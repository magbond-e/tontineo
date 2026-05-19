"use client";

import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    // Vérifier s'il y a un hash dans l'URL (token de supabase)
    const handleHash = async () => {
      const hash = window.location.hash;
      if (!hash) {
        // Rediriger si pas de token
        // router.push("/login");
      }
    };
    handleHash();
  }, [router]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password.length < 6) {
      setErrorMsg("Le mot de passe doit contenir au moins 6 caractères.");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Votre mot de passe a été réinitialisé avec succès !");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight mb-2">Nouveau mot de passe</h1>
        <p className="text-textSecondary">Veuillez entrer votre nouveau mot de passe ci-dessous.</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3 bg-danger/10 border border-danger/20 rounded-xl flex items-start gap-3">
          <AlertCircle size={18} className="text-danger mt-0.5 shrink-0" />
          <p className="text-sm font-medium text-danger">{errorMsg}</p>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-3 bg-success/10 border border-success/20 rounded-xl flex items-start gap-3">
          <CheckCircle2 size={18} className="text-success mt-0.5 shrink-0" />
          <p className="text-sm font-medium text-success">{successMsg}</p>
        </div>
      )}

      <form onSubmit={handleUpdatePassword} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-textPrimary">Nouveau mot de passe</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-textSecondary">
              <Lock size={18} />
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-surface dark:bg-slate-800/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-medium text-textPrimary" 
              placeholder="••••••••"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading || !!successMsg}
          className="w-full py-3 mt-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            "Réinitialiser le mot de passe"
          )}
        </button>
      </form>
    </div>
  );
}
