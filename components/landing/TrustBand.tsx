"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function TrustBand() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (itemsRef.current) {
        gsap.from(itemsRef.current.children, {
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
          x: -20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out"
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="bg-surface py-6 sm:py-8 border-y border-border">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
        <p className="font-mono text-xs sm:text-sm text-textSecondary uppercase tracking-wider font-semibold">
          Paiements supportés via FedaPay :
        </p>
        <div ref={itemsRef} className="flex items-center gap-6 sm:gap-10 flex-wrap justify-center">
          {/* Simulate Logos with stylized text since we don't have SVG assets */}
          <div className="text-lg font-bold text-textSecondary hover:text-[#FFCC00] transition-colors duration-300 cursor-default grayscale hover:grayscale-0">
            MTN
          </div>
          <div className="text-lg font-bold text-textSecondary hover:text-[#00B0FF] transition-colors duration-300 cursor-default grayscale hover:grayscale-0">
            Wave
          </div>
          <div className="text-lg font-bold text-textSecondary hover:text-[#FF7900] transition-colors duration-300 cursor-default grayscale hover:grayscale-0">
            Orange Money
          </div>
          <div className="text-lg font-bold text-textSecondary hover:text-[#00529C] transition-colors duration-300 cursor-default grayscale hover:grayscale-0">
            Moov
          </div>
          <div className="w-px h-6 bg-border hidden sm:block"></div>
          <div className="text-lg font-bold text-textSecondary hover:text-primary transition-colors duration-300 cursor-default grayscale hover:grayscale-0">
            FedaPay
          </div>
        </div>
      </div>
    </section>
  );
}
