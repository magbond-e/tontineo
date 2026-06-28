"use client";

import Link from "next/link";
import { LayoutDashboard, Users, ShieldCheck, LogOut, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function SidebarAdmin() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
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
    <aside 
      className={`hidden md:flex flex-col bg-slate-900 border-r border-slate-800 h-screen sticky top-0 left-0 transition-all duration-300 z-40 text-white ${
        isCollapsed ? "w-[80px]" : "w-[260px]"
      }`}
    >
      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-slate-800 border border-slate-700 rounded-full p-1 text-slate-400 hover:text-white transition-colors z-50 shadow-sm"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo Area */}
      <div className={`p-6 flex items-center ${isCollapsed ? "justify-center px-0" : ""}`}>
        <Link href="/admin" className="flex items-center gap-2">
          {isCollapsed ? (
            <div className="w-8 h-8 bg-danger text-white rounded-lg flex items-center justify-center font-extrabold text-xl shadow-sm">
              A
            </div>
          ) : (
            <>
              <div className="w-8 h-8 bg-danger text-white rounded-lg flex items-center justify-center font-extrabold text-lg shadow-sm">
                A
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">Admin</span>
            </>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden hide-scrollbar">
        <Link 
          href="/admin" 
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all group ${(pathname === '/admin' || pathname === '/admin/') ? 'bg-danger/20 text-danger' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          title="Dashboard"
        >
          <div className="flex items-center justify-center w-6">
            <LayoutDashboard size={20} className={(pathname === '/admin' || pathname === '/admin/') ? 'text-danger' : 'group-hover:text-white transition-colors'} />
          </div>
          {!isCollapsed && <span>Dashboard</span>}
        </Link>
        <Link 
          href="/admin/utilisateurs" 
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all group ${pathname.startsWith('/admin/utilisateurs') ? 'bg-danger/20 text-danger' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          title="Utilisateurs"
        >
          <div className="flex items-center justify-center w-6">
            <Users size={20} className={pathname.startsWith('/admin/utilisateurs') ? 'text-danger' : 'group-hover:text-white transition-colors'} />
          </div>
          {!isCollapsed && <span>Utilisateurs</span>}
        </Link>
        <Link 
          href="/admin/kyc" 
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all group ${pathname.startsWith('/admin/kyc') ? 'bg-danger/20 text-danger' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          title="Validation KYC"
        >
          <div className="flex items-center justify-center w-6">
            <ShieldCheck size={20} className={pathname.startsWith('/admin/kyc') ? 'text-danger' : 'group-hover:text-white transition-colors'} />
          </div>
          {!isCollapsed && <span>Validation KYC</span>}
        </Link>

        <div className="pt-8 mt-8 border-t border-slate-800">
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all group text-slate-400 hover:text-white hover:bg-slate-800`}
            title="Retour au site"
          >
            <div className="flex items-center justify-center w-6">
              <Home size={20} className="group-hover:text-white transition-colors" />
            </div>
            {!isCollapsed && <span>Retour au site</span>}
          </Link>
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 font-medium hover:text-danger hover:bg-danger/10 transition-all group text-left mt-1"
          >
            <div className="flex items-center justify-center w-6">
              <LogOut size={20} className="group-hover:text-danger transition-colors" />
            </div>
            {!isCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-3 mt-auto border-t border-slate-800">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-2 rounded-lg bg-slate-800/50`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-danger flex items-center justify-center text-white font-bold shadow-sm shrink-0 uppercase overflow-hidden">
              {userProfile?.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-full h-full object-cover" />
              ) : (
                userProfile ? userProfile.name.substring(0, 2) : "AD"
              )}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden pr-2">
                <span className="text-sm font-bold text-white truncate">{userProfile ? userProfile.name : "Admin"}</span>
                <span className="text-[10px] text-danger font-bold tracking-wider uppercase">Super Admin</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
