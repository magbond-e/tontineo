"use client";

import { useState } from "react";
import { Check, X, Eye, Loader2, AlertCircle } from "lucide-react";
import { updateKycStatus } from "@/app/actions/admin";

export default function KycClient({ pendingUsers }: { pendingUsers: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const handleUpdateStatus = async (userId: string, status: 'verified' | 'rejected') => {
    if (!window.confirm(`Êtes-vous sûr de vouloir ${status === 'verified' ? 'approuver' : 'rejeter'} ce document ?`)) return;
    
    setLoadingId(userId);
    const result = await updateKycStatus(userId, status);
    setLoadingId(null);
    
    if (result.success) {
      if (selectedUser?.id === userId) setSelectedUser(null);
      alert("Statut mis à jour avec succès.");
    } else {
      alert("Erreur: " + result.error);
    }
  };

  if (pendingUsers.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4">
          <Check size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Tout est à jour !</h3>
        <p className="text-slate-500">Aucun document KYC en attente de vérification.</p>
      </div>
    );
  }

  return (
    <>
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedUser(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Documents de {selectedUser.full_name}</h3>
              <button onClick={() => setSelectedUser(null)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedUser.kyc_doc_front && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300">Recto</h4>
                  <img src={process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/kyc/" + selectedUser.kyc_doc_front} alt="Recto" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 object-contain max-h-[400px] bg-slate-100 dark:bg-slate-950" />
                </div>
              )}
              {selectedUser.kyc_doc_back ? (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300">Verso</h4>
                  <img src={process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/kyc/" + selectedUser.kyc_doc_back} alt="Verso" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 object-contain max-h-[400px] bg-slate-100 dark:bg-slate-950" />
                </div>
              ) : (
                <div className="space-y-2 flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  <span className="text-slate-400 font-medium py-12">Aucun verso fourni</span>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-4">
              <button 
                onClick={() => handleUpdateStatus(selectedUser.id, 'rejected')}
                disabled={loadingId === selectedUser.id}
                className="px-6 py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold rounded-xl transition-colors flex items-center gap-2"
              >
                <X size={18} /> Rejeter
              </button>
              <button 
                onClick={() => handleUpdateStatus(selectedUser.id, 'verified')}
                disabled={loadingId === selectedUser.id}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
              >
                {loadingId === selectedUser.id ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                Approuver le document
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date d'envoi</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {pendingUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                        {user.avatar_url ? <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : null}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{user.full_name || "Sans nom"}</p>
                        <p className="text-xs text-slate-500">{user.email || user.phone || "Pas de contact"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                    Il y a peu
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setSelectedUser(user)}
                        className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Voir les documents"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(user.id, 'verified')}
                        disabled={loadingId === user.id}
                        className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                        title="Approuver"
                      >
                        {loadingId === user.id ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(user.id, 'rejected')}
                        disabled={loadingId === user.id}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Rejeter"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
