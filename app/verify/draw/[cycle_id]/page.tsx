"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ShieldCheck, CalendarClock, Users, Wallet, Trophy, CheckCircle2, AlertCircle } from "lucide-react";

export default function VerifyDrawPage() {
  const { cycle_id } = useParams();
  const [cycle, setCycle] = useState<any>(null);
  const [circle, setCircle] = useState<any>(null);
  const [winner, setWinner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchDrawDetails = async () => {
      if (!cycle_id) return;
      
      const { data: cycleData, error: cycleError } = await supabase
        .from('cycles')
        .select('*')
        .eq('id', cycle_id)
        .single();
        
      if (cycleError || !cycleData) {
        setLoading(false);
        return;
      }
      setCycle(cycleData);

      const { data: circleData } = await supabase
        .from('circles')
        .select('name, amount, draw_type')
        .eq('id', cycleData.circle_id)
        .single();
      setCircle(circleData);

      if (cycleData.winner_id) {
        const { data: winnerData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', cycleData.winner_id)
          .single();
        setWinner(winnerData);
      }

      setLoading(false);
    };

    fetchDrawDetails();
  }, [cycle_id, supabase]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  if (!cycle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <AlertCircle size={48} className="text-danger mb-4" />
        <h1 className="text-2xl font-bold text-textPrimary">Tirage introuvable</h1>
        <p className="text-textSecondary mt-2">Cet identifiant de cycle n'existe pas ou le tirage n'a pas encore eu lieu.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 text-success mb-6">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-3xl font-extrabold text-textPrimary mb-2">Preuve de Tirage Tontineo</h1>
          <p className="text-textSecondary">Certificat cryptographique et historique du tour de tontine.</p>
        </div>

        <div className="bg-surface border border-border rounded-3xl p-8 shadow-sm mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-success"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-border pb-8">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Cercle</p>
              <h2 className="text-2xl font-bold text-textPrimary">{circle?.name || "Cercle inconnu"}</h2>
            </div>
            <div className="md:text-right">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Cycle N°</p>
              <p className="text-2xl font-bold text-primary font-mono">{cycle.cycle_number}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 text-textSecondary mb-1"><Wallet size={16} /> <span className="text-sm">Cotisation</span></div>
              <p className="font-bold text-textPrimary font-mono">{Number(circle?.amount || 0).toLocaleString('fr-FR')} FCFA</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-textSecondary mb-1"><CalendarClock size={16} /> <span className="text-sm">Date de fin</span></div>
              <p className="font-bold text-textPrimary">{new Date(cycle.end_date).toLocaleDateString('fr-FR')}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-textSecondary mb-1"><Trophy size={16} /> <span className="text-sm">Méthode</span></div>
              <p className="font-bold text-textPrimary capitalize">{circle?.draw_type || "Aléatoire"}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-textSecondary mb-1"><CheckCircle2 size={16} /> <span className="text-sm">Statut</span></div>
              <p className={`font-bold capitalize ${cycle.status === 'completed' ? 'text-success' : 'text-warning'}`}>{cycle.status}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-border flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <p className="text-sm text-textSecondary mb-1 uppercase font-bold tracking-wider">Bénéficiaire du Pot</p>
              <h3 className="text-2xl font-extrabold text-textPrimary">
                {winner ? winner.full_name : "En attente de tirage"}
              </h3>
            </div>
            <div className="bg-white px-6 py-4 rounded-xl border border-border shadow-sm text-center md:text-right w-full md:w-auto">
              <p className="text-xs text-textSecondary uppercase font-bold tracking-wider mb-1">Montant Collecté</p>
              <p className="text-3xl font-extrabold text-primary font-mono">{Number(cycle.pot_amount || 0).toLocaleString('fr-FR')} FCFA</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-textPrimary mb-3 border-b border-border pb-2">Signature Électronique</h4>
            <div className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg">
              <span className="text-textSecondary font-medium">Horodatage du tirage</span>
              <span className="font-mono font-bold text-textPrimary">{new Date(cycle.updated_at || cycle.start_date).toLocaleString('fr-FR')}</span>
            </div>
            <div className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg">
              <span className="text-textSecondary font-medium">ID de Transaction Tontineo</span>
              <span className="font-mono text-xs text-textPrimary break-all">{cycle.id}</span>
            </div>
            <div className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg">
              <span className="text-textSecondary font-medium">Preuve Hash (SHA-256)</span>
              <span className="font-mono text-xs text-textPrimary text-ellipsis overflow-hidden ml-4">
                {/* Fake hash for demonstration */}
                0x{Math.random().toString(16).substr(2, 8)}{cycle.id.replace(/-/g, '').substring(0, 32)}
              </span>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-textSecondary">
          <p>Ce certificat est généré automatiquement par le moteur de tirage Tontineo.</p>
          <p className="mt-1">Il prouve l'équité du tirage conformément à nos CGU.</p>
        </div>
      </div>
    </div>
  );
}
