"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";
import { Moon, Sun, Globe, ShieldCheck, Wallet, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { lang, setLang, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: <ShieldCheck size={48} className="text-white drop-shadow-md" />,
      title: t("carousel_1_title"),
      desc: t("carousel_1_desc")
    },
    {
      icon: <Wallet size={48} className="text-white drop-shadow-md" />,
      title: t("carousel_2_title"),
      desc: t("carousel_2_desc")
    },
    {
      icon: <MessageCircle size={48} className="text-white drop-shadow-md" />,
      title: t("carousel_3_title"),
      desc: t("carousel_3_desc")
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 text-textPrimary overflow-hidden">
      
      {/* Left side: Content (Form) */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col p-6 sm:p-12 lg:p-16 xl:p-20 relative z-20">
        
        {/* Top bar: Theme & Language Switchers */}
        <div className="absolute top-8 right-8 flex items-center gap-3">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 rounded-full border border-border bg-surface flex items-center justify-center text-textSecondary hover:text-textPrimary hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          <div className="relative group">
            {/* Added a larger hit area to prevent losing hover */}
            <div className="absolute -inset-2"></div>
            <button className="relative h-10 px-3 rounded-full border border-border bg-surface flex items-center gap-2 text-textSecondary hover:text-textPrimary hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shadow-sm text-sm font-bold uppercase z-10">
              <Globe size={18} /> {lang}
            </button>
            {/* Added pt-2 to bridge the gap */}
            <div className="absolute top-full right-0 pt-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all w-32 z-50">
              <div className="bg-surface border border-border rounded-xl shadow-xl p-2 flex flex-col">
                <button onClick={() => setLang('fr')} className={`px-3 py-2 text-sm font-bold rounded-lg text-left transition-colors ${lang === 'fr' ? 'bg-primary/10 text-primary' : 'text-textPrimary hover:bg-gray-50 dark:hover:bg-slate-800'}`}>Français</button>
                <button onClick={() => setLang('en')} className={`px-3 py-2 text-sm font-bold rounded-lg text-left transition-colors ${lang === 'en' ? 'bg-primary/10 text-primary' : 'text-textPrimary hover:bg-gray-50 dark:hover:bg-slate-800'}`}>English</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto mt-16 lg:mt-0">
          {/* Logo mobile only */}
          <div className="flex items-center gap-1 mb-10 lg:hidden justify-center">
            <span className="font-extrabold text-3xl tracking-tight text-textPrimary">Tontineo</span>
            <span className="w-2.5 h-2.5 rounded-full bg-primary mt-2"></span>
          </div>
          
          {children}
        </div>
      </div>
      
      {/* Right side: Marketing Carousel (Floating Panel style) */}
      <div className="hidden lg:flex flex-1 p-4 lg:p-6 pl-0 z-10">
        <div className="w-full h-full bg-gradient-to-br from-[#16A34A] to-[#14532D] rounded-[2.5rem] relative overflow-hidden flex flex-col items-center justify-center p-20 text-white shadow-2xl">
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-black/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
          
          {/* Floating Icons Background */}
          <div className="absolute top-1/4 left-1/4 animate-[bounce_8s_infinite] opacity-20 pointer-events-none">
            <ShieldCheck size={48} />
          </div>
          <div className="absolute bottom-1/3 right-1/4 animate-[bounce_6s_infinite_reverse] opacity-20 pointer-events-none">
            <Wallet size={48} />
          </div>
          <div className="absolute top-2/3 left-1/3 animate-[bounce_10s_infinite] opacity-20 pointer-events-none">
            <MessageCircle size={48} />
          </div>

          <div className="relative z-10 max-w-lg text-center space-y-8 w-full flex flex-col items-center justify-center">
            
            <div className="w-20 h-20 bg-white/10 rounded-3xl backdrop-blur-md flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-transform hover:scale-105">
              {slides[currentSlide].icon}
            </div>
              
            {/* Fixed height container for text to prevent jumping */}
            <div className="h-[140px] flex flex-col justify-center transition-all duration-500 ease-in-out">
              <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4 text-white drop-shadow-sm">
                {slides[currentSlide].title}
              </h2>
              <p className="text-lg lg:text-xl text-white/90 font-medium">
                {slides[currentSlide].desc}
              </p>
            </div>

            {/* Carousel Controls */}
            <div className="pt-8 flex items-center justify-center gap-6">
              <button onClick={prevSlide} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <ChevronLeft size={24} />
              </button>
              <div className="flex gap-3">
                {slides.map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${currentSlide === i ? 'w-8 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/60'}`}
                  />
                ))}
              </div>
              <button onClick={nextSlide} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <ChevronRight size={24} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
