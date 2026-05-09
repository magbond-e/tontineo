"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Award, TrendingUp, CheckCircle2, AlertCircle, Info, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ConfiancePage() {
  const [score, setScore] = useState(0);
  const targetScore = 92;

  useEffect(() => {
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

  const history = [
    { id: 1, action: "Paiement ponctuel (Cercle Entrepreneurs)", date: "10/05/2026", points: "+2", type: "positive" },
    { id: 2, action: "Paiement en avance (Famille Diop)", date: "15/04/2026", points: "+5", type: "positive" },
    { id: 3, action: "Retard de 2 jours (Voyage Dubai)", date: "02/03/2026", points: "-5", type: "negative" },
    { id: 4, action: "Création de profil vérifié", date: "01/01/2026", points: "+50", type: "positive" },
  ];

  return (
    <div className="max-w-[1000px] mx-auto min-h-[80vh] space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">Score de Confiance</h1>
        <p className="text-textSecondary mt-1">Votre réputation financière au sein de la communauté Tontineo.</p>
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
                className="text-gray-100"
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
          
          <h2 className="text-xl font-bold text-textPrimary mb-1">Excellent Profil</h2>
          <p className="text-sm text-textSecondary max-w-[200px]">Vous êtes plus fiable que 92% des utilisateurs.</p>
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
              
              <div className="relative h-2 w-full bg-gray-100 rounded-full mt-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Badges */}
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-textPrimary mb-6 flex items-center gap-2">
            <Award size={20} className="text-primary" /> Badges Débloqués
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FEF08A] to-[#EAB308] rounded-full flex items-center justify-center shadow-sm mb-2 border-2 border-white ring-2 ring-border">
                <span className="text-2xl">⚡</span>
              </div>
              <p className="text-xs font-bold text-textPrimary leading-tight">Payeur<br/>Ponctuel</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#BFDBFE] to-[#3B82F6] rounded-full flex items-center justify-center shadow-sm mb-2 border-2 border-white ring-2 ring-border">
                <span className="text-2xl">👑</span>
              </div>
              <p className="text-xs font-bold text-textPrimary leading-tight">Organisateur<br/>Pro</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FECACA] to-[#EF4444] rounded-full flex items-center justify-center shadow-sm mb-2 border-2 border-white ring-2 ring-border">
                <span className="text-2xl">❤️</span>
              </div>
              <p className="text-xs font-bold text-textPrimary leading-tight">Membre<br/>Fidèle</p>
            </div>
            
            <div className="flex flex-col items-center text-center opacity-40 grayscale">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2 border-2 border-white ring-2 ring-border">
                <span className="text-2xl">🌟</span>
              </div>
              <p className="text-xs font-bold text-textSecondary leading-tight">Légende<br/>(100 pts)</p>
            </div>
          </div>
        </div>

        {/* Historique d'impact */}
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-textPrimary">Historique des impacts</h3>
            <button className="text-primary text-xs font-bold hover:underline">Voir tout</button>
          </div>
          
          <div className="flex-1 space-y-4">
            {history.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex flex-col gap-1 pr-4 min-w-0">
                  <p className="text-sm font-bold text-textPrimary truncate">{item.action}</p>
                  <p className="text-xs text-textSecondary">{item.date}</p>
                </div>
                <div className={`font-mono font-bold text-sm px-2 py-1 rounded-md shrink-0 whitespace-nowrap ${item.type === 'positive' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                  {item.points} pts
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
            <Info size={16} className="text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-textSecondary leading-relaxed">
              Le score de confiance est calculé automatiquement. Les retards diminuent fortement votre score.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
