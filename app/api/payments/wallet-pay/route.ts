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

    const { circle_id, cycle_id, amount } = await req.json();

    if (!circle_id || !cycle_id || !amount) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Check wallet balance
    const { data: wallet, error: walletErr } = await supabaseAdmin
      .from('profiles')
      .select('wallet_balance')
      .eq('id', user.id)
      .single();

    if (walletErr || !wallet) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
    }

    if (Number(wallet.wallet_balance) < Number(amount)) {
      return NextResponse.json({ error: 'Solde insuffisant dans le portefeuille' }, { status: 400 });
    }

    // 2. Vérifier que l'utilisateur n'a pas déjà payé pour ce cycle
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('id, status')
      .eq('cycle_id', cycle_id)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .single();

    if (existingPayment) {
      return NextResponse.json({ error: 'Vous avez déjà cotisé pour ce tour' }, { status: 400 });
    }

    // 3. Débiter le portefeuille
    const newBalance = Number(wallet.wallet_balance) - Number(amount);
    await supabaseAdmin
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', user.id);

    // 4. Créer la transaction de portefeuille
    await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        user_id: user.id,
        amount: amount,
        type: 'withdrawal',
        status: 'completed',
        description: `Cotisation via Wallet - Cercle ID: ${circle_id.substring(0, 8)}`,
        reference: `wallet_pay_${cycle_id}`,
        completed_at: new Date().toISOString()
      });

    // 5. Enregistrer le paiement
    const { data: paymentRecord, error: payErr } = await supabaseAdmin
      .from('payments')
      .insert({
        cycle_id,
        circle_id,
        user_id: user.id,
        amount,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (payErr) {
      console.error('Erreur insertion paiement:', payErr);
      // Rollback wallet debit if payment record failed
      await supabaseAdmin
        .from('profiles')
        .update({ wallet_balance: Number(wallet.wallet_balance) })
        .eq('id', user.id);
      return NextResponse.json({ error: 'Erreur lors de l\'enregistrement du paiement.' }, { status: 500 });
    }

    // 6. Mettre à jour le pot_amount du cycle
    const { data: cycle } = await supabaseAdmin
      .from('cycles')
      .select('pot_amount')
      .eq('id', cycle_id)
      .single();

    if (cycle) {
      await supabaseAdmin
        .from('cycles')
        .update({ pot_amount: Number(cycle.pot_amount) + Number(amount) })
        .eq('id', cycle_id);
    }

    // 7. Mettre à jour pot_collected du cercle (pour la barre de progression)
    const { data: currentCircle } = await supabaseAdmin
      .from('circles')
      .select('pot_collected')
      .eq('id', circle_id)
      .single();

    if (currentCircle) {
      await supabaseAdmin
        .from('circles')
        .update({ pot_collected: Number(currentCircle.pot_collected || 0) + Number(amount) })
        .eq('id', circle_id);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Paiement effectué avec succès depuis le portefeuille',
      payment_id: paymentRecord?.id
    });

  } catch (error: any) {
    console.error('Erreur wallet-pay route:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur interne' }, { status: 500 });
  }
}
