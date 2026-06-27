-- Accorder le droit de modification (UPDATE) sur la colonne cgu_accepted_at aux utilisateurs authentifiés
GRANT UPDATE (cgu_accepted_at) ON public.profiles TO authenticated;
