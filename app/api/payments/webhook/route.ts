import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { FedaPay, Transaction } from 'fedapay';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Récupération de l'événement et de la transaction envoyés
    const event = body.name; 
    const transactionData = body.entity;

    if (!transactionData || !transactionData.id) {
      return NextResponse.json({ error: 'Transaction ID missing' }, { status: 400 });
    }

    // Si ce n'est pas une transaction approuvée, on l'ignore silencieusement
    if (event !== 'transaction.approved' || transactionData.status !== 'approved') {
      return NextResponse.json({ message: 'Événement ignoré (non approuvé)' });
    }

    // Configurer FedaPay de manière sécurisée en backend
    const apiKey = process.env.FEDAPAY_SECRET_KEY || 'sk_sandbox_YOUR_FEDAPAY_KEY';
    FedaPay.setApiKey(apiKey);
    FedaPay.setEnvironment(process.env.NODE_ENV === 'production' ? 'live' : 'sandbox');

    // Sécurité Absolue : Interroger directement le serveur FedaPay pour vérifier la transaction
    let verifiedTx;
    try {
      verifiedTx = await Transaction.retrieve(transactionData.id);
    } catch (e: any) {
      console.error('FedaPay retrieve error:', e);
      return NextResponse.json({ error: 'Impossible de vérifier la transaction auprès de FedaPay' }, { status: 400 });
    }

    // Vérifier le statut de la transaction renvoyée par FedaPay
    if (verifiedTx.status !== 'approved') {
      console.warn('Falsification de webhook détectée ! La transaction n\'est pas approuvée sur FedaPay.');
      return NextResponse.json({ error: 'Falsification détectée' }, { status: 400 });
    }

    const amount = verifiedTx.amount;
    const metadata = verifiedTx.custom_metadata || verifiedTx.metadata || {};
    const { circle_id, cycle_id, user_id, type } = metadata;

    if (!user_id) {
      console.error('Webhook reçu mais user_id manquant dans les métadonnées:', metadata);
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    // Utilisation exclusive du client Admin Supabase pour bypasser les limites de RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // CAS 1: Recharge de portefeuille via FedaPay
    if (type === 'wallet_recharge') {
      // 1. Mettre à jour le solde du profil
      const { data: profile, error: profileErr } = await supabaseAdmin
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user_id)
        .single();
        
      if (profileErr || !profile) {
        console.error('User profile not found for wallet recharge:', user_id);
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      await supabaseAdmin.from('profiles').update({
        wallet_balance: (profile.wallet_balance || 0) + Number(amount)
      }).eq('id', user_id);

      // 2. Mettre à jour ou insérer la transaction de recharge
      await supabaseAdmin.from('wallet_transactions').upsert({
        user_id,
        amount: Number(amount),
        type: 'deposit',
        status: 'completed',
        description: 'Recharge via FedaPay Mobile Money',
        reference: verifiedTx.id.toString(),
        completed_at: new Date().toISOString()
      }, { onConflict: 'reference' });

      return NextResponse.json({ success: true, message: 'Recharge de portefeuille traitée avec succès' });
    }

    // CAS 2: Cotisation de cercle de tontine standard
    if (!circle_id || !cycle_id) {
      console.error('Webhook reçu pour cotisation mais circle_id ou cycle_id manquant:', metadata);
      return NextResponse.json({ error: 'Missing circle_id or cycle_id' }, { status: 400 });
    }

    // 1. Enregistrer le paiement validé dans notre base (upsert pour éviter les doublons)
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .upsert({
        fedapay_transaction_id: verifiedTx.id.toString(),
        user_id,
        circle_id,
        cycle_id,
        amount,
        status: 'completed',
        completed_at: new Date().toISOString()
      }, { onConflict: 'fedapay_transaction_id' });

    if (paymentError) {
      console.error('Erreur insertion paiement:', paymentError);
      return NextResponse.json({ error: paymentError.message }, { status: 500 });
    }

    // 2. Incrémenter le pot du cycle via notre fonction sécurisée RPC (qui est maintenant réservée à service_role)
    const { error: cycleError } = await supabaseAdmin
      .rpc('increment_cycle_pot', { 
        p_cycle_id: cycle_id, 
        p_amount: amount 
      });

    if (cycleError) {
      console.error('Erreur incrémentation pot:', cycleError);
    }

    // 3. Score de confiance: Ajouter +5 points pour paiement réussi
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('trust_score')
      .eq('id', user_id)
      .single();
      
    if (profile) {
      const scoreBefore = profile.trust_score || 50;
      const scoreAfter = Math.min(100, scoreBefore + 5);
      
      await supabaseAdmin.from('trust_events').insert({
        user_id,
        circle_id,
        event_type: 'on_time_payment',
        points: 5,
        score_before: scoreBefore,
        score_after: scoreAfter,
        description: 'Paiement de cotisation réussi'
      });
      
      await supabaseAdmin.from('profiles').update({ trust_score: scoreAfter }).eq('id', user_id);
    }

    // 4. Enregistrer une notification réelle en base de données
    const { data: circleData } = await supabaseAdmin
      .from('circles')
      .select('name')
      .eq('id', circle_id)
      .single();
    
    const circleName = circleData?.name || 'Cercle';

    await supabaseAdmin.from('notifications').insert({
      user_id,
      title: 'Cotisation réussie',
      description: `Votre cotisation de ${Number(amount).toLocaleString('fr-FR')} FCFA pour le cercle "${circleName}" a été validée avec succès.`,
      unread: true
    });

    return NextResponse.json({ success: true, message: 'Paiement de cotisation traité avec succès' });
  } catch (error: any) {
    console.error('Erreur Webhook FedaPay:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur interne' }, { status: 500 });
  }
}
