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

    const { circle_id, user_id_to_approve } = await req.json();

    if (!circle_id || !user_id_to_approve) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify permissions: Only organizer can approve
    const { data: circle } = await supabaseAdmin
      .from('circles')
      .select('organizer_id')
      .eq('id', circle_id)
      .single();
      
    if (!circle || circle.organizer_id !== user.id) {
      return NextResponse.json({ error: 'Seul l\'organisateur peut approuver un membre' }, { status: 403 });
    }

    // Actually update the membership
    const { error: approveErr } = await supabaseAdmin
      .from('memberships')
      .update({ status: 'active' })
      .match({ circle_id: circle_id, user_id: user_id_to_approve });

    if (approveErr) {
      return NextResponse.json({ error: 'Erreur lors de l\'approbation' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Membre approuvé avec succès' });

  } catch (error: any) {
    console.error('Erreur approve member route:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur interne' }, { status: 500 });
  }
}
