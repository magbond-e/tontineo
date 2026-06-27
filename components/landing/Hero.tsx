"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ShieldCheck } from "lucide-react";

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
  };

  const floatAnimation = {
    y: [0, -15, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  const floatAnimationReverse = {
    y: [0, 15, 0],
    transition: {
      duration: 7,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <section className="relative w-full min-h-[100dvh] flex flex-col justify-center py-32 px-6 sm:px-16 overflow-hidden bg-background bg-dot-pattern">
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-background via-background/90 to-transparent" />

      {/* Floating abstract shapes (Optional decor) */}
      <motion.div 
        animate={floatAnimation}
        className="absolute top-32 left-10 w-24 h-24 bg-primaryLight/50 rounded-full blur-2xl z-0"
      />
      <motion.div 
        animate={floatAnimationReverse}
        className="absolute bottom-32 right-10 w-48 h-48 bg-primaryLight/30 rounded-full blur-3xl z-0"
      />

      {/* Main Content */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-4xl mx-auto lg:mx-0 w-full"
      >
        <motion.div 
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border shadow-sm mb-8"
        >
          <span className="text-sm">🔒</span>
          <span className="text-sm font-bold text-textPrimary tracking-tight">
            Mobile Money · Tirage certifié · Zéro cash
          </span>
        </motion.div>

        <motion.h1 variants={itemVariants} className="flex flex-col gap-2 mb-6">
          <span className="font-sans font-extrabold text-5xl sm:text-7xl lg:text-[80px] leading-tight tracking-tighter text-textPrimary">
            Gérez vos tontines
          </span>
          <span className="font-sans font-extrabold text-5xl sm:text-7xl lg:text-[80px] leading-tight tracking-tighter text-primary">
            et vos épargnes.
          </span>
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          className="text-lg sm:text-xl text-textSecondary max-w-xl mb-10 leading-relaxed font-medium"
        >
          Cotisez ou épargnez en 1 clic avec MTN, Wave ou Orange Money.
          Tirage transparent. Votre argent protégé à 100%.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-white rounded-full font-bold px-8 py-4 transition-all duration-300 shadow-lg shadow-primary/30 hover:scale-[1.03] hover:-translate-y-1 w-full sm:w-auto"
          >
            Commencer maintenant
          </Link>
          <Link
            href="#comment-ca-marche"
            className="inline-flex items-center justify-center bg-surface hover:bg-background border border-border text-textPrimary rounded-full font-bold px-8 py-4 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 w-full sm:w-auto"
          >
            Voir comment ça marche &rarr;
          </Link>
        </motion.div>
      </motion.div>

      {/* Floating Cards (Visible on lg screens) */}
      <div className="hidden lg:block absolute right-16 top-1/2 -translate-y-1/2 z-10 w-96">
        <div className="relative h-[450px]">
          {/* Card 1: Paiement Confirmé */}
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.8 }}
            className="absolute top-[10%] right-0 w-[85%] bg-surface rounded-2xl p-4 border border-border shadow-xl shadow-border/50"
          >
            <motion.div animate={floatAnimation} className="h-full w-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                  <Check size={20} strokeWidth={3} />
                </div>
                <div>
                  <p className="text-sm font-bold text-textPrimary">Paiement confirmé</p>
                  <p className="text-xs text-textSecondary">Il y a 2 min</p>
                </div>
              </div>
              <div className="flex justify-between items-end mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primaryLight text-primary flex items-center justify-center text-xs font-bold">
                    K
                  </div>
                  <span className="text-sm font-medium text-textPrimary">Kofi M.</span>
                </div>
                <span className="font-mono font-bold text-textPrimary">25 000 FCFA</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Card 2: Tirage Certifié (Replacing Trust Score) */}
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 80, damping: 20, delay: 1.1 }}
            className="absolute top-[50%] right-12 w-[90%] bg-surface rounded-2xl p-5 border border-border shadow-xl shadow-border/50"
          >
            <motion.div animate={floatAnimationReverse} className="h-full w-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-bold text-textPrimary">Tirage certifié</span>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck size={20} strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-background rounded-xl border border-border flex flex-col items-center justify-center">
                  <span className="text-xs text-textSecondary font-medium">NOV</span>
                  <span className="text-sm font-bold text-textPrimary">15</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-textSecondary">Gagnant du mois</p>
                  <p className="text-base font-bold text-textPrimary">Aminata T.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
