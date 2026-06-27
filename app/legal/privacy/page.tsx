import React from "react";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col gap-6 text-textSecondary">
      <div className="mb-4">
        <h2 className="font-sans font-bold text-2xl sm:text-3xl text-textPrimary tracking-tight mb-2">Politique de Confidentialité</h2>
        <p className="text-sm">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="font-bold text-xl text-textPrimary mb-3">1. Collecte des Données</h3>
          <p>
            TONTINEO s'engage à protéger votre vie privée. Dans le cadre de l'utilisation de nos services, nous collectons certaines données personnelles essentielles, notamment :
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Votre nom, prénom et numéro de téléphone (Mobile Money).</li>
            <li>L'historique de vos transactions et de vos cotisations.</li>
            <li>Votre pièce d'identité (uniquement si requise pour la procédure KYC sur les gros montants).</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-xl text-textPrimary mb-3">2. Utilisation des Données</h3>
          <p>Vos données sont utilisées exclusivement pour :</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Faciliter les paiements et reverser les cagnottes au bon destinataire.</li>
            <li>Calculer votre Score de Confiance.</li>
            <li>Envoyer des rappels de paiement automatisés via WhatsApp ou SMS.</li>
            <li>Lutter contre la fraude et le blanchiment d'argent.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-xl text-textPrimary mb-3">3. Partage des Données</h3>
          <p>
            TONTINEO ne revend <strong>jamais</strong> vos données personnelles. Elles ne sont partagées qu'avec des tiers de confiance strictement nécessaires au fonctionnement du service :
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Nos partenaires de paiement (ex: FedaPay) pour le traitement des transactions.</li>
            <li>Nos fournisseurs d'infrastructures cloud (sécurisées et chiffrées).</li>
            <li>Les autorités judiciaires compétentes, uniquement en cas de réquisition légale.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-xl text-textPrimary mb-3">4. Sécurité</h3>
          <p>
            Toutes les communications entre votre téléphone et nos serveurs sont chiffrées (SSL/TLS). L'historique des tirages au sort est sécurisé par des preuves cryptographiques pour empêcher toute altération.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-xl text-textPrimary mb-3">5. Vos Droits</h3>
          <p>
            Conformément à la réglementation en vigueur sur la protection des données, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ces droits, vous pouvez nous contacter via la page Contact ou envoyer un e-mail à notre support.
          </p>
        </section>
      </div>
    </div>
  );
}
