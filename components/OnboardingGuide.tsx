"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, LayoutDashboard, Wallet, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function OnboardingGuide() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Bienvenue sur Tontineo 🎉",
      description: "Votre nouvelle plateforme pour gérer vos tontines de manière transparente et sécurisée. Faisons un petit tour du propriétaire pour bien démarrer !",
      icon: <LayoutDashboard size={48} className="text-primary mb-4 mx-auto" />,
    },
    {
      id: 2,
      title: "Vos Cercles (Tontines)",
      description: "Dans l'onglet 'Mes cercles', vous pouvez créer ou rejoindre des tontines. C'est ici que vous définirez les montants, les cycles et que vous gérerez vos membres.",
      icon: <Users size={48} className="text-primary mb-4 mx-auto" />,
    },
    {
      id: 3,
      title: "Votre Portefeuille Sécurisé",
      description: "Toutes vos cotisations et vos gains transitent par votre portefeuille sécurisé. Vous pouvez retirer votre argent vers Mobile Money à tout moment via l'onglet 'Portefeuille'.",
      icon: <Wallet size={48} className="text-primary mb-4 mx-auto" />,
    }
  ];

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem("tontineo_platform_tour");
    if (!hasSeenGuide) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("tontineo_platform_tour", "true");
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
      <div className="bg-surface w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-border relative">
        {/* Progress bar top */}
        <div className="absolute top-0 left-0 h-1 bg-primary/20 w-full">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out" 
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>

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
          <p className="text-textSecondary text-sm leading-relaxed mb-6">
            {slides[currentSlide].description}
          </p>

          {/* Controls */}
          <div className="flex gap-3 mt-8">
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
              {currentSlide === slides.length - 1 ? (
                "C'est parti !"
              ) : (
                <>Suivant <ChevronRight size={18} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
