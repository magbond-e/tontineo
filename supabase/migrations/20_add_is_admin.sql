-- ============================================================
-- 20. AJOUT DU ROLE ADMINISTRATEUR
-- ============================================================

-- 1. Ajout de la colonne is_admin dans la table profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Note : La politique existante (dans 09_fix_profile_rls_update.sql) 
-- restreint déjà les colonnes modifiables par l'utilisateur (via GRANT UPDATE).
-- Les utilisateurs normaux ne pourront donc pas modifier is_admin eux-mêmes.

-- 2. On s'assure que tout le monde peut lire cette colonne (déjà géré par le SELECT global, 
-- mais ajout explicite si nécessaire)
GRANT SELECT (is_admin) ON public.profiles TO authenticated, anon;
