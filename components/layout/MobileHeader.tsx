"use client";

import { Menu, Bell, X, LayoutDashboard, Users, Wallet, ShieldCheck, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { userProfile } = useAuth();

  const supabase = createClient();

  const notifications: any[] = [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    // Basic logout logic for mobile menu
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      await supabase.auth.signOut();
      localStorage.removeItem("tontineo_profile");
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <>
      <header className="md:hidden flex items-center justify-between p-4 bg-surface border-b border-border sticky top-0 z-40">
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
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-textSecondary hover:text-textPrimary transition-colors mt-1"
            >
              <Bell size={20} />
            </button>

            {/* Notifications Dropdown for Mobile */}
            {showNotifications && (
              <div className="absolute right-0 mt-4 w-[300px] bg-surface border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-4 border-b border-border flex justify-between items-center bg-gray-50 dark:bg-slate-800">
                  <h3 className="font-bold text-textPrimary">Notifications</h3>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-textSecondary text-sm">
                      Aucune notification pour le moment.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className={`p-4 border-b border-border hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${notif.unread ? 'bg-primary/5' : ''}`}>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm ${notif.unread ? 'font-bold text-textPrimary' : 'font-medium text-textSecondary'}`}>{notif.title}</h4>
                          <span className="text-[10px] font-bold text-textSecondary">{notif.time}</span>
                        </div>
                        <p className="text-xs text-textSecondary line-clamp-2">{notif.desc}</p>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-3 text-center bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                    <span className="text-xs font-bold text-primary">Marquer tout lu</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="w-8 h-8 rounded-full bg-textPrimary flex items-center justify-center text-surface text-xs font-bold shadow-sm uppercase">
            {userProfile ? userProfile.name.substring(0, 2) : "UT"}
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
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-lg text-textSecondary font-medium hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-slate-800 transition-all group">
                <div className="flex items-center gap-3">
                  <LayoutDashboard size={20} /> Dashboard
                </div>
              </Link>
              <Link href="/cercles" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-textSecondary font-medium hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">
                <Users size={20} /> Mes cercles
              </Link>
              <Link href="/portefeuille" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-textSecondary font-medium hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">
                <Wallet size={20} /> Portefeuille
              </Link>
              <Link href="/confiance" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-textSecondary font-medium hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">
                <ShieldCheck size={20} /> Score de confiance
              </Link>
              <Link href="/parametres" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-textSecondary font-medium hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">
                <Settings size={20} /> Paramètres
              </Link>

              <button 
                onClick={handleLogout} 
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-textSecondary font-medium hover:text-danger hover:bg-danger/10 transition-all mt-8"
              >
                <LogOut size={20} className="text-danger" /> <span className="text-danger">Déconnexion</span>
              </button>
            </nav>

            <div className="p-4 mt-auto border-t border-border">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-textPrimary flex items-center justify-center text-surface font-bold shadow-sm uppercase">
                    {userProfile ? userProfile.name.substring(0, 2) : "UT"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-textPrimary truncate max-w-[140px]">{userProfile ? userProfile.name : "Utilisateur"}</span>
                    <span className="text-xs text-textSecondary font-medium truncate max-w-[140px]">{userProfile ? userProfile.email : "Nouveau membre"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
