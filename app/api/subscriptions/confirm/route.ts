import { NextResponse } from 'next/server';
import { FedaPay, Transaction } from 'fedapay';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const PLAN_LABELS: Record<string, string> = {
  pro: 'Pro',
  business: 'Business',
};

export async function POST(req: Request) {
  try {
    const supabaseSession = createServerClient();
    const {
      data: { user },
    } = await supabaseSession.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { transactionId } = await req.json();
    if (!transactionId) {
      return NextResponse.json({ error: 'transactionId manquant' }, { status: 400 });
    }

    const apiKey = process.env.FEDAPAY_SECRET_KEY || 'sk_sandbox_YOUR_FEDAPAY_KEY';
    FedaPay.setApiKey(apiKey);
    FedaPay.setEnvironment(apiKey.startsWith('sk_live') ? 'live' : 'sandbox');

    const verifiedTx = await Transaction.retrieve(transactionId);
    if (verifiedTx.status !== 'approved') {
      return NextResponse.json({ error: 'Paiement non approuvé' }, { status: 400 });
    }

    const metadata = verifiedTx.custom_metadata || verifiedTx.metadata || {};
    const txUserId = metadata.user_id;
    const plan = metadata.plan;

    if (metadata.type !== 'subscription' || !txUserId || !plan) {
      return NextResponse.json({ error: 'Métadonnées abonnement invalides' }, { status: 400 });
    }

    if (txUserId !== user.id) {
      return NextResponse.json({ error: 'Transaction non liée à cet utilisateur' }, { status: 403 });
    }

    if (!['pro', 'business'].includes(plan)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const txId = verifiedTx.id.toString();

    await supabaseAdmin.from('profiles').update({
      current_plan: plan,
      plan_expires_at: expiresAt.toISOString(),
      plan_renewed_at: now.toISOString(),
    }).eq('id', user.id);

    await supabaseAdmin.from('subscriptions').upsert({
      user_id: user.id,
      plan,
      amount: Number(verifiedTx.amount || 0),
      status: 'active',
      fedapay_tx_id: txId,
      started_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    }, { onConflict: 'fedapay_tx_id' });

    const planLabel = PLAN_LABELS[plan] || plan;
    await supabaseAdmin.from('notifications').insert({
      user_id: user.id,
      title: `🎉 Abonnement ${planLabel} activé !`,
      description: `Votre plan ${planLabel} est actif jusqu'au ${expiresAt.toLocaleDateString('fr-FR')}.`,
      unread: true,
    });

    return NextResponse.json({
      success: true,
      plan,
      expires_at: expiresAt.toISOString(),
      message: `Abonnement ${planLabel} activé`,
    });
  } catch (error: any) {
    console.error('Erreur confirmation abonnement:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
