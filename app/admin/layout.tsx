import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SidebarAdmin } from "@/components/admin/SidebarAdmin";
import { HeaderAdmin } from "@/components/admin/HeaderAdmin";

export const metadata = {
  title: "Administration - Tontineo",
  description: "Espace d'administration de Tontineo",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Vérifier si l'utilisateur est admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_admin) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
      <SidebarAdmin />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <HeaderAdmin />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50 dark:bg-slate-950/50 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
