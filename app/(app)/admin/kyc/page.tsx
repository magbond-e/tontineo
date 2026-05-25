"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldAlert, CheckCircle2, XCircle, Loader2, FileText } from "lucide-react";

export default function AdminKycPage() {
  const [pendingKycs, setPendingKycs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedKyc, setSelectedKyc] = useState<any>(null);
  const [docUrls, setDocUrls] = useState<{front: string, back: string | null}>({front: '', back: null});
  
  const { user } = useAuth();
  const supabase = createClient();

  const handleViewDocs = async (kyc: any) => {
    setSelectedKyc(kyc);
    setDocUrls({front: '', back: null});
    
    // Fetch signed URLs for private bucket 'kyc'
    if (kyc.kyc_front_url) {
      const { data } = await supabase.storage.from('kyc').createSignedUrl(kyc.kyc_front_url, 3600);
      if (data) setDocUrls(prev => ({ ...prev, front: data.signedUrl }));
    }
    
    if (kyc.kyc_back_url) {
      const { data } = await supabase.storage.from('kyc').createSignedUrl(kyc.kyc_back_url, 3600);
      if (data) setDocUrls(prev => ({ ...prev, back: data.signedUrl }));
    }
  };

  useEffect(() => {
    fetchPendingKyc();
  }, [user]);

  const fetchPendingKyc = async () => {
    setIsLoading(true);
    // Ideally we should use supabaseAdmin to bypass RLS, but for MVP we assume RLS allows this or user is admin
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, kyc_status, created_at, kyc_doc_type, kyc_front_url, kyc_back_url')
      .eq('kyc_status', 'pending');
      
    if (data) {
      setPendingKycs(data);
    }
    setIsLoading(false);
  };

  const handleAction = async (userId: string, action: 'verified' | 'rejected') => {
    if (!window.confirm(`Voulez-vous vraiment ${action === 'verified' ? 'approuver' : 'rejeter'} le KYC de cet utilisateur ?`)) return;
    
    setProcessingId(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          kyc_status: action,
          kyc_verified_at: action === 'verified' ? new Date().toISOString() : null
        })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update local state
      setPendingKycs(pendingKycs.filter(k => k.id !== userId));
      
      // Optional: Add to trust score +10 if verified (via API or trigger)
      
    } catch (err) {
      console.error(err);
      alert("Erreur lors du traitement du KYC.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto py-8 px-4 min-h-[80vh]">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-warning/10 text-warning rounded-xl flex items-center justify-center">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-textPrimary tracking-tight">Validation KYC (Admin)</h1>
          <p className="text-textSecondary text-sm">Approuvez ou rejetez les demandes de vérification d'identité.</p>
        </div>
      </div>
      
      <div className="bg-surface border border-border rounded-2xl md:rounded-3xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-textSecondary">Chargement des dossiers...</p>
          </div>
        ) : pendingKycs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-xl font-bold text-textPrimary mb-2">Tous les KYC sont traités !</h2>
            <p className="text-textSecondary">Il n'y a aucune demande en attente pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-border">
                <tr className="text-textSecondary text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Utilisateur</th>
                  <th className="px-6 py-4 font-semibold">Contact</th>
                  <th className="px-6 py-4 font-semibold">Documents</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingKycs.map((kyc) => (
                  <tr key={kyc.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-textPrimary">{kyc.full_name || "Sans nom"}</p>
                      <p className="text-xs text-textSecondary font-mono mt-1">ID: {kyc.id.substring(0, 8)}...</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-textPrimary">{kyc.email}</p>
                      <p className="text-sm text-textSecondary mt-1">{kyc.phone || "Pas de téléphone"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleViewDocs(kyc)}
                        className="flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                      >
                        <FileText size={16} />
                        Voir les documents
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleAction(kyc.id, 'rejected')}
                          disabled={processingId === kyc.id}
                          className="p-2 bg-surface border border-border rounded-lg shadow-sm text-textSecondary hover:text-danger hover:border-danger hover:bg-danger/5 transition-all disabled:opacity-50"
                          title="Rejeter"
                        >
                          {processingId === kyc.id ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                        </button>
                        <button 
                          onClick={() => handleAction(kyc.id, 'verified')}
                          disabled={processingId === kyc.id}
                          className="p-2 bg-surface border border-border rounded-lg shadow-sm text-textSecondary hover:text-success hover:border-success hover:bg-success/5 transition-all disabled:opacity-50"
                          title="Approuver"
                        >
                          {processingId === kyc.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Modal View Docs */}
      {selectedKyc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl md:rounded-3xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-border flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
              <h2 className="text-xl font-bold text-textPrimary">Documents KYC - {selectedKyc.full_name}</h2>
              <button 
                onClick={() => setSelectedKyc(null)}
                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-xl">
                <p className="text-sm font-bold text-textPrimary">Type de document : <span className="uppercase text-primary">{selectedKyc.kyc_doc_type}</span></p>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-textPrimary mb-3">Recto</h3>
                {docUrls.front ? (
                  <img src={docUrls.front} alt="Recto" className="w-full h-auto rounded-xl border border-border" />
                ) : (
                  <div className="w-full h-40 bg-gray-100 dark:bg-slate-800 animate-pulse rounded-xl flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-textSecondary" />
                  </div>
                )}
              </div>
              
              {selectedKyc.kyc_back_url && (
                <div>
                  <h3 className="text-sm font-bold text-textPrimary mb-3">Verso</h3>
                  {docUrls.back ? (
                    <img src={docUrls.back} alt="Verso" className="w-full h-auto rounded-xl border border-border" />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 dark:bg-slate-800 animate-pulse rounded-xl flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-textSecondary" />
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-border flex gap-4 sticky bottom-0 bg-surface justify-end">
              <button 
                onClick={() => {
                  handleAction(selectedKyc.id, 'rejected');
                  setSelectedKyc(null);
                }}
                disabled={processingId === selectedKyc.id}
                className="px-6 py-2.5 bg-danger/10 text-danger font-bold rounded-xl hover:bg-danger/20 transition-all flex items-center gap-2"
              >
                {processingId === selectedKyc.id ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                Rejeter
              </button>
              <button 
                onClick={() => {
                  handleAction(selectedKyc.id, 'verified');
                  setSelectedKyc(null);
                }}
                disabled={processingId === selectedKyc.id}
                className="px-6 py-2.5 bg-success text-white font-bold rounded-xl shadow-md shadow-success/20 hover:bg-success/90 transition-all flex items-center gap-2"
              >
                {processingId === selectedKyc.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                Approuver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
