"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  userProfile: {
    name: string;
    email: string;
    avatarUrl: string;
    whatsapp: string;
    city: string;
    phone: string;
    isAdmin: boolean;
  } | null;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  userProfile: null,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileData, setProfileData] = useState<{
    name: string;
    email: string;
    avatarUrl: string;
    whatsapp: string;
    city: string;
    phone: string;
    isAdmin: boolean;
  } | null>(null);
  // Stabiliser l'instance Supabase — CRITIQUE : ne pas créer en body du composant
  // sinon supabase.auth change de référence à chaque render → boucle infinie dans useEffect
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    // Get initial session
    // Get initial session — MUST use getUser() (server-verified) not getSession() (local cache)
    // getSession() never contacts Supabase so banned users keep access until JWT expires.
    // getUser() always verifies against Supabase server → detects bans immediately.
    const initAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          // Token invalid, banned, or expired — clear local session immediately
          await supabase.auth.signOut();
          setUser(null);
        } else {
          setUser(user);
        }
      } catch (error) {
        console.error("Error verifying session:", error);
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes (sign in, sign out, token refresh, ban, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        // Re-verify with server on refresh to detect bans applied after login
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          await supabase.auth.signOut();
          setUser(null);
        } else {
          setUser(user);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      } else {
        setUser(session?.user ?? null);
      }
      setIsAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    setIsProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, whatsapp, city, phone, is_admin")
        .eq("id", user.id)
        .single();
      
      if (data) {
        setProfileData({
          name: data.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Utilisateur",
          email: user.email || "",
          avatarUrl: data.avatar_url || user.user_metadata?.avatar_url || "",
          whatsapp: data.whatsapp || user.user_metadata?.whatsapp || "",
          city: data.city || "",
          phone: data.phone || "",
          isAdmin: data.is_admin || false,
        });
      } else if (error && error.code === 'PGRST116') {
        // No row found, try creating one
        const fallbackName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Utilisateur";
        const fallbackAvatar = user.user_metadata?.avatar_url || "";
        const fallbackWhatsapp = user.user_metadata?.whatsapp || "";
        
        await supabase.from("profiles").insert({
          id: user.id,
          full_name: fallbackName,
          avatar_url: fallbackAvatar,
        });

        setProfileData({
          name: fallbackName,
          email: user.email || "",
          avatarUrl: fallbackAvatar,
          whatsapp: fallbackWhatsapp,
          city: "",
          phone: "",
          isAdmin: false,
        });
      } else {
        setProfileData({
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Utilisateur",
          email: user.email || "",
          avatarUrl: user.user_metadata?.avatar_url || "",
          whatsapp: user.user_metadata?.whatsapp || "",
          city: "",
          phone: "",
          isAdmin: false,
        });
      }
    } catch (err) {
      console.error("Error refreshing profile:", err);
    } finally {
      setIsProfileLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (!user) {
      setProfileData(null);
      setIsProfileLoading(false);
      return;
    }

    refreshProfile();

    // Subscribe to profile changes
    const channel = supabase
      .channel(`profile_changes_${user.id}`)
      .on(
        "postgres_changes", 
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` }, 
        (payload) => {
          const updated = payload.new as any;
          setProfileData({
            name: updated.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Utilisateur",
            email: user.email || "",
            avatarUrl: updated.avatar_url || user.user_metadata?.avatar_url || "",
            whatsapp: updated.whatsapp || user.user_metadata?.whatsapp || "",
            city: updated.city || "",
            phone: updated.phone || "",
            isAdmin: updated.is_admin || false,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, refreshProfile]);

  const userProfile = profileData || (user ? {
    name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Utilisateur",
    email: user.email || "",
    avatarUrl: user.user_metadata?.avatar_url || "",
    whatsapp: user.user_metadata?.whatsapp || "",
    city: "",
    phone: "",
    isAdmin: false,
  } : null);

  const isLoading = isAuthLoading || (user !== null && isProfileLoading);

  return (
    <AuthContext.Provider value={{ user, isLoading, userProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
