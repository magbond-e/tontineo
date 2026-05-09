"use client";

import { Wallet, AlertCircle, Calendar, ArrowRight, ArrowDownRight, ArrowUpRight, Coins, Users, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function MemberDashboardPage() {
  const activeTontines = [
    {
      id: 1,
      name: "Cercle des Entrepreneurs",
      amount: "50 000 FCFA",
      frequency: "Mensuel",
      nextPayment: "10/06/2026",
      status: "À jour",
      progress: 3,
      totalMembers: 10,
    },
    {
      id: 2,
      name: "Famille Diop Solidarité",
      amount: "10 000 FCFA",
      frequency: "Hebdomadaire",
      nextPayment: "Aujourd'hui",
      status: "En attente",
      progress: 5,
      totalMembers: 12,
    }
  ];

  const calendarMembers = [
    { id: 1, name: "Jean D.", date: "15 Mai", status: "payé" },
    { id: 2, name: "Marie K.", date: "15 Juin", status: "payé" },
    { id: 3, name: "Sarah L.", date: "15 Juillet", status: "payé" },
    { id: 4, name: "Amadou K. (Vous)", date: "15 Août", status: "en attente", isCurrent: true },
    { id: 5, name: "Kofi A.", date: "15 Septembre", status: "en attente" },
  ];

  const recentTransactions = [
    { id: "TX-010", type: "Cotisation (Cercle Entrepreneurs)", amount: "50 000 FCFA", date: "10/05/2026", isPositive: false },
    { id: "TX-009", type: "Rechargement Wallet", amount: "60 000 FCFA", date: "09/05/2026", isPositive: true },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      {/* Notification J-2 */}
      <div className="bg-warning/10 border border-warning/20 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-warning/20 rounded-full text-warning">
            <AlertCircle size={20} />
          </div>
          <div>
            <h4 className="text-warning font-bold text-sm">Paiement imminent</h4>
            <p className="text-warning/80 text-xs mt-0.5">Votre cotisation de 10 000 FCFA pour "Famille Diop Solidarité" est due aujourd'hui.</p>
          </div>
        </div>
        <button className="px-4 py-1.5 bg-warning text-white font-bold rounded-full text-sm shadow-md hover:bg-warning/90 transition-all">
          Payer
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">Espace Membre</h1>
          <p className="text-textSecondary mt-1">Gérez vos cotisations et suivez vos gains.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Active Tontines & Calendar */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Mes Tontines Actives */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-textPrimary">Mes Tontines Actives</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTontines.map(tontine => (
                <div key={tontine.id} className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:border-primary/30 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-textPrimary text-lg">{tontine.name}</h3>
                      <p className="text-xs text-textSecondary mt-1">{tontine.amount} • {tontine.frequency}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${tontine.status === 'À jour' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                      {tontine.status}
                    </span>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between text-xs text-textSecondary mb-2">
                      <span>Prochain paiement: <strong className="text-textPrimary">{tontine.nextPayment}</strong></span>
                      <span>{tontine.progress}/{tontine.totalMembers} tours</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${(tontine.progress/tontine.totalMembers)*100}%` }}></div>
                    </div>
                  </div>

                  <button className="w-full py-2.5 bg-primary hover:bg-primary/90 hover:-translate-y-0.5 text-white font-bold rounded-xl shadow-md shadow-primary/20 transition-all duration-300">
                    Cotiser maintenant
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Calendrier de Gain */}
          <section className="bg-surface rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="text-primary" size={20} />
              <h2 className="text-lg font-bold text-textPrimary">Calendrier de Gain (Cercle des Entrepreneurs)</h2>
            </div>
            
            <div className="bg-primaryLight/30 rounded-xl p-4 mb-6 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-primary font-medium">Votre tour arrive bientôt !</p>
                <p className="text-xl font-extrabold text-primary mt-1">Vous êtes le 4ème sur 10.</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-textSecondary">Date de gain estimée</p>
                <p className="text-lg font-bold text-textPrimary font-mono">15 Août 2026</p>
              </div>
            </div>

            <div className="relative">
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
          </section>

        </div>

        {/* Right Column - Wallet & Quick Links */}
        <div className="space-y-6">
          
          {/* Wallet Card */}
          <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Wallet className="text-primary" size={24} />
            </div>
            <p className="text-sm font-medium text-textSecondary">Solde Disponible</p>
            <h2 className="text-3xl font-extrabold text-textPrimary font-mono mt-1 mb-6">12 500 FCFA</h2>
            
            <div className="flex gap-3 w-full">
              <button className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-textPrimary font-bold rounded-xl transition-colors text-sm">
                Recharger
              </button>
              <button className="flex-1 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors shadow-md shadow-primary/20 text-sm">
                Retirer
              </button>
            </div>
          </div>

          {/* Wallet Transactions */}
          <div className="bg-surface rounded-2xl border border-border shadow-sm p-6">
            <h3 className="text-sm font-bold text-textPrimary mb-4">Activité du Wallet</h3>
            <div className="space-y-4">
              {recentTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.isPositive ? 'bg-success/10 text-success' : 'bg-gray-100 text-textSecondary'}`}>
                      {tx.isPositive ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-textPrimary max-w-[140px] truncate">{tx.type}</p>
                      <p className="text-xs text-textSecondary">{tx.date}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-mono font-bold ${tx.isPositive ? 'text-success' : 'text-textPrimary'}`}>
                    {tx.isPositive ? '+' : '-'}{tx.amount}
                  </span>
                </div>
              ))}
            </div>
            <Link href="/portefeuille" className="block text-center text-sm font-bold text-primary hover:text-primary/80 mt-6 transition-colors">
              Voir tout le portefeuille →
            </Link>
          </div>

          {/* Quick Info */}
          <div className="bg-gradient-to-br from-primary to-[#22C55E] rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-2">Score de Confiance</h3>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-4xl font-extrabold font-mono">98</span>
              <span className="text-white/80 font-medium pb-1">/100</span>
            </div>
            <p className="text-sm text-white/90">Vous êtes dans le top 5% des payeurs les plus ponctuels !</p>
            <Link href="/confiance" className="inline-flex items-center gap-1 text-sm font-bold mt-4 hover:underline">
              Voir les détails <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
