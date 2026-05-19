"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight mb-2">{t("login_title")}</h1>
        <p className="text-textSecondary">{t("login_subtitle")}</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3 bg-danger/10 border border-danger/20 rounded-xl flex items-start gap-3">
          <AlertCircle size={18} className="text-danger mt-0.5 shrink-0" />
          <p className="text-sm font-medium text-danger">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-textPrimary">{t("email_label")}</label>
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-textPrimary">{t("pwd_label")}</label>
            <Link href="/forgot-password" className="text-xs font-bold text-primary hover:underline">{t("pwd_forgot")}</Link>
          </div>
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
          disabled={isLoading}
          className="w-full py-3 mt-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <><LogIn size={18} /> {t("btn_login")}</>
          )}
        </button>
      </form>

      <div className="mt-8 flex items-center gap-4">
        <div className="flex-1 h-px bg-border"></div>
        <span className="text-xs font-medium text-textSecondary uppercase tracking-wider">{t("or_continue_with")}</span>
        <div className="flex-1 h-px bg-border"></div>
      </div>

      <button onClick={handleGoogleLogin} className="w-full mt-6 py-3 bg-surface dark:bg-slate-800 border border-border hover:bg-gray-50 dark:hover:bg-slate-700 text-textPrimary font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-sm">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {t("btn_google")}
      </button>

      <p className="mt-8 text-center text-sm text-textSecondary">
        {t("no_account")} <Link href="/register" className="text-primary font-bold hover:underline">{t("create_account")}</Link>
      </p>
    </div>
  );
}
