"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      quote: "J'ai 3 tontines actives. Plus aucun stress depuis que les relances sont automatiques. Tout se passe sur le téléphone, c'est magique.",
      name: "Aminata K.",
      role: "Commerçante, Dakar",
      stats: "3 tontines actives",
    },
    {
      quote: "Le tirage certifié a changé la donne. Mes membres savent que le système est transparent avant même de rejoindre.",
      name: "Kofi M.",
      role: "Dev freelance, Abidjan",
      stats: "Membre régulier",
    },
    {
      quote: "En 2 mois, 750 000 FCFA collectés. Tout était visible, tout était juste. Je recommande à toutes mes collègues.",
      name: "Fatou D.",
      role: "Fonctionnaire, Lomé",
      stats: "750k FCFA épargnés",
    },
    {
      quote: "C'est la première fois que j'épargne avec autant de facilité. Le paiement par Wave est super rapide.",
      name: "Seydou T.",
      role: "Étudiant, Bamako",
      stats: "Épargne simple",
    },
    {
      quote: "Fini les disputes pour savoir qui a payé et qui n'a pas payé. L'application gère tout, je ne fais que vérifier mon solde.",
      name: "Aissatou B.",
      role: "Coiffeuse, Conakry",
      stats: "Zéro dispute",
    }
  ];

  // We duplicate the array to create a seamless infinite scrolling effect
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="py-24 bg-background border-t border-border overflow-hidden bg-dot-pattern">
      <div className="max-w-6xl mx-auto px-6 sm:px-16 mb-16 text-center">
        <h2 className="font-sans font-extrabold text-4xl sm:text-5xl text-textPrimary tracking-tighter mb-4">
          La preuve par la confiance.
        </h2>
        <p className="text-lg text-textSecondary font-medium">
          Découvrez pourquoi ils ont choisi notre plateforme pour leur épargne.
        </p>
      </div>

      <div className="relative w-full flex overflow-hidden group">
        {/* Left and Right Fade overlays */}
        <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <motion.div 
          className="flex gap-6 whitespace-nowrap px-4 py-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ 
            ease: "linear", 
            duration: 35, 
            repeat: Infinity 
          }}
        >
          {duplicatedTestimonials.map((t, i) => (
            <div 
              key={i} 
              className="w-[350px] sm:w-[400px] flex-shrink-0 bg-surface border border-border rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <p className="font-sans text-lg text-textPrimary leading-relaxed mb-8 whitespace-normal font-medium">
                "{t.quote}"
              </p>
              
              <div className="flex flex-col gap-4 mt-auto">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-textPrimary text-base">{t.name}</p>
                    <p className="text-sm text-textSecondary">{t.role}</p>
                    <div className="flex items-center text-gold mt-1 gap-1">
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                    </div>
                  </div>
                </div>
                
                <div className="inline-flex items-center self-start gap-2 px-3 py-1.5 bg-success/10 rounded-lg">
                  <span className="font-mono text-xs font-bold text-success">{t.stats}</span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
