"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, CheckCircle2, ShieldCheck, ChevronRight } from "lucide-react";
import { User } from "@supabase/supabase-js";
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import Link from "next/link";

export function OnboardingGuard({ user }: { user: User }) {
  const [step, setStep] = useState(1);
  const [city, setCity] = useState("");
  const [whatsapp, setWhatsapp] = useState<string | undefined>("");
  const [momo, setMomo] = useState<string | undefined>("");
  
  const [cguAccepted, setCguAccepted] = useState(false);
  const [cookiesAccepted, setCookiesAccepted] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || !whatsapp || !momo) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    
    // Validation stricte des numéros
    if (whatsapp && !isValidPhoneNumber(whatsapp)) {
      setError("Le numéro WhatsApp saisi n'est pas valide pour ce pays.");
      return;
    }
    
    if (momo && !isValidPhoneNumber(momo)) {
      setError("Le numéro Mobile Money saisi n'est pas valide pour ce pays.");
      return;
    }

    setError("");
    setStep(2);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cguAccepted || !cookiesAccepted) {
      setError("Vous devez accepter les conditions pour continuer.");
      return;
    }
    
    setIsSaving(true);
    setError("");

    const supabase = createClient();
    
    // Appel sécurisé via RPC qui contourne le RLS capricieux
    const { error: updateError } = await supabase.rpc('submit_onboarding', {
      p_city: city,
      p_whatsapp: whatsapp,
      p_momo: momo
    });

    if (updateError) {
      setError("Erreur lors de la sauvegarde : " + updateError.message);
      setIsSaving(false);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-md w-full bg-surface border border-border rounded-3xl p-8 shadow-xl text-center animate-in fade-in zoom-in duration-300 my-8">
        
        {/* Stepper Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`w-10 h-2 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-border'}`}></div>
          <div className={`w-10 h-2 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-border'}`}></div>
        </div>

        {step === 1 ? (
          <>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold text-textPrimary tracking-tight mb-2">Dernière étape !</h1>
            <p className="text-textSecondary text-sm mb-8">
              Pour finaliser votre inscription et garantir la sécurité des transactions sur Tontineo, veuillez renseigner ces informations de contact.
            </p>

            <form onSubmit={handleNextStep} className="space-y-5 text-left">
              {error && (
                <div className="p-3 text-sm text-danger bg-danger/10 rounded-xl font-medium border border-danger/20">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-textPrimary mb-1.5">Ville de résidence</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Cotonou"
                  className="w-full px-4 py-3 bg-surface dark:bg-slate-800/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-textPrimary text-sm font-medium"
                  required
                />
              </div>

              {/* Custom CSS for PhoneInput to match the theme */}
              <style jsx global>{`
                .PhoneInput {
                  display: flex;
                  align-items: center;
                  background-color: var(--color-surface);
                  border: 1px solid var(--color-border);
                  border-radius: 0.75rem;
                  padding: 0.25rem 1rem;
                  transition: all 0.2s;
                }
                .PhoneInput:focus-within {
                  border-color: var(--color-primary);
                  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.2);
                }
                .PhoneInputCountry {
                  margin-right: 0.75rem;
                }
                .PhoneInputInput {
                  flex: 1;
                  min-width: 0;
                  background: transparent;
                  border: none;
                  padding: 0.5rem 0;
                  font-size: 0.875rem;
                  font-weight: 500;
                  color: var(--color-textPrimary);
                  outline: none;
                }
              `}</style>

              <div>
                <label className="block text-sm font-bold text-textPrimary mb-1.5">Numéro WhatsApp</label>
                <PhoneInput
                  international
                  defaultCountry="BJ"
                  value={whatsapp}
                  onChange={setWhatsapp}
                  className="w-full"
                />
                <p className="text-xs text-textSecondary mt-1.5">Pour recevoir les notifications et rappels.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-textPrimary mb-1.5">Numéro Mobile Money (Réception)</label>
                <PhoneInput
                  international
                  defaultCountry="BJ"
                  value={momo}
                  onChange={setMomo}
                  className="w-full"
                />
                <p className="text-xs text-textSecondary mt-1.5">Ce numéro sera utilisé pour recevoir vos gains.</p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-6"
              >
                Continuer <ChevronRight size={18} />
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold text-textPrimary tracking-tight mb-2">Sécurité & Confidentialité</h1>
            <p className="text-textSecondary text-sm mb-8">
              Veuillez prendre connaissance de nos conditions d'utilisation avant de rejoindre la plateforme.
            </p>

            <form onSubmit={handleSave} className="space-y-6 text-left">
              {error && (
                <div className="p-3 text-sm text-danger bg-danger/10 rounded-xl font-medium border border-danger/20">
                  {error}
                </div>
              )}

              <div className="bg-gray-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-border space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                    <input 
                      type="checkbox" 
                      checked={cguAccepted}
                      onChange={(e) => setCguAccepted(e.target.checked)}
                      className="peer appearance-none w-5 h-5 border-2 border-border rounded focus:ring-2 focus:ring-primary/50 checked:bg-primary checked:border-primary transition-all cursor-pointer"
                    />
                    <CheckCircle2 size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                  </div>
                  <span className="text-sm text-textPrimary font-medium leading-snug">
                    J'ai lu et j'accepte les <Link href="/legal" target="_blank" className="text-primary hover:underline">Conditions Générales d'Utilisation</Link> et je certifie avoir plus de 18 ans.
                  </span>
                </label>

                <div className="h-px w-full bg-border"></div>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                    <input 
                      type="checkbox" 
                      checked={cookiesAccepted}
                      onChange={(e) => setCookiesAccepted(e.target.checked)}
                      className="peer appearance-none w-5 h-5 border-2 border-border rounded focus:ring-2 focus:ring-primary/50 checked:bg-primary checked:border-primary transition-all cursor-pointer"
                    />
                    <CheckCircle2 size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                  </div>
                  <span className="text-sm text-textPrimary font-medium leading-snug">
                    J'accepte l'utilisation de cookies nécessaires au bon fonctionnement de l'application et de ma session.
                  </span>
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3.5 bg-surface border border-border hover:bg-gray-50 dark:hover:bg-slate-800 text-textPrimary font-bold rounded-xl transition-all"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !cguAccepted || !cookiesAccepted}
                  className="flex-1 py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Accéder au tableau de bord"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
