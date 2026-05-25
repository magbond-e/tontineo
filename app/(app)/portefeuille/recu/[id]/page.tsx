"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Printer, Download } from "lucide-react";
import Link from "next/link";

export default function ReceiptPage() {
  const { id } = useParams();
  const router = useRouter();
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchPayment = async () => {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          cycles (cycle_number, start_date, end_date),
          circles (name, amount),
          profiles (full_name)
        `)
        .eq("id", id)
        .single();

      if (data) {
        setPayment(data);
      }
      setLoading(false);
    };

    if (id) fetchPayment();
  }, [id, supabase]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen animate-pulse">Chargement du reçu...</div>;
  }

  if (!payment) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <h2 className="text-2xl font-bold text-textPrimary mb-4">Reçu introuvable</h2>
        <button onClick={() => router.back()} className="px-6 py-2 bg-primary text-white rounded-full">
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center print:hidden mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-textSecondary hover:text-primary transition-colors">
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-full font-bold shadow-md shadow-primary/20 transition-all"
        >
          <Printer size={18} />
          <span>Imprimer le Reçu (PDF)</span>
        </button>
      </div>

      {/* Reçu (Zone imprimable) */}
      <div className="bg-white border border-gray-200 p-10 rounded-2xl shadow-sm print:shadow-none print:border-none print:p-0">
        <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-primary tracking-tight">TONTINEO</h1>
            <p className="text-gray-500 mt-1">La tradition de la tontine, la sécurité de la technologie.</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Reçu de Paiement</p>
            <p className="font-mono text-gray-900"># {payment.fedapay_transaction_id || payment.id.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-10">
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase mb-2">Détails du Membre</p>
            <p className="font-bold text-gray-900 text-lg">{payment.profiles?.full_name || "Membre"}</p>
            <p className="text-gray-600">{payment.phone_used || "N/A"}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-400 uppercase mb-2">Informations de Tontine</p>
            <p className="font-bold text-gray-900 text-lg">{payment.circles?.name || "Cercle"}</p>
            <p className="text-gray-600">Cycle {payment.cycles?.cycle_number || "-"}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-10 border border-gray-100">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
            <p className="font-medium text-gray-700">Cotisation Principale</p>
            <p className="font-mono font-bold text-gray-900">{Number(payment.amount).toLocaleString('fr-FR')} FCFA</p>
          </div>
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
            <p className="font-medium text-gray-700">Pénalités de retard</p>
            <p className="font-mono font-bold text-gray-900">{Number(payment.penalty_amount || 0).toLocaleString('fr-FR')} FCFA</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="font-extrabold text-xl text-gray-900 uppercase">Montant Total Payé</p>
            <p className="font-mono font-extrabold text-2xl text-primary">
              {(Number(payment.amount) + Number(payment.penalty_amount || 0)).toLocaleString('fr-FR')} FCFA
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 text-sm border-t border-gray-200 pt-8">
          <div>
            <p className="text-gray-500 font-medium mb-1">Méthode de paiement</p>
            <p className="font-bold text-gray-900 capitalize">{payment.payment_method || "Mobile Money"}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium mb-1">Date et Heure</p>
            <p className="font-bold text-gray-900">
              {new Date(payment.completed_at || payment.initiated_at).toLocaleDateString('fr-FR')} à {new Date(payment.completed_at || payment.initiated_at).toLocaleTimeString('fr-FR')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 font-medium mb-1">Statut</p>
            <p className={`font-bold inline-flex px-2 py-1 rounded-full text-xs uppercase tracking-wider ${payment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {payment.status === 'completed' ? 'Payé' : payment.status}
            </p>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>Ce document certifie électroniquement que le paiement ci-dessus a été reçu et traité par TONTINEO.</p>
          <p className="mt-1 font-mono">{payment.id}</p>
        </div>
      </div>
    </div>
  );
}
