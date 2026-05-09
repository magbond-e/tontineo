"use client";

import { useState } from "react";
import { Check, ChevronRight, ChevronLeft, Image as ImageIcon, Users, Wallet, AlertCircle, Link as LinkIcon, Copy } from "lucide-react";
import Link from "next/link";

export default function CreateCerclePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: "10000",
    frequency: "Mensuel",
    maxMembers: "10",
    drawType: "Aléatoire IA",
    penalty: "1000",
  });
  const [isCreated, setIsCreated] = useState(false);

  const handleNext = () => setStep(s => Math.min(3, s + 1));
  const handlePrev = () => setStep(s => Math.max(1, s - 1));
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = () => {
    setIsCreated(true);
  };

  return (
    <div className="max-w-[1200px] mx-auto min-h-[80vh]">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">Créer un Cercle</h1>
        <p className="text-textSecondary mt-1">Configurez une nouvelle tontine pour vous et vos proches.</p>
      </div>

      {isCreated ? (
        <div className="bg-surface border border-border rounded-2xl p-8 max-w-2xl mx-auto text-center shadow-lg">
          <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} />
          </div>
          <h2 className="text-2xl font-bold text-textPrimary mb-2">Cercle créé avec succès !</h2>
          <p className="text-textSecondary mb-8">Votre tontine "{formData.name}" est prête. Invitez maintenant vos membres à la rejoindre.</p>
          
          <div className="bg-gray-50 border border-border rounded-xl p-4 flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 overflow-hidden text-left">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <LinkIcon size={20} />
              </div>
              <div className="truncate">
                <p className="text-xs text-textSecondary font-medium">Lien d'invitation</p>
                <p className="text-sm font-mono font-bold text-textPrimary truncate">https://tontineo.app/join/crcl_8f92k1</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border hover:bg-gray-50 text-textPrimary font-bold rounded-lg transition-colors shadow-sm ml-4 flex-shrink-0">
              <Copy size={16} /> Copier
            </button>
          </div>

          <Link href="/dashboard">
            <button className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-md shadow-primary/20">
              Aller au Dashboard
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Form & Stepper */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stepper Header */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 h-1 bg-border w-full">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
              </div>
              
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center flex-col gap-2 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    step >= num ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-gray-100 text-textSecondary'
                  }`}>
                    {step > num ? <Check size={18} /> : num}
                  </div>
                  <span className={`text-xs font-bold ${step >= num ? 'text-primary' : 'text-textSecondary'}`}>
                    {num === 1 ? 'Informations' : num === 2 ? 'Règles' : 'Confirmation'}
                  </span>
                </div>
              ))}
            </div>

            {/* Form Steps */}
            <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm">
              
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="text-xl font-bold text-textPrimary border-b border-border pb-4">Informations Générales</h3>
                  
                  <div>
                    <label className="block text-sm font-bold text-textPrimary mb-2">Nom du cercle</label>
                    <input 
                      type="text" name="name" value={formData.name} onChange={handleChange}
                      placeholder="Ex: Famille Diop Solidarité" 
                      className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-textPrimary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-textPrimary mb-2">Photo de couverture</label>
                    <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3">
                        <ImageIcon size={24} />
                      </div>
                      <p className="text-sm font-bold text-textPrimary">Cliquez pour uploader</p>
                      <p className="text-xs text-textSecondary mt-1">SVG, PNG, JPG (max. 800x400px)</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-textPrimary mb-2">Description (Optionnel)</label>
                    <textarea 
                      name="description" value={formData.description} onChange={handleChange}
                      placeholder="Quel est le but de cette tontine ?" 
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-textPrimary resize-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="text-xl font-bold text-textPrimary border-b border-border pb-4">Règles Financières</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-textPrimary mb-2">Montant de cotisation (FCFA)</label>
                      <input 
                        type="number" name="amount" value={formData.amount} onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-textPrimary font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-textPrimary mb-2">Fréquence</label>
                      <select 
                        name="frequency" value={formData.frequency} onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-textPrimary"
                      >
                        <option value="Journalier">Journalier</option>
                        <option value="Hebdomadaire">Hebdomadaire</option>
                        <option value="Mensuel">Mensuel</option>
                        <option value="Annuel">Annuel</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-textPrimary mb-2">Nombre max de membres</label>
                      <input 
                        type="number" name="maxMembers" value={formData.maxMembers} onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-textPrimary font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-textPrimary mb-2">Pénalité de retard (FCFA)</label>
                      <input 
                        type="number" name="penalty" value={formData.penalty} onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-textPrimary font-mono"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-textPrimary mb-2">Type de Tirage</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div 
                          onClick={() => setFormData({...formData, drawType: "Aléatoire IA"})}
                          className={`p-4 border rounded-xl cursor-pointer transition-all ${formData.drawType === "Aléatoire IA" ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-gray-50 hover:bg-gray-100"}`}
                        >
                          <h4 className={`font-bold text-sm ${formData.drawType === "Aléatoire IA" ? "text-primary" : "text-textPrimary"}`}>Tirage Aléatoire IA</h4>
                          <p className="text-xs text-textSecondary mt-1">L'ordre est défini par notre algorithme de manière équitable.</p>
                        </div>
                        <div 
                          onClick={() => setFormData({...formData, drawType: "Liste Fixe"})}
                          className={`p-4 border rounded-xl cursor-pointer transition-all ${formData.drawType === "Liste Fixe" ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-gray-50 hover:bg-gray-100"}`}
                        >
                          <h4 className={`font-bold text-sm ${formData.drawType === "Liste Fixe" ? "text-primary" : "text-textPrimary"}`}>Liste Fixe</h4>
                          <p className="text-xs text-textSecondary mt-1">L'organisateur (vous) définit l'ordre manuellement.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h3 className="text-xl font-bold text-textPrimary border-b border-border pb-4">Résumé & Confirmation</h3>
                  
                  <div className="bg-warning/10 border border-warning/20 p-4 rounded-xl flex gap-3 text-warning text-sm">
                    <AlertCircle size={20} className="flex-shrink-0" />
                    <p>En créant ce cercle, vous devenez l'organisateur. Vous serez responsable de la validation des membres et de la bonne tenue des paiements de votre tontine.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-4 text-sm bg-gray-50 p-6 rounded-xl border border-border">
                    <div className="text-textSecondary">Pot global estimé</div>
                    <div className="font-bold text-textPrimary font-mono text-right">{parseInt(formData.amount || "0") * parseInt(formData.maxMembers || "0")} FCFA</div>
                    
                    <div className="text-textSecondary">Frais de plateforme (0%)</div>
                    <div className="font-bold text-success text-right">Gratuit</div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-8 pt-6 border-t border-border flex justify-between items-center">
                <button 
                  onClick={handlePrev}
                  disabled={step === 1}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all ${step === 1 ? 'opacity-50 cursor-not-allowed text-textSecondary bg-gray-100' : 'text-textPrimary bg-gray-100 hover:bg-gray-200'}`}
                >
                  <ChevronLeft size={20} /> Précédent
                </button>
                
                {step < 3 ? (
                  <button 
                    onClick={handleNext}
                    disabled={step === 1 && !formData.name.trim()}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all shadow-md shadow-primary/20 ${step === 1 && !formData.name.trim() ? 'opacity-50 cursor-not-allowed text-white bg-primary/50' : 'bg-primary hover:bg-primary/90 text-white hover:scale-105'}`}
                  >
                    Suivant <ChevronRight size={20} />
                  </button>
                ) : (
                  <button 
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-8 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-full font-bold transition-all shadow-lg shadow-primary/30 hover:scale-105"
                  >
                    Créer le cercle <Check size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Live Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h3 className="text-sm font-bold text-textSecondary uppercase tracking-wider mb-4 px-2">Aperçu du cercle</h3>
              
              <div className="bg-surface rounded-2xl border border-border shadow-md overflow-hidden group">
                <div className="h-24 bg-gradient-to-r from-primaryLight to-primary/20 relative">
                  <div className="absolute -bottom-8 left-6 w-16 h-16 bg-surface rounded-2xl border-4 border-surface shadow-sm flex items-center justify-center text-primary font-bold text-xl">
                    {formData.name ? formData.name.substring(0, 2).toUpperCase() : 'CC'}
                  </div>
                </div>
                <div className="p-6 pt-10">
                  <h4 className="font-bold text-textPrimary text-xl mb-1 truncate">{formData.name || "Nom du cercle"}</h4>
                  <p className="text-sm text-textSecondary line-clamp-2 min-h-[40px]">{formData.description || "Une description du but de cette tontine..."}</p>
                  
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-textSecondary flex items-center gap-2"><Wallet size={16}/> Montant</span>
                      <span className="font-bold text-textPrimary font-mono">{formData.amount || "0"} FCFA</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-textSecondary flex items-center gap-2"><CalendarClock size={16}/> Fréquence</span>
                      <span className="font-bold text-textPrimary">{formData.frequency}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-textSecondary flex items-center gap-2"><Users size={16}/> Membres</span>
                      <span className="font-bold text-textPrimary">1 / {formData.maxMembers || "0"}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-border">
                    <button className="w-full py-2 bg-gray-100 text-textSecondary font-bold rounded-xl cursor-not-allowed">
                      Cotiser
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// Simple CalendarClock icon workaround since lucide-react version might vary
function CalendarClock(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/>
      <path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h5"/><path d="M17.5 17.5 16 16.25V14"/>
      <circle cx="16" cy="16" r="6"/>
    </svg>
  );
}
