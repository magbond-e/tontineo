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

    const { oldPin, newPin } = await req.json();

    // Validation du nouveau code PIN
    if (!newPin || (newPin.length !== 4 && newPin.length !== 6) || !/^\d+$/.test(newPin)) {
      return NextResponse.json({ error: "Le code PIN doit comporter 4 ou 6 chiffres." }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Récupérer les informations de sécurité du profil
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("pin_code, has_pin, failed_pin_attempts, is_locked")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    if (profile.is_locked) {
      return NextResponse.json({ 
        error: "Votre compte est gelé après plusieurs tentatives de code PIN infructueuses. Veuillez contacter le support." 
      }, { status: 403 });
    }

    // 2. Si l'utilisateur possède déjà un code PIN, on exige et valide l'ancien PIN
    if (profile.has_pin) {
      if (!oldPin) {
        return NextResponse.json({ error: "L'ancien code PIN est requis pour pouvoir le modifier." }, { status: 400 });
      }

      if (profile.pin_code !== oldPin) {
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
          return NextResponse.json({ 
            error: "Ancien code PIN incorrect. Votre compte est désormais gelé. Veuillez contacter le support." 
          }, { status: 403 });
        }

        return NextResponse.json({ 
          error: `Ancien code PIN incorrect. Tentatives restantes : ${3 - attempts}` 
        }, { status: 400 });
      }
    }

    // 3. Enregistrement du nouveau PIN et réinitialisation des tentatives
    const { error: updateErr } = await supabaseAdmin
      .from("profiles")
      .update({
        pin_code: newPin,
        failed_pin_attempts: 0, // Réinitialiser en cas de succès
      })
      .eq("id", user.id);

    if (updateErr) {
      console.error("PIN update error:", updateErr);
      return NextResponse.json({ error: "Erreur lors de la sauvegarde du PIN." }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: profile.has_pin ? "Code PIN modifié avec succès !" : "Code PIN configuré avec succès !" 
    });

  } catch (error: any) {
    console.error("PIN route error:", error);
    return NextResponse.json({ error: "Une erreur inattendue est survenue." }, { status: 500 });
  }
}
