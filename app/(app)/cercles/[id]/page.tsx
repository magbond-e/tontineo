"use client";

import { useState, useEffect } from "react";
import { Users, Wallet, AlertCircle, CalendarClock, MoreVertical, CheckCircle2, Clock, XCircle, ChevronDown, ChevronUp, History, Info, Smartphone, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function CercleDetailsPage({ params }: { params: { id: string } }) {
  const [expandedCycle, setExpandedCycle] = useState<number | null>(null);
  
  const [cercle, setCercle] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [pastCycles, setPastCycles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();
  const supabase = createClient();

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
        nextPaymentDate: "En attente",
        penalty: circleData.late_penalty_pct,
        drawType: circleData.draw_type,
        isOrganizer: circleData.organizer_id === user.id,
        isMember: true,
        image: circleData.icon_emoji || "💰"
      });

      // Fetch members with profile data
      const { data: membershipsData } = await supabase
        .from('memberships')
        .select('*, profiles(full_name, avatar_url, trust_score)')
        .eq('circle_id', params.id);
        
      if (membershipsData) {
        const mappedMembers = membershipsData.map(m => ({
          id: m.id,
          name: m.profiles?.full_name || "Utilisateur",
          role: m.role === 'co-organizer' ? 'Organisateur' : 'Membre',
          status: 'En attente', // Par défaut
          date: "-",
          avatar: m.profiles?.full_name ? m.profiles.full_name.substring(0, 2).toUpperCase() : "UT",
          trustScore: m.profiles?.trust_score || 50
        }));
        setMembers(mappedMembers);
      }

      setIsLoading(false);
    };

    fetchCercleDetails();
  }, [params.id, user]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-textSecondary">Chargement du cercle...</p>
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
  const potProgress = (cercle.potCollected / cercle.potTarget) * 100;
  
  // Paramètres SVG pour le Donut
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (potProgress / 100) * circumference;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 md:space-y-8 min-h-[80vh]">
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
                <span className="px-2.5 py-1 bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider rounded-md whitespace-nowrap">
                  {cercle.status}
                </span>
                {cercle.isOrganizer && (
                  <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-md border border-primary/20 whitespace-nowrap">
                    Organisateur
                  </span>
                )}
                {cercle.isMember && (
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-blue-200 whitespace-nowrap">
                    Membre
                  </span>
                )}
              </div>
            </div>
            <p className="text-textSecondary text-sm md:text-base">{cercle.description}</p>
          </div>
          
          <div className="flex w-full md:w-auto gap-3 mt-2 md:mt-0">
            {cercle.isMember && (
              <button className="flex-1 md:flex-none px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-md shadow-primary/20 transition-all hover:scale-105">
                Cotiser maintenant
              </button>
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
            {cercle.isOrganizer && potProgress === 100 && (
               <button className="w-full mt-4 py-2.5 bg-textPrimary hover:bg-black text-white font-bold rounded-xl transition-all shadow-md">
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
              <p className="text-sm text-white/80">Dans environ 22 jours</p>
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
          </div>
        </div>

        {/* Right Column: Members & History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Cycle Actuel - Membres */}
          <div className="bg-surface border border-border rounded-2xl md:rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 md:p-6 border-b border-border flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-textPrimary">Membres ({members.length})</h2>
              <span className="text-sm font-bold text-primary whitespace-nowrap ml-4">{members.filter(m => m.status === 'Payé').length} / {cercle.currentMembers} Payés</span>
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
                    <tr key={member.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm shrink-0 ${member.role === 'Organisateur' ? 'bg-primary text-white' : 'bg-gray-100 text-textPrimary'}`}>
                            {member.avatar}
                          </div>
                          <div>
                            <p className="font-bold text-textPrimary text-sm">{member.name}</p>
                            <p className="text-xs text-textSecondary flex items-center gap-1">
                              Score: <span className={`font-bold ${member.trustScore > 80 ? 'text-success' : member.trustScore > 50 ? 'text-warning' : 'text-danger'}`}>{member.trustScore}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
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
                      </td>
                      <td className="px-6 py-4 text-sm text-textSecondary font-medium whitespace-nowrap">
                        {member.date}
                      </td>
                      {cercle.isOrganizer && (
                        <td className="px-6 py-4 text-right">
                          {member.status !== 'Payé' ? (
                            <button className="p-2 bg-surface border border-border rounded-lg shadow-sm text-textSecondary hover:text-primary hover:border-primary transition-all hover:-translate-y-0.5 group-hover:bg-primary/5" title="Relancer sur WhatsApp">
                              <Smartphone size={16} />
                            </button>
                          ) : (
                            <span className="text-textSecondary opacity-50 px-4">-</span>
                          )}
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
          <div className="bg-surface border border-border rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm">
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
                            <p className="font-bold text-primary font-mono text-xs cursor-pointer hover:underline flex items-center gap-1">
                              0x8f...2a4c
                            </p>
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
      </div>
    </div>
  );
}
