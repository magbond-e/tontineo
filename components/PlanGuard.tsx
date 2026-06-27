"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

export function PlanGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkPlan = async () => {
      if (!user) {
        setIsChecking(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("current_plan, trial_ends_at")
          .eq("id", user.id)
          .single();

        if (data) {
          // If on free plan but trial is still active, we could upgrade them visually or just let them be free.
          // Since the instruction is "s'assure du plan de l'utilisateur", we just verify.
          // If the trial has expired (trial_ends_at < NOW) and they are on 'pro', we should downgrade them to 'free'.
          if (data.current_plan === 'pro' && data.trial_ends_at) {
            const trialEnd = new Date(data.trial_ends_at);
            if (trialEnd < new Date()) {
              // Trial expired, downgrade to free
              await supabase.from("profiles").update({ current_plan: 'free' }).eq('id', user.id);
            }
          }
        }
      } catch (err) {
        console.error("Erreur lors de la vérification du plan:", err);
      } finally {
        setIsChecking(false);
      }
    };

    checkPlan();
  }, [user, supabase]);

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-primary/10 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-textPrimary animate-pulse">Vérification de votre espace...</h2>
          <p className="text-sm text-textSecondary">Nous préparons vos fonctionnalités illimitées.</p>
        </div>
        
        {/* Skeleton UI for content below */}
        <div className="w-full max-w-4xl mt-8 space-y-4 opacity-50 px-4">
          <div className="h-40 bg-surface border border-border rounded-2xl animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-surface border border-border rounded-2xl animate-pulse delay-75"></div>
            <div className="h-32 bg-surface border border-border rounded-2xl animate-pulse delay-100"></div>
            <div className="h-32 bg-surface border border-border rounded-2xl animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
