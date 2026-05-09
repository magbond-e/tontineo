"use client";

import { useEffect, useState } from "react";
import { Users, Coins, Percent, CalendarDays, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, AlertCircle, Play, MoreVertical } from "lucide-react";

// Mock Data
const stats = [
  { label: "Pot Global", value: "250 000 FCFA", trend: "+12%", icon: Coins, color: "text-primary", bg: "bg-primaryLight", trendDown: false },
  { label: "Cercles Actifs", value: "3", trend: "+1", icon: Users, color: "text-primary", bg: "bg-primary/10", trendDown: false },
  { label: "Membres", value: "24", trend: "+5", icon: Users, color: "text-primary", bg: "bg-primary/10", trendDown: false },
  { label: "Taux de Ponctualité", value: "98%", trend: "+2%", trendDown: false, icon: Percent, color: "text-primary", bg: "bg-primary/10" },
];

const transactions = [
  { id: "TX-001", type: "Cotisation mensuelle - Aminata D.", date: "08/05/2026", amount: "50 000 FCFA", status: "Payée" },
  { id: "TX-002", type: "Cotisation mensuelle - Kofi A.", date: "07/05/2026", amount: "50 000 FCFA", status: "Payée" },
  { id: "TX-003", type: "Cotisation mensuelle - Sarah K.", date: "05/05/2026", amount: "50 000 FCFA", status: "En retard" },
];

import Link from "next/link";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [potProgress, setPotProgress] = useState(0);

  // Simulate loading and animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setPotProgress(80), 100);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">Salut Amadou,</h1>
          <p className="text-textSecondary mt-1">Bienvenue sur votre espace créateur Tontineo.</p>
        </div>
        <Link href="/cercles/nouveau">
          <button 
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20"
          >
            Créer un cercle
          </button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-surface rounded-2xl p-6 border border-border shadow-sm flex flex-col justify-between group hover:bg-primary hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 cursor-pointer">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="w-8 h-8 bg-border rounded-lg" />
                <div className="w-24 h-4 bg-border rounded" />
                <div className="w-32 h-8 bg-border rounded" />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-textSecondary text-sm font-medium group-hover:text-primaryLight transition-colors">{stat.label}</h3>
                  <div className={`p-1.5 rounded-lg bg-gray-50 text-primary group-hover:bg-white transition-colors`}>
                    <stat.icon size={18} className="text-primary" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-textPrimary mb-2 group-hover:text-white transition-colors">{stat.value}</p>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded-md transition-colors ${stat.trendDown ? 'bg-danger/10 text-danger group-hover:bg-white/20 group-hover:text-white' : 'bg-success/10 text-success group-hover:bg-white/20 group-hover:text-white'}`}>
                      {stat.trend}
                    </div>
                    <span className="text-xs text-textSecondary group-hover:text-primaryLight transition-colors">depuis le mois dernier</span>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm flex flex-col mt-8">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-bold text-textPrimary">Dernières Cotisations & Versements</h2>
        </div>
        
        <div className="p-6 overflow-x-auto">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-10 bg-gray-50 rounded animate-pulse" />
              <div className="h-12 bg-gray-50 rounded animate-pulse" />
              <div className="h-12 bg-gray-50 rounded animate-pulse" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="text-textSecondary text-xs uppercase tracking-wider">
                  <th className="pb-4 font-semibold w-32">Référence</th>
                  <th className="pb-4 font-semibold">Description</th>
                  <th className="pb-4 font-semibold">Date</th>
                  <th className="pb-4 font-semibold">Montant</th>
                  <th className="pb-4 font-semibold text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-semibold text-sm text-textPrimary">
                      {tx.id}
                    </td>
                    <td className="py-4 text-sm text-textSecondary">
                      {tx.type}
                    </td>
                    <td className="py-4 text-sm text-textSecondary">
                      {tx.date}
                    </td>
                    <td className="py-4 text-sm font-semibold text-textPrimary">
                      {tx.amount}
                    </td>
                    <td className="py-4 text-right">
                      <span className={`
                        inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold
                        ${tx.status === 'Payée' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}
                      `}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
    </div>
  );
}
