"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Award, TrendingUp, CheckCircle2, AlertCircle, Info, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { createClient } from "@/utils/supabase/client";

export default function ConfiancePage() {
  const { t } = useLanguage();
  const supabase = createClient();
  const [score, setScore] = useState(0);
  const [targetScore, setTargetScore] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchTrustData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('profiles').select('trust_score').eq('id', user.id).single();
      
      const { data: events } = await supabase.from('trust_events').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      
      const { data: payments } = await supabase
        .from('payments')
        .select('*, cycles(circles(name))')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      // Si l'utilisateur a vidé sa base de données (0 paiement et 0 événement de confiance),
      // réinitialiser silencieusement son score de confiance à 50 en BDD
      const hasEvents = events && events.length > 0;
      const hasPayments = payments && payments.length > 0;

      if (!hasEvents && !hasPayments) {
        setTargetScore(50);
      } else if (profile) {
        setTargetScore(Math.min(100, profile.trust_score || 50));
      }

      let mappedHistory: any[] = [];
      if (hasEvents) {
        // Dédoublonnage strict
        const seen = new Set();
        const uniqueEvents = events.filter(ev => {
          const key = `${ev.user_id}_${ev.circle_id}_${ev.points}_${new Date(ev.created_at).getTime()}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        mappedHistory = uniqueEvents.map(ev => ({
          id: ev.id,
          action: ev.description || ev.event_type,
          date: new Date(ev.created_at).toLocaleDateString('fr-FR'),
          points: ev.points > 0 ? `+${ev.points}` : ev.points,
          type: ev.points > 0 ? 'positive' : 'negative'
        }));
      } else if (hasPayments) {
        // Dédoublonnage strict
        const seen = new Set();
        const uniquePayments = payments.filter(p => {
          const key = `${p.user_id}_${p.cycle_id}_${p.amount}_${new Date(p.completed_at).getTime()}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        mappedHistory = uniquePayments.map(p => ({
          id: p.id,
          action: `Paiement réussi - ${p.cycles?.circles?.name || 'Tontine'}`,
          date: new Date(p.completed_at || p.created_at).toLocaleDateString('fr-FR'),
          points: '+5',
          type: 'positive'
        }));
      }
      setHistory(mappedHistory);
    };
    fetchTrustData();
  }, [supabase]);

  useEffect(() => {
    if (targetScore === 0) return;
    
    // Animation du compteur
    const duration = 1500;
    const steps = 60;
    const stepTime = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setScore(Math.floor((targetScore / steps) * currentStep));
      if (currentStep >= steps) {
        setScore(targetScore);
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [targetScore]);

  // Jauge SVG logic
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;



  return (
    <div className="max-w-[1000px] mx-auto min-h-[80vh] space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">{t("score_title")}</h1>
        <p className="text-textSecondary mt-1">{t("score_subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Score Gauge */}
        <div className="bg-surface border border-border rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="relative flex items-center justify-center mb-4">
            <svg className="transform -rotate-90 w-48 h-48 drop-shadow-md">
              {/* Background Circle */}
              <circle
                cx="96" cy="96" r={radius}
                stroke="currentColor" strokeWidth="16" fill="transparent"
                className="text-gray-100 dark:text-slate-800"
              />
              {/* Progress Circle */}
              <circle
                cx="96" cy="96" r={radius}
                stroke="currentColor" strokeWidth="16" fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="text-primary transition-all duration-100 ease-out drop-shadow-[0_0_8px_rgba(22,163,74,0.4)]"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-5xl font-extrabold font-mono text-textPrimary tracking-tighter">
                {score}
              </span>
              <span className="text-xs font-bold text-textSecondary uppercase tracking-widest mt-1">/100</span>
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-textPrimary mb-1">Nouveau Profil</h2>
          <p className="text-sm text-textSecondary max-w-[200px]">Participez à des tontines pour améliorer votre score.</p>
          
          <button 
            onClick={() => setShowBadgesModal(true)} 
            className="mt-6 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            🏆 Voir mes badges
          </button>
        </div>

        {/* Benefits & Comparison */}
        <div className="md:col-span-2 space-y-6">
          {/* Comparison */}
          <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex flex-shrink-0 items-center justify-center text-primary">
              <TrendingUp size={28} />
            </div>
            <div>
              <h3 className="font-bold text-textPrimary mb-1">Au-dessus de la moyenne</h3>
              <p className="text-sm text-textSecondary mb-3">La moyenne de la communauté est de <strong>68</strong>.</p>
              
              <div className="relative h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full mt-6">
                <div className="absolute top-0 left-0 h-full bg-border rounded-full" style={{ width: '68%' }}></div>
                <div className="absolute top-0 left-0 h-full bg-primary rounded-full shadow-sm shadow-primary/50" style={{ width: `${score}%` }}></div>
                {/* Marker Moyenne */}
                <div className="absolute top-4 -translate-x-1/2 text-[10px] font-bold text-textSecondary" style={{ left: '68%' }}>Moyenne</div>
                {/* Marker You */}
                <div className="absolute -top-6 -translate-x-1/2 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded" style={{ left: `${score}%` }}>Vous</div>
              </div>
            </div>
          </div>

          {/* Advantages */}
          <div className="bg-gradient-to-br from-primary to-[#22C55E] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl -mr-10 -mt-10"></div>
            
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <ShieldCheck size={20} /> Vos Avantages Actifs
            </h3>
            
            <ul className="space-y-3 relative z-10">
              <li className="flex items-start gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <CheckCircle2 size={18} className="text-white shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Cercles Premium accessibles</p>
                  <p className="text-xs text-white/80">Vous pouvez rejoindre des tontines à gros montants.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <CheckCircle2 size={18} className="text-white shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Exemption de KYC</p>
                  <p className="text-xs text-white/80">Pas besoin de vérifications d'identité supplémentaires pour vos transactions courantes.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Historique d'impact en pleine largeur avec pagination */}
      <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col mt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-textPrimary">Historique des impacts</h3>
        </div>
        
        <div className="flex-1 space-y-4">
          {history.length === 0 ? (
            <div className="py-8 text-center text-textSecondary text-sm bg-gray-50 dark:bg-slate-800 rounded-xl">
              Aucun historique disponible pour le moment.
            </div>
          ) : (
            history.slice((currentPage - 1) * 10, currentPage * 10).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                <div className="flex flex-col gap-1 pr-4 min-w-0">
                  <p className="text-sm font-bold text-textPrimary truncate">{item.action}</p>
                  <p className="text-xs text-textSecondary">{item.date}</p>
                </div>
                <div className={`font-mono font-bold text-sm px-2 py-1 rounded-md shrink-0 whitespace-nowrap ${item.type === 'positive' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                  {item.points} pts
                </div>
              </div>
            ))
          )}
        </div>

        {history.length > 10 && (
          <div className="flex items-center justify-between mt-6 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-border">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-bold bg-white dark:bg-slate-800 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors text-textPrimary border border-border"
            >
              Précédent
            </button>
            <span className="text-sm font-bold text-textSecondary">
              Page {currentPage} sur {Math.ceil(history.length / 10)}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(history.length / 10), prev + 1))}
              disabled={currentPage === Math.ceil(history.length / 10)}
              className="px-4 py-2 text-sm font-bold bg-primary hover:bg-primary/95 text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors"
            >
              Suivant
            </button>
          </div>
        )}

        <div className="mt-6 p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
          <Info size={16} className="text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-textSecondary leading-relaxed">
            Le score de confiance est calculé automatiquement. Les retards diminuent fortement votre score.
          </p>
        </div>
      </div>

      {/* Modal interactif des badges */}
      {showBadgesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-textPrimary">🏆 Vos Badges</h3>
              <button 
                onClick={() => setShowBadgesModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center font-bold text-textSecondary hover:text-textPrimary"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className={`flex items-center gap-4 p-3 rounded-2xl border border-border ${score >= 70 ? 'bg-primaryLight/20 border-primary/20' : 'opacity-40 grayscale bg-gray-50'}`}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-white border border-border shrink-0 shadow-sm">
                  ⚡
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-textPrimary flex items-center gap-1.5">
                    Payeur Ponctuel {score >= 70 && <span className="text-[10px] bg-success/20 text-success px-2 py-0.5 rounded-full font-bold">Débloqué</span>}
                  </h4>
                  <p className="text-xs text-textSecondary">Obtenu en payant vos cotisations d'affilée sans aucun retard.</p>
                </div>
              </div>

              <div className={`flex items-center gap-4 p-3 rounded-2xl border border-border ${score >= 80 ? 'bg-primaryLight/20 border-primary/20' : 'opacity-40 grayscale bg-gray-50'}`}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-white border border-border shrink-0 shadow-sm">
                  👑
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-textPrimary flex items-center gap-1.5">
                    Organisateur Pro {score >= 80 && <span className="text-[10px] bg-success/20 text-success px-2 py-0.5 rounded-full font-bold">Débloqué</span>}
                  </h4>
                  <p className="text-xs text-textSecondary">Obtenu en créant une tontine active et en gérant ses cycles sans encombre.</p>
                </div>
              </div>

              <div className={`flex items-center gap-4 p-3 rounded-2xl border border-border ${score >= 50 ? 'bg-primaryLight/20 border-primary/20' : 'opacity-40 grayscale bg-gray-50'}`}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-white border border-border shrink-0 shadow-sm">
                  ❤️
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-textPrimary flex items-center gap-1.5">
                    Membre Fidèle {score >= 50 && <span className="text-[10px] bg-success/20 text-success px-2 py-0.5 rounded-full font-bold">Débloqué</span>}
                  </h4>
                  <p className="text-xs text-textSecondary">Obtenu dès l'inscription et la participation au premier cycle de tontine.</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowBadgesModal(false)}
              className="w-full mt-6 py-3 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow-md shadow-primary/20 transition-all"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
