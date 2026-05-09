"use client";

import Link from "next/link";
import { LayoutDashboard, Users, Wallet, ShieldCheck, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={`hidden md:flex flex-col bg-surface border-r border-border h-screen sticky top-0 left-0 transition-all duration-300 z-40 ${
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
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-textSecondary font-medium hover:text-textPrimary hover:bg-gray-50 transition-all group"
          title="Dashboard"
        >
          <div className="flex items-center justify-center w-6">
            <LayoutDashboard size={20} className="group-hover:text-primary transition-colors" />
          </div>
          {!isCollapsed && <span>Dashboard Organisateur</span>}
        </Link>
        <Link 
          href="/dashboard/member" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-textSecondary font-medium hover:text-textPrimary hover:bg-gray-50 transition-all group"
          title="Espace Membre"
        >
          <div className="flex items-center justify-center w-6">
            <Users size={20} className="group-hover:text-primary transition-colors" />
          </div>
          {!isCollapsed && <span>Espace Membre</span>}
        </Link>
        <Link 
          href="/cercles" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-textSecondary font-medium hover:text-textPrimary hover:bg-gray-50 transition-all group"
          title="Mes cercles"
        >
          <div className="relative flex items-center justify-center w-6">
            <Users size={20} className="group-hover:text-primary transition-colors" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full border border-surface"></span>
          </div>
          {!isCollapsed && <span>Mes cercles</span>}
        </Link>
        <Link 
          href="/portefeuille" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-textSecondary font-medium hover:text-textPrimary hover:bg-gray-50 transition-all group"
          title="Portefeuille"
        >
          <div className="flex items-center justify-center w-6">
            <Wallet size={20} className="group-hover:text-primary transition-colors" />
          </div>
          {!isCollapsed && <span>Portefeuille</span>}
        </Link>
        <Link 
          href="/confiance" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-textSecondary font-medium hover:text-textPrimary hover:bg-gray-50 transition-all group"
          title="Score de confiance"
        >
          <div className="flex items-center justify-center w-6">
            <ShieldCheck size={20} className="group-hover:text-primary transition-colors" />
          </div>
          {!isCollapsed && <span>Score de confiance</span>}
        </Link>
        <Link 
          href="/parametres" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-textSecondary font-medium hover:text-textPrimary hover:bg-gray-50 transition-all group"
          title="Paramètres"
        >
          <div className="flex items-center justify-center w-6">
            <Settings size={20} className="group-hover:text-primary transition-colors" />
          </div>
          {!isCollapsed && <span>Paramètres</span>}
        </Link>
      </nav>

      {/* User Profile */}
      <div className="p-3 mt-auto border-t border-border">
        <div 
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group`}
          title="Profil"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-textPrimary flex items-center justify-center text-surface font-bold shadow-sm shrink-0">
              AK
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-textPrimary truncate">Amadou K.</span>
                <span className="text-xs text-textSecondary font-medium">Utilisateur</span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button onClick={(e) => { e.preventDefault(); alert("Déconnexion mockup"); }}>
              <LogOut size={16} className="text-textSecondary hover:text-danger transition-colors" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
