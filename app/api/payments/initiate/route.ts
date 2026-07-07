import { NextResponse } from 'next/server';
import { FedaPay, Transaction } from 'fedapay';
import { createClient } from '@/utils/supabase/server';

function resolveAppUrl(req: Request) {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && envUrl.trim().length > 0) return envUrl.replace(/\/$/, '');

  const forwardedProto = req.headers.get('x-forwarded-proto');
  const forwardedHost = req.headers.get('x-forwarded-host');
  const host = forwardedHost || req.headers.get('host');
  if (host) {
    const protocol = forwardedProto || (host.includes('localhost') ? 'http' : 'https');
    return `${protocol}://${host}`;
  }

  return 'https://tontineo-agence.vercel.app';
}

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { circle_id, cycle_id, amount, phone, type } = body;

    if (!amount) {
      return NextResponse.json({ error: 'Montant manquant' }, { status: 400 });
    }

    if (!type && (!circle_id || !cycle_id)) {
      return NextResponse.json({ error: 'Paramètres manquants pour la cotisation' }, { status: 400 });
    }

    // Configurer FedaPay (Détection automatique de l'environnement via la clé)
    const apiKey = process.env.FEDAPAY_SECRET_KEY || 'sk_sandbox_YOUR_FEDAPAY_KEY';
    FedaPay.setApiKey(apiKey);
    FedaPay.setEnvironment(apiKey.startsWith('sk_live') ? 'live' : 'sandbox');

    const appUrl = resolveAppUrl(req);
    
    // Configuration dynamique selon le type de paiement
    const isRecharge = type === 'wallet_recharge';
    const description = isRecharge ? 'Recharge de Portefeuille Tontineo' : `Cotisation Tontine - Cercle ${circle_id}`;
    const callbackUrl = isRecharge ? `${appUrl}/portefeuille/recharge?payment=success` : `${appUrl}/cercles/${circle_id}?payment=success`;
    
    const customMetadata: any = {
      user_id: user.id
    };
    if (isRecharge) {
      customMetadata.type = 'wallet_recharge';
    } else {
      customMetadata.circle_id = circle_id;
      customMetadata.cycle_id = cycle_id;
    }

    // Création de la transaction FedaPay
    const transaction = await Transaction.create({
      description: description,
      amount: amount,
      currency: { iso: 'XOF' },
      callback_url: callbackUrl,
      customer: {
        email: user.email || 'user@tontineo.com',
        firstname: 'Membre',
        lastname: 'Tontineo'
      },
      custom_metadata: customMetadata
    });

    // Génération du lien de paiement (checkout URL)
    const token = await transaction.generateToken();

    return NextResponse.json({ 
      success: true, 
      transaction_id: transaction.id,
      url: token.url
    });

  } catch (error: any) {
    console.error('Erreur initiation paiement FedaPay:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
