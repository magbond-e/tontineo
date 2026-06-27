"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, ShieldCheck, Zap, Star, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/utils/supabase/client";

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'business'>('pro');
  const [showSkeleton, setShowSkeleton] = useState(false);
  
  const supabase = createClient();
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro' | 'business'>('free');
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      if (user) {
        const { data } = await supabase.from('profiles').select('current_plan').eq('id', user.id).single();
        if (data && data.current_plan) {
          setCurrentPlan(data.current_plan as 'free' | 'pro' | 'business');
          setSelectedPlan(data.current_plan as 'free' | 'pro' | 'business');
        }
      }
      setIsFetching(false);
    };
    fetchPlan();

    // Check for simulated payment return
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('payment') === 'success' && urlParams.get('plan')) {
        const planToUpgrade = urlParams.get('plan') as 'pro' | 'business';
        setShowSkeleton(true);
        
        // Simulate webhook processing time
        setTimeout(async () => {
          if (user) {
            // For the PRO trial, we also set the trial_ends_at
            if (planToUpgrade === 'pro') {
              await supabase.rpc('start_premium_trial'); // Use our custom RPC from migration
            } else {
              await supabase.from('profiles').update({ current_plan: planToUpgrade }).eq('id', user.id);
            }
            setCurrentPlan(planToUpgrade);
            setSelectedPlan(planToUpgrade);
          }
          setShowSkeleton(false);
          // Remove query params
          window.history.replaceState(null, '', window.location.pathname);
        }, 3000);
      }
    }
  }, [user, supabase]);

  const handleUpgrade = async () => {
    if (selectedPlan === currentPlan) return;
    
    setIsProcessing(true);
    // Real flow would call FedaPay API here. We simulate redirect to FedaPay checkout:
    setTimeout(() => {
      // Fake FedaPay URL redirect that instantly redirects back
      window.location.href = window.location.pathname + `?payment=success&plan=${selectedPlan}`;
    }, 500);
  };

  const handleCancel = async () => {
    if (!window.confirm("Voulez-vous vraiment résilier votre abonnement et repasser au plan Essentiel (Gratuit) ?")) return;
    setIsProcessing(true);
    setTimeout(async () => {
      if (user) {
        await supabase.from('profiles').update({ current_plan: 'free' }).eq('id', user.id);
        setCurrentPlan('free');
        setSelectedPlan('free');
      }
      setIsProcessing(false);
      alert("Abonnement résilié avec succès.");
    }, 1000);
  };

  if (isFetching) {
    return <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (showSkeleton) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 min-h-[80vh] flex flex-col items-center justify-center animate-pulse">
        <div className="w-20 h-20 bg-primary/20 rounded-full mb-6 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-textPrimary mb-2">Validation du paiement en cours...</h2>
        <p className="text-textSecondary mb-8 text-center max-w-md">Veuillez patienter pendant que nous confirmons votre transaction auprès de notre partenaire de paiement.</p>
        
        <div className="w-full max-w-2xl bg-surface border border-border rounded-3xl p-8 space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-md w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md w-1/2"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-md w-full mt-6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 min-h-[80vh]">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-textPrimary tracking-tight mb-4">
          Passez à la vitesse supérieure avec <span className="text-primary">Premium</span>
        </h1>
        <p className="text-textSecondary text-lg">
          Débloquez la création illimitée de tontines, un support prioritaire et des garanties avancées.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* FREE PLAN */}
        <div className={`bg-surface border ${selectedPlan === 'free' ? 'border-primary shadow-lg ring-2 ring-primary/20' : 'border-border'} rounded-3xl p-8 relative transition-all cursor-pointer hover:border-primary/50`}
             onClick={() => setSelectedPlan('free')}>
          {currentPlan === 'free' && (
            <div className="absolute top-0 right-8 transform -translate-y-1/2">
              <span className="bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Plan Actuel</span>
            </div>
          )}
          <h3 className="text-xl font-bold text-textPrimary mb-2">Essentiel</h3>
          <div className="mb-6">
            <span className="text-4xl font-extrabold text-textPrimary">0</span>
            <span className="text-textSecondary"> FCFA / mois</span>
          </div>
          <p className="text-sm text-textSecondary mb-6">Pour découvrir Tontineo et gérer sa première tontine.</p>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-3 text-sm font-medium text-textPrimary">
              <CheckCircle2 size={20} className="text-success shrink-0" />
              1 cercle actif maximum
            </li>
            <li className="flex items-start gap-3 text-sm font-medium text-textPrimary">
              <CheckCircle2 size={20} className="text-success shrink-0" />
              Jusqu'à 10 membres
            </li>
            <li className="flex items-start gap-3 text-sm font-medium text-textPrimary">
              <CheckCircle2 size={20} className="text-success shrink-0" />
              Paiement Mobile Money standard
            </li>
            <li className="flex items-start gap-3 text-sm font-medium text-gray-400">
              <ShieldCheck size={20} className="text-gray-300 shrink-0" />
              Support communautaire
            </li>
          </ul>
          
          <button 
            disabled
            className="w-full py-3 bg-gray-100 text-gray-400 font-bold rounded-xl transition-all"
          >
            {currentPlan === 'free' ? 'Votre plan' : 'Choisir ce plan'}
          </button>
        </div>

        {/* PREMIUM PLAN */}
        <div className={`bg-surface border ${selectedPlan === 'pro' ? 'border-primary shadow-2xl ring-4 ring-primary/20 scale-105' : 'border-border'} rounded-3xl p-8 relative transition-all cursor-pointer hover:border-primary/50 z-10`}
             onClick={() => setSelectedPlan('pro')}>
          <div className="absolute top-0 inset-x-0 flex justify-center transform -translate-y-1/2">
            <span className="bg-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-md">🎉 30 Jours d'Essai Gratuit</span>
          </div>
          <h3 className="text-xl font-bold text-primary mb-2 flex items-center gap-2">
            <Star size={20} fill="currentColor" /> Premium
          </h3>
          <div className="mb-6">
            <span className="text-4xl font-extrabold text-textPrimary">2 000</span>
            <span className="text-textSecondary"> FCFA / mois</span>
          </div>
          <p className="text-sm text-textSecondary mb-6">Pour les organisateurs sérieux qui gèrent plusieurs groupes.</p>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-3 text-sm font-bold text-textPrimary">
              <CheckCircle2 size={20} className="text-primary shrink-0" />
              Cercles actifs illimités
            </li>
            <li className="flex items-start gap-3 text-sm font-medium text-textPrimary">
              <CheckCircle2 size={20} className="text-primary shrink-0" />
              Jusqu'à 50 membres par cercle
            </li>
            <li className="flex items-start gap-3 text-sm font-medium text-textPrimary">
              <CheckCircle2 size={20} className="text-primary shrink-0" />
              Frais de retrait réduits (1%)
            </li>
            <li className="flex items-start gap-3 text-sm font-medium text-textPrimary">
              <CheckCircle2 size={20} className="text-primary shrink-0" />
              Support prioritaire 24/7
            </li>
          </ul>
          
          <button 
            onClick={handleUpgrade}
            disabled={isProcessing && selectedPlan === 'pro'}
            className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 hover:-translate-y-1"
          >
            {isProcessing && selectedPlan === 'pro' ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} fill="currentColor" />}
            {currentPlan === 'pro' ? "Votre plan actuel" : (isProcessing && selectedPlan === 'pro' ? "Préparation..." : "Démarrer l'essai (30 jours)")}
          </button>
        </div>

        {/* BUSINESS PLAN */}
        <div className={`bg-gray-900 border ${selectedPlan === 'business' ? 'border-primary shadow-lg ring-2 ring-primary/20' : 'border-gray-800'} rounded-3xl p-8 relative transition-all cursor-pointer hover:border-gray-700`}
             onClick={() => setSelectedPlan('business')}>
          <h3 className="text-xl font-bold text-white mb-2">Pro / Entreprise</h3>
          <div className="mb-6">
            <span className="text-4xl font-extrabold text-white">10 000</span>
            <span className="text-gray-400"> FCFA / mois</span>
          </div>
          <p className="text-sm text-gray-400 mb-6">La solution complète pour les très grandes communautés.</p>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-3 text-sm font-medium text-gray-200">
              <CheckCircle2 size={20} className="text-white shrink-0" />
              Cercles et Membres illimités
            </li>
            <li className="flex items-start gap-3 text-sm font-medium text-gray-200">
              <CheckCircle2 size={20} className="text-white shrink-0" />
              Zéro frais de retrait Tontineo
            </li>
            <li className="flex items-start gap-3 text-sm font-medium text-gray-200">
              <CheckCircle2 size={20} className="text-white shrink-0" />
              Gestionnaire de compte dédié
            </li>
            <li className="flex items-start gap-3 text-sm font-medium text-gray-200">
              <CheckCircle2 size={20} className="text-white shrink-0" />
              API Tontineo en marque blanche
            </li>
          </ul>
          
          <button 
            onClick={handleUpgrade}
            disabled={isProcessing && selectedPlan === 'business'}
            className="w-full py-3 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {isProcessing && selectedPlan === 'business' ? <Loader2 size={20} className="animate-spin" /> : null}
            Passer Business
          </button>
        </div>

      </div>
      
      <div className="mt-12 text-center text-sm text-textSecondary bg-surface border border-border p-6 rounded-2xl">
        <p>Les abonnements sont sans engagement. Vous pouvez annuler à tout moment depuis vos paramètres.</p>
        {currentPlan !== 'free' && (
          <button 
            onClick={handleCancel}
            disabled={isProcessing}
            className="mt-4 px-4 py-2 bg-danger/10 text-danger hover:bg-danger/20 font-bold rounded-lg transition-colors text-xs"
          >
            {isProcessing ? "Traitement..." : "Résilier mon abonnement actuel"}
          </button>
        )}
        <p className="mt-4">Besoin d'aide pour choisir ? <a href="mailto:contact@tontineo.app" className="text-primary font-bold hover:underline">Contactez notre équipe commerciale</a>.</p>
      </div>
    </div>
  );
}
