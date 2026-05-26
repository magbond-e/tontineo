"use client";

import { useState, useEffect } from "react";
import { Users, Wallet, AlertCircle, CalendarClock, MoreVertical, CheckCircle2, Clock, XCircle, ChevronDown, ChevronUp, History, Info, Smartphone, Loader2, Share2, FileText } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import DisputeModal from "@/components/DisputeModal";
import CharteModal from "@/components/CharteModal";

export default function CercleDetailsPage({ params }: { params: { id: string } }) {
  const [expandedCycle, setExpandedCycle] = useState<number | null>(null);
  
  const [cercle, setCercle] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [activeCycle, setActiveCycle] = useState<any>(null);
  const [pastCycles, setPastCycles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [hasPaidCurrentCycle, setHasPaidCurrentCycle] = useState(false);
  const [hasFiredWebhook, setHasFiredWebhook] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showCharte, setShowCharte] = useState(false);

  const { user } = useAuth();
  const supabase = createClient();

  const handleCopyLink = () => {
    if (!cercle?.invite_token) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "https://tontineo.app");
    navigator.clipboard.writeText(`${appUrl}/join/${cercle.invite_token}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDraw = async () => {
    if (!activeCycle) return;
    const confirmDraw = window.confirm(`Voulez-vous déclencher le tirage de ${cercle.potCollected.toLocaleString('fr-FR')} FCFA ?`);
    if (!confirmDraw) return;
    
    setIsPaying(true);
    try {
      const res = await fetch('/api/circles/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ circle_id: cercle.id, cycle_id: activeCycle.id })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`🎉 Le tirage a été effectué avec succès !\n\n${data.winner} a remporté ${data.amount.toLocaleString('fr-FR')} FCFA.\nLe paiement FedaPay a été initié.`);
        setShowSuccessModal(true);
      } else {
        alert(data.error || "Erreur lors du tirage.");
      }
    } catch (e) {
      alert("Erreur inattendue.");
    } finally {
      setIsPaying(false);
    }
  };

  const handleStartCircle = async () => {
    setIsStarting(true);
    const { error: circleError } = await supabase
      .from('circles')
      .update({ status: 'En cours' })
      .eq('id', cercle.id);
      
    if (circleError) {
      console.error(circleError);
      setIsStarting(false);
      return;
    }

    const startDate = new Date();
    const endDate = new Date();
    
    // Calcul de la durée exacte du cycle selon la fréquence
    let durationDays = 30;
    if (cercle?.frequency === 'Journalier') durationDays = 1;
    else if (cercle?.frequency === 'Hebdomadaire') durationDays = 7;
    else if (cercle?.frequency === 'Mensuel') durationDays = 30;
    else if (cercle?.frequency === 'Annuel') durationDays = 365;

    endDate.setDate(startDate.getDate() + durationDays); 

    const { error: cycleError } = await supabase
      .from('cycles')
      .insert({
        circle_id: cercle.id,
        cycle_number: 1,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active'
      });

    if (!cycleError) {
      // Notify all active members
      const { data: activeMembers } = await supabase.from('memberships').select('user_id').eq('circle_id', cercle.id).eq('status', 'active');
      if (activeMembers && activeMembers.length > 0) {
        const notifications = activeMembers.map(m => ({
          user_id: m.user_id,
          title: 'Cercle démarré',
          description: `Le cercle "${cercle.name}" a démarré son premier cycle ! Préparez-vous pour vos cotisations.`,
          unread: true
        }));
        await supabase.from('notifications').insert(notifications);
      }

      setCercle({ ...cercle, status: 'En cours' });
      window.location.reload();
    }
    setIsStarting(false);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    window.location.reload();
  };

  const handlePayment = async () => {
    if (!activeCycle) {
      alert("La tontine n'a pas de cycle actif pour le moment.");
      return;
    }
    setIsPaying(true);
    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          circle_id: cercle.id,
          cycle_id: activeCycle.id,
          amount: cercle.amount,
          phone: ''
        })
      });
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Erreur d'initialisation du paiement.");
      }
    } catch (error) {
      console.error(error);
      alert("Une erreur inattendue est survenue");
    } finally {
      setIsPaying(false);
    }
  };

  const handleWalletPayment = async () => {
    if (!activeCycle) {
      alert("La tontine n'a pas de cycle actif pour le moment.");
      return;
    }
    const confirmPay = window.confirm(`Voulez-vous payer ${cercle.amount.toLocaleString('fr-FR')} FCFA depuis votre portefeuille Tontineo ?`);
    if (!confirmPay) return;
    
    setIsPaying(true);
    try {
      const response = await fetch('/api/payments/wallet-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          circle_id: cercle.id,
          cycle_id: activeCycle.id,
          amount: cercle.amount
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setSuccessMessage(`🎉 Paiement de ${cercle.amount} FCFA validé depuis votre portefeuille !`);
        setShowSuccessModal(true);
      } else {
        alert(data.error || "Erreur lors du paiement par portefeuille.");
      }
    } catch (error) {
      console.error(error);
      alert("Une erreur inattendue est survenue");
    } finally {
      setIsPaying(false);
    }
  };

  // Nouveau useEffect pour simuler le webhook FedaPay (Mode local uniquement)
  useEffect(() => {
    if (typeof window !== "undefined" && user && activeCycle && cercle && !hasFiredWebhook) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('payment') === 'success') {
        setHasFiredWebhook(true);
        const simulateWebhook = async () => {
          try {
            await fetch('/api/payments/webhook', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: 'transaction.approved',
                entity: {
                  id: `sim_${user.id}_${activeCycle.id}`, // Faux ID de transaction déterministe pour éviter les doublons
                  amount: cercle.amount,
                  status: 'approved',
                  metadata: {
                    circle_id: cercle.id,
                    cycle_id: activeCycle.id,
                    user_id: user.id
                  }
                }
              })
            });
            setSuccessMessage(`🎉 Paiement de test validé !\n\nLe Simulateur a intercepté le retour de FedaPay et a incrémenté le pot de ${cercle.amount} FCFA dans votre base de données.`);
            setShowSuccessModal(true);
            window.history.replaceState(null, '', window.location.pathname);
          } catch (err) {
            console.error("Simulation webhook failed", err);
          }
        };
        simulateWebhook();
      }
    }
  }, [user, activeCycle, cercle, hasFiredWebhook]);

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir exclure ${userName} de ce cercle ?`)) return;
    
    try {
      const res = await fetch('/api/circles/members/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ circle_id: cercle.id, user_id_to_remove: userId })
      });
      const data = await res.json();
      if (data.success) {
        setMembers(members.filter(m => m.user_id !== userId));
        setCercle((prev: any) => ({ ...prev, currentMembers: prev.currentMembers - 1 }));
      } else {
        alert(data.error || "Erreur lors de l'exclusion");
      }
    } catch (e) {
      alert("Erreur inattendue");
    }
  };

  const handleApproveMember = async (userId: string, userName: string) => {
    try {
      const res = await fetch('/api/circles/members/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ circle_id: cercle.id, user_id_to_approve: userId })
      });
      const data = await res.json();
      if (data.success) {
        setMembers(members.map(m => m.user_id === userId ? { ...m, isPending: false } : m));
      } else {
        alert(data.error || "Erreur lors de l'approbation");
      }
    } catch (e) {
      alert("Erreur inattendue");
    }
  };

  useEffect(() => {
    const fetchCercleDetails = async () => {
      if (!user) return;
      
      const { data: circleData, error: circleError } = await supabase
        .from('circles')
        .select('*')
        .eq('id', params.id)
        .single();
        
      if (circleError || !circleData) {
        console.error("Error fetching circle", circleError);
        setIsLoading(false);
        return;
      }
      
      // Fetch active cycle
      const { data: cycleData } = await supabase
        .from('cycles')
        .select('*')
        .eq('circle_id', params.id)
        .eq('status', 'active')
        .order('cycle_number', { ascending: false })
        .limit(1)
        .single();
        
      if (cycleData) {
        setActiveCycle(cycleData);
      }

      let nextPaymentDate = "En attente";
      let daysRemainingText = "Aucun tirage en cours";

      if (cycleData) {
        const endDate = new Date(cycleData.end_date);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        nextPaymentDate = endDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
        if (diffDays > 0) {
          daysRemainingText = `Dans ${diffDays} ${diffDays === 1 ? 'jour' : 'jours'}`;
        } else if (diffDays === 0) {
          daysRemainingText = "Aujourd'hui !";
        } else {
          daysRemainingText = `En retard de ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'jour' : 'jours'}`;
        }
      }

      setCercle({
        ...circleData,
        description: circleData.description || "Aucune description",
        amount: circleData.amount,
        frequency: circleData.frequency,
        maxMembers: circleData.max_members,
        currentMembers: circleData.current_members || 1,
        status: circleData.status,
        potTarget: circleData.pot_target,
        potCollected: circleData.pot_collected,
        nextPaymentDate,
        daysRemainingText,
        penalty: circleData.late_penalty_pct,
        drawType: circleData.draw_type,
        isOrganizer: circleData.organizer_id === user.id,
        isMember: false, // Sera mis à jour après la vérification des memberships
        image: circleData.icon_emoji || "💰"
      });

      // Fetch payments for active cycle to calculate pot and check member status
      let cyclePayments: any[] = [];
      let calculatedPot = circleData.pot_collected || 0;
      
      if (cycleData) {
        const { data: paymentsData } = await supabase
          .from('payments')
          .select('*')
          .eq('circle_id', params.id)
          .eq('cycle_id', cycleData.id)
          .eq('status', 'completed');
          
        if (paymentsData) {
          cyclePayments = paymentsData;
          // We can recalculate pot based on payments or stick to the stored one
          // calculatedPot = paymentsData.reduce((sum, p) => sum + (p.amount || 0), 0);
        }
      }

      // Fetch members with profile data
      const { data: membershipsData } = await supabase
        .from('memberships')
        .select('*, profiles(full_name, avatar_url, trust_score)')
        .eq('circle_id', params.id);
        
      if (membershipsData) {
        const userMembership = membershipsData.find(m => m.user_id === user.id);
        const isUserMember = !!userMembership && userMembership.status !== 'rejected';

        setCercle((prev: any) => ({
          ...prev,
          isMember: isUserMember,
          isPending: userMembership?.status === 'pending',
          potCollected: calculatedPot
        }));

        const mappedMembers = membershipsData.map(m => {
          const userPayment = cyclePayments.find(p => p.user_id === m.user_id);
          return {
            id: m.id,
            user_id: m.user_id,
            name: m.profiles?.full_name || "Utilisateur",
            role: m.role === 'co-organizer' ? 'Organisateur' : 'Membre',
            status: userPayment ? 'Payé' : 'En attente',
            isPending: m.status === 'pending',
            date: userPayment ? new Date(userPayment.completed_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : "-",
            avatar: m.profiles?.full_name ? m.profiles.full_name.substring(0, 2).toUpperCase() : "UT",
            avatarUrl: m.profiles?.avatar_url || null,
            trustScore: m.profiles?.trust_score || 50
          };
        });
        
        // Trier pour mettre ceux qui ont payé en premier
        mappedMembers.sort((a, b) => a.status === 'Payé' ? -1 : 1);
        
        setMembers(mappedMembers);
      }

      setIsLoading(false);
    };

    fetchCercleDetails();
  }, [params.id, user]);

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-6 md:space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-surface rounded-2xl md:rounded-3xl border border-border overflow-hidden">
          <div className="h-24 md:h-32 bg-gray-200 dark:bg-gray-700 relative">
            <div className="absolute -bottom-8 md:-bottom-10 left-6 md:left-8 w-16 h-16 md:w-20 md:h-20 bg-gray-300 dark:bg-gray-600 rounded-2xl border-4 border-surface"></div>
          </div>
          <div className="px-5 pt-10 pb-6 md:px-8 md:pt-14 md:pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="w-full md:w-1/2 space-y-3">
              <div className="w-2/3 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="w-4/5 h-4 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
            <div className="w-full md:w-auto flex gap-3">
              <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column Skeleton */}
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-2xl p-6 h-64 bg-gray-100 dark:bg-gray-800"></div>
            <div className="bg-surface border border-border rounded-2xl p-6 h-32 bg-gray-100 dark:bg-gray-800"></div>
            <div className="bg-surface border border-border rounded-2xl p-6 h-64 bg-gray-100 dark:bg-gray-800"></div>
          </div>
          {/* Right Column Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-border rounded-2xl p-6 h-96 bg-gray-100 dark:bg-gray-800"></div>
            <div className="bg-surface border border-border rounded-2xl p-6 h-48 bg-gray-100 dark:bg-gray-800"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!cercle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-12 h-12 text-warning mb-4" />
        <h2 className="text-xl font-bold text-textPrimary mb-2">Cercle introuvable</h2>
        <p className="text-textSecondary">Ce cercle n'existe pas ou vous n'y avez pas accès.</p>
      </div>
    );
  }

  // Pourcentage de remplissage du pot
  const potProgress = Math.min(100, (cercle.potCollected / cercle.potTarget) * 100);
  
  // Paramètres SVG pour le Donut
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (potProgress / 100) * circumference;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 md:space-y-8 min-h-[80vh]">
      
      {/* Custom Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-textPrimary text-center mb-4">Cotisation Réussie !</h3>
            <p className="text-textSecondary text-center mb-8 whitespace-pre-line leading-relaxed">
              {successMessage}
            </p>
            <button 
              onClick={handleCloseSuccessModal}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5"
            >
              Super, fermer
            </button>
          </div>
        </div>
      )}

      {/* Si l'utilisateur est en attente */}
      {cercle.isPending && (
        <div className="bg-warning/10 border border-warning/20 p-6 rounded-2xl flex flex-col items-center text-center">
          <Clock className="w-12 h-12 text-warning mb-4" />
          <h2 className="text-xl font-bold text-textPrimary mb-2">Demande en attente</h2>
          <p className="text-textSecondary mb-4">Votre demande d'adhésion est en cours d'examen par l'organisateur. Vous recevrez une notification une fois accepté(e).</p>
          <Link href="/dashboard">
            <button className="px-6 py-2.5 bg-surface border border-border hover:bg-gray-50 text-textPrimary font-bold rounded-xl shadow-sm transition-all">
              Retour au Dashboard
            </button>
          </Link>
        </div>
      )}

      {/* Header du Cercle */}
      <div className="bg-surface rounded-2xl md:rounded-3xl border border-border overflow-hidden shadow-sm">
        <div className="h-24 md:h-32 bg-gradient-to-r from-primaryLight to-primary/20 relative">
          <div className="absolute -bottom-8 md:-bottom-10 left-6 md:left-8 w-16 h-16 md:w-20 md:h-20 bg-surface rounded-2xl border-4 border-surface shadow-sm flex items-center justify-center text-primary font-bold text-3xl">
            {cercle.image}
          </div>
        </div>
        <div className="px-5 pt-10 pb-6 md:px-8 md:pt-14 md:pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
          <div className="w-full md:w-auto">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-textPrimary tracking-tight break-words">{cercle.name}</h1>
              <div className="flex flex-wrap gap-2 mt-1 md:mt-0">
                {/* Badges supprimés pour épurer l'interface selon demande */}
              </div>
            </div>
            <p className="text-textSecondary text-sm md:text-base">{cercle.description}</p>
          </div>
          
          <div className="flex flex-wrap w-full md:w-auto gap-3 mt-2 md:mt-0">
            {cercle.isOrganizer && cercle.status === 'En attente' && (
              <button 
                onClick={handleCopyLink}
                className="flex-1 md:flex-none px-6 py-2.5 bg-surface border border-border hover:bg-gray-50 text-textPrimary font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {isCopied ? <CheckCircle2 size={18} className="text-success" /> : <Share2 size={18} />}
                {isCopied ? "Copié !" : "Inviter"}
              </button>
            )}
            {cercle.isOrganizer && cercle.status === 'En attente' && cercle.currentMembers >= 1 && (
              <button 
                onClick={handleStartCircle}
                disabled={isStarting}
                className="flex-1 md:flex-none px-6 py-2.5 bg-textPrimary hover:bg-black text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isStarting ? <Loader2 size={18} className="animate-spin" /> : "Démarrer"}
              </button>
            )}
            {cercle.isMember && cercle.status === 'En cours' && (
              hasPaidCurrentCycle ? (
                <div className="flex-1 md:flex-none px-6 py-2.5 bg-success/10 text-success border border-success/20 font-bold rounded-xl flex items-center justify-center gap-2 text-sm text-center">
                  <CheckCircle2 size={18} className="shrink-0" /> À jour pour ce tour
                </div>
              ) : (
                <>
                  <button 
                    onClick={handlePayment}
                    disabled={isPaying}
                    className="flex-1 md:flex-none px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-md shadow-primary/20 transition-all hover:scale-105 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isPaying ? <Loader2 size={18} className="animate-spin" /> : <Wallet size={18} />}
                    {isPaying ? "Redirection..." : "Mobile Money"}
                  </button>
                  <button 
                    onClick={handleWalletPayment}
                    disabled={isPaying}
                    className="flex-1 md:flex-none px-6 py-2.5 bg-surface border border-primary text-primary hover:bg-primary/5 font-bold rounded-xl shadow-sm transition-all hover:scale-105 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    <Wallet size={18} />
                    Portefeuille
                  </button>
                </>
              )
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column: Pot, Prochain Tirage, Informations */}
        <div className="space-y-6">
          
          {/* Pot Actuel (Donut Chart) */}
          <div className="bg-surface border border-border rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm flex flex-col items-center text-center">
            <h2 className="text-lg font-bold text-textPrimary w-full text-left mb-6">Pot du Cycle 4</h2>
            
            <div className="relative flex items-center justify-center mb-6">
              <svg className="transform -rotate-90 w-40 h-40">
                {/* Background Circle */}
                <circle
                  cx="80" cy="80" r={radius}
                  stroke="currentColor" strokeWidth="12" fill="transparent"
                  className="text-gray-100"
                />
                {/* Progress Circle */}
                <circle
                  cx="80" cy="80" r={radius}
                  stroke="currentColor" strokeWidth="12" fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="text-primary transition-all duration-1000 ease-out drop-shadow-[0_0_6px_rgba(22,163,74,0.3)]"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-sm text-textSecondary font-medium">Collecté</span>
                <span className="text-xl font-extrabold font-mono text-textPrimary tracking-tight">
                  {cercle.potCollected.toLocaleString('fr-FR')}
                </span>
                <span className="text-[10px] font-bold text-textSecondary uppercase tracking-widest mt-1">FCFA</span>
              </div>
            </div>
            
            <div className="w-full flex justify-between text-sm border-t border-border pt-4">
              <span className="text-textSecondary">Objectif</span>
              <span className="font-bold text-textPrimary font-mono">{cercle.potTarget.toLocaleString('fr-FR')} FCFA</span>
            </div>
            
            {cercle.isOrganizer && potProgress < 100 && (
              <div className="w-full mt-4 bg-warning/10 border border-warning/20 p-3 rounded-xl flex items-start gap-2 text-warning text-xs text-left">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p>En attente de 2 paiements pour compléter le pot.</p>
              </div>
            )}
            {cercle.isOrganizer && potProgress >= 100 && (
               <button 
                 onClick={handleDraw}
                 disabled={isPaying}
                 className="w-full mt-4 py-2.5 bg-textPrimary hover:bg-black text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
               >
                 {isPaying ? <Loader2 size={18} className="animate-spin" /> : null}
                 Déclencher le tirage
               </button>
            )}
          </div>

          {/* Prochain Tirage */}
          <div className="bg-gradient-to-br from-primary to-[#22C55E] rounded-2xl md:rounded-3xl p-5 md:p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <CalendarClock size={20} />
              <h2 className="font-bold text-lg">Prochain Tirage</h2>
            </div>
            
            <div className="relative z-10">
              <p className="text-3xl font-extrabold tracking-tight mb-1">{cercle.nextPaymentDate}</p>
              <p className="text-sm text-white/80">{cercle.daysRemainingText}</p>
            </div>
          </div>

          {/* Informations / Règles */}
          <div className="bg-surface border border-border rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-textPrimary mb-4">Règles du Cercle</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-textSecondary flex items-center gap-2"><Wallet size={16} /> Cotisation</span>
                <span className="font-bold text-textPrimary font-mono">{cercle.amount.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-textSecondary flex items-center gap-2"><CalendarClock size={16} /> Fréquence</span>
                <span className="font-bold text-textPrimary">{cercle.frequency}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-textSecondary flex items-center gap-2"><Users size={16} /> Membres</span>
                <span className="font-bold text-textPrimary">{cercle.currentMembers} / {cercle.maxMembers}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-textSecondary flex items-center gap-2"><AlertCircle size={16} /> Pénalité retard</span>
                <span className="font-bold text-danger font-mono">{cercle.penalty.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-textSecondary flex items-center gap-2"><Info size={16} /> Type de tirage</span>
                <span className="font-bold text-textPrimary">{cercle.drawType}</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-border flex flex-col gap-3">
              <button 
                onClick={() => setShowCharte(true)} 
                className="w-full py-2.5 bg-gray-50 border border-border hover:bg-gray-100 text-textPrimary font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                <FileText size={16} />
                Consulter la charte
              </button>
              <button 
                onClick={() => setShowDisputeModal(true)} 
                className="w-full py-2.5 bg-danger/10 hover:bg-danger/20 text-danger font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                <AlertCircle size={16} />
                Signaler un problème / Litige
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Members & History */}
        {!cercle.isPending && (
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Cycle Actuel - Membres */}
          <div className="bg-surface border border-border rounded-2xl md:rounded-3xl shadow-sm overflow-hidden flex flex-col shrink-0">
            <div className="p-5 md:p-6 border-b border-border flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-textPrimary">Membres ({members.filter(m => !m.isPending).length})</h2>
              <span className="text-sm font-bold text-primary whitespace-nowrap ml-4">{members.filter(m => m.status === 'Payé' && !m.isPending).length} / {cercle.currentMembers} Payés</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead className="bg-gray-50 border-b border-border">
                  <tr className="text-textSecondary text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Membre</th>
                    <th className="px-6 py-4 font-semibold">Statut</th>
                    <th className="px-6 py-4 font-semibold">Date de paiement</th>
                    {cercle.isOrganizer && <th className="px-6 py-4 font-semibold text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {members.map((member) => (
                    <tr key={member.id} className={`hover:bg-gray-50/50 transition-colors group ${member.isPending ? 'opacity-70 bg-gray-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm shrink-0 ${member.role === 'Organisateur' ? 'bg-primary text-white' : 'bg-gray-100 text-textPrimary'} overflow-hidden`}>
                            {member.avatarUrl ? (
                              <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                              member.avatar
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-textPrimary text-sm">{member.name} {member.isPending && <span className="text-[10px] text-warning bg-warning/10 px-2 py-0.5 rounded-full ml-2">En attente d'approbation</span>}</p>
                            <p className="text-xs text-textSecondary flex items-center gap-1">
                              Score: <span className={`font-bold ${member.trustScore > 80 ? 'text-success' : member.trustScore > 50 ? 'text-warning' : 'text-danger'}`}>{member.trustScore}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {!member.isPending ? (
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap
                            ${member.status === 'Payé' ? 'bg-success/10 text-success border border-success/20' : 
                              member.status === 'En attente' ? 'bg-warning/10 text-warning border border-warning/20' : 
                              'bg-danger/10 text-danger border border-danger/20'}`}
                          >
                            {member.status === 'Payé' ? <CheckCircle2 size={14}/> : 
                             member.status === 'En attente' ? <Clock size={14}/> : 
                             <XCircle size={14}/>}
                            {member.status}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-gray-100 text-textSecondary border border-border">
                            -
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-textSecondary font-medium whitespace-nowrap">
                        {member.date}
                      </td>
                      {cercle.isOrganizer && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {member.isPending ? (
                              <>
                                <button 
                                  onClick={() => handleApproveMember(member.user_id, member.name)}
                                  className="p-2 bg-success/10 border border-success/20 rounded-lg shadow-sm text-success hover:bg-success/20 transition-all hover:-translate-y-0.5" 
                                  title="Approuver"
                                >
                                  <CheckCircle2 size={16} />
                                </button>
                                <button 
                                  onClick={() => handleRemoveMember(member.user_id, member.name)}
                                  className="p-2 bg-danger/10 border border-danger/20 rounded-lg shadow-sm text-danger hover:bg-danger/20 transition-all hover:-translate-y-0.5" 
                                  title="Rejeter"
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            ) : (
                              <>
                                {member.status !== 'Payé' && (
                                  <button 
                                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Bonjour ${member.name}, c'est le moment de payer ta cotisation de ${cercle.amount.toLocaleString('fr-FR')} FCFA pour la tontine "${cercle.name}" ! Connecte-toi sur Tontineo pour régler.`)}`, '_blank')}
                                    className="p-2 bg-surface border border-border rounded-lg shadow-sm text-textSecondary hover:text-primary hover:border-primary transition-all hover:-translate-y-0.5 group-hover:bg-primary/5" 
                                    title="Relancer sur WhatsApp"
                                  >
                                    <Smartphone size={16} />
                                  </button>
                                )}
                                {member.user_id !== user?.id && (
                                  <button 
                                    onClick={() => handleRemoveMember(member.user_id, member.name)}
                                    className="p-2 bg-surface border border-border rounded-lg shadow-sm text-textSecondary hover:text-danger hover:border-danger transition-all hover:-translate-y-0.5 group-hover:bg-danger/5" 
                                    title="Exclure ce membre"
                                  >
                                    <XCircle size={16} />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {members.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-textSecondary">Aucun membre pour le moment.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historique des Cycles Passés (Accordéon) */}
          <div className="bg-surface border border-border rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <History className="text-primary" size={20} />
              <h2 className="text-lg font-bold text-textPrimary">Historique des Cycles Passés</h2>
            </div>
            
            <div className="space-y-3">
              {pastCycles.length === 0 ? (
                <div className="p-8 text-center text-textSecondary bg-gray-50 dark:bg-slate-800 rounded-2xl">
                  Aucun historique de cycle disponible.
                </div>
              ) : (
                pastCycles.map((cycle) => (
                  <div key={cycle.id} className="border border-border rounded-2xl overflow-hidden transition-colors hover:border-primary/30">
                    <button 
                      onClick={() => setExpandedCycle(expandedCycle === cycle.id ? null : cycle.id)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100 transition-colors focus:outline-none"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                          #{cycle.id}
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-textPrimary">{cycle.name}</h4>
                          <p className="text-xs text-textSecondary">{cycle.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="hidden sm:block text-right">
                          <p className="text-textSecondary text-xs">Gagnant</p>
                          <p className="font-bold text-textPrimary">{cycle.winner}</p>
                        </div>
                        <div className="p-1 bg-white border border-border rounded-full shadow-sm text-textSecondary">
                          {expandedCycle === cycle.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                        </div>
                      </div>
                    </button>
                    
                    {/* Accordion Content */}
                    {expandedCycle === cycle.id && (
                      <div className="p-4 border-t border-border bg-white animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-border/50">
                          <div>
                            <p className="text-xs text-textSecondary mb-1">Montant collecté</p>
                            <p className="font-bold font-mono text-textPrimary">{cycle.amount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-textSecondary mb-1">Pénalités</p>
                            <p className="font-bold font-mono text-textPrimary">0 FCFA</p>
                          </div>
                          <div>
                            <p className="text-xs text-textSecondary mb-1">Membres</p>
                            <p className="font-bold text-textPrimary">10/10 payés</p>
                          </div>
                          <div>
                            <p className="text-xs text-textSecondary mb-1">Preuve du tirage</p>
                            <Link href={`/verify/draw/${cycle.id}`} className="font-bold text-primary font-mono text-xs hover:underline flex items-center gap-1">
                              Voir le certificat
                            </Link>
                          </div>
                        </div>
                        
                        {cercle.isOrganizer && (
                          <div className="mt-4 flex justify-end">
                             <button className="text-sm font-bold text-textPrimary hover:text-primary transition-colors flex items-center gap-2">
                               Télécharger le reçu global PDF
                             </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
        )}
      </div>
      
      <DisputeModal 
        isOpen={showDisputeModal} 
        onClose={() => setShowDisputeModal(false)} 
        circleId={cercle.id} 
        circleName={cercle.name} 
      />

      <CharteModal 
        isOpen={showCharte}
        onClose={() => setShowCharte(false)}
        circle={{
          name: cercle.name,
          amount: cercle.amount,
          frequency: cercle.frequency,
          penalty: cercle.penalty,
          drawType: cercle.drawType,
          maxMembers: cercle.maxMembers
        }}
        hasAccepted={true}
      />
    </div>
  );
}
