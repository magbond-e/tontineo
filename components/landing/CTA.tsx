"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import CountUp from "react-countup";

export default function CTA() {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 px-6 sm:px-16 bg-gradient-to-br from-background via-surface to-background border-y border-border">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <p className="text-xl sm:text-2xl text-textSecondary font-medium mb-4">
          Rejoins les
        </p>
        <h2 
          ref={ref}
          className="font-sans font-bold text-6xl sm:text-[88px] text-textPrimary leading-none mb-2"
        >
          {inView ? (
            <CountUp start={1800} end={2000} duration={2} suffix="+" />
          ) : (
            "2000+"
          )} membres
        </h2>
        <p className="font-serif italic font-medium text-4xl sm:text-6xl text-primary mb-12">
          qui cotisent en confiance.
        </p>

        <Link
          href="/register"
          className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-white rounded-full font-bold px-8 py-5 transition-all duration-300 shadow-xl shadow-primary/20 hover:scale-[1.03] hover:-translate-y-1 w-full sm:w-auto text-lg mb-4"
        >
          Créer mon premier cercle — C'est gratuit
        </Link>
        <p className="text-sm font-medium text-textSecondary">
          Aucune carte bancaire requise · Annulation à tout moment
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-textSecondary font-medium">
          <div className="flex items-center gap-2">
            <span>🔒 Sécurisé par FedaPay</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-border hidden sm:block"></div>
          <div className="tracking-widest">🇸🇳 🇨🇮 🇧🇯 🇨🇲 🇹🇬</div>
          <div className="w-1 h-1 rounded-full bg-border hidden sm:block"></div>
          <div>Fait en Afrique 🌍</div>
        </div>
      </div>
    </section>
  );
}
