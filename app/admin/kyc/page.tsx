import { createAdminClient } from "@/utils/supabase/admin";
import KycClient from "./KycClient";

export default async function AdminKycPage() {
  const adminClient = createAdminClient();

  // Fetch pending KYC users
  const { data: pendingUsers } = await adminClient
    .from("profiles")
    .select("id, full_name, avatar_url, phone, kyc_doc_front, kyc_doc_back, kyc_status")
    .eq("kyc_status", "pending")
    .order("kyc_verified_at", { ascending: true, nullsFirst: true });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Vérification KYC</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Gérez les demandes de vérification d'identité des utilisateurs.</p>
      </div>

      <KycClient pendingUsers={pendingUsers || []} />
    </div>
  );
}
