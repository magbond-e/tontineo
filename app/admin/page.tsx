import { createAdminClient } from "@/utils/supabase/admin";
import { Users, ShieldCheck, Wallet, Activity } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const adminClient = createAdminClient();

  // Récupérer les stats globales
  const { count: usersCount } = await adminClient.from('profiles').select('*', { count: 'exact', head: true });
  const { count: kycPendingCount } = await adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('kyc_status', 'pending');
  const { count: circlesCount } = await adminClient.from('circles').select('*', { count: 'exact', head: true });
  
  // Pour le volume de transaction, on fait la somme des paiements complétés
  const { data: payments } = await adminClient.from('payments').select('amount').eq('status', 'completed');
  const totalVolume = payments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0;

  const stats = [
    { title: "Utilisateurs Inscrits", value: usersCount || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", link: "/admin/utilisateurs" },
    { title: "KYC en attente", value: kycPendingCount || 0, icon: ShieldCheck, color: "text-orange-500", bg: "bg-orange-500/10", link: "/admin/kyc" },
    { title: "Cercles Créés", value: circlesCount || 0, icon: Activity, color: "text-green-500", bg: "bg-green-500/10", link: "#" },
    { title: "Volume (FCFA)", value: totalVolume.toLocaleString('fr-FR'), icon: Wallet, color: "text-purple-500", bg: "bg-purple-500/10", link: "#" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Vue d'ensemble</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Statistiques globales de la plateforme Tontineo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Link key={index} href={stat.link} className={`block p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.title}</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{stat.value}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
