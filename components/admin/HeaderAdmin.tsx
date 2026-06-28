"use client";

import { Menu, X, LayoutDashboard, Users, ShieldCheck, LogOut, Home } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function HeaderAdmin() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <>
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-white">
        <div className="flex items-center gap-3">
          <button 
            className="text-slate-400 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-danger text-white rounded flex items-center justify-center font-extrabold text-sm shadow-sm">
              A
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">Admin</span>
          </Link>
        </div>
        
        <div className="w-8 h-8 rounded-full bg-danger flex items-center justify-center text-white text-xs font-bold shadow-sm uppercase shrink-0 overflow-hidden">
          {userProfile?.avatarUrl ? (
            <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-full h-full object-cover" />
          ) : (
            userProfile ? userProfile.name.substring(0, 2) : "AD"
          )}
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 md:hidden" onClick={() => setIsMenuOpen(false)}>
          <div 
            className="fixed inset-y-0 left-0 w-[260px] bg-slate-900 shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <Link href="/admin" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                <div className="w-8 h-8 bg-danger text-white rounded-lg flex items-center justify-center font-extrabold text-lg shadow-sm">
                  A
                </div>
                <span className="font-extrabold text-xl tracking-tight text-white">Admin</span>
              </Link>
              <button 
                className="text-slate-400 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <nav className="flex-1 py-4 px-4 space-y-1 overflow-y-auto">
              <Link href="/admin" onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${(pathname === '/admin' || pathname === '/admin/') ? 'bg-danger/20 text-danger' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                <LayoutDashboard size={20} className={(pathname === '/admin' || pathname === '/admin/') ? 'text-danger' : ''} /> Dashboard
              </Link>
              <Link href="/admin/utilisateurs" onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${pathname.startsWith('/admin/utilisateurs') ? 'bg-danger/20 text-danger' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                <Users size={20} className={pathname.startsWith('/admin/utilisateurs') ? 'text-danger' : ''} /> Utilisateurs
              </Link>
              <Link href="/admin/kyc" onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${pathname.startsWith('/admin/kyc') ? 'bg-danger/20 text-danger' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                <ShieldCheck size={20} className={pathname.startsWith('/admin/kyc') ? 'text-danger' : ''} /> Validation KYC
              </Link>

              <div className="pt-8 mt-8 border-t border-slate-800">
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 font-medium hover:text-white hover:bg-slate-800 transition-all">
                  <Home size={20} /> Retour au site
                </Link>
                <button 
                  onClick={handleLogout} 
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 font-medium hover:text-danger hover:bg-danger/10 transition-all mt-1 text-left"
                >
                  <LogOut size={20} className="group-hover:text-danger" /> <span className="group-hover:text-danger">Déconnexion</span>
                </button>
              </div>
            </nav>

            <div className="p-4 mt-auto border-t border-slate-800">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
                <div className="w-10 h-10 rounded-full bg-danger flex items-center justify-center text-white font-bold shadow-sm uppercase shrink-0 overflow-hidden">
                  {userProfile?.avatarUrl ? (
                    <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-full h-full object-cover" />
                  ) : (
                    userProfile ? userProfile.name.substring(0, 2) : "AD"
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-bold text-white truncate max-w-[140px]">{userProfile ? userProfile.name : "Admin"}</span>
                  <span className="text-[10px] text-danger font-bold tracking-wider uppercase">Super Admin</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
