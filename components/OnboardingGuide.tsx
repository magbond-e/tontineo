"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, ShieldCheck, Users, Wallet, Phone, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { createClient } from "@/utils/supabase/client";

export function OnboardingGuide() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [whatsapp, setWhatsapp] = useState("");
  const [momo, setMomo] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

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
      title: "Finalisez votre profil",
      description: "Ajoutez vos numéros WhatsApp et Mobile Money pour faciliter vos futures transactions et communications.",
      icon: <ShieldCheck size={48} className="text-primary mb-4 mx-auto" />,
      content: (
        <div className="space-y-4 mt-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-textPrimary uppercase tracking-wider">WhatsApp</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textSecondary">
                <Phone size={16} />
              </div>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+229 00000000"
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-textPrimary uppercase tracking-wider">Mobile Money (Momo)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textSecondary">
                <DollarSign size={16} />
              </div>
              <input
                type="tel"
                value={momo}
                onChange={(e) => setMomo(e.target.value)}
                placeholder="+229 00000000"
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium"
              />
            </div>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem("tontineo_onboarding_seen");
    if (!hasSeenGuide) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("tontineo_onboarding_seen", "true");
  };

  const nextSlide = async () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Final slide: save data if provided
      if (whatsapp || momo) {
        setIsSaving(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const updates: any = {};
          if (whatsapp) updates.whatsapp = whatsapp;
          if (momo) updates.momo_number = momo;
          
          await supabase.from("profiles").update(updates).eq("id", session.user.id);
        }
        setIsSaving(false);
      }
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

          {slides[currentSlide].content && (
            <div className="mb-8">
              {slides[currentSlide].content}
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-3 mt-8">
            {currentSlide > 0 && (
              <button 
                onClick={prevSlide}
                disabled={isSaving}
                className="flex-1 py-3 bg-background border border-border text-textPrimary font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
              >
                Précédent
              </button>
            )}
            <button 
              onClick={nextSlide}
              disabled={isSaving}
              className="flex-[2] py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : currentSlide === slides.length - 1 ? (
                "Terminer"
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
