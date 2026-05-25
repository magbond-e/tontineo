-- ============================================================
-- 10. AJOUT DE LA COLONNE GAGNANT DANS LA TABLE DES CYCLES
-- ============================================================

-- Ajouter winner_id à la table public.cycles pointant vers les profils
ALTER TABLE public.cycles 
ADD COLUMN IF NOT EXISTS winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- S'assurer que le SELECT complet sur cycles est bien autorisé pour les rôles authenticated et anon
GRANT SELECT ON public.cycles TO authenticated, anon;
