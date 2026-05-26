"use client";

import { useState, useEffect } from "react";
import { User, ShieldCheck, Bell, Crown, Settings, UploadCloud, CheckCircle2, AlertCircle, Camera, FileText, Check, Smartphone, Mail, MessageSquare, Globe, Loader2, Save, Lock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/utils/supabase/client";

export default function ParametresPage() {
  const { lang, setLang, t } = useLanguage();
  const { user, userProfile } = useAuth();
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

  // Security State
  const [pinCode, setPinCode] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [isPinSaving, setIsPinSaving] = useState(false);
  const [pinSuccess, setPinSuccess] = useState("");
  const [pinError, setPinError] = useState("");
  const [hasPin, setHasPin] = useState(false);
  const [oldPin, setOldPin] = useState("");

  const supabase = createClient();

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
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
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

  const handleUpgrade = async (plan: 'premium' | 'business') => {
    if (userPlan === plan) return;
    setIsSaving(true);
    setTimeout(async () => {
      alert("Paiement FedaPay simulé avec succès pour l'abonnement " + plan.toUpperCase());
      if (user?.id) {
        await supabase.from('profiles').update({ current_plan: plan }).eq('id', user.id);
        setUserPlan(plan);
      }
      setIsSaving(false);
    }, 1500);
  };

  const handleCancelPlan = async () => {
    if (!window.confirm("Voulez-vous vraiment résilier votre abonnement et repasser au plan Essentiel (Gratuit) ?")) return;
    setIsSaving(true);
    setTimeout(async () => {
      if (user?.id) {
        await supabase.from('profiles').update({ current_plan: 'free' }).eq('id', user.id);
        setUserPlan('free');
      }
      setIsSaving(false);
      alert("Abonnement résilié avec succès.");
    }, 1000);
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
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
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
                <span className="text-xs font-bold text-primary cursor-pointer hover:underline">
                  {isUploadingAvatar ? "Envoi en cours..." : t("change_photo")}
                </span>
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
                    <input 
                      type="tel" 
                      value={waInput} 
                      onChange={(e)=>setWaInput(e.target.value)} 
                      placeholder="+229XXXXXXXX"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-medium text-textPrimary" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-primary mb-1.5">{t("momo_num")}</label>
                  <p className="text-xs text-textSecondary mb-3">{t("momo_desc")}</p>
                  <input type="tel" value={momo} onChange={(e)=>setMomo(e.target.value)} className="w-full max-w-md px-4 py-2.5 bg-surface dark:bg-slate-800 border border-primary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-medium text-textPrimary shadow-sm" />
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
        {activeTab === "abonnement" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-2xl font-extrabold text-textPrimary mb-2">{t("plan_title")}</h2>
              <p className="text-textSecondary text-sm">{t("plan_desc")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Free Plan */}
              <div className="border border-border rounded-3xl p-6 bg-surface shadow-sm flex flex-col">
                <h3 className="font-bold text-textPrimary text-lg mb-1">{t("essential")}</h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-3xl font-extrabold text-textPrimary font-mono">0</span>
                  <span className="text-textSecondary text-sm font-medium pb-1">FCFA / mois</span>
                </div>
                <div className="space-y-3 mb-8 flex-1">
                  <div className="flex items-center gap-2 text-sm text-textSecondary"><Check size={16} className="text-success" /> 1 Cercle actif</div>
                  <div className="flex items-center gap-2 text-sm text-textSecondary"><Check size={16} className="text-success" /> Jusqu'à 10 membres</div>
                  <div className="flex items-center gap-2 text-sm text-textSecondary"><Check size={16} className="text-success" /> Frais de retrait normaux (2%)</div>
                </div>
                <button className={`w-full py-2.5 font-bold rounded-xl transition-all ${userPlan === 'free' ? 'bg-gray-100 dark:bg-slate-800 text-textSecondary cursor-default' : 'bg-surface border border-border text-textPrimary hover:bg-gray-50'}`}>
                  {userPlan === 'free' ? t("current_plan") : "Passer à Essential"}
                </button>
              </div>

              {/* Pro Plan */}
              <div className="border-2 border-primary rounded-3xl p-6 bg-surface shadow-md flex flex-col relative transform md:-translate-y-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                  {t("popular")}
                </div>
                <h3 className="font-bold text-primary text-lg mb-1">{t("pro_org")}</h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-3xl font-extrabold text-textPrimary font-mono">2500</span>
                  <span className="text-textSecondary text-sm font-medium pb-1">FCFA / mois</span>
                </div>
                <div className="space-y-3 mb-8 flex-1">
                  <div className="flex items-center gap-2 text-sm text-textPrimary font-medium"><Check size={16} className="text-primary" /> 5 Cercles actifs</div>
                  <div className="flex items-center gap-2 text-sm text-textPrimary font-medium"><Check size={16} className="text-primary" /> Jusqu'à 50 membres / cercle</div>
                  <div className="flex items-center gap-2 text-sm text-textPrimary font-medium"><Check size={16} className="text-primary" /> Frais de retrait réduits (1.5%)</div>
                  <div className="flex items-center gap-2 text-sm text-textPrimary font-medium"><Check size={16} className="text-primary" /> Relances auto WhatsApp & SMS</div>
                </div>
                <button className={`w-full py-2.5 font-bold rounded-xl shadow-md transition-all ${userPlan === 'pro' ? 'bg-primary/20 text-primary cursor-default' : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20 hover:-translate-y-0.5'}`}>
                  {userPlan === 'pro' ? t("current_plan") : t("upgrade_pro")}
                </button>
              </div>

              {/* Business Plan */}
              <div className="border border-border rounded-3xl p-6 bg-surface shadow-sm flex flex-col">
                <h3 className="font-bold text-textPrimary text-lg mb-1">{t("business")}</h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-3xl font-extrabold text-textPrimary font-mono">10000</span>
                  <span className="text-textSecondary text-sm font-medium pb-1">FCFA / mois</span>
                </div>
                <div className="space-y-3 mb-8 flex-1">
                  <div className="flex items-center gap-2 text-sm text-textSecondary"><Check size={16} className="text-success" /> Cercles et membres illimités</div>
                  <div className="flex items-center gap-2 text-sm text-textSecondary"><Check size={16} className="text-success" /> Frais de retrait mini (1%)</div>
                  <div className="flex items-center gap-2 text-sm text-textSecondary"><Check size={16} className="text-success" /> Tableau de bord avancé</div>
                  <div className="flex items-center gap-2 text-sm text-textSecondary"><Check size={16} className="text-success" /> Support prioritaire H24</div>
                </div>
                <button 
                  onClick={() => handleUpgrade('business')}
                  disabled={userPlan === 'business' || isSaving}
                  className={`w-full py-2.5 font-bold rounded-xl transition-all ${userPlan === 'business' ? 'bg-gray-100 dark:bg-slate-800 text-textSecondary cursor-default' : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-border text-textPrimary'}`}
                >
                  {userPlan === 'business' ? t("current_plan") : t("upgrade_biz")}
                </button>
              </div>
            </div>
            
            {userPlan !== 'free' && (
              <div className="mt-8 pt-8 border-t border-border flex flex-col items-center">
                <p className="text-sm text-textSecondary mb-4">Vous souhaitez revenir au plan Essentiel ?</p>
                <button 
                  onClick={handleCancelPlan}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-danger/10 text-danger font-bold rounded-xl hover:bg-danger/20 transition-all text-sm"
                >
                  {isSaving ? "Traitement..." : "Résilier mon abonnement actuel"}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
