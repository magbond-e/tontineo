"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section id="fonctionnalites" className="py-24 px-6 sm:px-16 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-sans font-extrabold text-4xl sm:text-5xl text-textPrimary tracking-tighter mb-4">
            La tontine et l'épargne, réinventées.
          </h2>
          <p className="text-lg text-textSecondary font-medium">
            Sans le chaos. Sans le cash. Sans les disputes.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <motion.div variants={itemVariants}><LiveFeedCard /></motion.div>
          <motion.div variants={itemVariants}><TerminalCard /></motion.div>
          <motion.div variants={itemVariants}><SavingsCard /></motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// CARTE 1: Flux de Cotisation Live
function LiveFeedCard() {
  const entries = [
    { name: "Aminata K.", amount: "25 000 FCFA", method: "Wave", status: "success", icon: "✓" },
    { name: "Kofi M.", amount: "25 000 FCFA", method: "MTN", status: "success", icon: "✓" },
    { name: "Fatou D.", amount: "En attente...", method: "", status: "pending", icon: "⏳" },
    { name: "Ibrahim S.", amount: "25 000 FCFA", method: "Orange", status: "success", icon: "✓" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % entries.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [entries.length]);

  return (
    <div className="group bg-surface rounded-3xl p-6 border border-border shadow-sm hover:-translate-y-2 hover:shadow-lg transition-all duration-300 flex flex-col h-[400px]">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 rounded-full bg-primary status-pulse"></div>
        <span className="font-sans font-bold text-sm tracking-widest text-textSecondary uppercase">Cotisation en direct</span>
      </div>
      
      <div className="flex-1 relative overflow-hidden bg-background rounded-2xl border border-border p-4">
        <div 
          className="absolute w-full px-4 left-0 transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{ transform: `translateY(-${currentIndex * 60}px)` }}
        >
          {entries.concat(entries).map((entry, idx) => ( // Doublé pour l'illusion de boucle continue
            <div key={idx} className="h-[60px] flex items-center justify-between border-b border-border/50 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${entry.status === 'success' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                  {entry.icon}
                </div>
                <span className="font-medium text-textPrimary">{entry.name}</span>
              </div>
              <div className="text-right flex flex-col">
                <span className={`font-mono text-sm ${entry.status === 'success' ? 'text-textPrimary' : 'text-textSecondary'}`}>{entry.amount}</span>
                <span className="text-xs text-textSecondary">{entry.method}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-textSecondary font-medium">Pot actuel</span>
          <span className="font-mono font-bold text-textPrimary">175 000 / 200 000</span>
        </div>
        <div className="w-full h-2 bg-background rounded-full overflow-hidden">
          <div className="h-full bg-primary w-[87.5%] rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

// CARTE 2: Terminal de Tirage Certifié
function TerminalCard() {
  const [text, setText] = useState("");
  const fullText = `> Cycle 5 initialisé...
> Membres éligibles : 8
> Seed cryptographique : a3f7b...
> Fisher-Yates shuffle...
> ✓ GAGNANT : Aminata Kouyaté 🎉
> Pot : 200 000 FCFA → virement...
> Preuve #SHA256: 8f2a9...`;
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setText(fullText.substring(0, index));
        index++;
      } else {
        setTimeout(() => { index = 0; }, 3000); // Reset after 3s
      }
    }, 40);
    return () => clearInterval(interval);
  }, [fullText]);

  return (
    <div className="group bg-surface rounded-3xl p-6 border border-border shadow-sm hover:-translate-y-2 hover:shadow-lg transition-all duration-300 flex flex-col h-[400px]">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 rounded-full bg-gold status-pulse"></div>
        <span className="font-sans font-bold text-sm tracking-widest text-textSecondary uppercase">Tirage Certifié</span>
      </div>
      
      <div className="flex-1 bg-textPrimary rounded-2xl p-4 font-mono text-sm text-surface overflow-hidden relative shadow-inner">
        <pre className="whitespace-pre-wrap leading-relaxed">
          {text}
          <span className="cursor-blink text-primary">_</span>
        </pre>
      </div>

      <div className="mt-6">
        <h4 className="font-bold text-textPrimary mb-1">Tirage 100% transparent</h4>
        <p className="text-sm text-textSecondary font-medium">Algorithme certifié · Preuve cryptographique</p>
      </div>
    </div>
  );
}

// CARTE 3: Épargne simplifiée (Remplace le Score de Confiance)
function SavingsCard() {
  return (
    <div className="group bg-surface rounded-3xl p-6 border border-border shadow-sm hover:-translate-y-2 hover:shadow-lg transition-all duration-300 flex flex-col h-[400px]">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 rounded-full bg-success status-pulse"></div>
        <span className="font-sans font-bold text-sm tracking-widest text-textSecondary uppercase">Épargne Simplifiée</span>
      </div>
      
      <div className="flex-1 flex flex-col justify-center gap-4 relative bg-background rounded-2xl p-6 border border-border overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.64-2.25 1.64-1.74 0-2.1-.96-2.17-1.92H8.01c.09 1.96 1.28 2.87 2.89 3.19V19h2.33v-1.67c1.73-.39 2.86-1.51 2.86-3.04 0-2.16-1.8-2.8-3.78-3.25z"/>
          </svg>
        </div>
        
        <div className="z-10">
          <p className="text-sm font-medium text-textSecondary mb-1">Objectif d'épargne</p>
          <p className="font-sans font-extrabold text-3xl text-primary tracking-tight">500 000 FCFA</p>
        </div>

        <div className="z-10 w-full bg-border rounded-full h-3 overflow-hidden mt-4">
          <div className="bg-success h-full w-[65%] rounded-full"></div>
        </div>
        <p className="z-10 text-right text-xs font-bold text-textPrimary mt-1">65% atteint</p>
      </div>

      <div className="mt-6">
        <h4 className="font-bold text-textPrimary mb-1">Pas de cercle ? Pas de problème.</h4>
        <p className="text-sm text-textSecondary font-medium">Fixez un objectif et épargnez à votre rythme, en toute sécurité.</p>
      </div>
    </div>
  );
}
