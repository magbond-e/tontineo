"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Wallet, ArrowDownRight, ArrowUpRight, Loader2, Plus, ArrowRightLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PortefeuillePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [autoWithdraw, setAutoWithdraw] = useState(false);

  useEffect(() => {
    const fetchWallet = async () => {
      if (!user) return;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('wallet_balance, auto_withdraw')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setBalance(profile.wallet_balance || 0);
          setAutoWithdraw(profile.auto_withdraw || false);
        }

        const { data: walletTxs } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', user.id);

        const { data: paymentsTxs } = await supabase
          .from('payments')
          .select('*, cycles(circles(name))')
          .eq('user_id', user.id)
          .eq('status', 'completed');

        let allTxs: any[] = [];
        if (walletTxs) {
          allTxs = allTxs.concat(walletTxs.map(tx => ({
            id: tx.id,
            type: tx.type, // 'deposit' or 'withdrawal'
            label: tx.type === 'deposit' ? 'Recharge Momo' : 'Retrait Momo',
            amount: tx.amount,
            date: tx.completed_at || tx.created_at,
            status: tx.status
          })));
        }
        if (paymentsTxs) {
          // Dédoublonnage strict au niveau de l'affichage
          const seen = new Set();
          const uniquePaymentsTxs = paymentsTxs.filter(tx => {
            const key = `${tx.user_id}_${tx.cycle_id}_${tx.amount}_${new Date(tx.completed_at).getTime()}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });

          allTxs = allTxs.concat(uniquePaymentsTxs.map(tx => ({
            id: tx.id,
            type: 'withdrawal',
            label: `Cotisation - ${tx.cycles?.circles?.name || 'Cercle'}`,
            amount: tx.amount,
            date: tx.completed_at || tx.initiated_at,
            status: tx.status
          })));
        }

        // Trier par date décroissante
        allTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(allTxs);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWallet();
  }, [user, supabase]);

  if (isLoading) {
    return (
      <div className="max-w-[800px] mx-auto space-y-8 animate-pulse">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="space-y-2">
            <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            <div className="w-48 h-4 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          </div>
        </div>
        
        <div className="w-full h-16 bg-gray-200 dark:bg-gray-700 rounded-xl mb-6"></div>

        <div className="bg-surface rounded-3xl border border-border p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
          <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 mx-auto rounded-md mb-2"></div>
          <div className="w-48 h-10 bg-gray-200 dark:bg-gray-700 mx-auto rounded-md mb-8"></div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <div className="w-full sm:w-auto flex-1 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="w-full sm:w-auto flex-1 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/member" className="w-10 h-10 bg-surface border border-border rounded-full flex items-center justify-center text-textSecondary hover:text-primary hover:border-primary transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-textPrimary tracking-tight">Mon Épargne</h1>
          <p className="text-sm text-textSecondary">Votre cagnotte personnelle, sans groupe.</p>
        </div>
      </div>

      <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-start gap-3 text-primary text-sm mb-6">
        <Wallet size={20} className="flex-shrink-0 mt-0.5" />
        <p><strong>Bientôt disponible :</strong> Cet espace est votre épargne personnelle. Vous pourrez très prochainement bloquer vos fonds sur une période donnée pour atteindre vos objectifs financiers en toute sécurité.</p>
      </div>

      <div className="bg-surface rounded-3xl border border-border p-8 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
          <Wallet className="text-primary" size={32} />
        </div>
        <p className="text-textSecondary font-medium relative z-10">Solde Disponible</p>
        <h2 className="text-4xl md:text-5xl font-extrabold text-textPrimary font-mono mt-2 mb-8 relative z-10">
          {balance.toLocaleString('fr-FR')} FCFA
        </h2>
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full relative z-10">
          <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 dark:bg-slate-800 border border-border rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-slate-700 w-full sm:w-auto flex-1">
            <div className="relative flex items-center justify-center">
              <input 
                type="checkbox" 
                checked={autoWithdraw} 
                onChange={async (e) => {
                  const val = e.target.checked;
                  setAutoWithdraw(val);
                  if (user) {
                    await supabase.from('profiles').update({ auto_withdraw: val }).eq('id', user.id);
                  }
                }}
                className="peer appearance-none w-10 h-5 bg-gray-200 rounded-full checked:bg-primary transition-all cursor-pointer relative"
              />
              <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-all pointer-events-none"></div>
            </div>
            <div className="flex-1 text-left">
              <span className="block text-sm font-bold text-textPrimary leading-tight">Retrait automatique</span>
              <span className="block text-xs text-textSecondary mt-0.5">Vers Mobile Money</span>
            </div>
          </label>
          <Link href="/portefeuille/retrait" className="w-full sm:w-auto flex-1">
            <button className="w-full py-4 sm:py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors shadow-md shadow-primary/20 flex items-center justify-center gap-2">
              <ArrowRightLeft size={18} /> Retirer Manuellement
            </button>
          </Link>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-textPrimary mb-4">Historique des transactions</h3>
        {transactions.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-textSecondary">
              <Wallet size={32} />
            </div>
            <p className="text-textPrimary font-bold mb-1">Aucune transaction</p>
            <p className="text-sm text-textSecondary">Votre portefeuille est vide pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.slice((currentPage - 1) * 20, currentPage * 20).map(tx => (
              <div key={tx.id} className="bg-surface border border-border rounded-2xl p-4 flex items-center justify-between hover:shadow-sm transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tx.type === 'deposit' ? 'bg-success/10 text-success' : 'bg-gray-100 dark:bg-slate-800 text-textSecondary'}`}>
                    {tx.type === 'deposit' ? <ArrowDownRight size={24} /> : <ArrowUpRight size={24} />}
                  </div>
                  <div>
                    <p className="font-bold text-textPrimary">{tx.label}</p>
                    <p className="text-xs text-textSecondary">{new Date(tx.date).toLocaleString('fr-FR')}</p>
                    {tx.status === 'pending' && <span className="text-[10px] font-bold text-warning bg-warning/10 px-2 py-0.5 rounded ml-2 uppercase">En attente</span>}
                  </div>
                </div>
                <span className={`font-mono font-bold text-lg ${tx.type === 'deposit' ? 'text-success' : 'text-textPrimary'}`}>
                  {tx.type === 'deposit' ? '+' : '-'}{Number(tx.amount).toLocaleString('fr-FR')}
                </span>
              </div>
            ))}

            {transactions.length > 20 && (
              <div className="flex items-center justify-between mt-6 bg-surface border border-border p-4 rounded-2xl shadow-sm">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-bold bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors text-textPrimary"
                >
                  Précédent
                </button>
                <span className="text-sm font-bold text-textSecondary">
                  Page {currentPage} sur {Math.ceil(transactions.length / 20)}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(transactions.length / 20), prev + 1))}
                  disabled={currentPage === Math.ceil(transactions.length / 20)}
                  className="px-4 py-2 text-sm font-bold bg-primary hover:bg-primary/95 text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
