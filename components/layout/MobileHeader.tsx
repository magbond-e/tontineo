"use client";

import { Menu, Bell, X, LayoutDashboard, Users, Wallet, ShieldCheck, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { userProfile } = useAuth();

  const supabase = createClient();

  // Load and listen for notifications in real-time
  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data) {
        setNotifications(data.map(n => ({
          id: n.id,
          title: n.title,
          desc: n.description,
          unread: n.unread,
          time: new Date(n.created_at).toLocaleDateString('fr-FR') + ' ' + new Date(n.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        })));
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel('realtime_mobile_notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Click outside dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    // 1. Optimistic update (instantané visuellement)
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    
    // 2. Appel BD
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ unread: false })
      .eq('user_id', user.id);
  };
  
  const handleNotifClick = async (id: string, isUnread: boolean) => {
    if (!isUnread) return;
    
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    
    // Update DB
    await supabase
      .from('notifications')
      .update({ unread: false })
      .eq('id', id);
  };

  const triggerLogoutModal = () => {
    setIsMenuOpen(false);
    setShowLogoutModal(true);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    localStorage.removeItem("tontineo_profile");
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-3xl border border-border shadow-2xl p-8 max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mb-6 mx-auto">
              <LogOut size={32} />
            </div>
            <h3 className="text-xl font-bold text-textPrimary text-center mb-3">Déconnexion</h3>
            <p className="text-textSecondary text-center text-sm mb-8">
              Êtes-vous sûr de vouloir vous déconnecter de Tontineo ?
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-textPrimary font-bold rounded-xl transition-colors disabled:opacity-50 text-sm"
              >
                Annuler
              </button>
              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 py-3 bg-danger hover:bg-danger/90 text-white font-bold rounded-xl transition-all shadow-md shadow-danger/20 disabled:opacity-50 flex justify-center items-center text-sm"
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
        
        <div className="flex items-center gap-4 relative" ref={notifRef}>
          <div>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-textSecondary hover:text-textPrimary transition-colors mt-1"
            >
              <Bell size={20} />
              {notifications.some(n => n.unread) && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-danger animate-pulse"></span>
              )}
            </button>

            {/* Notifications Dropdown for Mobile */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-4 w-[300px] max-w-[calc(100vw-32px)] bg-surface border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-4 border-b border-border flex justify-between items-center bg-gray-50 dark:bg-slate-800">
                  <h3 className="font-bold text-textPrimary text-sm">Notifications</h3>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-textSecondary text-sm">
                      Aucune notification pour le moment.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        onClick={() => handleNotifClick(notif.id, notif.unread)}
                        className={`p-4 border-b border-border hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${notif.unread ? 'bg-primary/5' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-xs ${notif.unread ? 'font-bold text-textPrimary' : 'font-medium text-textSecondary'}`}>{notif.title}</h4>
                          <span className="text-[9px] font-bold text-textSecondary">{notif.time}</span>
                        </div>
                        <p className="text-[11px] text-textSecondary line-clamp-2 leading-relaxed">{notif.desc}</p>
                      </div>
                    ))
                  )}
                </div>
                {notifications.some(n => n.unread) && (
                  <div 
                    onClick={markAllAsRead}
                    className="p-3 text-center bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer text-xs font-bold text-primary"
                  >
                    Marquer tout comme lu
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="w-8 h-8 rounded-full bg-textPrimary flex items-center justify-center text-surface text-xs font-bold shadow-sm uppercase shrink-0 overflow-hidden">
            {userProfile?.avatarUrl ? (
              <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-full h-full object-cover" />
            ) : (
              userProfile ? userProfile.name.substring(0, 2) : "UT"
            )}
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
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${(pathname === '/dashboard' || pathname === '/dashboard/') ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                <LayoutDashboard size={20} className={(pathname === '/dashboard' || pathname === '/dashboard/') ? 'text-primary' : ''} /> Dashboard
              </Link>
              <Link href="/dashboard/member" onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${pathname.startsWith('/dashboard/member') ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                <Users size={20} className={pathname.startsWith('/dashboard/member') ? 'text-primary' : ''} /> Espace membre
              </Link>
              <Link href="/cercles" onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${pathname.startsWith('/cercles') ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                <Users size={20} className={pathname.startsWith('/cercles') ? 'text-primary' : ''} /> Mes cercles
              </Link>
              <Link href="/portefeuille" onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${pathname.startsWith('/portefeuille') ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                <Wallet size={20} className={pathname.startsWith('/portefeuille') ? 'text-primary' : ''} /> Portefeuille
              </Link>
              <Link href="/confiance" onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${pathname.startsWith('/confiance') ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                <ShieldCheck size={20} className={pathname.startsWith('/confiance') ? 'text-primary' : ''} /> Score de confiance
              </Link>
              <Link href="/parametres" onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${pathname.startsWith('/parametres') ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                <Settings size={20} className={pathname.startsWith('/parametres') ? 'text-primary' : ''} /> Paramètres
              </Link>

              <button 
                onClick={triggerLogoutModal} 
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-textSecondary font-medium hover:text-danger hover:bg-danger/10 transition-all mt-8 text-left"
              >
                <LogOut size={20} className="text-danger" /> <span className="text-danger">Déconnexion</span>
              </button>
            </nav>

            <div className="p-4 mt-auto border-t border-border">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-textPrimary flex items-center justify-center text-surface font-bold shadow-sm uppercase shrink-0 overflow-hidden">
                    {userProfile?.avatarUrl ? (
                      <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-full h-full object-cover" />
                    ) : (
                      userProfile ? userProfile.name.substring(0, 2) : "UT"
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
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
