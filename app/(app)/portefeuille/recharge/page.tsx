"use client";

import { Suspense, useState, useEffect } from "react";
import { ArrowLeft, Plus, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

function RechargeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      setSuccess(true);
      setTimeout(() => {
        router.push('/portefeuille');
      }, 3000);
    }
  }, [searchParams, router]);

  const handleInitRecharge = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0 || !user) return;
    if (Number(amount) < 100) {
      setErrorMsg("Le montant minimum de recharge est de 100 FCFA.");
      return;
    }
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: Number(amount), 
          type: 'wallet_recharge' 
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMsg(result.error || "Une erreur est survenue lors de l'initialisation.");
        setIsLoading(false);
        return;
      }

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Erreur réseau. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-[600px] mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mb-6 animate-in zoom-in-50">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-extrabold text-textPrimary mb-2">Recharge initiée avec succès !</h2>
        <p className="text-textSecondary mb-8">Votre solde sera mis à jour dès la validation de FedaPay.</p>
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
          <h1 className="text-2xl font-extrabold text-textPrimary tracking-tight">Recharger mon compte</h1>
          <p className="text-sm text-textSecondary">Ajoutez des fonds via Mobile Money</p>
        </div>
      </div>

      <div className="bg-surface rounded-3xl border border-border p-6 md:p-8 shadow-sm">
        <div className="mb-8">
          <label className="block text-sm font-bold text-textPrimary mb-2">Montant à recharger (FCFA)</label>
          <div className="relative">
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 10000"
              className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800/50 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-xl font-bold text-textPrimary font-mono" 
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-textSecondary font-bold">FCFA</span>
          </div>
          <p className="text-[11px] text-textSecondary mt-1.5">Montant minimum : <span className="font-bold">100 FCFA</span></p>
        </div>

        <button 
          onClick={handleInitRecharge}
          disabled={isLoading || !amount || Number(amount) <= 0}
          className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
          {isLoading ? "Redirection vers FedaPay..." : "Payer via Mobile Money"}
        </button>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 bg-danger/5 border border-danger/20 text-danger text-sm font-bold p-3 rounded-xl animate-in slide-in-from-top-2 duration-200">
            <span className="shrink-0">&#9888;</span>
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RechargePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={30} />
      </div>
    }>
      <RechargeContent />
    </Suspense>
  );
}

