import React from "react";

export default function CGUPage() {
  return (
    <div className="flex flex-col gap-6 text-textSecondary">
      <div className="mb-4">
        <h2 className="font-sans font-bold text-2xl sm:text-3xl text-textPrimary tracking-tight mb-2">Conditions Générales d'Utilisation (CGU)</h2>
        <p className="text-sm">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="font-bold text-xl text-textPrimary mb-3">1. Objet</h3>
          <p>
            Les présentes Conditions Générales d'Utilisation ont pour objet d'encadrer l'accès et l'utilisation de la plateforme TONTINEO. TONTINEO propose un service numérique permettant à ses Utilisateurs de créer, de gérer et de participer à des cercles d'épargne rotative (tontines) et des épargnes individuelles simplifiées.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-xl text-textPrimary mb-3">2. Inscription et Accès</h3>
          <p className="mb-2">Pour utiliser TONTINEO, vous devez :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Être âgé d'au moins 18 ans.</li>
            <li>Disposer d'un compte Mobile Money actif auprès d'un opérateur supporté (MTN, Wave, Orange, Moov).</li>
            <li>Fournir des informations exactes lors de votre inscription (procédure KYC éventuelle).</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-xl text-textPrimary mb-3">3. Cercles de Tontine</h3>
          <p>
            Un cercle est créé par un <strong>Administrateur</strong> qui définit les règles (montant, fréquence, nombre de membres). Les membres s'engagent moralement et financièrement à respecter ces règles. Bien que TONTINEO automatise les collectes et les tirages certifiés via son algorithme, la plateforme n'est pas une banque et n'assume pas la responsabilité en cas de défaut de paiement d'un membre.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-xl text-textPrimary mb-3">4. Paiements et Frais</h3>
          <p>
            Les paiements sont traités par notre partenaire certifié (FedaPay). TONTINEO peut prélever une commission transparente sur les transactions pour les utilisateurs des plans PRO ou Business, détaillée lors de la création du cercle. L'argent est temporairement séquestré avant d'être reversé automatiquement au bénéficiaire du tirage.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-xl text-textPrimary mb-3">5. Score de Confiance et Tirage</h3>
          <p>
            Le "Score de Confiance" évalue la régularité des paiements d'un membre. Les tirages au sort pour attribuer les cagnottes sont effectués de manière cryptographique et incontestable. Toute tentative de fraude entraînera un bannissement immédiat.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-xl text-textPrimary mb-3">6. Responsabilités</h3>
          <p>
            TONTINEO s'engage à assurer la disponibilité technique de la plateforme et la sécurité des transactions. Toutefois, TONTINEO ne peut être tenue responsable des litiges personnels entre les membres d'un même cercle ou des interruptions de service dues aux opérateurs de télécommunication.
          </p>
        </section>
      </div>
    </div>
  );
}
