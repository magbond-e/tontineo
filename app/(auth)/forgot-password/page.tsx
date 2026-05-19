"use client";

import Link from "next/link";
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password`,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Un email de réinitialisation vous a été envoyé. Veuillez vérifier votre boîte mail.");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-textSecondary hover:text-textPrimary mb-6 transition-colors">
        <ArrowLeft size={16} /> Retour à la connexion
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight mb-2">Mot de passe oublié ?</h1>
        <p className="text-textSecondary">Saisissez votre adresse email pour recevoir un lien de réinitialisation sécurisé.</p>
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

      <form onSubmit={handleResetPassword} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-textPrimary">Adresse Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-textSecondary">
              <Mail size={18} />
            </div>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-surface dark:bg-slate-800/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-medium text-textPrimary" 
              placeholder="votre@email.com"
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
            "Envoyer le lien"
          )}
        </button>
      </form>
    </div>
  );
}
