import { NextResponse } from 'next/server';
import { FedaPay, Transaction } from 'fedapay';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Prix des plans en XOF (FCFA)
const PLAN_PRICES: Record<string, number> = {
  pro: 2000,
  business: 5000,
};

const PLAN_LABELS: Record<string, string> = {
  pro: 'Pro',
  business: 'Business',
};

export async function POST(req: Request) {
  try {
    const supabaseSession = createServerClient();
    const { data: { user } } = await supabaseSession.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { plan } = await req.json();

    if (!plan || !['pro', 'business'].includes(plan)) {
      return NextResponse.json({ error: 'Plan invalide. Choisissez "pro" ou "business".' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Vérifier le plan actuel de l'utilisateur
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('current_plan, plan_expires_at, full_name')
      .eq('id', user.id)
      .single();

    if (profile && profile.current_plan === plan) {
      // Déjà sur ce plan — vérifier s'il est expiré ou non
      const isExpired = profile.plan_expires_at
        ? new Date(profile.plan_expires_at) < new Date()
        : true;

      if (!isExpired) {
        return NextResponse.json({
          error: `Vous êtes déjà sur le plan ${PLAN_LABELS[plan]}. Votre abonnement expire le ${new Date(profile.plan_expires_at!).toLocaleDateString('fr-FR')}.`
        }, { status: 400 });
      }
    }

    const amount = PLAN_PRICES[plan];

    // Configurer FedaPay
    const apiKey = process.env.FEDAPAY_SECRET_KEY || 'sk_sandbox_YOUR_FEDAPAY_KEY';
    FedaPay.setApiKey(apiKey);
    FedaPay.setEnvironment(apiKey.startsWith('sk_live') ? 'live' : 'sandbox');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Créer la transaction FedaPay
    const transaction = await Transaction.create({
      description: `Abonnement Tontineo ${PLAN_LABELS[plan]} — 30 jours`,
      amount,
      currency: { iso: 'XOF' },
      callback_url: `${appUrl}/parametres?tab=abonnement&plan_status=success&plan=${plan}`,
      customer: {
        email: user.email || 'user@tontineo.com',
        firstname: profile?.full_name?.split(' ')[0] || 'Membre',
        lastname: profile?.full_name?.split(' ').slice(1).join(' ') || 'Tontineo',
      },
      custom_metadata: {
        user_id: user.id,
        type: 'subscription',
        plan,
      },
    });

    const token = await transaction.generateToken();

    // Enregistrer la subscription en statut "pending" avec l'ID FedaPay
    await supabaseAdmin.from('subscriptions').insert({
      user_id: user.id,
      plan,
      amount,
      status: 'pending',
      fedapay_tx_id: transaction.id.toString(),
    });

    return NextResponse.json({
      success: true,
      transaction_id: transaction.id,
      url: token.url,
      plan,
      amount,
    });

  } catch (error: any) {
    console.error('Erreur initiation abonnement:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
