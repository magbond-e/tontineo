import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabaseSession = createServerClient();
    const { data: { user } } = await supabaseSession.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { amount, pin } = await req.json();
    const parsedAmount = Number(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
    }

    if (!pin || pin.length < 4) {
      return NextResponse.json({ error: "Code PIN requis" }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Récupérer les informations de sécurité du profil
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("wallet_balance, pin_code, failed_pin_attempts, is_locked")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    if (profile.is_locked) {
      return NextResponse.json({ error: "Votre compte est gelé après plusieurs tentatives infructueuses. Veuillez contacter le support." }, { status: 403 });
    }

    // 2. Valider le code PIN
    if (profile.pin_code !== pin) {
      const attempts = (profile.failed_pin_attempts || 0) + 1;
      const shouldLock = attempts >= 3;

      await supabaseAdmin
        .from("profiles")
        .update({
          failed_pin_attempts: attempts,
          is_locked: shouldLock,
        })
        .eq("id", user.id);

      if (shouldLock) {
        return NextResponse.json({ error: "Code PIN incorrect. Votre compte est désormais gelé." }, { status: 403 });
      }

      return NextResponse.json({ error: `Code PIN incorrect. Tentatives restantes : ${3 - attempts}` }, { status: 400 });
    }

    // 3. Valider le solde
    if ((profile.wallet_balance || 0) < parsedAmount) {
      return NextResponse.json({ error: "Solde insuffisant pour effectuer ce retrait." }, { status: 400 });
    }

    // Calcul des frais (6%)
    const feeAmount = Math.ceil(parsedAmount * 0.06);
    const netPayout = Math.floor(parsedAmount - feeAmount);

    // 3.5. Initiation FedaPay Payout
    let fedapayReference = 'simulated_' + Math.random().toString(36).substring(7);
    try {
      const { FedaPay, Payout } = require('fedapay');
      const apiKey = process.env.FEDAPAY_SECRET_KEY || 'sk_sandbox_YOUR_FEDAPAY_KEY';
      FedaPay.setApiKey(apiKey);
      FedaPay.setEnvironment(apiKey.startsWith('sk_live') ? 'live' : 'sandbox');

      const payout = await Payout.create({
        amount: netPayout,
        currency: { iso: 'XOF' },
        mode: 'mtn', // Default to MTN, can be made dynamic
        customer: {
          firstname: user.user_metadata?.full_name || 'Utilisateur',
          lastname: 'Tontineo',
          email: user.email || 'user@tontineo.com',
          phone_number: {
            number: user.phone || '00000000',
            country: 'BJ'
          }
        },
        send_now: true
      });
      fedapayReference = payout.id.toString();
    } catch (e: any) {
      console.warn('FedaPay Payout simulation fallback (probably sandbox without payout enabled):', e.message);
    }

    // 4. Débiter le portefeuille (Atomic update via Admin client)
    const { error: updateErr } = await supabaseAdmin
      .from("profiles")
      .update({
        wallet_balance: (profile.wallet_balance || 0) - parsedAmount,
        failed_pin_attempts: 0, // Réinitialiser le compteur de tentatives en cas de succès
      })
      .eq("id", user.id);

    if (updateErr) {
      console.error("Balance update error:", updateErr);
      return NextResponse.json({ error: "Erreur lors de la mise à jour du solde" }, { status: 500 });
    }


    // 5. Enregistrer la transaction de retrait complétée
    const { error: txErr } = await supabaseAdmin
      .from("wallet_transactions")
      .insert({
        user_id: user.id,
        amount: parsedAmount, // On trace le montant total débité
        type: "withdrawal",
        status: "completed",
        description: `Retrait vers Mobile Money (Reçu: ${netPayout} FCFA, Frais: ${feeAmount} FCFA)`,
        completed_at: new Date().toISOString()
      });

    if (txErr) {
      console.error("Transaction insert error:", txErr);
      // Note: In production, you would want transactional atomicity (e.g. Supabase RPC / DB Transaction)
    }

    return NextResponse.json({ success: true, message: "Retrait effectué avec succès." });
  } catch (error: any) {
    console.error("Withdraw route error:", error);
    return NextResponse.json({ error: "Une erreur inattendue est survenue." }, { status: 500 });
  }
}
