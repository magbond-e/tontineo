"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Philosophy() {
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
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="relative py-32 px-6 sm:px-16 bg-surface overflow-hidden bg-dot-pattern">
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col gap-8 text-center sm:text-left">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.p variants={itemVariants} className="text-xl sm:text-2xl text-textSecondary font-medium mb-4">
            La plupart des apps se concentrent sur : les transactions individuelles.
          </motion.p>

          <motion.h2 variants={itemVariants} className="font-sans font-extrabold text-4xl sm:text-6xl lg:text-[72px] leading-tight tracking-tighter mb-8">
            <span className="text-primary">Nous nous concentrons sur :</span> <span className="text-textPrimary">la confiance collective.</span>
          </motion.h2>

          <motion.p variants={itemVariants} className="text-lg sm:text-xl text-textSecondary max-w-2xl font-medium leading-relaxed">
            Parce qu'en Afrique, l'épargne a toujours été un acte communautaire.
            Notre mission est de numériser cette confiance — pas juste l'argent.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
