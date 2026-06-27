-- Ajouter cgu_accepted_at aux profils pour tracer l'acceptation légale
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cgu_accepted_at TIMESTAMPTZ;

-- Autoriser la lecture de cette colonne (le reste des règles RLS sur profiles couvre déjà la mise à jour)
GRANT SELECT (cgu_accepted_at) ON public.profiles TO authenticated, anon;
