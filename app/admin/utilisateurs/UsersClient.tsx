"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Shield, ShieldOff, Loader2 } from "lucide-react";
import { toggleAdminRole } from "@/app/actions/admin";

export default function UsersClient({ users, currentUserId }: { users: any[], currentUserId: string }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    if (userId === currentUserId) {
      alert("Vous ne pouvez pas modifier votre propre statut.");
      return;
    }
    
    const action = currentIsAdmin ? "révoquer" : "accorder";
    if (!window.confirm(`Êtes-vous sûr de vouloir ${action} les droits d'administration pour cet utilisateur ?`)) return;
    
    setLoadingId(userId);
    const result = await toggleAdminRole(userId, !currentIsAdmin);
    setLoadingId(null);
    
    if (result.success) {
      alert("Droits mis à jour avec succès.");
    } else {
      alert("Erreur: " + result.error);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Utilisateur</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut KYC</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rôle</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-500 uppercase">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        user.full_name?.substring(0, 2) || "U"
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{user.full_name || "Sans nom"}</p>
                      <p className="text-xs text-slate-500">{user.city || "Ville non précisée"}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-sm text-slate-900 dark:text-white">{user.phone || "Non renseigné"}</p>
                  <p className="text-xs text-slate-500">{user.whatsapp ? `WA: ${user.whatsapp}` : "Pas de WA"}</p>
                </td>
                <td className="p-4">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                    ${user.kyc_status === 'verified' ? 'bg-green-500/10 text-green-500' : 
                      user.kyc_status === 'pending' ? 'bg-orange-500/10 text-orange-500' : 
                      user.kyc_status === 'rejected' ? 'bg-red-500/10 text-red-500' : 
                      'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                  >
                    {user.kyc_status === 'verified' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {user.kyc_status === 'verified' ? 'Vérifié' : 
                     user.kyc_status === 'pending' ? 'En attente' : 
                     user.kyc_status === 'rejected' ? 'Rejeté' : 'Non vérifié'}
                  </div>
                </td>
                <td className="p-4">
                  {user.is_admin ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-danger bg-danger/10 px-2.5 py-1 rounded-md">
                      <Shield size={14} /> Admin
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-500">Membre</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                      disabled={loadingId === user.id || user.id === currentUserId}
                      className={`p-2 rounded-lg transition-colors ${user.is_admin ? 'text-slate-500 hover:bg-slate-200' : 'text-danger hover:bg-danger/10'} disabled:opacity-50`}
                      title={user.is_admin ? "Révoquer droits admin" : "Accorder droits admin"}
                    >
                      {loadingId === user.id ? <Loader2 size={18} className="animate-spin" /> : 
                       user.is_admin ? <ShieldOff size={18} /> : <Shield size={18} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
