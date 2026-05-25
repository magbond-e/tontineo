"use client";

import { useEffect, useState } from "react";
import { Wallet, AlertCircle, Calendar, ArrowRight, ArrowDownRight, ArrowUpRight, Coins, Users, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { createClient } from "@/utils/supabase/client";

export default function MemberDashboardPage() {
  const { t } = useLanguage();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTontines, setActiveTontines] = useState<any[]>([]);
  const [calendarMembers, setCalendarMembers] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [trustScore, setTrustScore] = useState<number>(50);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch User Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('trust_score, wallet_balance')
          .eq('id', user.id)
          .single();

        // Réinitialisation automatique du score de confiance à 50 si l'historique est vierge
        const { data: events } = await supabase.from('trust_events').select('id').eq('user_id', user.id).limit(1);
        const { data: payments } = await supabase.from('payments').select('id').eq('user_id', user.id).eq('status', 'completed').limit(1);

        const hasEvents = events && events.length > 0;
        const hasPayments = payments && payments.length > 0;

        if (!hasEvents && !hasPayments) {
          setTrustScore(50);
        } else if (profile) {
          setTrustScore(Math.min(100, profile.trust_score || 50));
        }

        if (profile) {
          setWalletBalance(profile.wallet_balance || 0);
        }

        // Fetch Active Tontines
        const { data: memberships } = await supabase
          .from('memberships')
          .select('circle_id, circles(*)')
          .eq('user_id', user.id);

        let tontines: any[] = [];
        if (memberships) {
          tontines = (memberships as any[])
            .filter((m: any) => m.circles && m.circles.status === 'En cours')
            .map((m: any) => ({
              id: m.circles.id,
              name: m.circles.name,
              amount: `${m.circles.amount.toLocaleString('fr-FR')} FCFA`,
              frequency: m.circles.frequency,
              status: "Actif", 
              nextPayment: "Voir détails", 
              progress: 0,
              totalMembers: m.circles.current_members
            }));
        }

        // Fetch Recent Contributions
        const { data: pTxs } = await supabase
          .from('payments')
          .select('*, cycles(circles(name))')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false });

        let txs: any[] = [];
        if (pTxs && pTxs.length > 0) {
          const seen = new Set();
          const uniquePTxs = pTxs.filter(tx => {
            const key = `${tx.user_id}_${tx.cycle_id}_${tx.amount}_${new Date(tx.completed_at).getTime()}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          txs = uniquePTxs.slice(0, 5).map((tx: any) => ({
            id: tx.id,
            type: `Cotisation - ${tx.cycles?.circles?.name || 'Tontine'}`,
            date: new Date(tx.completed_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
            amount: `${Number(tx.amount).toLocaleString('fr-FR')} FCFA`,
            isPositive: false
          }));
        }

        // Fetch Calendar for the first active tontine
        if (tontines.length > 0) {
          const firstTontineId = tontines[0].id;
          const { data: circleMembers } = await supabase
            .from('memberships')
            .select('id, user_id, draw_position, status, profiles(full_name)')
            .eq('circle_id', firstTontineId)
            .order('draw_position', { ascending: true });

          if (circleMembers) {
            const mappedCalendar = (circleMembers as any[]).map((m: any, index) => ({
              id: m.id,
              name: (m.profiles && !Array.isArray(m.profiles) ? (m.profiles as any).full_name : "Membre") || "Membre",
              date: "Cycle " + (index + 1),
              status: m.status === 'payé' ? 'payé' : 'en_attente',
              isCurrent: m.user_id === user.id
            }));
            setCalendarMembers(mappedCalendar);
          }
        }

        setActiveTontines(tontines);
        setRecentTransactions(txs);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching member data", error);
        setIsLoading(false);
      }
    };
    fetchMemberData();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-8 animate-pulse">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="w-48 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="w-64 h-4 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <div className="flex flex-col gap-8 h-full">
            <div className="bg-surface border border-border rounded-2xl p-6 h-64 bg-gray-100 dark:bg-gray-800"></div>
            <div className="bg-surface border border-border rounded-2xl p-6 h-64 bg-gray-100 dark:bg-gray-800"></div>
          </div>
          <div className="flex flex-col gap-8 h-full">
            <div className="bg-surface border border-border rounded-2xl p-6 h-96 bg-gray-100 dark:bg-gray-800"></div>
            <div className="bg-surface border border-border rounded-2xl p-6 h-48 bg-gray-100 dark:bg-gray-800"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">{t("member_space_title")}</h1>
          <p className="text-textSecondary mt-1">{t("member_space_subtitle")}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left Column - Active Tontines & Calendar */}
        <div className="flex flex-col gap-8 h-full">
          
          {/* Mes Tontines Actives */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-textPrimary">{t("member_active_tontines")}</h2>
            </div>
            
            {activeTontines.length === 0 ? (
              <div className="bg-surface border border-border rounded-2xl p-8 text-center text-textSecondary font-medium">
                Vous n'avez pas de tontine en cours actuellement. Rejoignez un cercle ou créez-en un pour commencer à cotiser.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {activeTontines.map(tontine => (
                  <Link href={`/cercles/${tontine.id}`} key={tontine.id} className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:border-primary/30 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-textPrimary text-lg group-hover:text-primary transition-colors">{tontine.name}</h3>
                        <p className="text-xs text-textSecondary mt-1">{tontine.amount} • {tontine.frequency}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success`}>
                        {tontine.status}
                      </span>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex justify-between text-xs text-textSecondary mb-2">
                        <span>Aller au cercle</span>
                        <span>{tontine.totalMembers} {t("tours")}</span>
                      </div>
                    </div>

                    <button className="w-full py-2.5 bg-primary hover:bg-primary/90 hover:-translate-y-0.5 text-white font-bold rounded-xl shadow-md shadow-primary/20 transition-all duration-300 pointer-events-none">
                      Gérer ce cercle
                    </button>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Historique des transactions */}
          <section className="bg-surface rounded-2xl border border-border shadow-sm p-6">
            <h3 className="text-sm font-bold text-textPrimary mb-4">Vos cotisations récentes</h3>
            
            {recentTransactions.length === 0 ? (
              <div className="py-4 text-center text-textSecondary text-sm">
                Aucune cotisation récente dans vos cercles.
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-textSecondary`}>
                        <Coins size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-textPrimary max-w-[200px] truncate" title={tx.type}>{tx.type}</p>
                        <p className="text-xs text-textSecondary">{tx.date}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-mono font-bold text-textPrimary`}>
                      - {tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Right Column - Calendar */}
        <div className="flex flex-col gap-8 h-full">
          {/* Calendrier de Gain */}
          <section className="bg-surface rounded-2xl border border-border shadow-sm p-6 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="text-primary" size={20} />
              <h2 className="text-lg font-bold text-textPrimary">{t("member_calendar")}</h2>
            </div>
            
            {calendarMembers.length === 0 ? (
              <div className="text-center text-textSecondary font-medium py-8 bg-gray-50/50 dark:bg-slate-800/30 rounded-xl flex-1 flex items-center justify-center">
                Dès que vous commencerez une tontine, votre calendrier de gain s'affichera ici.
              </div>
            ) : (
              <>
                <div className="bg-primaryLight/30 rounded-xl p-4 mb-6 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-primary font-medium">{t("member_turn_soon")}</p>
                    <p className="text-xl font-extrabold text-primary mt-1">{t("member_position")} 4ème {t("member_on")} 10.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-textSecondary">{t("estimated_win")}</p>
                    <p className="text-lg font-bold text-textPrimary font-mono">15 Août 2026</p>
                  </div>
                </div>

                <div className="relative flex-1">
                  <div className="absolute top-0 bottom-0 left-[15px] w-0.5 bg-border z-0"></div>
                  <div className="space-y-4 relative z-10">
                    {calendarMembers.map((member, i) => (
                      <div key={member.id} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${member.isCurrent ? 'bg-primary shadow-md transform scale-[1.02]' : 'hover:bg-gray-50'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${member.isCurrent ? 'bg-white text-primary' : member.status === 'payé' ? 'bg-success/20 text-success' : 'bg-gray-200 text-textSecondary'}`}>
                          {member.status === 'payé' ? <CheckCircle2 size={16} /> : i + 1}
                        </div>
                        <div className="flex-1 flex justify-between items-center">
                          <div>
                            <p className={`font-bold text-sm ${member.isCurrent ? 'text-white' : 'text-textPrimary'}`}>{member.name}</p>
                            <p className={`text-xs ${member.isCurrent ? 'text-white/80' : 'text-textSecondary'}`}>Tour prévu : {member.date}</p>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded-md ${member.isCurrent ? 'bg-white/20 text-white' : member.status === 'payé' ? 'text-success bg-success/10' : 'text-textSecondary bg-gray-100'}`}>
                            {member.status === 'payé' ? 'Déjà pris' : 'À venir'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>

          {/* Quick Info */}
          <div className="bg-gradient-to-br from-primary to-[#22C55E] rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-2">{t("member_trust_score")}</h3>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-4xl font-extrabold font-mono">{trustScore}</span>
              <span className="text-white/80 font-medium pb-1">/100</span>
            </div>
            <p className="text-sm text-white/90">Vous êtes dans la bonne moyenne. Continuez à payer à temps !</p>
            <Link href="/confiance" className="inline-flex items-center gap-1 text-sm font-bold mt-4 hover:underline">
              {t("member_see_details")} <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
