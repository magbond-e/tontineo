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

    const { amount, otp } = await req.json();
    const parsedAmount = Number(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
    }

    if (!otp || otp.length < 4) {
      return NextResponse.json({ error: "Code de validation OTP requis" }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Récupérer le solde actuel du profil
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("wallet_balance, is_locked")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    if (profile.is_locked) {
      return NextResponse.json({ error: "Votre compte est gelé. Impossible de recharger." }, { status: 403 });
    }

    // 2. Mettre à jour le solde du profil (Atomic update via Admin client)
    const { error: updateErr } = await supabaseAdmin
      .from("profiles")
      .update({
        wallet_balance: (profile.wallet_balance || 0) + parsedAmount
      })
      .eq("id", user.id);

    if (updateErr) {
      console.error("Balance credit error:", updateErr);
      return NextResponse.json({ error: "Erreur lors du crédit de solde" }, { status: 500 });
    }

    // 3. Enregistrer la transaction de recharge complétée
    const { error: txErr } = await supabaseAdmin
      .from("wallet_transactions")
      .insert({
        user_id: user.id,
        amount: parsedAmount,
        type: "deposit",
        status: "completed",
        description: "Recharge via Mobile Money",
        completed_at: new Date().toISOString()
      });

    if (txErr) {
      console.error("Transaction insert error:", txErr);
    }

    return NextResponse.json({ success: true, message: "Recharge effectuée avec succès." });
  } catch (error: any) {
    console.error("Recharge route error:", error);
    return NextResponse.json({ error: "Une erreur inattendue est survenue." }, { status: 500 });
  }
}
