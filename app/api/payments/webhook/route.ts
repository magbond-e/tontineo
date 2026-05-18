import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Utilisation d'un client "Service Role" pour bypasser les RLS dans le webhook (qui n'a pas de session utilisateur)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
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
      const { data: payment, error: paymentError } = await supabaseAdmin
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
      const { error: cycleError } = await supabaseAdmin
        .rpc('increment_cycle_pot', { 
          p_cycle_id: cycle_id, 
          p_amount: amount 
        });

      if (cycleError) {
        console.error('Erreur incrémentation pot:', cycleError);
      }

      return NextResponse.json({ success: true, message: 'Paiement traité avec succès' });
    }

    // Ignorer les autres événements (transaction.canceled, etc.)
    return NextResponse.json({ success: true, message: 'Événement ignoré' });

  } catch (error: any) {
    console.error('Erreur Webhook FedaPay:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur interne' }, { status: 500 });
  }
}
