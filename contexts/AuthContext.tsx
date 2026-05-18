"use client";

import { createContext, useContext, useEffect, useState } from "react";
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
  } | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  userProfile: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<{
    name: string;
    email: string;
    avatarUrl: string;
    whatsapp: string;
  } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  useEffect(() => {
    if (!user) {
      setProfileData(null);
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, whatsapp")
        .eq("id", user.id)
        .single();
      
      if (data) {
        setProfileData({
          name: data.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Utilisateur",
          email: user.email || "",
          avatarUrl: data.avatar_url || user.user_metadata?.avatar_url || "",
          whatsapp: data.whatsapp || user.user_metadata?.whatsapp || "",
        });
      } else {
        setProfileData({
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Utilisateur",
          email: user.email || "",
          avatarUrl: user.user_metadata?.avatar_url || "",
          whatsapp: user.user_metadata?.whatsapp || "",
        });
      }
    };

    fetchProfile();

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
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  const userProfile = profileData || (user ? {
    name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Utilisateur",
    email: user.email || "",
    avatarUrl: user.user_metadata?.avatar_url || "",
    whatsapp: user.user_metadata?.whatsapp || "",
  } : null);

  return (
    <AuthContext.Provider value={{ user, isLoading, userProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
