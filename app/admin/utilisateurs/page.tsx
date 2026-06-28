import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import UsersClient from "./UsersClient";

export default async function AdminUsersPage() {
  const adminClient = createAdminClient();
  const supabase = createClient();
  
  // Fetch current user id to prevent self-demotion
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch all users
  const { data: users } = await adminClient
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Utilisateurs</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Gérez tous les utilisateurs inscrits sur la plateforme.</p>
      </div>

      <UsersClient users={users || []} currentUserId={user?.id || ""} />
    </div>
  );
}
