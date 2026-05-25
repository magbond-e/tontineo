import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const supabaseSession = createServerClient();
    const { data: { user } } = await supabaseSession.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { circle_id, user_id_to_remove } = await req.json();

    if (!circle_id || !user_id_to_remove) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify permissions: Only organizer can remove others, or user can remove themselves
    if (user.id !== user_id_to_remove) {
      const { data: circle } = await supabaseAdmin
        .from('circles')
        .select('organizer_id')
        .eq('id', circle_id)
        .single();
        
      if (!circle || circle.organizer_id !== user.id) {
        return NextResponse.json({ error: 'Seul l\'organisateur peut exclure un membre' }, { status: 403 });
      }
    }

    // Actually delete the membership
    const { error: removeErr } = await supabaseAdmin
      .from('memberships')
      .delete()
      .match({ circle_id: circle_id, user_id: user_id_to_remove });

    if (removeErr) {
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }

    // Decrement current_members
    const { data: currentCircle } = await supabaseAdmin
      .from('circles')
      .select('current_members')
      .eq('id', circle_id)
      .single();

    if (currentCircle) {
      await supabaseAdmin
        .from('circles')
        .update({ current_members: Math.max(0, (currentCircle.current_members || 1) - 1) })
        .eq('id', circle_id);
    }

    // Ajouter une notification pour le membre exclu
    const circleName = currentCircle ? 'le cercle' : 'le cercle'; // Cannot fetch name, wait, currentCircle only selected current_members.
    // Let's fetch circle name
    const { data: circleData } = await supabaseAdmin.from('circles').select('name').eq('id', circle_id).single();
    
    if (user.id !== user_id_to_remove) {
      await supabaseAdmin.from('notifications').insert({
        user_id: user_id_to_remove,
        title: 'Adhésion refusée ou exclue',
        description: `Vous avez été retiré ou refusé du cercle "${circleData?.name || 'Cercle'}".`,
        unread: true
      });

      // Score de confiance: Retirer -2 points pour exclusion
      const { data: profile } = await supabaseAdmin.from('profiles').select('trust_score').eq('id', user_id_to_remove).single();
      if (profile) {
        const scoreBefore = profile.trust_score || 50;
        const scoreAfter = Math.max(0, scoreBefore - 2);
        
        await supabaseAdmin.from('trust_events').insert({
          user_id: user_id_to_remove,
          circle_id: circle_id,
          event_type: 'circle_removed',
          points: -2,
          score_before: scoreBefore,
          score_after: scoreAfter,
          description: 'Exclusion ou refus d\'un cercle'
        });
        
        await supabaseAdmin.from('profiles').update({ trust_score: scoreAfter }).eq('id', user_id_to_remove);
      }
    }

    return NextResponse.json({ success: true, message: 'Membre retiré avec succès' });

  } catch (error: any) {
    console.error('Erreur remove member route:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur interne' }, { status: 500 });
  }
}
