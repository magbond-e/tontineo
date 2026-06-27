"use client";

import React, { useState, useEffect } from "react";
import CountUp from "react-countup";
import Link from "next/link";

export default function Simulator() {
  const [amount, setAmount] = useState(25000);
  const [members, setMembers] = useState(10);
  
  const pot = amount * (members - 1); // Pot reçu par personne (sauf le sien)
  const totalSaved = amount * members * members;
  
  const presets = [5000, 10000, 25000, 50000];

  // Estimation de date
  const [estDate, setEstDate] = useState("");
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + (members / 2) * 30); // Position médiane estimée (1 mois par cycle)
    setEstDate(d.toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' }));
  }, [members]);

  return (
    <section id="simulateur" className="py-24 px-6 sm:px-16 bg-surface">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-sans font-bold text-4xl sm:text-5xl text-textPrimary tracking-tight mb-4">
            Calculez votre gain.
          </h2>
          <p className="text-lg text-textSecondary">
            Entrez le montant et le nombre de membres.
          </p>
        </div>

        <div className="bg-background border border-border rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 shadow-xl">
          <div className="flex flex-col md:flex-row gap-8 mb-10">
            {/* Montant Input */}
            <div className="flex-1">
              <label className="block text-sm font-bold text-textSecondary mb-3 uppercase tracking-wider">
                Montant de cotisation (FCFA)
              </label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-surface border-2 border-border text-textPrimary text-xl font-bold rounded-2xl px-6 py-4 focus:outline-none focus:border-primary transition-colors"
                min="1000" step="1000"
              />
            </div>
            
            {/* Membres Input */}
            <div className="flex-1">
              <label className="block text-sm font-bold text-textSecondary mb-3 uppercase tracking-wider">
                Nombre de membres
              </label>
              <input 
                type="number" 
                value={members}
                onChange={(e) => setMembers(Math.max(2, Number(e.target.value)))}
                className="w-full bg-surface border-2 border-border text-textPrimary text-xl font-bold rounded-2xl px-6 py-4 focus:outline-none focus:border-primary transition-colors"
                min="2" max="100"
              />
            </div>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-3 mb-10 pb-10 border-b border-border">
            {presets.map(p => (
              <button 
                key={p}
                onClick={() => setAmount(p)}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${amount === p ? 'bg-primary text-white shadow-md' : 'bg-surface text-textSecondary border border-border hover:bg-background'}`}
              >
                {p / 1000}K
              </button>
            ))}
          </div>

          {/* Result */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <p className="text-textSecondary text-lg font-medium mb-1">Vous recevrez</p>
              <div className="text-5xl sm:text-6xl font-sans font-extrabold text-gold tracking-tight mb-2 flex items-baseline gap-3">
                <CountUp end={pot} duration={1.2} separator=" " />
                <span className="text-2xl text-textSecondary font-medium">FCFA</span>
              </div>
              <p className="text-sm text-textSecondary mb-6">
                Estimé le {estDate} (position médiane)
              </p>
              <div className="flex gap-6 text-sm text-textSecondary">
                <span>Durée totale : <strong className="text-textPrimary">{members} mois</strong></span>
                <span>Pot du groupe : <strong className="text-textPrimary">{(amount * members).toLocaleString("fr-FR")} FCFA</strong></span>
              </div>
            </div>

            <Link
              href="/register"
              className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-white rounded-full font-bold px-8 py-5 transition-all duration-300 shadow-lg shadow-primary/20 hover:scale-[1.03] hover:-translate-y-1 w-full md:w-auto text-lg whitespace-nowrap"
            >
              Commencer l'épargne &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
