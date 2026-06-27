import React from "react";

export default function CookiesPage() {
  return (
    <div className="flex flex-col gap-6 text-textSecondary">
      <div className="mb-4">
        <h2 className="font-sans font-bold text-2xl sm:text-3xl text-textPrimary tracking-tight mb-2">Politique des Cookies</h2>
        <p className="text-sm">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="font-bold text-xl text-textPrimary mb-3">1. Que sont les cookies ?</h3>
          <p>
            Les cookies sont de petits fichiers texte déposés sur votre appareil (ordinateur, tablette, mobile) lors de votre visite sur le site TONTINEO. Ils permettent au site de mémoriser vos actions et préférences (telles que la connexion ou la langue) pendant une durée donnée.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-xl text-textPrimary mb-3">2. Les cookies que nous utilisons</h3>
          <p className="mb-3">TONTINEO utilise principalement des cookies dits <strong>strictement nécessaires</strong> au bon fonctionnement de la plateforme :</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Cookies d'authentification :</strong> Ils nous permettent de vous maintenir connecté(e) à votre compte de manière sécurisée lors de la gestion de vos cercles.
            </li>
            <li>
              <strong>Cookies de session de paiement :</strong> Utilisés temporairement lors d'une transaction (vers FedaPay ou autre opérateur) pour garantir que votre paiement est bien attribué à votre compte.
            </li>
            <li>
              <strong>Cookies de préférences :</strong> Pour sauvegarder vos choix d'interface (comme le mode clair/sombre).
            </li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-xl text-textPrimary mb-3">3. Cookies Tiers (Analytics)</h3>
          <p>
            Nous pouvons occasionnellement utiliser des outils d'analyse (comme Google Analytics ou Plausible) pour comprendre comment notre site est utilisé et l'améliorer. Ces outils déposent des cookies pour mesurer l'audience. Ces données sont anonymisées et ne sont pas utilisées pour vous cibler publicitairement.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-xl text-textPrimary mb-3">4. Gérer vos préférences</h3>
          <p>
            Vous pouvez à tout moment configurer votre navigateur pour bloquer ou vous alerter sur l'utilisation des cookies. Cependant, si vous bloquez les cookies strictement nécessaires, certaines parties du site (notamment la connexion et les paiements) ne fonctionneront pas correctement.
          </p>
        </section>
      </div>
    </div>
  );
}
