import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { createClient as createServerClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    // 1. Client avec session (pour le simulateur local appelé depuis le navigateur)
    const supabaseWithSession = createServerClient();
    const { data: { user } } = await supabaseWithSession.auth.getUser();

    // 2. Client Admin (pour la vraie production quand FedaPay appelle sans session)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Si on a un utilisateur (simulateur), on utilise son client autorisé. Sinon on tente l'admin.
    const supabase = user ? supabaseWithSession : supabaseAdmin;

    const body = await req.json();
    
    // Le nom de l'événement envoyé par FedaPay (ex: "transaction.approved")
    const event = body.name; 
    const transaction = body.entity;

    if (event === 'transaction.approved' && transaction.status === 'approved') {
      const fedapay_transaction_id = transaction.id;
      const amount = transaction.amount;
      const metadata = transaction.custom_metadata || transaction.metadata || {};
      
      const { circle_id, cycle_id, user_id } = metadata;

      if (!circle_id || !cycle_id || !user_id) {
        console.error('Webhook reçu mais métadonnées manquantes:', metadata);
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      // 1. Enregistrer le paiement validé dans notre base (upsert pour éviter les doublons si webhook appelé 2 fois)
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .upsert({
          fedapay_transaction_id: fedapay_transaction_id.toString(),
          user_id,
          circle_id,
          cycle_id,
          amount,
          status: 'completed',
          completed_at: new Date().toISOString()
        }, { onConflict: 'fedapay_transaction_id' })
        .select()
        .single();

      if (paymentError) {
        console.error('Erreur insertion paiement:', paymentError);
        return NextResponse.json({ error: paymentError.message }, { status: 500 });
      }

      // 2. Incrémenter le pot du cycle via notre fonction sécurisée RPC
      const { error: cycleError } = await supabase
        .rpc('increment_cycle_pot', { 
          p_cycle_id: cycle_id, 
          p_amount: amount 
        });

      if (cycleError) {
        console.error('Erreur incrémentation pot:', cycleError);
      }

      // 3. Score de confiance: Ajouter +5 points pour paiement réussi
      const { data: profile } = await supabase
        .from('profiles')
        .select('trust_score')
        .eq('id', user_id)
        .single();
        
      if (profile) {
        const scoreBefore = profile.trust_score || 50;
        const scoreAfter = Math.min(100, scoreBefore + 5);
        
        await supabase.from('trust_events').insert({
          user_id,
          circle_id,
          event_type: 'on_time_payment',
          points: 5,
          score_before: scoreBefore,
          score_after: scoreAfter,
          description: 'Paiement de cotisation réussi'
        });
        
        await supabase.from('profiles').update({ trust_score: scoreAfter }).eq('id', user_id);
      }

      // 4. Enregistrer une notification réelle en base de données
      const { data: circleData } = await supabase
        .from('circles')
        .select('name')
        .eq('id', circle_id)
        .single();
      
      const circleName = circleData?.name || 'Cercle';

      await supabase.from('notifications').insert({
        user_id,
        title: 'Cotisation réussie',
        description: `Votre cotisation de ${Number(amount).toLocaleString('fr-FR')} FCFA pour le cercle "${circleName}" a été validée avec succès.`,
        unread: true
      });

      return NextResponse.json({ success: true, message: 'Paiement traité avec succès' });
    }

    // Ignorer les autres événements (transaction.canceled, etc.)
    return NextResponse.json({ success: true, message: 'Événement ignoré' });

  } catch (error: any) {
    console.error('Erreur Webhook FedaPay:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur interne' }, { status: 500 });
  }
}
