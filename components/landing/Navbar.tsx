"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import clsx from "clsx";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={clsx(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl transition-all duration-300",
        scrolled ? "px-4 sm:px-0" : "px-4 sm:px-0"
      )}
    >
      <nav
        className={clsx(
          "flex items-center justify-between px-6 py-3 rounded-full transition-all duration-300",
          scrolled
            ? "bg-surface/80 backdrop-blur-xl border border-border shadow-sm"
            : "bg-transparent border-transparent"
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">💰</span>
          <span className="font-bold text-xl tracking-tight text-textPrimary">
            TONTINEO
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="#fonctionnalites"
            className="text-textSecondary hover:text-primary transition-colors text-sm font-medium"
          >
            Fonctionnalités
          </Link>
          <Link
            href="#comment-ca-marche"
            className="text-textSecondary hover:text-primary transition-colors text-sm font-medium"
          >
            Comment ça marche
          </Link>
          <Link
            href="#tarifs"
            className="text-textSecondary hover:text-primary transition-colors text-sm font-medium"
          >
            Tarifs
          </Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Link
            href="/register"
            className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-white rounded-full font-bold px-6 py-2 transition-all duration-300 shadow-md shadow-primary/20 hover:scale-[1.03] hover:-translate-y-px"
          >
            Créer mon cercle &rarr;
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-textSecondary hover:text-primary transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-surface border border-border rounded-2xl shadow-xl p-6 flex flex-col gap-4 md:hidden">
          <Link
            href="#fonctionnalites"
            className="text-textPrimary font-medium py-2 border-b border-border"
            onClick={() => setMobileMenuOpen(false)}
          >
            Fonctionnalités
          </Link>
          <Link
            href="#comment-ca-marche"
            className="text-textPrimary font-medium py-2 border-b border-border"
            onClick={() => setMobileMenuOpen(false)}
          >
            Comment ça marche
          </Link>
          <Link
            href="#tarifs"
            className="text-textPrimary font-medium py-2 border-b border-border"
            onClick={() => setMobileMenuOpen(false)}
          >
            Tarifs
          </Link>
          <Link
            href="/register"
            className="mt-4 bg-primary text-white text-center rounded-full font-bold py-3"
            onClick={() => setMobileMenuOpen(false)}
          >
            Créer mon cercle &rarr;
          </Link>
        </div>
      )}
    </header>
  );
}
