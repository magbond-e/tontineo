import { X, FileText, CheckCircle2 } from "lucide-react";

interface CharteModalProps {
  isOpen: boolean;
  onClose: () => void;
  circle: {
    name: string;
    amount: number;
    frequency: string;
    penalty: number;
    drawType: string;
    maxMembers: number;
  };
  onAccept?: () => void;
  hasAccepted?: boolean;
}

export default function CharteModal({ isOpen, onClose, circle, onAccept, hasAccepted }: CharteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-2xl md:rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="p-5 md:p-6 border-b border-border flex justify-between items-center bg-gray-50/50 rounded-t-2xl md:rounded-t-3xl">
          <div className="flex items-center gap-3 text-textPrimary">
            <FileText size={24} className="text-primary" />
            <h2 className="text-xl font-bold">Charte du Cercle : {circle.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full hover:bg-gray-100 border border-border text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-textSecondary">
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl">
            <p className="font-medium text-primary mb-2">Résumé des règles</p>
            <ul className="grid grid-cols-2 gap-2 font-bold text-textPrimary">
              <li>Montant : {circle.amount.toLocaleString('fr-FR')} FCFA</li>
              <li>Fréquence : {circle.frequency}</li>
              <li>Pénalité de retard : {circle.penalty.toLocaleString('fr-FR')} FCFA</li>
              <li>Type de tirage : {circle.drawType}</li>
              <li>Membres max : {circle.maxMembers}</li>
            </ul>
          </div>

          <section>
            <h3 className="text-base font-bold text-textPrimary mb-2">1. Engagement de Cotisation</h3>
            <p>En rejoignant ce cercle, chaque membre s'engage formellement à verser sa cotisation de <strong>{circle.amount.toLocaleString('fr-FR')} FCFA</strong> selon la fréquence <strong>{circle.frequency.toLowerCase()}</strong> convenue. Le non-respect de cet engagement bloque l'ensemble du groupe.</p>
          </section>

          <section>
            <h3 className="text-base font-bold text-textPrimary mb-2">2. Pénalités et Retards</h3>
            <p>Tout retard de paiement entraînera une pénalité de <strong>{circle.penalty.toLocaleString('fr-FR')} FCFA</strong> par jour de retard, applicable dès le lendemain de la date limite. Après 15 jours de retard, le membre est passible d'exclusion et perd ses droits sur le pot s'il ne l'a pas encore reçu.</p>
          </section>

          <section>
            <h3 className="text-base font-bold text-textPrimary mb-2">3. Processus de Tirage et de Paiement</h3>
            <p>Le tirage au sort (de type <strong>{circle.drawType}</strong>) est certifié par Tontineo. Le pot est versé au gagnant sous 24h ouvrées via Mobile Money ou sur son portefeuille Tontineo, une fois que l'ensemble des membres ont cotisé.</p>
          </section>

          <section>
            <h3 className="text-base font-bold text-textPrimary mb-2">4. Résolution des Litiges</h3>
            <p>En cas de désaccord (paiement non reçu, tirage suspecté d'irrégularité), le membre a l'obligation d'ouvrir un litige via l'application Tontineo avant d'engager toute autre action. L'organisateur et Tontineo agiront en tant que médiateurs impartiaux.</p>
          </section>
        </div>

        {onAccept && !hasAccepted && (
          <div className="p-5 md:p-6 border-t border-border bg-gray-50/50 rounded-b-2xl md:rounded-b-3xl flex flex-col sm:flex-row items-center gap-4 justify-between">
            <p className="text-xs text-textSecondary flex-1">
              En cliquant sur "J'accepte", vous validez électroniquement cette charte et vous engagez à respecter ses conditions.
            </p>
            <button 
              onClick={onAccept}
              className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-md transition-all whitespace-nowrap"
            >
              J'accepte la charte
            </button>
          </div>
        )}
        
        {hasAccepted && (
          <div className="p-5 md:p-6 border-t border-border bg-success/10 rounded-b-2xl md:rounded-b-3xl flex items-center justify-center gap-2 text-success font-bold">
            <CheckCircle2 size={20} />
            Vous avez accepté cette charte.
          </div>
        )}
      </div>
    </div>
  );
}
