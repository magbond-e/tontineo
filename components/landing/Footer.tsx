import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface rounded-t-[3rem] sm:rounded-t-[4rem] px-8 sm:px-16 py-16 border-t border-border mt-24">
      <div className="max-w-6xl mx-auto flex flex-col gap-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand & Mission */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span className="font-bold text-2xl tracking-tight text-textPrimary">
                TONTINEO
              </span>
            </Link>
            <p className="text-textSecondary text-lg max-w-sm">
              La tontine de confiance.
            </p>
            <p className="text-textSecondary font-medium">
              Fait avec fierté 🌍 en Afrique
            </p>

            <div className="mt-4">
              <p className="text-textSecondary text-sm mb-3">
                Paiements supportés via FedaPay :
              </p>
              <div className="flex gap-3 items-center">
                <div className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-textSecondary hover:text-textPrimary transition-colors cursor-default">
                  MTN
                </div>
                <div className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-textSecondary hover:text-textPrimary transition-colors cursor-default">
                  Wave
                </div>
                <div className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-textSecondary hover:text-textPrimary transition-colors cursor-default">
                  Orange
                </div>
                <div className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-textSecondary hover:text-textPrimary transition-colors cursor-default">
                  Moov
                </div>
              </div>
            </div>
          </div>

          {/* Links - Produit */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-textPrimary">Produit</h4>
            <Link
              href="#fonctionnalites"
              className="text-textSecondary hover:text-primary transition-colors"
            >
              Fonctionnalités
            </Link>
            <Link
              href="#tarifs"
              className="text-textSecondary hover:text-primary transition-colors"
            >
              Tarifs
            </Link>
            <Link
              href="#comment-ca-marche"
              className="text-textSecondary hover:text-primary transition-colors"
            >
              Comment ça marche
            </Link>
          </div>

          {/* Links - Légal */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-textPrimary">Légal</h4>
            <Link
              href="/legal/cgu"
              className="text-textSecondary hover:text-primary transition-colors"
            >
              CGU
            </Link>
            <Link
              href="/legal/privacy"
              className="text-textSecondary hover:text-primary transition-colors"
            >
              Confidentialité
            </Link>
            <Link
              href="/legal/cookies"
              className="text-textSecondary hover:text-primary transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-textSecondary text-sm">
            © {new Date().getFullYear()} TONTINEO. Tous droits réservés.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success status-pulse"></div>
            <span className="font-mono text-xs text-success font-medium">
              Système opérationnel
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
