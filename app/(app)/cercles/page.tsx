"use client";

import { Plus, Users, Wallet, Filter, CalendarClock, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CerclesPage() {
  const [filter, setFilter] = useState("Tous");
  
  const filters = ["Tous", "En cours", "En attente", "Terminés"];

  const cercles = [
    {
      id: 1,
      name: "Cercle des Entrepreneurs",
      status: "En cours",
      membersCount: 10,
      membersMax: 10,
      potStatus: 400000,
      potTarget: 500000,
      nextPayment: "10/06/2026",
      amount: "50 000 FCFA",
      isOrganizer: true,
      image: "CE"
    },
    {
      id: 2,
      name: "Famille Diop Solidarité",
      status: "En cours",
      membersCount: 12,
      membersMax: 15,
      potStatus: 120000,
      potTarget: 150000,
      nextPayment: "Aujourd'hui",
      amount: "10 000 FCFA",
      isOrganizer: false,
      image: "FD"
    },
    {
      id: 3,
      name: "Projet Immobilier 2027",
      status: "En attente",
      membersCount: 4,
      membersMax: 5,
      potStatus: 0,
      potTarget: 1000000,
      nextPayment: "En attente",
      amount: "200 000 FCFA",
      isOrganizer: true,
      image: "PI"
    },
    {
      id: 4,
      name: "Voyage Dubai",
      status: "Terminés",
      membersCount: 8,
      membersMax: 8,
      potStatus: 400000,
      potTarget: 400000,
      nextPayment: "Terminé",
      amount: "50 000 FCFA",
      isOrganizer: false,
      image: "VD"
    }
  ];

  const filteredCercles = filter === "Tous" ? cercles : cercles.filter(c => c.status === filter);

  return (
    <div className="max-w-[1200px] mx-auto relative min-h-[80vh]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">Mes Cercles</h1>
          <p className="text-textSecondary mt-1">Gérez vos tontines et suivez la progression des pots.</p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {filters.map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${
                filter === f 
                  ? 'bg-textPrimary text-surface shadow-md' 
                  : 'bg-surface border border-border text-textSecondary hover:border-textSecondary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCercles.map(cercle => (
          <div key={cercle.id} className="bg-surface rounded-2xl border border-border p-6 shadow-sm flex flex-col group hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primaryLight flex items-center justify-center text-primary font-bold shadow-sm">
                  {cercle.image}
                </div>
                <div>
                  <h3 className="font-bold text-textPrimary text-lg leading-tight group-hover:text-primary transition-colors">{cercle.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      cercle.status === 'En cours' ? 'bg-success/10 text-success' : 
                      cercle.status === 'En attente' ? 'bg-warning/10 text-warning' : 'bg-gray-100 text-textSecondary'
                    }`}>
                      {cercle.status}
                    </span>
                  </div>
                </div>
              </div>
              <button className="text-textSecondary hover:text-textPrimary p-1">
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-6 relative z-10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-textSecondary flex items-center gap-2"><Wallet size={16} /> Montant</span>
                <span className="font-bold text-textPrimary">{cercle.amount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-textSecondary flex items-center gap-2"><CalendarClock size={16} /> Prochain gain</span>
                <span className="font-bold text-textPrimary">{cercle.nextPayment}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-textSecondary flex items-center gap-2"><Users size={16} /> Membres</span>
                <span className="font-bold text-textPrimary">{cercle.membersCount} / {cercle.membersMax}</span>
              </div>
            </div>

            <div className="mb-6 relative z-10">
              <div className="flex justify-between text-xs text-textSecondary mb-2 font-medium">
                <span>Pot collecté</span>
                <span>{((cercle.potStatus / cercle.potTarget) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${cercle.status === 'Terminés' ? 'bg-success' : 'bg-primary'}`}
                  style={{ width: `${(cercle.potStatus / cercle.potTarget) * 100}%` }}
                ></div>
              </div>
            </div>

            <Link href={`/cercles/${cercle.id}`} className="mt-auto relative z-10">
              <button className="w-full py-2.5 bg-gray-50 hover:bg-primary text-textPrimary hover:text-white font-bold rounded-xl border border-border hover:border-primary transition-all duration-300">
                Gérer le cercle
              </button>
            </Link>
          </div>
        ))}
      </div>

      {filteredCercles.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-2xl">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-textSecondary">
            <Filter size={32} />
          </div>
          <h3 className="text-lg font-bold text-textPrimary mb-1">Aucun cercle trouvé</h3>
          <p className="text-textSecondary text-sm mb-6">Vous n'avez aucun cercle avec ce statut pour le moment.</p>
          <button onClick={() => setFilter("Tous")} className="text-primary font-bold hover:underline">
            Afficher tous les cercles
          </button>
        </div>
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
