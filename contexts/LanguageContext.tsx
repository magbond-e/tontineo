"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "fr" | "en";

// Define the massive dictionary for the whole app
export const translations = {
  fr: {
    // Sidebar
    nav_dashboard: "Tableau de Bord",
    nav_cercles: "Mes Cercles",
    nav_portefeuille: "Portefeuille",
    nav_score: "Score de Confiance",
    nav_settings: "Paramètres",
    nav_support: "Support Client",
    nav_logout: "Déconnexion",
    nav_member_space: "Espace Membre",

    // Dashboard
    dash_title: "Tableau de Bord",
    dash_subtitle: "Bienvenue sur votre espace personnel.",
    dash_total_contributed: "Total Cotisé",
    dash_total_received: "Total Reçu",
    dash_active_circles: "Cercles Actifs",
    dash_next_draw: "Prochain Tirage",
    dash_members: "Membres",
    dash_punctuality: "Taux de Ponctualité",
    dash_no_transactions: "Aucune transaction disponible pour le moment.",
    dash_recent_ops: "Dernières Opérations",

    // Cercles
    circles_title: "Mes Cercles",
    circles_subtitle: "Gérez vos tontines et suivez la progression des pots.",
    filter_all: "Tous",
    filter_ongoing: "En cours",
    filter_waiting: "En attente",
    filter_done: "Terminés",
    circle_amount: "Montant",
    circle_next_pay: "Prochain gain",
    circle_members: "Membres",
    circle_pot_collected: "Pot collecté",
    btn_manage_circle: "Gérer le cercle",
    no_circle_found: "Aucun cercle trouvé",
    no_circle_desc: "Vous n'avez aucun cercle avec ce statut pour le moment.",
    show_all_circles: "Afficher tous les cercles",
    circle_empty_title: "Aucun cercle",
    circle_empty_desc: "Vous n'avez pas encore rejoint ou créé de cercle.",

    // Portefeuille
    wallet_title: "Mon Portefeuille",
    wallet_subtitle: "Gérez vos fonds et vos transactions.",
    wallet_balance: "Solde Disponible",
    wallet_withdraw: "Retirer des fonds",
    wallet_deposit: "Recharger",
    wallet_history: "Historique des Transactions",
    wallet_empty_tx: "Vous n'avez effectué aucune transaction.",

    // Score
    score_title: "Score de Confiance",
    score_subtitle: "Votre réputation sur la plateforme.",
    score_excellent: "Excellent",
    score_good: "Bon",
    score_average: "Moyen",

    // Paramètres
    settings_title: "Paramètres",
    settings_subtitle: "Gérez votre compte, votre identité et vos préférences.",
    tab_profile: "Mon Profil",
    tab_kyc: "Vérification",
    tab_notif: "Notifications",
    tab_plan: "Abonnement",
    tab_pref: "Préférences",
    
    // Member Space
    member_space_title: "Espace Membre",
    member_space_subtitle: "Gérez vos cotisations et suivez vos gains.",
    member_active_tontines: "Mes Tontines Actives",
    member_empty_tontines: "Vous n'avez pas encore de tontine active.",
    member_calendar: "Calendrier de Gain",
    member_wallet_activity: "Activité du Wallet",
    member_see_all_wallet: "Voir tout le portefeuille →",
    member_trust_score: "Score de Confiance",
    member_top_payer: "Vous n'avez pas encore d'historique de paiement.",
    member_see_details: "Voir les détails",
    btn_contribute_now: "Cotiser maintenant",
    next_payment: "Prochain paiement",
    tours: "tours",
    estimated_win: "Date de gain estimée",
    member_turn_soon: "Votre tour arrive bientôt !",
    member_position: "Vous êtes le",
    member_on: "sur",
    
    // Profile
    personal_info: "Informations Personnelles",
    change_photo: "Changer la photo",
    full_name: "Nom Complet",
    city_country: "Ville & Pays",
    email: "Adresse Email",
    whatsapp_num: "Numéro WhatsApp (Alertes)",
    momo_num: "Numéro de réception des Pots (Mobile Money)",
    momo_desc: "C'est sur ce numéro que vous recevrez vos fonds lorsque c'est votre tour de gagner.",
    save_btn: "Enregistrer",
    saving_btn: "Enregistrement...",
    saved_success: "Modifications enregistrées",
    cancel: "Annuler",
    confirm: "Confirmer",
    wa_modal_title: "Modifier le numéro WhatsApp ?",
    wa_modal_desc: "Vous êtes sur le point de modifier le numéro sur lequel vous recevez vos alertes en",
    wa_modal_sure: "Êtes-vous sûr ?",

    // KYC
    kyc_title: "Vérification d'Identité (KYC)",
    kyc_desc: "Conformément aux lois financières, nous devons vérifier votre identité.",
    unverified: "Non Vérifié",
    doc_type: "Type de document à fournir",
    cip: "Carte d'Identité (CIP)",
    passport: "Passeport",
    license: "Permis de conduire",
    front: "Face Avant (Recto)",
    back: "Face Arrière (Verso)",
    upload_hint: "Cliquez ou glissez le fichier ici",
    upload_format: "JPG, PNG ou PDF (Max 5MB)",
    back_hint: "Obligatoire pour les cartes d'identité",
    kyc_security: "Vos documents sont cryptés et stockés de manière sécurisée. La vérification prend généralement entre 24h et 48h ouvrées.",
    submit_kyc: "Soumettre pour vérification",

    // Notifications
    notif_title: "Préférences de Communication",
    wa_rec: "Recommandé",
    wa_desc: "Recevez vos alertes instantanément.",
    wa_opt1: "Rappels de cotisations (J-2 et Jour-J)",
    wa_opt2: "Alerte de tirage effectué (Gagnant)",
    wa_opt3: "Invitations à de nouveaux cercles",
    sms_title: "SMS Classique",
    sms_desc: "Uniquement pour les alertes critiques.",
    email_title: "Email",
    email_desc: "Reçus de paiements et récapitulatifs.",
    sms_lock: "Réservé aux forfaits Pro/Business.",

    // Plan
    plan_title: "Choisissez votre Plan",
    plan_desc: "Passez à la vitesse supérieure pour gérer de plus grands cercles et automatiser vos tontines.",
    essential: "Essentiel",
    pro_org: "Pro Organisateur",
    business: "Business",
    popular: "Populaire",
    current_plan: "Plan Actuel",
    upgrade_pro: "Passer en Pro",
    upgrade_biz: "Passer en Business",

    // Prefs
    pref_title: "Préférences de l'Application",
    theme_title: "Thème de l'application",
    theme_desc: "Mode clair ou sombre premium.",
    light: "Clair",
    dark: "Sombre",
    lang_title: "Langue",
    lang_desc: "Sélectionnez la langue de l'interface.",

    // Auth
    back_to_home: "Retour à l'accueil",
    auth_marketing_title: "Gérez vos tontines en toute sécurité et transparence.",
    auth_marketing_desc: "Rejoignez des milliers d'utilisateurs qui ont modernisé leur manière de cotiser.",
    login_title: "Bon retour !",
    login_subtitle: "Connectez-vous pour accéder à vos cercles.",
    email_label: "Adresse Email",
    pwd_label: "Mot de passe",
    pwd_forgot: "Mot de passe oublié ?",
    btn_login: "Se connecter",
    or_continue_with: "Ou continuer avec",
    btn_google: "Google",
    no_account: "Vous n'avez pas de compte ?",
    create_account: "Créer un compte",
    register_title: "Créer un compte",
    register_subtitle: "Rejoignez Tontineo et commencez à gérer vos cercles.",
    name_label: "Nom complet",
    whatsapp_label: "Numéro WhatsApp",
    btn_register: "S'inscrire",
    has_account: "Vous avez déjà un compte ?",
    login_link: "Se connecter",
    invitation_title: "Vous avez été invité !",
    invitation_desc: "Vous avez reçu une invitation pour rejoindre un cercle privé.",
    invitation_circle: "Cercle",
    invitation_amount: "Cotisation mensuelle",
    invitation_members: "Membres actuels",
    btn_accept_invite: "Accepter l'invitation",

    // Carousel Auth
    carousel_1_title: "Sécurité & Transparence",
    carousel_1_desc: "Gérez vos tontines en toute sécurité et transparence totale.",
    carousel_2_title: "Paiements Automatisés",
    carousel_2_desc: "Collectez et dispatchez les fonds via Mobile Money et cartes bancaires.",
    carousel_3_title: "Alertes Intelligentes",
    carousel_3_desc: "Ne manquez jamais un paiement grâce aux relances automatiques WhatsApp.",
    
    // Logout Modal
    logout_title: "Déconnexion",
    logout_desc: "Êtes-vous sûr de vouloir vous déconnecter de Tontineo ?",
  },
  en: {
    // Sidebar
    nav_dashboard: "Dashboard",
    nav_cercles: "My Circles",
    nav_portefeuille: "Wallet",
    nav_score: "Trust Score",
    nav_settings: "Settings",
    nav_support: "Customer Support",
    nav_logout: "Logout",
    nav_member_space: "Member Space",

    // Dashboard
    dash_title: "Dashboard",
    dash_subtitle: "Welcome to your personal space.",
    dash_total_contributed: "Total Contributed",
    dash_total_received: "Total Received",
    dash_active_circles: "Active Circles",
    dash_next_draw: "Next Draw",
    dash_members: "Members",
    dash_punctuality: "Punctuality Rate",
    dash_no_transactions: "No transactions available yet.",
    dash_recent_ops: "Recent Operations",

    // Cercles
    circles_title: "My Circles",
    circles_subtitle: "Manage your tontines and track pot progression.",
    filter_all: "All",
    filter_ongoing: "Ongoing",
    filter_waiting: "Waiting",
    filter_done: "Completed",
    circle_amount: "Amount",
    circle_next_pay: "Next payout",
    circle_members: "Members",
    circle_pot_collected: "Pot collected",
    btn_manage_circle: "Manage circle",
    no_circle_found: "No circle found",
    no_circle_desc: "You don't have any circle with this status yet.",
    show_all_circles: "Show all circles",
    circle_empty_title: "No circle",
    circle_empty_desc: "You haven't joined or created a circle yet.",

    // Portefeuille
    wallet_title: "My Wallet",
    wallet_subtitle: "Manage your funds and transactions.",
    wallet_balance: "Available Balance",
    wallet_withdraw: "Withdraw funds",
    wallet_deposit: "Top up",
    wallet_history: "Transaction History",
    wallet_empty_tx: "You haven't made any transactions.",

    // Score
    score_title: "Trust Score",
    score_subtitle: "Your reputation on the platform.",
    score_excellent: "Excellent",
    score_good: "Good",
    score_average: "Average",

    // Paramètres
    settings_title: "Settings",
    settings_subtitle: "Manage your account, identity and preferences.",
    tab_profile: "My Profile",
    tab_kyc: "Verification",
    tab_notif: "Notifications",
    tab_plan: "Subscription",
    tab_pref: "Preferences",

    // Member Space
    member_space_title: "Member Space",
    member_space_subtitle: "Manage your contributions and track your payouts.",
    member_active_tontines: "My Active Tontines",
    member_empty_tontines: "You don't have any active tontine yet.",
    member_calendar: "Payout Calendar",
    member_wallet_activity: "Wallet Activity",
    member_see_all_wallet: "See full wallet →",
    member_trust_score: "Trust Score",
    member_top_payer: "You don't have a payment history yet.",
    member_see_details: "See details",
    btn_contribute_now: "Contribute now",
    next_payment: "Next payment",
    tours: "rounds",
    estimated_win: "Estimated payout date",
    member_turn_soon: "Your turn is coming soon!",
    member_position: "You are",
    member_on: "out of",
    
    // Profile
    personal_info: "Personal Information",
    change_photo: "Change photo",
    full_name: "Full Name",
    city_country: "City & Country",
    email: "Email Address",
    whatsapp_num: "WhatsApp Number (Alerts)",
    momo_num: "Mobile Money Receiving Number",
    momo_desc: "This is the number where you will receive your funds when it's your turn to win.",
    save_btn: "Save",
    saving_btn: "Saving...",
    saved_success: "Changes saved",
    cancel: "Cancel",
    confirm: "Confirm",
    wa_modal_title: "Change WhatsApp number?",
    wa_modal_desc: "You are about to change the number where you receive your alerts to",
    wa_modal_sure: "Are you sure?",

    // KYC
    kyc_title: "Identity Verification (KYC)",
    kyc_desc: "In accordance with financial laws, we must verify your identity.",
    unverified: "Unverified",
    doc_type: "Document type to provide",
    cip: "ID Card (CIP)",
    passport: "Passport",
    license: "Driver's License",
    front: "Front Side",
    back: "Back Side",
    upload_hint: "Click or drag file here",
    upload_format: "JPG, PNG or PDF (Max 5MB)",
    back_hint: "Required for ID cards",
    kyc_security: "Your documents are encrypted and stored securely. Verification usually takes 24-48 business hours.",
    submit_kyc: "Submit for verification",

    // Notifications
    notif_title: "Communication Preferences",
    wa_rec: "Recommended",
    wa_desc: "Receive your alerts instantly.",
    wa_opt1: "Contribution reminders (D-2 and D-Day)",
    wa_opt2: "Draw alert (Winner)",
    wa_opt3: "Invitations to new circles",
    sms_title: "Classic SMS",
    sms_desc: "For critical alerts only.",
    email_title: "Email",
    email_desc: "Payment receipts and summaries.",
    sms_lock: "Reserved for Pro/Business plans.",

    // Plan
    plan_title: "Choose your Plan",
    plan_desc: "Shift to the next gear to manage larger circles and automate your tontines.",
    essential: "Essential",
    pro_org: "Pro Organizer",
    business: "Business",
    popular: "Popular",
    current_plan: "Current Plan",
    upgrade_pro: "Upgrade to Pro",
    upgrade_biz: "Upgrade to Business",

    // Prefs
    pref_title: "Application Preferences",
    theme_title: "Application Theme",
    theme_desc: "Light or premium dark mode.",
    light: "Light",
    dark: "Dark",
    lang_title: "Language",
    lang_desc: "Select the interface language.",

    // Auth
    back_to_home: "Back to home",
    auth_marketing_title: "Manage your tontines securely and transparently.",
    auth_marketing_desc: "Join thousands of users who have modernized their way of contributing.",
    login_title: "Welcome back!",
    login_subtitle: "Log in to access your circles.",
    email_label: "Email Address",
    pwd_label: "Password",
    pwd_forgot: "Forgot password?",
    btn_login: "Log in",
    or_continue_with: "Or continue with",
    btn_google: "Google",
    no_account: "Don't have an account?",
    create_account: "Create an account",
    register_title: "Create an account",
    register_subtitle: "Join Tontineo and start managing your circles.",
    name_label: "Full Name",
    whatsapp_label: "WhatsApp Number",
    btn_register: "Sign up",
    has_account: "Already have an account?",
    login_link: "Log in",
    invitation_title: "You've been invited!",
    invitation_desc: "You received an invitation to join a private circle.",
    invitation_circle: "Circle",
    invitation_amount: "Monthly contribution",
    invitation_members: "Current members",
    btn_accept_invite: "Accept invitation",

    // Carousel Auth
    carousel_1_title: "Security & Transparency",
    carousel_1_desc: "Manage your tontines with complete security and transparency.",
    carousel_2_title: "Automated Payments",
    carousel_2_desc: "Collect and dispatch funds via Mobile Money and credit cards.",
    carousel_3_title: "Smart Alerts",
    carousel_3_desc: "Never miss a payment with automatic WhatsApp reminders.",
    
    // Logout Modal
    logout_title: "Log out",
    logout_desc: "Are you sure you want to log out of Tontineo?",
  }
};

type Translations = typeof translations.fr;

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof Translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("fr");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedData = localStorage.getItem("tontineo_profile");
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.lang === "en" || data.lang === "fr") {
          setLangState(data.lang);
        }
      } catch (e) {}
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    // Update local storage
    const savedData = localStorage.getItem("tontineo_profile");
    let data = {};
    if (savedData) {
      try {
        data = JSON.parse(savedData);
      } catch (e) {}
    }
    (data as any).lang = newLang;
    localStorage.setItem("tontineo_profile", JSON.stringify(data));
  };

  const t = (key: keyof Translations): string => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
