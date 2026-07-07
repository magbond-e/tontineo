import type { SupabaseClient } from "@supabase/supabase-js";

const LOGOUT_TIMEOUT_MS = 4000;

/**
 * Déconnexion robuste: ne bloque pas l'UI si Supabase met trop de temps à répondre.
 */
export async function performLogout(supabase: SupabaseClient) {
  try {
    await Promise.race([
      supabase.auth.signOut({ scope: "local" }),
      new Promise<void>((resolve) => setTimeout(resolve, LOGOUT_TIMEOUT_MS)),
    ]);
  } catch (error) {
    console.error("Erreur déconnexion:", error);
  }

  try {
    localStorage.removeItem("tontineo_profile");
  } catch {
    // ignore storage errors (private mode, etc.)
  }

  // Redirection dure: évite les blocages router/middleware après signOut.
  window.location.assign("/login");
}
