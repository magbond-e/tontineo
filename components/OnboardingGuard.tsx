"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { Loader2, CheckCircle2 } from "lucide-react";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, userProfile, isLoading } = useAuth();

  const [city, setCity] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [momo, setMomo] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // Si on a un utilisateur et qu'il manque des informations essentielles
  if (user && userProfile && (!userProfile.city || !userProfile.whatsapp || !userProfile.phone)) {

    const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!city || !whatsapp || !momo) {
        setError("Veuillez remplir tous les champs.");
        return;
      }
      setIsSaving(true);
      setError("");

      const supabase = createClient();
      const { error: updateError } = await supabase.from('profiles').update({
        city: city,
        whatsapp: whatsapp,
        phone: momo
      }).eq('id', user.id);

      if (updateError) {
        setError("Erreur lors de la sauvegarde : " + updateError.message);
        setIsSaving(false);
      } else {
        // Recharger la page pour forcer la mise à jour du contexte AuthContext 
        // au cas où les webhooks Realtime ne sont pas activés
        window.location.reload();
      }
    };

    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface border border-border rounded-3xl p-8 shadow-xl text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-textPrimary tracking-tight mb-2">Dernière étape !</h1>
          <p className="text-textSecondary text-sm mb-8">
            Pour finaliser votre inscription et garantir la sécurité des transactions sur Tontineo, veuillez renseigner ces dernières informations.
          </p>

          <form onSubmit={handleSave} className="space-y-4 text-left">
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
                className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-textPrimary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-textPrimary mb-1.5">Numéro WhatsApp</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+229 00 00 00 00"
                className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-textPrimary"
                required
              />
              <p className="text-xs text-textSecondary mt-1">Pour recevoir les notifications et rappels.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-textPrimary mb-1.5">Numéro Mobile Money (Réception)</label>
              <input
                type="text"
                value={momo}
                onChange={(e) => setMomo(e.target.value)}
                placeholder="Ex: 97 00 00 00"
                className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-textPrimary"
                required
              />
              <p className="text-xs text-textSecondary mt-1">Ce numéro sera utilisé pour recevoir vos gains.</p>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Accéder à mon tableau de bord"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Si tout est ok, on affiche le reste de l'application
  return <>{children}</>;
}
