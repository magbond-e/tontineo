"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

/**
 * Vérifie si l'utilisateur appelant est un admin.
 * Lance une erreur s'il ne l'est pas.
 */
async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Non authentifié");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_admin) {
    throw new Error("Accès refusé. Réservé aux administrateurs.");
  }

  return user;
}

/**
 * Met à jour le statut KYC d'un utilisateur.
 */
export async function updateKycStatus(userId: string, newStatus: 'verified' | 'rejected' | 'pending') {
  try {
    await requireAdmin();
    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from("profiles")
      .update({ 
        kyc_status: newStatus,
        kyc_verified_at: newStatus === 'verified' ? new Date().toISOString() : null
      })
      .eq("id", userId);

    if (error) throw error;

    revalidatePath("/admin/kyc");
    revalidatePath("/admin/utilisateurs");
    return { success: true };
  } catch (error: any) {
    console.error("Erreur updateKycStatus:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Met à jour le rôle admin d'un utilisateur.
 */
export async function toggleAdminRole(userId: string, makeAdmin: boolean) {
  try {
    const caller = await requireAdmin();
    if (caller.id === userId) {
      throw new Error("Vous ne pouvez pas modifier votre propre statut administrateur depuis l'interface.");
    }
    
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from("profiles")
      .update({ is_admin: makeAdmin })
      .eq("id", userId);

    if (error) throw error;

    revalidatePath("/admin/utilisateurs");
    return { success: true };
  } catch (error: any) {
    console.error("Erreur toggleAdminRole:", error);
    return { success: false, error: error.message };
  }
}
