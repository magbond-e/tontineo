"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Wallet, CheckCircle2, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CharteModal from "@/components/CharteModal";

export default function JoinPage({ params }: { params: { token: string } }) {
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [inviteData, setInviteData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [showCharte, setShowCharte] = useState(false);

  useEffect(() => {
    const fetchCircleInfo = async () => {
      const { data, error } = await supabase
        .from('circles')
        .select('*, profiles:organizer_id(full_name)')
        .eq('invite_token', params.token)
        .single();

      if (error || !data) {
        console.error("Error fetching circle info:", error);
        setError("Ce lien d'invitation est invalide, expiré, ou le cercle n'accepte plus de membres.");
      } else {
        setInviteData({
          ...data,
          organizer_name: data.profiles?.full_name || "L'organisateur"
        });
      }
      setIsLoading(false);
    };

    fetchCircleInfo();
  }, [params.token]);

  const handleJoin = async () => {
    if (!user) {
      // Rediriger vers login avec redirect
      router.push(`/login?redirect=/join/${params.token}`);
      return;
    }

    setIsJoining(true);
    
    // Check if already a member
    const { data: existing, error: checkError } = await supabase
      .from('memberships')
      .select('id')
      .eq('circle_id', inviteData.id)
      .eq('user_id', user.id)
      .single();
      
    if (existing) {
      router.push(`/cercles/${inviteData.id}`);
      return;
    }

    const { error } = await supabase
      .from('memberships')
      .insert({
        circle_id: inviteData.id,
        user_id: user.id,
        role: 'member',
        status: 'pending'
      });

    if (error) {
      console.error("Error joining circle:", error);
      setError("Une erreur est survenue lors de la demande d'adhésion.");
      setIsJoining(false);
    } else {
      // Add notification for the organizer
      await supabase.from('notifications').insert({
        user_id: inviteData.organizer_id,
        title: 'Nouvelle demande d\'adhésion',
        description: `Un nouvel utilisateur souhaite rejoindre votre cercle "${inviteData.name}".`,
        unread: true
      });
      
      router.push(`/cercles/${inviteData.id}?joined=pending`);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12 animate-in fade-in duration-500">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-textSecondary font-medium">Chargement de l'invitation...</p>
      </div>
    );
  }

  if (error || !inviteData) {
    return (
      <div className="w-full text-center animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-textPrimary tracking-tight mb-2">Lien invalide</h1>
        <p className="text-textSecondary text-sm max-w-sm mx-auto mb-8">
          {error}
        </p>
        <Link href="/">
          <button className="px-6 py-3 bg-surface border border-border hover:bg-gray-50 text-textPrimary font-bold rounded-xl shadow-sm transition-all">
            Retour à l'accueil
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-primary/20 text-3xl">
          {inviteData.icon_emoji || "💰"}
        </div>
        <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight mb-2">{t("invitation_title")}</h1>
        <p className="text-textSecondary text-sm max-w-xs mx-auto leading-relaxed">
          <strong>{inviteData.organizer_name}</strong> vous invite à rejoindre une tontine.
        </p>
      </div>

      <div className="bg-surface dark:bg-slate-800 border border-border rounded-2xl p-6 shadow-sm mb-8 space-y-4 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        
        <div className="flex justify-between items-center pb-4 border-b border-border relative z-10">
          <span className="text-sm font-medium text-textSecondary">{t("invitation_circle")}</span>
          <span className="font-bold text-textPrimary text-right max-w-[60%] truncate" title={inviteData.name}>{inviteData.name}</span>
        </div>
        <div className="flex justify-between items-center pb-4 border-b border-border relative z-10">
          <span className="text-sm font-medium text-textSecondary">{t("invitation_amount")}</span>
          <span className="font-bold text-textPrimary flex items-center gap-2 font-mono">
            <Wallet size={16} className="text-primary" /> {Number(inviteData.amount).toLocaleString('fr-FR')} FCFA
          </span>
        </div>
        <div className="flex justify-between items-center relative z-10">
          <span className="text-sm font-medium text-textSecondary">{t("invitation_members")}</span>
          <span className="font-bold text-textPrimary flex items-center gap-2">
            <Users size={16} className="text-primary" /> {inviteData.current_members} / {inviteData.max_members}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {user && (
          <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-border">
            <input 
              type="checkbox" 
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="w-5 h-5 rounded text-primary focus:ring-primary accent-primary cursor-pointer mt-0.5" 
            />
            <span className="text-xs text-textSecondary leading-snug mt-1">
              J'ai lu et j'accepte la <button type="button" onClick={() => setShowCharte(true)} className="text-primary hover:underline font-bold">Charte de la Tontine</button>. 
              Je m'engage à payer mes cotisations à temps sous peine de pénalités.
            </span>
          </label>
        )}

        <button 
          onClick={handleJoin}
          disabled={isJoining || (user && !accepted)}
          className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
        >
          {isJoining ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <><CheckCircle2 size={18} /> {user ? t("btn_accept_invite") : "Se connecter pour rejoindre"}</>
          )}
        </button>
        
        {!user && (
          <p className="text-center text-xs text-textSecondary pt-2">
            {t("has_account")} <Link href={`/login?redirect=/join/${params.token}`} className="text-primary font-bold hover:underline">{t("login_link")}</Link>
          </p>
        )}
      </div>

      {inviteData && (
        <CharteModal 
          isOpen={showCharte}
          onClose={() => setShowCharte(false)}
          circle={{
            name: inviteData.name,
            amount: inviteData.amount,
            frequency: inviteData.frequency,
            penalty: inviteData.late_penalty_pct || 0,
            drawType: inviteData.draw_type || 'Aléatoire',
            maxMembers: inviteData.max_members
          }}
          onAccept={() => {
            setAccepted(true);
            setShowCharte(false);
          }}
          hasAccepted={accepted}
        />
      )}
    </div>
  );
}
