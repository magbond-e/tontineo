"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Wallet, CheckCircle2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinPage({ params }: { params: { token: string } }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for the invitation
  const inviteData = {
    inviter: "Amadou K.",
    circleName: "Cercle des Entrepreneurs",
    amount: "50 000 FCFA",
    members: "10/12",
  };

  const handleJoin = () => {
    setIsLoading(true);
    // Simulate join process
    setTimeout(() => {
      router.push("/login?redirect=dashboard");
    }, 1500);
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Users size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight mb-2">{t("invitation_title")}</h1>
        <p className="text-textSecondary text-sm max-w-xs mx-auto">
          <strong>{inviteData.inviter}</strong> {t("invitation_desc").toLowerCase()}
        </p>
      </div>

      <div className="bg-surface dark:bg-slate-800 border border-border rounded-2xl p-6 shadow-sm mb-8 space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-border">
          <span className="text-sm font-medium text-textSecondary">{t("invitation_circle")}</span>
          <span className="font-bold text-textPrimary">{inviteData.circleName}</span>
        </div>
        <div className="flex justify-between items-center pb-4 border-b border-border">
          <span className="text-sm font-medium text-textSecondary">{t("invitation_amount")}</span>
          <span className="font-bold text-textPrimary flex items-center gap-2">
            <Wallet size={16} className="text-primary" /> {inviteData.amount}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-textSecondary">{t("invitation_members")}</span>
          <span className="font-bold text-textPrimary flex items-center gap-2">
            <Users size={16} className="text-primary" /> {inviteData.members}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <button 
          onClick={handleJoin}
          disabled={isLoading}
          className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <><CheckCircle2 size={18} /> {t("btn_accept_invite")}</>
          )}
        </button>
        
        <p className="text-center text-xs text-textSecondary pt-2">
          {t("has_account")} <Link href="/login" className="text-primary font-bold hover:underline">{t("login_link")}</Link>
        </p>
      </div>
    </div>
  );
}
