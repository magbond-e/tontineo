"use client";

import { ShieldCheck, FileText, Cookie } from "lucide-react";
import Link from "next/link";

export default function LegalIndexPage() {
  return (
    <div className="min-h-screen bg-background py-20 px-4 flex justify-center">
      <div className="max-w-3xl w-full bg-surface border border-border rounded-3xl p-8 md:p-12 shadow-xl">
        <h1 className="text-3xl md:text-4xl font-extrabold text-textPrimary tracking-tight mb-4 flex items-center gap-3">
          <ShieldCheck className="text-primary w-10 h-10" />
          Centre de Sécurité & Légal
        </h1>
        <p className="text-textSecondary text-lg mb-10 leading-relaxed">
          Bienvenue sur le portail légal de Tontineo. Vous trouverez ici toutes les informations concernant nos conditions d'utilisation, notre politique de confidentialité et la gestion de vos données.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/legal/cgu" className="group p-6 border border-border rounded-2xl hover:border-primary hover:shadow-md transition-all flex flex-col gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-textPrimary mb-2">Conditions Générales d'Utilisation</h2>
              <p className="text-textSecondary text-sm">Les règles et conditions d'accès à la plateforme Tontineo.</p>
            </div>
          </Link>

          <Link href="/legal/privacy" className="group p-6 border border-border rounded-2xl hover:border-primary hover:shadow-md transition-all flex flex-col gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-textPrimary mb-2">Politique de Confidentialité</h2>
              <p className="text-textSecondary text-sm">Comment nous protégeons et gérons vos données personnelles.</p>
            </div>
          </Link>

          <Link href="/legal/cookies" className="group p-6 border border-border rounded-2xl hover:border-primary hover:shadow-md transition-all flex flex-col gap-4 md:col-span-2">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Cookie size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-textPrimary mb-2">Politique des Cookies</h2>
              <p className="text-textSecondary text-sm">Informations sur l'utilisation des cookies nécessaires à votre session.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
