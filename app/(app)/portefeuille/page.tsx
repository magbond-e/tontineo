"use client";

import { Wallet, ArrowDownRight, ArrowUpRight, Download, Send, Plus, History } from "lucide-react";
import { useState } from "react";

export default function PortefeuillePage() {
  const [activeTab, setActiveTab] = useState("Historique");

  const transactions = [
    { id: "TX-982", date: "09 Mai 2026", time: "14:30", description: "Rechargement via Mobile Money", amount: "60 000 FCFA", type: "in", receipt: true },
    { id: "TX-981", date: "05 Mai 2026", time: "10:15", description: "Cotisation - Cercle Entrepreneurs", amount: "50 000 FCFA", type: "out", receipt: true },
    { id: "TX-980", date: "28 Avr 2026", time: "09:00", description: "Gain Tontine - Famille Diop", amount: "150 000 FCFA", type: "in", receipt: true },
    { id: "TX-979", date: "28 Avr 2026", time: "16:45", description: "Retrait vers MTN Mobile Money", amount: "100 000 FCFA", type: "out", receipt: true },
    { id: "TX-978", date: "15 Avr 2026", time: "11:20", description: "Frais de retard", amount: "1 000 FCFA", type: "out", receipt: false },
  ];

  return (
    <div className="max-w-[1000px] mx-auto min-h-[80vh] space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">Mon Portefeuille</h1>
        <p className="text-textSecondary mt-1">Gérez vos fonds sécurisés sur Tontineo via FedaPay.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Balance Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-primary to-[#22C55E] rounded-3xl p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-tl-full"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-2 text-white/90 font-medium mb-4">
              <Wallet size={20} /> Solde Total Disponible
            </div>
            
            <div className="mb-6">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold font-mono tracking-tight whitespace-nowrap">12 500 <span className="text-3xl md:text-4xl font-bold text-white/80">FCFA</span></h2>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm">
                <Plus size={18} /> Recharger
              </button>
              <button className="flex items-center gap-2 bg-black/20 hover:bg-black/30 text-white px-6 py-3 rounded-xl font-bold transition-colors backdrop-blur-sm">
                <ArrowUpRight size={18} /> Retirer
              </button>
              <button className="flex items-center gap-2 bg-black/20 hover:bg-black/30 text-white px-6 py-3 rounded-xl font-bold transition-colors backdrop-blur-sm">
                <Send size={18} /> Transférer
              </button>
            </div>
          </div>
        </div>

        {/* Mini Chart / Analytics */}
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-textPrimary mb-1">Résumé (30 Jours)</h3>
            <p className="text-xs text-textSecondary">Évolution de vos fonds</p>
          </div>
          
          {/* Mockup CSS Chart */}
          <div className="flex items-end justify-between h-32 mt-6 gap-2">
            {[40, 70, 30, 80, 50, 90, 60].map((h, i) => (
              <div key={i} className="w-full flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-full bg-primary/20 rounded-t-md relative group-hover:bg-primary transition-colors" style={{ height: `${h}%` }}>
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-textPrimary text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Jour {i+1}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between mt-4 pt-4 border-t border-border">
            <div>
              <p className="text-[10px] text-textSecondary uppercase font-bold">Entrées</p>
              <p className="text-sm font-bold text-success">+ 210K</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-textSecondary uppercase font-bold">Sorties</p>
              <p className="text-sm font-bold text-textPrimary">- 151K</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden mt-8">
        <div className="flex border-b border-border">
          <button 
            className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'Historique' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-textSecondary hover:bg-gray-50'}`}
            onClick={() => setActiveTab('Historique')}
          >
            Historique des Transactions
          </button>
          <button 
            className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'Attente' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-textSecondary hover:bg-gray-50'}`}
            onClick={() => setActiveTab('Attente')}
          >
            En attente (0)
          </button>
        </div>

        <div className="p-0">
          {activeTab === 'Historique' && (
            <div className="divide-y divide-border">
              {transactions.map(tx => (
                <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-4 min-w-0 pr-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${tx.type === 'in' ? 'bg-success/10 text-success' : 'bg-surface border border-border text-textPrimary'}`}>
                      {tx.type === 'in' ? <ArrowDownRight size={24} /> : <ArrowUpRight size={24} />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-textPrimary text-sm mb-0.5 truncate">{tx.description}</p>
                      <p className="text-xs text-textSecondary flex items-center gap-2 truncate">
                        {tx.date} à {tx.time} <span className="w-1 h-1 rounded-full bg-border shrink-0"></span> <span className="truncate">Réf: {tx.id}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 shrink-0">
                    <span className={`font-mono font-bold whitespace-nowrap ${tx.type === 'in' ? 'text-success' : 'text-textPrimary'}`}>
                      {tx.type === 'in' ? '+' : '-'}{tx.amount}
                    </span>
                    
                    {tx.receipt ? (
                      <button className="text-textSecondary hover:text-primary transition-colors p-2 bg-surface border border-border rounded-lg shadow-sm hover:shadow-md" title="Télécharger le reçu PDF">
                        <Download size={16} />
                      </button>
                    ) : (
                      <div className="w-8"></div> // Placeholder for alignment
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'Attente' && (
            <div className="p-12 text-center text-textSecondary flex flex-col items-center">
              <History size={32} className="mb-4 opacity-50" />
              <p>Aucune transaction en attente.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
