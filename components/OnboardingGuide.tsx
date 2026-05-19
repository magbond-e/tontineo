"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, ShieldCheck, Users, Wallet } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const slides = [
  {
    id: 1,
    title: "Bienvenue sur Tontineo",
    description: "Découvrez la nouvelle façon de gérer vos tontines de manière sécurisée, transparente et 100% digitale.",
    icon: <Wallet size={48} className="text-primary mb-4 mx-auto" />,
  },
  {
    id: 2,
    title: "Rejoignez ou créez un cercle",
    description: "Participez à des cercles de confiance avec vos amis ou votre famille. Suivez les cotisations et les tirages en temps réel.",
    icon: <Users size={48} className="text-primary mb-4 mx-auto" />,
  },
  {
    id: 3,
    title: "Bâtissez votre réputation",
    description: "Votre ponctualité fait grimper votre Score de Confiance, vous donnant accès à des cercles premiums et exclusifs.",
    icon: <ShieldCheck size={48} className="text-primary mb-4 mx-auto" />,
  }
];

export function OnboardingGuide() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà vu le guide
    const hasSeenGuide = localStorage.getItem("tontineo_onboarding_seen");
    if (!hasSeenGuide) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("tontineo_onboarding_seen", "true");
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleClose();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-300 border border-border">
        {/* Header */}
        <div className="flex justify-end p-4 pb-0">
          <button 
            onClick={handleClose}
            className="text-textSecondary hover:text-textPrimary bg-background hover:bg-border p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 pt-4 text-center">
          {slides[currentSlide].icon}
          <h2 className="text-2xl font-extrabold text-textPrimary mb-3 tracking-tight">
            {slides[currentSlide].title}
          </h2>
          <p className="text-textSecondary text-sm leading-relaxed mb-8">
            {slides[currentSlide].description}
          </p>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {slides.map((_, index) => (
              <div 
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "w-8 bg-primary" : "w-2 bg-border"
                }`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            {currentSlide > 0 && (
              <button 
                onClick={prevSlide}
                className="flex-1 py-3 bg-background border border-border text-textPrimary font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
              >
                Précédent
              </button>
            )}
            <button 
              onClick={nextSlide}
              className="flex-[2] py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
            >
              {currentSlide === slides.length - 1 ? "Commencer" : "Suivant"}
              {currentSlide < slides.length - 1 && <ChevronRight size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
