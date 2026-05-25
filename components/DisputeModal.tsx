import { useState } from "react";
import { AlertCircle, X, Loader2, Send } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  circleId: string;
  circleName: string;
}

export default function DisputeModal({ isOpen, onClose, circleId, circleName }: DisputeModalProps) {
  const [type, setType] = useState("payment");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const { user } = useAuth();
  const supabase = createClient();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (description.length < 50) {
      setError("La description doit faire au moins 50 caractères.");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      const { error: disputeError } = await supabase.from('disputes').insert({
        circle_id: circleId,
        raised_by: user.id,
        type: type,
        description: description,
        status: 'open'
      });
      
      if (disputeError) throw disputeError;
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
      
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors de la création du litige.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-2xl md:rounded-3xl max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        
        <div className="p-5 md:p-6 border-b border-border flex justify-between items-center bg-danger/5">
          <div className="flex items-center gap-3 text-danger">
            <AlertCircle size={24} />
            <h2 className="text-xl font-bold">Ouvrir un Litige</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4">
              <Send size={32} />
            </div>
            <h3 className="text-xl font-bold text-textPrimary mb-2">Litige envoyé !</h3>
            <p className="text-textSecondary">Notre équipe et l'organisateur vont étudier votre demande sous 72h.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5">
            <p className="text-sm text-textSecondary mb-4">
              Un problème sur le cercle <strong>{circleName}</strong> ? Détaillez-le ci-dessous. Les fausses déclarations peuvent impacter votre score de confiance.
            </p>
            
            <div>
              <label className="block text-sm font-bold text-textPrimary mb-2">Nature du problème</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
              >
                <option value="payment">Paiement non reconnu / contesté</option>
                <option value="draw">Tirage suspect</option>
                <option value="payout">Virement non reçu</option>
                <option value="member">Comportement d'un membre</option>
                <option value="other">Autre problème</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-textPrimary mb-2">Description détaillée</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez précisément la situation..."
                className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[120px] resize-y"
              ></textarea>
              <div className="flex justify-between mt-1 text-xs">
                <span className={description.length < 50 ? "text-danger" : "text-success"}>
                  {description.length}/50 caractères minimum
                </span>
              </div>
            </div>
            
            {error && <p className="text-sm text-danger font-medium">{error}</p>}
            
            <div className="pt-4 border-t border-border flex justify-end gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-textPrimary font-bold rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting || description.length < 50}
                className="flex items-center gap-2 px-5 py-2.5 bg-danger hover:bg-danger/90 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <AlertCircle size={18} />}
                Soumettre le litige
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
