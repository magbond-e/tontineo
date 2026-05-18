"use client";

import { Plus, Users, Wallet, Filter, CalendarClock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function CerclesPage() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState("Tous");
  const [cercles, setCercles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useAuth();
  const supabase = createClient();
  
  const filters = [
    { id: "Tous", label: t("filter_all") },
    { id: "En cours", label: t("filter_ongoing") },
    { id: "En attente", label: t("filter_waiting") },
    { id: "Terminés", label: t("filter_done") }
  ];

  useEffect(() => {
    const fetchCercles = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('circles')
        .select('*, cycles(id, status, pot_amount, payments(amount, status))')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching cercles:", error);
      } else if (data) {
        const mappedCercles = data.map(c => {
          const activeCycle = c.cycles?.find((cy: any) => cy.status === 'active');
          let currentPot = 0;
          
          if (activeCycle && activeCycle.payments) {
            // Calculer dynamiquement le pot en additionnant les paiements validés
            currentPot = activeCycle.payments
              .filter((p: any) => p.status === 'completed')
              .reduce((sum: number, p: any) => sum + Number(p.amount), 0);
          }

          return {
            id: c.id,
            name: c.name,
            status: c.status,
            membersCount: c.current_members || 1,
            membersMax: c.max_members,
            potStatus: currentPot,
            potTarget: c.pot_target || 1, // éviter division par 0
            nextPayment: "En attente",
            amount: `${c.amount.toLocaleString('fr-FR')} FCFA`,
            isOrganizer: c.organizer_id === user.id,
            image: c.icon_emoji || "💰"
          };
        });
        setCercles(mappedCercles);
      }
      setIsLoading(false);
    };

    fetchCercles();
  }, [user]);

  const filteredCercles = filter === "Tous" ? cercles : cercles.filter(c => c.status === filter);

  return (
    <div className="max-w-[1200px] mx-auto relative min-h-[80vh]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">{t("circles_title")}</h1>
          <p className="text-textSecondary mt-1">{t("circles_subtitle")}</p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {filters.map(f => (
            <button 
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${
                filter === f.id 
                  ? 'bg-textPrimary text-surface shadow-md' 
                  : 'bg-surface border border-border text-textSecondary hover:border-textSecondary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-center text-textSecondary h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p>Chargement de vos cercles...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCercles.map(cercle => (
          <div key={cercle.id} className="bg-surface rounded-2xl border border-border p-5 md:p-6 shadow-sm flex flex-col group hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primaryLight flex items-center justify-center text-primary font-bold text-xl shadow-sm shrink-0">
                  {cercle.image}
                </div>
                <div>
                  <h3 className="font-bold text-textPrimary text-lg leading-tight group-hover:text-primary transition-colors">{cercle.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      cercle.status === 'En cours' ? 'bg-success/10 text-success' : 
                      cercle.status === 'En attente' ? 'bg-warning/10 text-warning' : 'bg-gray-100 dark:bg-gray-800 text-textSecondary'
                    }`}>
                      {cercle.status === 'En cours' ? t("filter_ongoing") : cercle.status === 'En attente' ? t("filter_waiting") : t("filter_done")}
                    </span>
                    {cercle.isOrganizer && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                        {t("pro_org").split(" ")[1] || "Organisateur"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6 relative z-10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-textSecondary flex items-center gap-2"><Wallet size={16} /> {t("circle_amount")}</span>
                <span className="font-bold text-textPrimary">{cercle.amount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-textSecondary flex items-center gap-2"><CalendarClock size={16} /> {t("circle_next_pay")}</span>
                <span className="font-bold text-textPrimary">{cercle.nextPayment}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-textSecondary flex items-center gap-2"><Users size={16} /> {t("circle_members")}</span>
                <span className="font-bold text-textPrimary">{cercle.membersCount} / {cercle.membersMax}</span>
              </div>
            </div>

            <div className="mb-6 relative z-10">
              <div className="flex justify-between text-xs text-textSecondary mb-2 font-medium">
                <span>{t("circle_pot_collected")}</span>
                <span>{((cercle.potStatus / cercle.potTarget) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${cercle.status === 'Terminés' ? 'bg-success' : 'bg-primary'}`}
                  style={{ width: `${(cercle.potStatus / cercle.potTarget) * 100}%` }}
                ></div>
              </div>
            </div>

            <Link href={`/cercles/${cercle.id}`} className="mt-auto relative z-10">
              <button className="w-full py-2.5 bg-gray-50 dark:bg-slate-800 hover:bg-primary dark:hover:bg-primary text-textPrimary hover:text-white font-bold rounded-xl border border-border hover:border-primary transition-all duration-300">
                {t("btn_manage_circle")}
              </button>
            </Link>
          </div>
        ))}
      </div>

          {filteredCercles.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-2xl">
              <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-textSecondary">
                <Filter size={32} />
              </div>
              <h3 className="text-lg font-bold text-textPrimary mb-1">{t("circle_empty_title")}</h3>
              <p className="text-textSecondary text-sm mb-6">{t("circle_empty_desc")}</p>
              <Link href="/cercles/nouveau">
                <button className="text-primary font-bold hover:underline">
                  Créer un cercle
                </button>
              </Link>
            </div>
          )}
        </>
      )}

      {/* Floating Action Button */}
      <Link href="/cercles/nouveau">
        <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary hover:bg-primary/90 hover:scale-105 hover:-translate-y-1 transition-all duration-300 rounded-full flex items-center justify-center text-white shadow-xl shadow-primary/30 z-50">
          <Plus size={28} />
        </button>
      </Link>
    </div>
  );
}
