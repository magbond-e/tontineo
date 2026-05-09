"use client";

import { Menu, Bell, X, LayoutDashboard, Users, Wallet, ShieldCheck, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="md:hidden flex items-center justify-between p-4 bg-surface border-b border-border sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button 
            className="text-textSecondary hover:text-textPrimary transition-colors"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          <Link href="/dashboard" className="flex items-center gap-1">
            <span className="font-extrabold text-lg tracking-tight text-textPrimary">Tontineo</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1"></span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative text-textSecondary hover:text-textPrimary transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-surface"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-textPrimary flex items-center justify-center text-surface text-xs font-bold shadow-sm">
            AK
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 md:hidden" onClick={() => setIsMenuOpen(false)}>
          <div 
            className="fixed inset-y-0 left-0 w-[260px] bg-surface shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-1" onClick={() => setIsMenuOpen(false)}>
                <span className="font-extrabold text-xl tracking-tight text-textPrimary">Tontineo</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1"></span>
              </Link>
              <button 
                className="text-textSecondary hover:text-textPrimary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <nav className="flex-1 py-4 px-4 space-y-1 overflow-y-auto">
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-lg text-textSecondary font-medium hover:text-textPrimary hover:bg-gray-50 transition-all group">
                <div className="flex items-center gap-3">
                  <LayoutDashboard size={20} /> Dashboard
                </div>
              </Link>
              <Link href="/dashboard/member" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-lg text-textSecondary font-medium hover:text-textPrimary hover:bg-gray-50 transition-all group">
                <div className="flex items-center gap-3">
                  <LayoutDashboard size={20} /> Espace Membre
                </div>
              </Link>
              <Link href="/cercles" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-textSecondary font-medium hover:text-textPrimary hover:bg-gray-50 transition-all">
                <Users size={20} /> Mes cercles
              </Link>
              <Link href="/portefeuille" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-textSecondary font-medium hover:text-textPrimary hover:bg-gray-50 transition-all">
                <Wallet size={20} /> Portefeuille
              </Link>
              <Link href="/confiance" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-textSecondary font-medium hover:text-textPrimary hover:bg-gray-50 transition-all">
                <ShieldCheck size={20} /> Score de confiance
              </Link>
              <Link href="/parametres" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-textSecondary font-medium hover:text-textPrimary hover:bg-gray-50 transition-all">
                <Settings size={20} /> Paramètres
              </Link>
            </nav>

            <div className="p-4 mt-auto">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border-t border-border pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-textPrimary flex items-center justify-center text-surface font-bold shadow-sm">
                    AK
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-textPrimary">Amadou K.</span>
                    <span className="text-xs text-textSecondary font-medium">Organisateur</span>
                  </div>
                </div>
                <button onClick={() => alert("Déconnexion mockup")}>
                  <LogOut size={16} className="text-textSecondary hover:text-danger transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
