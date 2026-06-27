"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Protocol() {
  return (
    <section id="comment-ca-marche" className="bg-background relative py-24 px-6 sm:px-16 overflow-hidden bg-dot-pattern">
      <div className="max-w-4xl mx-auto text-center mb-20">
        <h2 className="font-sans font-extrabold text-4xl sm:text-5xl text-textPrimary tracking-tighter mb-4">
          Comment ça marche ?
        </h2>
        <p className="text-lg text-textSecondary font-medium">
          Simple, rapide et totalement transparent.
        </p>
      </div>

      <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-32">
        {/* Card 1 */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="sticky top-24 w-full bg-surface p-8 sm:p-12 rounded-[2rem] border border-border shadow-xl shadow-border/30 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
        >
          <div className="flex flex-col gap-4">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primaryLight text-primary font-bold text-lg mb-2">1</span>
            <h3 className="font-sans font-bold text-3xl text-textPrimary tracking-tight">Créez votre cercle</h3>
            <p className="text-base sm:text-lg text-textSecondary leading-relaxed font-medium">
              Définissez les règles : montant de la cotisation, fréquence, et invitez vos proches via WhatsApp. Vous pouvez aussi choisir d'épargner seul.
            </p>
          </div>
          <div className="relative h-48 sm:h-64 w-full flex items-center justify-center overflow-hidden rounded-2xl bg-background border border-border">
            <div className="absolute w-12 h-12 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: '3s' }}></div>
            <div className="absolute w-24 h-24 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
            <div className="absolute w-36 h-36 rounded-full border-2 border-primary/40 animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
            <div className="w-12 h-12 bg-primary rounded-full z-10 flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-white font-bold text-xl">+</span>
            </div>
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="sticky top-28 w-full bg-surface p-8 sm:p-12 rounded-[2rem] border border-border shadow-xl shadow-border/30 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
        >
          <div className="flex flex-col gap-4">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primaryLight text-primary font-bold text-lg mb-2">2</span>
            <h3 className="font-sans font-bold text-3xl text-textPrimary tracking-tight">Cotisez facilement</h3>
            <p className="text-base sm:text-lg text-textSecondary leading-relaxed font-medium">
              Payez en 30 secondes depuis votre téléphone. MTN, Wave, Orange Money — l'argent arrive directement dans le pot numérique sécurisé.
            </p>
          </div>
          <div className="relative h-48 sm:h-64 w-full flex items-center justify-center overflow-hidden rounded-2xl bg-textPrimary">
            <div className="grid grid-cols-6 gap-3 p-6 w-full h-full relative z-0">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-border/30"></div>
              ))}
            </div>
            <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_rgba(22,163,74,0.8)] z-10 animate-scan"></div>
          </div>
        </motion.div>

        {/* Card 3 */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="sticky top-32 w-full bg-surface p-8 sm:p-12 rounded-[2rem] border border-border shadow-xl shadow-border/30 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
        >
          <div className="flex flex-col gap-4">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primaryLight text-primary font-bold text-lg mb-2">3</span>
            <h3 className="font-sans font-bold text-3xl text-textPrimary tracking-tight">Recevez votre argent</h3>
            <p className="text-base sm:text-lg text-textSecondary leading-relaxed font-medium">
              À la fin du cycle, recevez votre argent directement sur votre Mobile Money. Le processus est automatique, transparent et incontestable.
            </p>
          </div>
          <div className="relative h-48 sm:h-64 w-full flex items-center justify-center overflow-hidden rounded-2xl bg-surface border border-border">
            <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none" className="stroke-primary">
              <path 
                d="M0,100 L150,100 L170,50 L200,180 L230,20 L260,140 L280,100 L500,100" 
                fill="none" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="animate-draw-path"
              />
            </svg>
          </div>
        </motion.div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
        @keyframes draw-path {
          0% { stroke-dasharray: 1000; stroke-dashoffset: 1000; }
          50% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -1000; }
        }
        .animate-draw-path {
          stroke-dasharray: 1000;
          animation: draw-path 3s linear infinite;
        }
      `}} />
    </section>
  );
}
