import { Sidebar } from "@/components/layout/Sidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { OnboardingGuard } from "@/components/OnboardingGuard";
import { PlanGuard } from "@/components/PlanGuard";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("city, whatsapp, phone, cgu_accepted_at")
    .eq("id", user.id)
    .single();

  const needsOnboarding = !profile?.city || !profile?.whatsapp || !profile?.phone || !profile?.cgu_accepted_at;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {needsOnboarding ? (
            <OnboardingGuard user={user} />
          ) : (
            <PlanGuard>{children}</PlanGuard>
          )}
        </main>
      </div>
    </div>
  );
}
