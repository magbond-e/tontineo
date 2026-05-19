"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function RechargePage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");

  const handleInitRecharge = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0 || !user) return;
    setIsLoading(true);
    // Simuler l'envoi du prompt sur le téléphone
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) return;
    setIsLoading(true);
    
    // Appeler l'API de recharge sécurisée côté serveur
    setTimeout(async () => {
      try {
        if (!user) {
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/wallet/recharge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: Number(amount), otp })
        });

        const result = await response.json();

        if (!response.ok) {
          alert(result.error || "Une erreur est survenue lors de la recharge.");
          setIsLoading(false);
          return;
        }

        setSuccess(true);
        setTimeout(() => {
          router.push('/portefeuille');
        }, 2000);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    }, 1500);
  };

  if (success) {
    return (
      <div className="max-w-[600px] mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mb-6 animate-in zoom-in-50">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-extrabold text-textPrimary mb-2">Recharge réussie !</h2>
        <p className="text-textSecondary mb-8">Votre solde a été mis à jour avec succès.</p>
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
        {step === 1 ? (
          <>
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
            </div>

            <button 
              onClick={handleInitRecharge}
              disabled={isLoading || !amount || Number(amount) <= 0}
              className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
              {isLoading ? "Envoi de la requête..." : "Payer via Momo"}
            </button>
          </>
        ) : (
          <div className="animate-in slide-in-from-right-4">
            <div className="mb-6 text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="animate-spin" size={30} />
              </div>
              <h3 className="font-bold text-lg text-textPrimary">Validation requise</h3>
              <p className="text-sm text-textSecondary mt-2">Veuillez consulter votre téléphone et entrer le code secret de validation Momo reçu par SMS pour autoriser le prélèvement.</p>
            </div>
            
            <div className="mb-8">
              <input 
                type="text" 
                maxLength={4}
                value={otp} 
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800/50 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-2xl font-bold text-textPrimary tracking-[1em] text-center font-mono" 
              />
            </div>

            <button 
              onClick={handleVerifyOtp}
              disabled={isLoading || otp.length < 4}
              className="w-full py-4 bg-textPrimary hover:bg-black text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
              {isLoading ? "Vérification..." : "Confirmer le paiement"}
            </button>
            <button 
              onClick={() => setStep(1)}
              disabled={isLoading}
              className="w-full py-3 text-textSecondary hover:text-textPrimary font-bold text-sm mt-2 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
