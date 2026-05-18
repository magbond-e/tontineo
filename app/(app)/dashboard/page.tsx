"use client";

import { useEffect, useState, useRef } from "react";
import { Users, Coins, Percent, Bell, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function DashboardPage() {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  // Mock Data
  const stats = [
    { label: t("dash_total_contributed"), value: "0 FCFA", trend: "-", icon: Coins, color: "text-primary", bg: "bg-primaryLight", trendDown: false },
    { label: t("dash_active_circles"), value: "0", trend: "-", icon: Users, color: "text-primary", bg: "bg-primary/10", trendDown: false },
    { label: t("dash_members"), value: "0", trend: "-", icon: Users, color: "text-primary", bg: "bg-primary/10", trendDown: false },
    { label: t("dash_punctuality"), value: "-", trend: "-", trendDown: false, icon: Percent, color: "text-primary", bg: "bg-primary/10" },
  ];

  // Empty states for transactions
  const transactions: any[] = [];

  const notifications: any[] = [];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 relative">
      
      {/* Transaction Modal Details */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedTx(null)}>
          <div className="bg-surface rounded-3xl border border-border shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-textPrimary">Détail Opération</h3>
              <button onClick={() => setSelectedTx(null)} className="p-2 bg-gray-50 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-textSecondary">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex flex-col items-center justify-center mb-6 bg-gray-50 dark:bg-slate-800 rounded-2xl p-6">
              <span className="text-sm font-medium text-textSecondary mb-2 text-center">{selectedTx.title}</span>
              <span className="text-3xl font-bold text-textPrimary font-mono">{selectedTx.amount}</span>
              <span className={`mt-3 inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${selectedTx.status === 'Payée' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                {selectedTx.status}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-sm text-textSecondary">Référence</span>
                <span className="text-sm font-bold text-textPrimary">{selectedTx.id}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-sm text-textSecondary">Membre</span>
                <span className="text-sm font-bold text-textPrimary">{selectedTx.user}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-sm text-textSecondary">Date & Heure</span>
                <span className="text-sm font-bold text-textPrimary">{selectedTx.date} à {selectedTx.time}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header with Notifications */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">{t("dash_title")}</h1>
          <p className="text-textSecondary mt-1">{t("dash_subtitle")}</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Notifications Toggle */}
          <div className="relative hidden md:block" ref={notifRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-11 h-11 bg-surface border border-border rounded-full flex items-center justify-center text-textSecondary hover:text-primary transition-colors shadow-sm relative"
            >
              <Bell size={20} />
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-4 border-b border-border flex justify-between items-center bg-gray-50 dark:bg-slate-800">
                  <h3 className="font-bold text-textPrimary">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-textSecondary text-sm">
                      Aucune notification pour le moment.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className={`p-4 border-b border-border hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${notif.unread ? 'bg-primary/5' : ''}`}>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm ${notif.unread ? 'font-bold text-textPrimary' : 'font-medium text-textSecondary'}`}>{notif.title}</h4>
                          <span className="text-[10px] font-bold text-textSecondary">{notif.time}</span>
                        </div>
                        <p className="text-xs text-textSecondary line-clamp-2">{notif.desc}</p>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-3 text-center border-t border-border bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                    <span className="text-xs font-bold text-primary">Marquer tout comme lu</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <Link href="/cercles/nouveau">
            <button 
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20"
            >
              Créer un cercle
            </button>
          </Link>
        </div>
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
                  <div className={`p-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-primary group-hover:bg-white transition-colors`}>
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

      {/* Sleek List Section for Transactions */}
      <div className="bg-surface rounded-3xl border border-border shadow-sm flex flex-col mt-8 overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
          <h2 className="text-lg font-bold text-textPrimary">{t("dash_recent_ops")}</h2>
          <Link href="/portefeuille" className="text-xs font-bold text-primary hover:underline">Voir tout</Link>
        </div>
        
        <div className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <div className="h-16 bg-gray-50 dark:bg-slate-800 rounded-xl animate-pulse" />
              <div className="h-16 bg-gray-50 dark:bg-slate-800 rounded-xl animate-pulse" />
              <div className="h-16 bg-gray-50 dark:bg-slate-800 rounded-xl animate-pulse" />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-textSecondary font-medium">
                  {t("dash_no_transactions")}
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} onClick={() => setSelectedTx(tx)} className="group p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 ${tx.type === 'in' ? 'bg-success/10 text-success' : tx.type === 'warning' ? 'bg-danger/10 text-danger' : 'bg-surface border border-border text-textPrimary'}`}>
                        {tx.type === 'in' ? <ArrowDownRight size={24} /> : tx.type === 'warning' ? <AlertCircle size={24} /> : <ArrowUpRight size={24} />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-textPrimary text-sm mb-0.5 truncate">{tx.title} - {tx.user}</p>
                        <p className="text-xs text-textSecondary flex items-center gap-2 truncate">
                          {tx.date} <span className="w-1 h-1 rounded-full bg-border shrink-0"></span> {tx.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                      <div className="flex flex-col items-end">
                        <span className={`font-mono font-bold whitespace-nowrap text-sm sm:text-base ${tx.type === 'in' ? 'text-success' : tx.type === 'warning' ? 'text-danger' : 'text-textPrimary'}`}>
                          {tx.type === 'in' ? '+' : '-'}{tx.amount}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${tx.status === 'Payée' ? 'text-success' : 'text-danger'}`}>
                          {tx.status}
                        </span>
                      </div>
                      <ChevronRight size={18} className="text-border group-hover:text-primary transition-colors hidden sm:block" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
