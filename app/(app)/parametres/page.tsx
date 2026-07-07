"use client";

import { useState, useEffect, useMemo, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { User, ShieldCheck, Bell, Crown, Settings, UploadCloud, CheckCircle2, AlertCircle, Camera, FileText, Check, Smartphone, Mail, MessageSquare, Globe, Loader2, Save, Lock, ArrowUpRight, TrendingUp, Zap, Users, Infinity, CalendarClock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { isValidPhoneNumber } from "react-phone-number-input";

export default function ParametresPage() {
  return (
    <Suspense fallback={null}>
      <ParametresPageContent />
    </Suspense>
  );
}

function ParametresPageContent() {
  const { lang, setLang, t } = useLanguage();
  const { user, userProfile, refreshProfile } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("profil");
  const [docType, setDocType] = useState("cip");
  
  // Profil Form State
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [momo, setMomo] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmingPlan, setIsConfirmingPlan] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // WhatsApp Logic
  const [showWaModal, setShowWaModal] = useState(false);
  const [waNumber, setWaNumber] = useState("");
  const [waInput, setWaInput] = useState("");
  const [pendingWaNumber, setPendingWaNumber] = useState("");

  // Toggles
  const [waEnabled, setWaEnabled] = useState(true);
  const [waReminders, setWaReminders] = useState(true);
  const [waDraws, setWaDraws] = useState(true);
  const [waInvites, setWaInvites] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);

  // Plan logic
  const [userPlan, setUserPlan] = useState("free");
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);
  const [cerclesCount, setCerclesCount] = useState(0);
  const [membresCount, setMembresCount] = useState(0);
  const [planSuccessToast, setPlanSuccessToast] = useState(""); // toast après retour FedaPay
  const searchParams = useSearchParams();
  const confirmedTxRef = useRef<string | null>(null);

  // Security State
  const [pinCode, setPinCode] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [isPinSaving, setIsPinSaving] = useState(false);
  const [pinSuccess, setPinSuccess] = useState("");
  const [pinError, setPinError] = useState("");
  const [hasPin, setHasPin] = useState(false);
  const [oldPin, setOldPin] = useState("");

  const supabase = useMemo(() => createClient(), []);

  // KYC State
  const [kycStatus, setKycStatus] = useState("unverified");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [isUploadingKyc, setIsUploadingKyc] = useState(false);
  const [kycMessage, setKycMessage] = useState("");

  useEffect(() => {
    setMounted(true);

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (tab) setActiveTab(tab);
    }

    const fetchProfile = async () => {
      if (user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, city, phone, whatsapp, current_plan, plan_expires_at, wa_enabled, wa_reminders_enabled, wa_draws_enabled, wa_invites_enabled, sms_enabled, email_enabled, has_pin, kyc_status, avatar_url')
          .eq('id', user.id)
          .single();
        if (profile) {
          setName(profile.full_name || userProfile?.name || "");
          setCity(profile.city || "");
          setEmail(user?.email || "");
          setMomo(profile.phone || "");
          if (profile.whatsapp) {
            setWaNumber(profile.whatsapp);
            setWaInput(profile.whatsapp);
          }
          if (profile.current_plan) setUserPlan(profile.current_plan);
          if (profile.plan_expires_at) setPlanExpiresAt(profile.plan_expires_at);
          if (profile.wa_enabled !== null) setWaEnabled(profile.wa_enabled);
          if (profile.wa_reminders_enabled !== null) setWaReminders(profile.wa_reminders_enabled);
          if (profile.wa_draws_enabled !== null) setWaDraws(profile.wa_draws_enabled);
          if (profile.wa_invites_enabled !== null) setWaInvites(profile.wa_invites_enabled);
          if (profile.sms_enabled !== null) setSmsEnabled(profile.sms_enabled);
          if (profile.email_enabled !== null) setEmailEnabled(profile.email_enabled);
          if (profile.has_pin !== undefined) setHasPin(profile.has_pin);
          if (profile.kyc_status) setKycStatus(profile.kyc_status);
          if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
        }
      }
    };
    fetchProfile();

    // Détecter retour FedaPay après abonnement payé
    const planStatus = searchParams.get('plan_status');
    const planParam = searchParams.get('plan');
    if (planStatus === 'success' && planParam) {
      const label = planParam === 'pro' ? 'Pro' : 'Business';
      setPlanSuccessToast(`🎉 Abonnement ${label} activé avec succès !`);
      setActiveTab('abonnement');
      // Nettoyer l'URL sans recharger
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/parametres?tab=abonnement');
      }
      setTimeout(() => setPlanSuccessToast(''), 6000);
    }

    // Confirmation serveur au retour FedaPay (évite les cas webhook en retard/raté)
    const paymentStatus = searchParams.get('status');
    const txId = searchParams.get('id');
    if (paymentStatus === 'approved' && txId && user?.id && confirmedTxRef.current !== txId) {
      confirmedTxRef.current = txId;
      setIsConfirmingPlan(true);
      fetch('/api/subscriptions/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: txId }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Confirmation abonnement impossible');
          }

          if (data.plan) setUserPlan(data.plan);
          if (data.expires_at) setPlanExpiresAt(data.expires_at);
          const label = data.plan === 'pro' ? 'Pro' : data.plan === 'business' ? 'Business' : 'Premium';
          setPlanSuccessToast(`🎉 Abonnement ${label} activé avec succès !`);

          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', '/parametres?tab=abonnement');
          }
        })
        .catch((err) => {
          setSaveError(err.message || "La confirmation du paiement a échoué.");
        })
        .finally(() => {
          setIsConfirmingPlan(false);
          setTimeout(() => setPlanSuccessToast(''), 6000);
        });
    }

    // Fetch real quota usage
    const fetchQuotas = async () => {
      if (!user?.id) return;
      const { count: cc } = await supabase.from('circles').select('*', { count: 'exact', head: true }).eq('organizer_id', user.id).eq('status', 'En cours');
      const { count: mc } = await supabase.from('memberships').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active');
      setCerclesCount(cc || 0);
      setMembresCount(mc || 0);
    };
    fetchQuotas();
  }, [user, userProfile, supabase]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setSaveError("Erreur lors de l'upload: " + (data.error || "Erreur inconnue"));
      } else {
        setAvatarUrl(data.avatar_url);
        setSavedSuccess(true);
        await refreshProfile();
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err: any) {
      setSaveError("Erreur réseau: " + err.message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleKycSubmit = async () => {
    if (!frontFile) {
      setKycMessage("Veuillez sélectionner le document recto.");
      return;
    }
    if (docType === 'permis' && !backFile) {
      setKycMessage("Veuillez sélectionner le verso pour le permis.");
      return;
    }
    setIsUploadingKyc(true);
    setKycMessage("");

    try {
      const formData = new FormData();
      formData.append('docType', docType);
      formData.append('frontFile', frontFile);
      if (backFile && docType === 'permis') {
        formData.append('backFile', backFile);
      }

      const res = await fetch('/api/profile/kyc', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setKycMessage("Erreur lors de la soumission: " + (data.error || "Erreur inconnue"));
      } else {
        setKycStatus("pending");
        setKycMessage("Documents soumis avec succès. En attente de validation.");
      }
    } catch (err: any) {
      setKycMessage("Erreur réseau: " + err.message);
    } finally {
      setIsUploadingKyc(false);
    }
  };

  const handleSaveProfile = () => {
    setSaveError("");
    // Validate Momo number
    if (momo && !isValidPhoneNumber(momo)) {
      setSaveError("Le numéro Mobile Money est invalide. Utilisez le format international (ex: +22997000000).");
      return;
    }
    // Validate WhatsApp number
    if (waInput && !isValidPhoneNumber(waInput)) {
      setSaveError("Le numéro WhatsApp est invalide. Utilisez le format international (ex: +22997000000).");
      return;
    }
    if (waInput !== waNumber) {
      setPendingWaNumber(waInput);
      setShowWaModal(true);
      return;
    }
    executeSave(waInput);
  };

  const executeSave = async (finalWaNum: string) => {
    setIsSaving(true);
    setSavedSuccess(false);
    setSaveError("");
    
    if (user?.id) {
      const { error } = await supabase.from('profiles').update({
        full_name: name,
        city: city,
        phone: momo,
        whatsapp: finalWaNum,
        wa_enabled: waEnabled,
        sms_enabled: smsEnabled,
        email_enabled: emailEnabled
      }).eq('id', user.id);

      setIsSaving(false);

      if (error) {
        setSaveError("Une erreur est survenue lors de la sauvegarde : " + error.message);
      } else {
        setSavedSuccess(true);
        if (pendingWaNumber) {
          setWaNumber(pendingWaNumber);
          setPendingWaNumber("");
        }
        await refreshProfile();
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } else {
      setIsSaving(false);
      setSaveError("Utilisateur non connecté.");
    }
  };

  const handleSavePin = async () => {
    if (hasPin && !oldPin) {
      setPinError("Veuillez saisir votre ancien code PIN.");
      return;
    }
    if (pinCode.length !== 4 && pinCode.length !== 6) {
      setPinError("Le code PIN doit faire 4 ou 6 chiffres.");
      return;
    }
    if (pinCode !== pinConfirm) {
      setPinError("Les codes PIN ne correspondent pas.");
      return;
    }
    if (!user?.id) return;

    setIsPinSaving(true);
    setPinError("");
    setPinSuccess("");
    
    try {
      const res = await fetch("/api/profile/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPin: hasPin ? oldPin : undefined,
          newPin: pinCode,
        }),
      });

      const data = await res.json();
      setIsPinSaving(false);

      if (!res.ok || data.error) {
        setPinError(data.error || "Erreur lors de la sauvegarde du PIN.");
      } else {
        setPinSuccess(data.message || "Code PIN configuré avec succès !");
        setHasPin(true);
        setOldPin("");
        setPinCode("");
        setPinConfirm("");
        setTimeout(() => setPinSuccess(""), 4000);
      }
    } catch (err) {
      setIsPinSaving(false);
      setPinError("Une erreur réseau est survenue.");
    }
  };

  const confirmWaChange = () => {
    setShowWaModal(false);
    executeSave(pendingWaNumber);
  };

  const toggleSms = async () => {
    if (userPlan === "free") return; // Premium locked
    const nextState = !smsEnabled;
    setSmsEnabled(nextState);
    if (user?.id) await supabase.from('profiles').update({ sms_enabled: nextState }).eq('id', user.id);
  };

  const toggleWa = async () => {
    const nextState = !waEnabled;
    setWaEnabled(nextState);
    if (user?.id) await supabase.from('profiles').update({ wa_enabled: nextState }).eq('id', user.id);
  };
  
  const toggleEmail = async () => {
    const nextState = !emailEnabled;
    setEmailEnabled(nextState);
    if (user?.id) await supabase.from('profiles').update({ email_enabled: nextState }).eq('id', user.id);
  };

  const toggleWaReminders = async () => {
    const nextState = !waReminders;
    setWaReminders(nextState);
    if (user?.id) await supabase.from('profiles').update({ wa_reminders_enabled: nextState }).eq('id', user.id);
  };

  const toggleWaDraws = async () => {
    const nextState = !waDraws;
    setWaDraws(nextState);
    if (user?.id) await supabase.from('profiles').update({ wa_draws_enabled: nextState }).eq('id', user.id);
  };

  const toggleWaInvites = async () => {
    const nextState = !waInvites;
    setWaInvites(nextState);
    if (user?.id) await supabase.from('profiles').update({ wa_invites_enabled: nextState }).eq('id', user.id);
  };

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as "fr" | "en";
    setLang(newLang);
  };

  // handleUpgrade — vrai paiement FedaPay
  const handleUpgrade = async (plan: 'pro' | 'business') => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError("");
    try {
      const response = await fetch('/api/subscriptions/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setSaveError(data.error || "Erreur lors de l'initialisation du paiement.");
        setIsSaving(false);
      }
    } catch {
      setSaveError("Erreur réseau. Veuillez réessayer.");
      setIsSaving(false);
    }
  };

  const [showCancelPlanModal, setShowCancelPlanModal] = useState(false);

  const handleCancelPlan = async () => {
    setShowCancelPlanModal(false);
    setIsSaving(true);
    try {
      if (user?.id) {
        await supabase.from('profiles').update({
          current_plan: 'free',
          plan_expires_at: null,
          plan_renewed_at: null
        }).eq('id', user.id);
        setUserPlan('free');
        setPlanExpiresAt(null);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) return null;

  const tabs = [
    { id: "profil", label: t("tab_profile"), icon: User },
    { id: "securite", label: t("tab_security"), icon: Lock },
    { id: "kyc", label: t("tab_kyc"), icon: ShieldCheck },
    { id: "notifications", label: t("tab_notif"), icon: Bell },
    { id: "abonnement", label: t("tab_plan"), icon: Crown }
  ];

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 md:space-y-8 min-h-[80vh] relative">
      
      {/* Modal Confirmation WhatsApp */}
      {showWaModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-3xl border border-border shadow-2xl p-8 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-warning/10 text-warning rounded-full flex items-center justify-center mb-6 mx-auto">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-textPrimary text-center mb-3">{t("wa_modal_title")}</h3>
            <p className="text-textSecondary text-center text-sm mb-8">
              {t("wa_modal_desc")} <strong className="text-textPrimary">{pendingWaNumber}</strong>. {t("wa_modal_sure")}
            </p>
            <div className="flex gap-4">
              <button onClick={() => {setShowWaModal(false); setPendingWaNumber("");}} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-textPrimary font-bold rounded-xl transition-colors">
                {t("cancel")}
              </button>
              <button onClick={confirmWaChange} className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-md shadow-primary/20">
                {t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation Résiliation Abonnement */}
      {showCancelPlanModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-3xl border border-border shadow-2xl p-8 max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-danger/10 text-danger rounded-2xl flex items-center justify-center mb-5 mx-auto">
              <AlertCircle size={28} />
            </div>
            <h3 className="text-lg font-extrabold text-textPrimary text-center mb-2">Résilier l&apos;abonnement ?</h3>
            <p className="text-textSecondary text-center text-sm mb-7 leading-relaxed">
              Vous allez repasser au plan <strong className="text-textPrimary">Essentiel (Gratuit)</strong>. Vos cercles au-delà de la limite seront archivés.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelPlanModal(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-textPrimary font-bold rounded-xl transition-colors text-sm">
                Annuler
              </button>
              <button onClick={handleCancelPlan} disabled={isSaving} className="flex-1 py-2.5 bg-danger hover:bg-danger/90 text-white font-bold rounded-xl transition-all text-sm shadow-md shadow-danger/20 flex items-center justify-center">
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Confirmer la résiliation"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">{t("settings_title")}</h1>
          <p className="text-textSecondary mt-1">{t("settings_subtitle")}</p>
        </div>
      </div>

      <div className="flex border-b border-border overflow-x-auto scrollbar-hide bg-surface rounded-t-3xl shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-textSecondary hover:text-textPrimary hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-surface border border-border rounded-b-3xl p-5 md:p-8 shadow-sm min-h-[500px]">
        
        {/* --- ONGLET PROFIL --- */}
        {activeTab === "profil" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">
            <h2 className="text-xl font-bold text-textPrimary mb-6">{t("personal_info")}</h2>
            
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <label className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-dashed border-border relative group cursor-pointer overflow-hidden">
                  <input id="avatar-upload-input" type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-textSecondary uppercase">
                      {userProfile ? userProfile.name.substring(0, 2) : "UT"}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUploadingAvatar ? <Loader2 className="text-white animate-spin" size={24} /> : <Camera className="text-white" size={24} />}
                  </div>
                </label>
                <label htmlFor="avatar-upload-input" className="text-xs font-bold text-primary cursor-pointer hover:underline">
                  {isUploadingAvatar ? "Envoi en cours..." : t("change_photo")}
                </label>
              </div>
              
              {/* Fields */}
              <div className="flex-1 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-textPrimary mb-1.5">{t("full_name")}</label>
                    <input type="text" value={name} onChange={(e)=>setName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-medium text-textPrimary" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-textPrimary mb-1.5">{t("city_country")}</label>
                    <input type="text" value={city} onChange={(e)=>setCity(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-medium text-textPrimary" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-textPrimary mb-1.5">{t("email")}</label>
                    <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-medium text-textPrimary" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-textPrimary mb-1.5">{t("whatsapp_num")}</label>
                    <div className="relative">
                      <input 
                        type="tel" 
                        value={waInput} 
                        onChange={(e) => { setWaInput(e.target.value); setSaveError(""); }} 
                        placeholder="+22997000000"
                        className={`w-full px-4 py-2.5 pr-10 bg-gray-50 dark:bg-slate-800/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-medium text-textPrimary ${
                          waInput && isValidPhoneNumber(waInput) ? 'border-success' : waInput && !isValidPhoneNumber(waInput) ? 'border-danger' : 'border-border'
                        }`} 
                      />
                      {waInput && (
                        <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${isValidPhoneNumber(waInput) ? 'text-success' : 'text-danger'}`}>
                          {isValidPhoneNumber(waInput) ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-textSecondary mt-1">Format international requis&nbsp;: <span className="font-mono font-bold">+229 97 00 00 00</span></p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-primary mb-1.5">{t("momo_num")}</label>
                  <p className="text-xs text-textSecondary mb-3">{t("momo_desc")}</p>
                  <div className="relative max-w-md">
                    <input
                      type="tel"
                      value={momo}
                      onChange={(e) => { setMomo(e.target.value); setSaveError(""); }}
                      placeholder="+22997000000"
                      className={`w-full px-4 py-2.5 pr-10 bg-surface dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-medium text-textPrimary shadow-sm ${
                        momo && isValidPhoneNumber(momo) ? 'border-success' : momo && !isValidPhoneNumber(momo) ? 'border-danger' : 'border-primary/30'
                      }`}
                    />
                    {momo && (
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${isValidPhoneNumber(momo) ? 'text-success' : 'text-danger'}`}>
                        {isValidPhoneNumber(momo) ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-textSecondary mt-1">Format international requis&nbsp;: <span className="font-mono font-bold">+229 97 00 00 00</span></p>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-end gap-4">
              {saveError && (
                <span className="text-danger text-sm font-bold flex items-center gap-2 animate-in shake">
                  <AlertCircle size={18} /> {saveError}
                </span>
              )}
              {savedSuccess && (
                <span className="text-success text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                  <CheckCircle2 size={18} /> {t("saved_success")}
                </span>
              )}
              <button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full sm:w-auto px-8 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {isSaving ? t("saving_btn") : t("save_btn")}
              </button>
            </div>
          </div>
        )}

        {/* --- ONGLET SECURITE --- */}
        {activeTab === "securite" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              {/* Formulaire */}
              <div className="bg-surface border border-border/80 rounded-2xl p-6 shadow-sm space-y-5">
                <h2 className="text-xl font-bold text-textPrimary">{t("sec_title")}</h2>
                <p className="text-xs text-textSecondary -mt-3">{t("sec_desc")}</p>
                
                <div className="space-y-4">
                  {hasPin && (
                    <div>
                      <label className="block text-sm font-bold text-textPrimary mb-1.5">{t("sec_old_pin")}</label>
                      <input 
                        type="password" 
                        maxLength={6}
                        value={oldPin} 
                        onChange={(e) => setOldPin(e.target.value)}
                        placeholder="••••"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-xl font-bold text-textPrimary tracking-[0.5em] text-center font-mono" 
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-bold text-textPrimary mb-1.5">
                      {hasPin ? t("sec_new_pin") : t("sec_pin")}
                    </label>
                    <input 
                      type="password" 
                      maxLength={6}
                      value={pinCode} 
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="••••"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-xl font-bold text-textPrimary tracking-[0.5em] text-center font-mono" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-textPrimary mb-1.5">
                      {hasPin ? t("sec_confirm_new") : t("sec_confirm_pin")}
                    </label>
                    <input 
                      type="password" 
                      maxLength={6}
                      value={pinConfirm} 
                      onChange={(e) => setPinConfirm(e.target.value)}
                      placeholder="••••"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-xl font-bold text-textPrimary tracking-[0.5em] text-center font-mono" 
                    />
                  </div>

                  {pinError && <p className="text-danger text-sm font-bold text-center animate-in shake">{pinError}</p>}
                  {pinSuccess && <p className="text-success text-sm font-bold text-center animate-in fade-in">{pinSuccess}</p>}

                  <button 
                    onClick={handleSavePin}
                    disabled={isPinSaving || !pinCode || !pinConfirm || (hasPin && !oldPin)}
                    className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                  >
                    {isPinSaving ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                    {isPinSaving ? t("sec_saving") : hasPin ? t("sec_modify_pin") : t("sec_save_pin")}
                  </button>
                </div>
              </div>

              {/* Tips & Info */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-slate-800/40 dark:to-slate-800/20 border border-border rounded-2xl p-6 flex flex-col justify-between min-h-[340px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                
                <div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 shadow-sm">
                    <ShieldCheck size={26} />
                  </div>
                  <h3 className="font-bold text-textPrimary mb-2">{t("sec_why")}</h3>
                  <p className="text-sm text-textSecondary leading-relaxed mb-4">
                    {t("sec_why_desc")}
                  </p>
                  
                  <ul className="space-y-2.5">
                    <li className="flex items-start gap-2.5 text-xs text-textSecondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>{t("sec_reason1")}</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-textSecondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>{t("sec_reason2")}</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-textSecondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                      <span>{t("sec_reason3")}</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-6 p-3 bg-white dark:bg-slate-800 border border-border rounded-xl flex items-start gap-2.5">
                  <span className="text-lg">💡</span>
                  <p className="text-[11px] text-textSecondary leading-normal">
                    <strong>{t("sec_tip")}</strong> {t("sec_tip_desc")}
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- ONGLET KYC --- */}
        {activeTab === "kyc" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-xl font-bold text-textPrimary">{t("kyc_title")}</h2>
                <p className="text-textSecondary text-sm mt-1">{t("kyc_desc")}</p>
              </div>
              <div className={`px-3 py-1.5 text-sm font-bold rounded-lg flex items-center gap-2
                ${kycStatus === 'verified' ? 'bg-success/10 border border-success/20 text-success' : 
                  kycStatus === 'pending' ? 'bg-warning/10 border border-warning/20 text-warning' : 
                  'bg-danger/10 border border-danger/20 text-danger'}`}
              >
                {kycStatus === 'verified' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} 
                {kycStatus === 'verified' ? 'Vérifié' : kycStatus === 'pending' ? 'En attente' : t("unverified")}
              </div>
            </div>

            <div className="space-y-6">
              <div className="border border-border rounded-3xl p-6 md:p-8 bg-gray-50/30 dark:bg-slate-800/20">
                <label className="block text-sm font-bold text-textPrimary mb-4">{t("doc_type")}</label>
                <div className="flex flex-wrap gap-4 mb-8">
                  {[
                    { id: 'cip', label: t("cip") },
                    { id: 'passport', label: t("passport") },
                    { id: 'permis', label: t("license") }
                  ].map(doc => (
                    <button 
                      key={doc.id}
                      onClick={() => setDocType(doc.id)}
                      className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                        docType === doc.id ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border text-textSecondary bg-surface hover:bg-gray-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {docType === doc.id && <CheckCircle2 size={16} />}
                      {doc.label}
                    </button>
                  ))}
                </div>

                <div className={`grid grid-cols-1 gap-6 ${docType === 'permis' ? 'md:grid-cols-2' : ''}`}>
                  {/* Upload Recto */}
                  <label htmlFor="front-upload" className="border-2 border-dashed border-border bg-surface rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                    <input id="front-upload" type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setFrontFile(e.target.files?.[0] || null)} />
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      {frontFile ? <CheckCircle2 size={28} /> : <FileText size={28} />}
                    </div>
                    <h4 className="font-bold text-textPrimary mb-1">{frontFile ? frontFile.name : t("front")}</h4>
                    <p className="text-xs text-textSecondary">{!frontFile && <>{t("upload_hint")}<br/>{t("upload_format")}</>}</p>
                  </label>
                  
                  {/* Upload Verso - Uniquement pour le permis selon les instructions */}
                  {docType === 'permis' && (
                    <label htmlFor="back-upload" className="border-2 border-dashed border-border bg-surface rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                      <input id="back-upload" type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setBackFile(e.target.files?.[0] || null)} />
                      <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        {backFile ? <CheckCircle2 size={28} /> : <UploadCloud size={28} />}
                      </div>
                      <h4 className="font-bold text-textPrimary mb-1">{backFile ? backFile.name : t("back")}</h4>
                      <p className="text-xs text-textSecondary">{!backFile && <>{t("back_hint")}<br/>{t("upload_format")}</>}</p>
                    </label>
                  )}
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-xl text-sm text-primary flex gap-3 items-start border border-primary/20 max-w-3xl">
                <ShieldCheck size={20} className="shrink-0 mt-0.5" />
                <p className="font-medium">{t("kyc_security")}</p>
              </div>

              {kycMessage && (
                <div className="text-center font-bold text-sm">
                  {kycMessage}
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={handleKycSubmit}
                  disabled={!frontFile || (docType === 'permis' && !backFile) || isUploadingKyc || kycStatus === 'pending' || kycStatus === 'verified'}
                  className="w-full md:w-auto px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-md shadow-primary/20 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                >
                  {isUploadingKyc && <Loader2 size={18} className="animate-spin" />}
                  {isUploadingKyc ? "Envoi..." : kycStatus === 'pending' ? "En attente de validation" : kycStatus === 'verified' ? "Validé" : t("submit_kyc")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- ONGLET NOTIFICATIONS --- */}
        {activeTab === "notifications" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">
            <h2 className="text-xl font-bold text-textPrimary mb-6">{t("notif_title")}</h2>
            
            <div className="grid grid-cols-1 gap-6">
              {/* WhatsApp Group */}
              <div className="border border-border rounded-2xl p-5 shadow-sm bg-surface">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#25D366]/10 text-[#25D366] rounded-xl">
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-textPrimary flex flex-wrap items-center gap-2">WhatsApp <span className="bg-[#25D366] text-white text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">{t("wa_rec")}</span></h3>
                      <p className="text-xs text-textSecondary">{t("wa_desc")}</p>
                    </div>
                  </div>
                  <div onClick={toggleWa} className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${waEnabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${waEnabled ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
                <div className={`space-y-3 pl-14 transition-opacity ${waEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={waReminders} onChange={toggleWaReminders} className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer" />
                    <span className="text-sm font-medium text-textPrimary">{t("wa_opt1")}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={waDraws} onChange={toggleWaDraws} className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer" />
                    <span className="text-sm font-medium text-textPrimary">{t("wa_opt2")}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={waInvites} onChange={toggleWaInvites} className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer" />
                    <span className="text-sm font-medium text-textPrimary">{t("wa_opt3")}</span>
                  </label>
                </div>
              </div>

              {/* SMS Group */}
              <div className={`border border-border rounded-2xl p-5 shadow-sm bg-surface relative ${userPlan === 'free' ? 'opacity-70' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gray-100 dark:bg-gray-800 text-textSecondary rounded-xl">
                      <Smartphone size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-textPrimary flex items-center gap-2">
                        {t("sms_title")}
                        {userPlan === 'free' && <Lock size={14} className="text-warning" />}
                      </h3>
                      <p className="text-xs text-textSecondary">
                        {userPlan === 'free' ? <span className="text-warning">{t("sms_lock")}</span> : t("sms_desc")}
                      </p>
                    </div>
                  </div>
                  <div onClick={toggleSms} className={`w-12 h-6 rounded-full relative transition-colors ${userPlan === 'free' ? 'bg-gray-200 dark:bg-gray-800 cursor-not-allowed' : smsEnabled ? 'bg-primary cursor-pointer' : 'bg-gray-300 dark:bg-gray-700 cursor-pointer'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${smsEnabled ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
              </div>

              {/* Email Group */}
              <div className="border border-border rounded-2xl p-5 shadow-sm bg-surface">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-textPrimary">{t("email_title")}</h3>
                      <p className="text-xs text-textSecondary">{t("email_desc")}</p>
                    </div>
                  </div>
                  <div onClick={toggleEmail} className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${emailEnabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${emailEnabled ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- ONGLET ABONNEMENT --- */}
        {activeTab === "abonnement" && (() => {
          const PLANS = {
            free:     { label: "Essentiel",  price: "Gratuit",         amount: 0,    maxCercles: 2,   maxMembers: 10,  fee: "6%", color: "text-textSecondary", badge: "bg-gray-100 text-textSecondary" },
            pro:      { label: "Pro",        price: "2 000 FCFA/mois",  amount: 2000, maxCercles: 5,   maxMembers: 50,  fee: "5%", color: "text-primary",      badge: "bg-primary/10 text-primary" },
            business: { label: "Business",  price: "5 000 FCFA/mois",  amount: 5000, maxCercles: 999, maxMembers: 200, fee: "4%", color: "text-amber-600",    badge: "bg-amber-100 text-amber-700" },
          };
          const plan = PLANS[userPlan as keyof typeof PLANS] || PLANS.free;
          const cerclesMax  = plan.maxCercles;
          const membresMax  = plan.maxMembers;
          const cerclesPct  = userPlan === 'business' ? 100 : Math.min(100, Math.round((cerclesCount / cerclesMax) * 100));
          const membresPct  = userPlan === 'business' ? 100 : Math.min(100, Math.round((membresCount / membresMax) * 100));
          const nextPlan    = userPlan === 'free' ? PLANS.pro : userPlan === 'pro' ? PLANS.business : null;
          const nextPlanKey = userPlan === 'free' ? 'pro' : 'business';

          return (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">

              {/* Toast succès abonnement */}
              {planSuccessToast && (
                <div className="flex items-center gap-3 bg-success/10 border border-success/30 text-success font-bold px-5 py-4 rounded-2xl animate-in slide-in-from-top-3 duration-300">
                  <CheckCircle2 size={20} className="shrink-0" />
                  <span>{planSuccessToast}</span>
                </div>
              )}

              {isConfirmingPlan && (
                <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 text-primary font-bold px-5 py-4 rounded-2xl">
                  <Loader2 size={20} className="shrink-0 animate-spin" />
                  <span>Confirmation de votre paiement en cours...</span>
                </div>
              )}

              {/* Erreur paiement */}
              {saveError && (
                <div className="flex items-center gap-3 bg-danger/10 border border-danger/20 text-danger font-bold px-5 py-4 rounded-2xl">
                  <AlertCircle size={20} className="shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {/* Header */}
              <div>
                <h2 className="text-2xl font-extrabold text-textPrimary tracking-tight">Mon abonnement</h2>
                <p className="text-textSecondary text-sm mt-1">Suivez vos quotas en temps réel et découvrez les avantages de votre plan.</p>
              </div>

              {/* Plan badge + quotas */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Plan actuel */}
                <div className="lg:col-span-1 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/20 rounded-3xl p-6 flex flex-col gap-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${plan.badge}`}>{plan.label}</span>
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <Crown size={20} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-textSecondary font-medium mb-0.5">Votre forfait</p>
                    <p className="text-xl font-extrabold text-textPrimary">{plan.price}</p>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-textSecondary"><CheckCircle2 size={14} className="text-success shrink-0" />
                      {userPlan === 'business' ? 'Cercles illimités' : `${cerclesMax} cercle${cerclesMax > 1 ? 's' : ''} actifs max`}
                    </div>
                    <div className="flex items-center gap-2 text-textSecondary"><CheckCircle2 size={14} className="text-success shrink-0" />
                      {userPlan === 'business' ? 'Membres illimités' : `${membresMax} membres / cercle`}
                    </div>
                    <div className="flex items-center gap-2 text-textSecondary"><CheckCircle2 size={14} className="text-success shrink-0" />Frais de retrait {plan.fee}</div>
                    {userPlan !== 'free' && <div className="flex items-center gap-2 text-textSecondary"><CheckCircle2 size={14} className="text-success shrink-0" />Relances SMS & WhatsApp</div>}
                    {userPlan === 'business' && <div className="flex items-center gap-2 text-textSecondary"><CheckCircle2 size={14} className="text-success shrink-0" />Support prioritaire H24</div>}
                  </div>

                  {/* Date d'expiration réelle */}
                  {planExpiresAt && userPlan !== 'free' && (() => {
                    const expiry = new Date(planExpiresAt);
                    const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    const isExpiringSoon = daysLeft <= 7;
                    const isExpired = daysLeft <= 0;
                    return (
                      <div className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl ${
                        isExpired ? 'bg-danger/10 text-danger border border-danger/20' :
                        isExpiringSoon ? 'bg-warning/10 text-warning border border-warning/20' :
                        'bg-primary/5 text-primary border border-primary/10'
                      }`}>
                        <CalendarClock size={14} className="shrink-0" />
                        {isExpired
                          ? `Abonnement expiré le ${expiry.toLocaleDateString('fr-FR')}`
                          : `Actif jusqu'au ${expiry.toLocaleDateString('fr-FR')} (${daysLeft}j)`
                        }
                      </div>
                    );
                  })()}

                  {userPlan !== 'free' && (
                    <button onClick={() => setShowCancelPlanModal(true)} disabled={isSaving} className="mt-2 text-xs text-danger/70 hover:text-danger font-bold underline underline-offset-2 transition-colors text-left">
                      Résilier l'abonnement
                    </button>
                  )}
                </div>

                {/* Quotas en temps réel */}
                <div className="lg:col-span-2 bg-surface border border-border rounded-3xl p-6 shadow-sm space-y-6">
                  <h3 className="font-bold text-textPrimary">Utilisation actuelle</h3>

                  {/* Cercles */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                          <Users size={16} />
                        </div>
                        <span className="text-sm font-bold text-textPrimary">Cercles actifs</span>
                      </div>
                      <span className="text-sm font-mono font-bold text-textPrimary">
                        {cerclesCount} / {userPlan === 'business' ? <span className="text-textSecondary">∞</span> : cerclesMax}
                      </span>
                    </div>
                    {userPlan !== 'business' ? (
                      <>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${cerclesPct >= 90 ? 'bg-danger' : cerclesPct >= 70 ? 'bg-warning' : 'bg-primary'}`}
                            style={{ width: `${cerclesPct}%` }}
                          />
                        </div>
                        <p className="text-xs text-textSecondary mt-1">{cerclesMax - cerclesCount} cercle(s) disponible(s)</p>
                      </>
                    ) : (
                      <p className="text-xs text-success font-bold flex items-center gap-1"><Infinity size={12} /> Illimité</p>
                    )}
                  </div>

                  {/* Membres */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                          <User size={16} />
                        </div>
                        <span className="text-sm font-bold text-textPrimary">Participations actives</span>
                      </div>
                      <span className="text-sm font-mono font-bold text-textPrimary">
                        {membresCount} membre(s)
                      </span>
                    </div>
                    <p className="text-xs text-textSecondary">Nombre de cercles auxquels vous participez en tant que membre actif.</p>
                  </div>

                  {/* Frais retrait */}
                  <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-textPrimary">Vos frais de retrait</p>
                      <p className="text-xs text-textSecondary">Appliqués sur chaque retrait vers Mobile Money</p>
                    </div>
                    <span className="text-2xl font-extrabold text-primary font-mono">{plan.fee}</span>
                  </div>
                </div>
              </div>

              {/* Upsell */}
              {nextPlan && (
                <div className="relative overflow-hidden rounded-3xl border-2 border-primary shadow-lg shadow-primary/10 bg-gradient-to-br from-white to-primaryLight/30 p-6 md:p-8">
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -ml-16 -mb-16" />
                  </div>
                  <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/30">
                          <Zap size={18} className="text-white" />
                        </div>
                        <span className="font-extrabold text-primary text-lg">Passez au plan {nextPlan.label}</span>
                        <span className="text-xs bg-primary text-white font-bold px-2 py-0.5 rounded-full">Recommandé</span>
                      </div>
                      <p className="text-sm text-textSecondary mb-4 max-w-lg">
                        {userPlan === 'free'
                          ? "Débloquez jusqu'à 5 cercles actifs, 50 membres par cercle, des relances automatiques SMS/WhatsApp et des frais de retrait réduits."
                          : "Obtenez des cercles et membres illimités, les frais de retrait les plus bas (4%) et un support VIP disponible 24h/24."}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {userPlan === 'free' ? (
                          <>
                            <span className="inline-flex items-center gap-1.5 text-xs bg-white border border-primary/20 text-textPrimary font-bold px-3 py-1.5 rounded-full shadow-sm"><TrendingUp size={12} className="text-primary" /> 5 Cercles actifs</span>
                            <span className="inline-flex items-center gap-1.5 text-xs bg-white border border-primary/20 text-textPrimary font-bold px-3 py-1.5 rounded-full shadow-sm"><Users size={12} className="text-primary" /> 50 membres / cercle</span>
                            <span className="inline-flex items-center gap-1.5 text-xs bg-white border border-primary/20 text-textPrimary font-bold px-3 py-1.5 rounded-full shadow-sm"><Zap size={12} className="text-primary" /> Frais réduits (5%)</span>
                          </>
                        ) : (
                          <>
                            <span className="inline-flex items-center gap-1.5 text-xs bg-white border border-primary/20 text-textPrimary font-bold px-3 py-1.5 rounded-full shadow-sm"><Infinity size={12} className="text-primary" /> Illimité</span>
                            <span className="inline-flex items-center gap-1.5 text-xs bg-white border border-primary/20 text-textPrimary font-bold px-3 py-1.5 rounded-full shadow-sm"><Zap size={12} className="text-primary" /> Frais 4%</span>
                            <span className="inline-flex items-center gap-1.5 text-xs bg-white border border-primary/20 text-textPrimary font-bold px-3 py-1.5 rounded-full shadow-sm"><ShieldCheck size={12} className="text-primary" /> Support H24</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-3 min-w-[160px]">
                      <div className="text-center">
                        <p className="text-3xl font-extrabold text-textPrimary font-mono">{nextPlan.price.split(' ')[0]}</p>
                        <p className="text-xs text-textSecondary font-medium">{nextPlan.price.split(' ').slice(1).join(' ')}</p>
                      </div>
                      <button
                        onClick={() => handleUpgrade(nextPlanKey as 'pro' | 'business')}
                        disabled={isSaving}
                        className="w-full py-3 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-md shadow-primary/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpRight size={16} />}
                        Passer au {nextPlan.label}
                      </button>
                      <p className="text-[10px] text-textSecondary text-center">
                        {nextPlan.price} · Paiement Mobile Money via FedaPay
                      </p>
                      <p className="text-[10px] text-textSecondary text-center">Sans engagement · Résiliable à tout moment</p>
                    </div>
                  </div>
                </div>
              )}

              {userPlan === 'business' && (
                <div className="flex items-center gap-4 p-5 bg-amber-50 border border-amber-200 rounded-2xl">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                    <Crown size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-amber-800">Vous êtes sur le plan Business</p>
                    <p className="text-sm text-amber-700">Vous profitez du meilleur que Tontineo a à offrir. Merci de votre confiance !</p>
                  </div>
                </div>
              )}

            </div>
          );
        })()}

      </div>
    </div>
  );
}
