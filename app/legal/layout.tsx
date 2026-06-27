import React from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <Navbar />
      
      <main className="flex-1 flex flex-col pt-32 pb-24 px-6 sm:px-16 max-w-6xl mx-auto w-full">
        <div className="mb-12">
          <h1 className="font-sans font-extrabold text-4xl sm:text-5xl text-textPrimary tracking-tighter mb-4">
            Centre Légal
          </h1>
          <p className="text-lg text-textSecondary font-medium">
            Toutes les informations juridiques concernant l'utilisation de TONTINEO.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 flex-shrink-0 sticky top-32">
            <nav className="flex flex-col gap-2">
              <Link 
                href="/legal/cgu"
                className="px-4 py-3 rounded-xl hover:bg-surface border border-transparent hover:border-border text-textSecondary hover:text-textPrimary font-medium transition-colors"
              >
                Conditions Générales (CGU)
              </Link>
              <Link 
                href="/legal/privacy"
                className="px-4 py-3 rounded-xl hover:bg-surface border border-transparent hover:border-border text-textSecondary hover:text-textPrimary font-medium transition-colors"
              >
                Politique de Confidentialité
              </Link>
              <Link 
                href="/legal/cookies"
                className="px-4 py-3 rounded-xl hover:bg-surface border border-transparent hover:border-border text-textSecondary hover:text-textPrimary font-medium transition-colors"
              >
                Politique des Cookies
              </Link>
            </nav>
          </aside>

          {/* Page Content */}
          <div className="flex-1 bg-surface border border-border rounded-3xl p-8 sm:p-12 shadow-sm prose prose-slate max-w-none">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
