"use client";

import Link from "next/link";
import { LayoutDashboard, Users, Wallet, ShieldCheck, Settings, LogOut, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useLanguage();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { userProfile } = useAuth();

  const supabase = createClient();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    localStorage.removeItem("tontineo_profile");
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-3xl border border-border shadow-2xl p-8 max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mb-6 mx-auto">
              <LogOut size={32} />
            </div>
            <h3 className="text-xl font-bold text-textPrimary text-center mb-3">{t("logout_title")}</h3>
            <p className="text-textSecondary text-center text-sm mb-8">
              {t("logout_desc")}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-textPrimary font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 py-3 bg-danger hover:bg-danger/90 text-white font-bold rounded-xl transition-all shadow-md shadow-danger/20 disabled:opacity-50 flex justify-center items-center"
              >
                {isLoggingOut ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Confirmer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <aside 
        className={`hidden md:flex flex-col bg-surface dark:bg-slate-900 border-r border-border h-screen sticky top-0 left-0 transition-all duration-300 z-40 ${
          isCollapsed ? "w-[80px]" : "w-[260px]"
        }`}
      >
        {/* Collapse Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 bg-surface border border-border rounded-full p-1 text-textSecondary hover:text-primary hover:border-primary transition-colors z-50 shadow-sm"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo Area */}
        <div className={`p-6 flex items-center ${isCollapsed ? "justify-center px-0" : ""}`}>
          <Link href="/dashboard" className="flex items-center gap-1">
            {isCollapsed ? (
              <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-extrabold text-xl shadow-sm">
                T
              </div>
            ) : (
              <>
                <span className="font-extrabold text-2xl tracking-tight text-textPrimary">Tontineo</span>
                <span className="w-2 h-2 rounded-full bg-primary mt-2"></span>
              </>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden hide-scrollbar">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-textSecondary font-medium hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-slate-800 transition-all group"
            title={t("nav_dashboard")}
          >
            <div className="flex items-center justify-center w-6">
              <LayoutDashboard size={20} className="group-hover:text-primary transition-colors" />
            </div>
            {!isCollapsed && <span>{t("nav_dashboard")}</span>}
          </Link>
          <Link 
            href="/dashboard/member" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-textSecondary font-medium hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-slate-800 transition-all group"
            title={t("nav_member_space")}
          >
            <div className="flex items-center justify-center w-6">
              <Users size={20} className="group-hover:text-primary transition-colors" />
            </div>
            {!isCollapsed && <span>{t("nav_member_space")}</span>}
          </Link>
          <Link 
            href="/cercles" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-textSecondary font-medium hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-slate-800 transition-all group"
            title={t("nav_cercles")}
          >
            <div className="relative flex items-center justify-center w-6">
              <Users size={20} className="group-hover:text-primary transition-colors" />
            </div>
            {!isCollapsed && <span>{t("nav_cercles")}</span>}
          </Link>
          <Link 
            href="/portefeuille" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-textSecondary font-medium hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-slate-800 transition-all group"
            title={t("nav_portefeuille")}
          >
            <div className="flex items-center justify-center w-6">
              <Wallet size={20} className="group-hover:text-primary transition-colors" />
            </div>
            {!isCollapsed && <span>{t("nav_portefeuille")}</span>}
          </Link>
          <Link 
            href="/confiance" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-textSecondary font-medium hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-slate-800 transition-all group"
            title={t("nav_score")}
          >
            <div className="flex items-center justify-center w-6">
              <ShieldCheck size={20} className="group-hover:text-primary transition-colors" />
            </div>
            {!isCollapsed && <span>{t("nav_score")}</span>}
          </Link>
          <Link 
            href="/parametres" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-textSecondary font-medium hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-slate-800 transition-all group"
            title={t("nav_settings")}
          >
            <div className="flex items-center justify-center w-6">
              <Settings size={20} className="group-hover:text-primary transition-colors" />
            </div>
            {!isCollapsed && <span>{t("nav_settings")}</span>}
          </Link>

          <div className="mt-8">
            <button 
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-textSecondary font-medium hover:text-danger hover:bg-danger/10 transition-all group"
            >
              <div className="flex items-center justify-center w-6">
                <LogOut size={20} className="group-hover:text-danger transition-colors" />
              </div>
              {!isCollapsed && <span>Déconnexion</span>}
            </button>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-3 mt-auto border-t border-border">
          <div 
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group`}
            title="Profil"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-textPrimary flex items-center justify-center text-surface font-bold shadow-sm shrink-0 uppercase">
                {userProfile ? userProfile.name.substring(0, 2) : "UT"}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden pr-2">
                  <span className="text-sm font-bold text-textPrimary truncate">{userProfile ? userProfile.name : "Utilisateur"}</span>
                  <span className="text-xs text-textSecondary font-medium truncate">{userProfile ? userProfile.email : "Nouveau Membre"}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
