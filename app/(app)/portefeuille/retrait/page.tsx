"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRightLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function RetraitPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [noPin, setNoPin] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const checkSecurity = async () => {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('has_pin, is_locked, is_deactivated, pin_blocked_until').eq('id', user.id).single();
      if (data) {
        if (!data.has_pin) {
          setNoPin(true);
        }
        if (data.is_deactivated || data.is_locked || (data.pin_blocked_until && new Date(data.pin_blocked_until) > new Date())) {
          setIsLocked(true);
        }
      }
      setIsInitializing(false);
    };
    checkSecurity();
  }, [user, supabase]);

  const handleRetrait = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0 || !pin || !user) return;
    setIsLoading(true);
    setErrorMsg("");

    try {
      const { data: profile } = await supabase.from('profiles').select('wallet_balance, is_locked, has_pin').eq('id', user.id).single();
      
      if (!profile) throw new Error("Profil introuvable");
      
      // 1. Vérifier si le compte est gelé
      if (profile.is_locked || profile.is_deactivated || (profile.pin_blocked_until && new Date(profile.pin_blocked_until) > new Date())) {
        setErrorMsg("Votre compte est temporairement ou définitivement bloqué. Veuillez patienter ou contacter le support.");
        setIsLoading(false);
        return;
      }
      
      // 3. Vérifier le solde disponible localement
      if (profile.wallet_balance < Number(amount)) {
        setErrorMsg("Solde insuffisant pour effectuer ce retrait.");
        setIsLoading(false);
        return;
      }

      // 4. Tout est bon : Appeler l'API sécurisée côté serveur
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), pin })
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMsg(result.error || "Une erreur est survenue lors du retrait.");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/portefeuille');
      }, 3000);

    } catch (e: any) {
      console.error(e);
      setErrorMsg("Une erreur est survenue lors du traitement.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-[600px] mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mb-6 animate-in zoom-in-50">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-extrabold text-textPrimary mb-2">Retrait Validé !</h2>
        <p className="text-textSecondary mb-8">Vos fonds sont en cours de transfert vers votre numéro Momo.</p>
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/portefeuille" className="w-10 h-10 bg-surface border border-border rounded-full flex items-center justify-center text-textSecondary hover:text-primary hover:border-primary transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-textPrimary tracking-tight">Retirer des fonds</h1>
          <p className="text-sm text-textSecondary">Transfert sécurisé vers Mobile Money</p>
        </div>
      </div>

      <div className="bg-surface rounded-3xl border border-border p-6 md:p-8 shadow-sm space-y-6">
        
        {isInitializing ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
        ) : isLocked ? (
          <div className="p-5 bg-danger/10 border border-danger/20 rounded-xl flex flex-col items-center text-center gap-3 animate-in fade-in">
            <AlertCircle className="text-danger" size={32} />
            <p className="text-sm font-bold text-textPrimary">Votre compte est actuellement bloqué suite à des tentatives erronées répétées.</p>
          </div>
        ) : noPin ? (
          <div className="p-5 bg-warning/10 border border-warning/20 rounded-xl flex flex-col items-center text-center gap-3 animate-in fade-in">
            <AlertCircle className="text-warning" size={32} />
            <p className="text-sm font-bold text-textPrimary">Vous devez d'abord configurer votre code PIN de sécurité.</p>
            <Link href="/parametres?tab=securite" className="mt-2 px-6 py-2.5 bg-textPrimary hover:bg-black text-white font-bold rounded-xl transition-all shadow-md">
              Configurer mon PIN maintenant
            </Link>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-start gap-3 animate-in shake">
                <AlertCircle className="text-danger shrink-0 mt-0.5" size={20} />
                <p className="text-sm font-bold text-danger leading-relaxed">{errorMsg}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-textPrimary mb-2">Montant à retirer (FCFA)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ex: 5000"
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800/50 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-xl font-bold text-textPrimary font-mono" 
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-textSecondary font-bold">FCFA</span>
              </div>
              
              {amount && Number(amount) > 0 && (
                <div className="mt-4 p-4 bg-primaryLight/30 border border-primary/20 rounded-xl space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-textSecondary">Frais de plateforme (6%)</span>
                    <span className="font-bold text-textPrimary font-mono">-{Math.ceil(Number(amount) * 0.06).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="h-px bg-border/50 my-2"></div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-textPrimary">Montant net reçu sur Momo</span>
                    <span className="font-bold text-success font-mono">{Math.floor(Number(amount) * 0.94).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-textPrimary mb-2">Code PIN de sécurité</label>
              <input 
                type="password" 
                maxLength={6}
                value={pin} 
                onChange={(e) => setPin(e.target.value)}
                placeholder=""
                className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800/50 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-xl font-bold text-textPrimary text-center tracking-[1em]" 
              />
              <p className="text-xs text-textSecondary mt-2 text-center">Entrez votre code pour valider le transfert.</p>
            </div>

            <button 
              onClick={handleRetrait}
              disabled={isLoading || !amount || Number(amount) <= 0 || !pin}
              className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRightLeft size={20} />}
              {isLoading ? "Vérification..." : "Valider le retrait"}
            </button>
          </>
        )}

        <button 
          onClick={handleRetrait}
          disabled={isLoading || !amount || Number(amount) <= 0 || !pin}
          className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRightLeft size={20} />}
          {isLoading ? "Vérification..." : "Valider le retrait"}
        </button>
      </div>
    </div>
  );
}
