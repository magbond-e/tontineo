import { NextResponse } from 'next/server';
import { FedaPay, Transaction } from 'fedapay';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { circle_id, cycle_id, amount, phone } = body;

    if (!circle_id || !cycle_id || !amount) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    // Configurer FedaPay (Utilisation de Sandbox par défaut si pas de clé de production)
    const apiKey = process.env.FEDAPAY_SECRET_KEY || 'sk_sandbox_YOUR_FEDAPAY_KEY';
    FedaPay.setApiKey(apiKey);
    FedaPay.setEnvironment(process.env.NODE_ENV === 'production' ? 'live' : 'sandbox');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Création de la transaction FedaPay
    const transaction = await Transaction.create({
      description: `Cotisation Tontine - Cercle ${circle_id}`,
      amount: amount,
      currency: { iso: 'XOF' },
      callback_url: `${appUrl}/cercles/${circle_id}?payment=success`,
      customer: {
        email: user.email || 'user@tontineo.com',
        firstname: 'Membre',
        lastname: 'Tontineo'
      },
      custom_metadata: {
        circle_id,
        cycle_id,
        user_id: user.id
      }
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
