-- ============================================================
-- 9. SÉCURISATION DE LA TABLE PROFILES PAR COLONNES
-- ============================================================

-- 1. Révoquer tous les droits de modification (UPDATE) sur la table profiles pour authenticated, anon et public
REVOKE UPDATE ON public.profiles FROM authenticated, anon, public;

-- 2. Accorder le droit d'UPDATE uniquement sur les colonnes de données personnelles non sensibles
GRANT UPDATE (
  full_name, 
  phone, 
  avatar_url, 
  city, 
  whatsapp, 
  wa_enabled, 
  sms_enabled, 
  email_enabled,
  wa_reminders_enabled,
  wa_draws_enabled,
  wa_invites_enabled
) 
  ON public.profiles 
  TO authenticated;

-- 3. Simplifier la politique RLS d'UPDATE pour éviter les sous-requêtes récursives complexes et les conflits de visibilité
DROP POLICY IF EXISTS "user_update_personal_fields" ON public.profiles;

CREATE POLICY "user_update_personal_fields" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);
