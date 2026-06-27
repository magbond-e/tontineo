"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check, X } from "lucide-react";

export default function Pricing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
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

  return (
    <section id="tarifs" className="py-24 px-6 sm:px-16 bg-surface bg-dot-pattern">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-sans font-extrabold text-4xl sm:text-5xl text-textPrimary tracking-tighter mb-4">
            Un plan pour chaque cercle.
          </h2>
          <p className="text-lg text-textSecondary font-medium">
            Commencez gratuitement. Évoluez quand vous êtes prêt.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto"
        >
          {/* Gratuit */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -10, transition: { duration: 0.2 } }}
            className="bg-background border border-border rounded-[2rem] p-8 shadow-sm flex flex-col h-full hover:shadow-xl transition-shadow"
          >
            <h3 className="font-bold text-lg text-textPrimary mb-2 uppercase tracking-wide">Gratuit</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-extrabold text-textPrimary">0</span>
              <span className="text-sm font-medium text-textSecondary">FCFA/mois</span>
            </div>
            
            <ul className="flex flex-col gap-4 mb-10 flex-1">
              <li className="flex items-center gap-3 text-sm text-textPrimary font-medium"><Check size={18} className="text-success" /> 1 cercle ou 1 épargne</li>
              <li className="flex items-center gap-3 text-sm text-textPrimary font-medium"><Check size={18} className="text-success" /> Jusqu'à 20 membres</li>
              <li className="flex items-center gap-3 text-sm text-textPrimary font-medium"><Check size={18} className="text-success" /> Tirage certifié</li>
              <li className="flex items-center gap-3 text-sm text-textSecondary opacity-50"><X size={18} /> IA Relances WhatsApp</li>
              <li className="flex items-center gap-3 text-sm text-textSecondary opacity-50"><X size={18} /> KYC</li>
            </ul>

            <Link href="/register" className="w-full py-3 rounded-xl border border-border text-center font-bold text-textPrimary hover:bg-border/50 transition-colors">
              Commencer &rarr;
            </Link>
          </motion.div>

          {/* PRO */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -10, transition: { duration: 0.2 } }}
            className="bg-primary rounded-[2rem] p-8 shadow-xl shadow-primary/20 flex flex-col h-[105%] relative md:-mt-4 md:-mb-4 z-10 border-2 border-primaryLight hover:shadow-2xl hover:shadow-primary/30 transition-shadow"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-surface text-primary text-xs font-bold px-4 py-1.5 rounded-full shadow-sm border border-border flex items-center gap-1 whitespace-nowrap">
              🎉 30 Jours d'Essai Gratuit
            </div>
            <h3 className="font-bold text-lg text-primaryLight mb-2 uppercase tracking-wide mt-2">PRO</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-extrabold text-white">2 500</span>
              <span className="text-sm font-medium text-primaryLight">FCFA/mois</span>
            </div>
            
            <ul className="flex flex-col gap-4 mb-10 flex-1">
              <li className="flex items-center gap-3 text-sm text-white font-medium"><Check size={18} className="text-primaryLight" /> Cercles illimités</li>
              <li className="flex items-center gap-3 text-sm text-white font-medium"><Check size={18} className="text-primaryLight" /> 50 membres/cercle</li>
              <li className="flex items-center gap-3 text-sm text-white font-medium"><Check size={18} className="text-primaryLight" /> IA Relanceuse WhatsApp</li>
              <li className="flex items-center gap-3 text-sm text-white font-medium"><Check size={18} className="text-primaryLight" /> KYC disponible</li>
              <li className="flex items-center gap-3 text-sm text-white font-medium"><Check size={18} className="text-primaryLight" /> Export CSV</li>
            </ul>

            <Link href="/register?plan=pro" className="w-full py-3 rounded-xl bg-white text-center font-bold text-primary hover:bg-primaryLight hover:text-primary transition-colors shadow-sm">
              Démarrer l'essai de 30 Jours &rarr;
            </Link>
          </motion.div>

          {/* Business */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -10, transition: { duration: 0.2 } }}
            className="bg-background border border-border rounded-[2rem] p-8 shadow-sm flex flex-col h-full hover:shadow-xl transition-shadow"
          >
            <h3 className="font-bold text-lg text-textPrimary mb-2 uppercase tracking-wide">Business</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-extrabold text-textPrimary">7 500</span>
              <span className="text-sm font-medium text-textSecondary">FCFA/mois</span>
            </div>
            
            <ul className="flex flex-col gap-4 mb-10 flex-1">
              <li className="flex items-center gap-3 text-sm text-textPrimary font-medium"><Check size={18} className="text-success" /> Tout du PRO</li>
              <li className="flex items-center gap-3 text-sm text-textPrimary font-medium"><Check size={18} className="text-success" /> 200 membres</li>
              <li className="flex items-center gap-3 text-sm text-textPrimary font-medium"><Check size={18} className="text-success" /> Multi-admins</li>
              <li className="flex items-center gap-3 text-sm text-textPrimary font-medium"><Check size={18} className="text-success" /> API sur mesure</li>
              <li className="flex items-center gap-3 text-sm text-textPrimary font-medium"><Check size={18} className="text-success" /> Support dédié</li>
            </ul>

            <Link href="/contact" className="w-full py-3 rounded-xl border border-border text-center font-bold text-textPrimary hover:bg-border/50 transition-colors">
              Nous contacter
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
