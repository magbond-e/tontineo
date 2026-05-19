-- ============================================================
-- 7. CORRECTIFS DE SÉCURITÉ (RLS, CLS & RPC)
-- ============================================================

-- 7.0. Ajout de la colonne a_pin sécurisée pour informer le client sans exposer le code PIN
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_pin BOOLEAN DEFAULT FALSE;

-- Trigger pour synchroniser automatiquement has_pin
CREATE OR REPLACE FUNCTION public.sync_profile_has_pin()
RETURNS trigger AS $$
BEGIN
  IF NEW.pin_code IS NOT NULL THEN
    NEW.has_pin := TRUE;
  ELSE
    NEW.has_pin := FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_sync_profile_has_pin ON profiles;
CREATE TRIGGER tr_sync_profile_has_pin
BEFORE INSERT OR UPDATE OF pin_code ON profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_has_pin();

-- 7.1. Sécurisation de la table profiles
-- Suppression de l'ancienne politique own_profile trop permissive
DROP POLICY IF EXISTS "own_profile" ON profiles;

-- Politique pour permettre à l'utilisateur de lire sa propre ligne
CREATE POLICY "user_select_own_profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

-- Politique pour permettre à l'utilisateur de mettre à jour UNIQUEMENT ses données non sensibles
CREATE POLICY "user_update_personal_fields" ON profiles 
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    -- Sécurité : Empêcher le client d'altérer lui-même ces colonnes critiques
    wallet_balance IS NOT DISTINCT FROM (SELECT wallet_balance FROM profiles WHERE id = auth.uid()) AND
    trust_score IS NOT DISTINCT FROM (SELECT trust_score FROM profiles WHERE id = auth.uid()) AND
    is_locked IS NOT DISTINCT FROM (SELECT is_locked FROM profiles WHERE id = auth.uid()) AND
    current_plan IS NOT DISTINCT FROM (SELECT current_plan FROM profiles WHERE id = auth.uid()) AND
    failed_pin_attempts IS NOT DISTINCT FROM (SELECT failed_pin_attempts FROM profiles WHERE id = auth.uid()) AND
    has_pin IS NOT DISTINCT FROM (SELECT has_pin FROM profiles WHERE id = auth.uid())
  );

-- 7.2. Sécurité de Visibilité des Colonnes (Column-Level Security)
-- Révoquer toutes les permissions SELECT existantes sur profiles pour authenticated et anon
REVOKE SELECT ON public.profiles FROM authenticated, anon, public;

-- Ré-accorder le droit de SELECT uniquement sur les colonnes non sensibles de profiles
GRANT SELECT (id, full_name, phone, avatar_url, trust_score, created_at, updated_at, wallet_balance, is_locked, current_plan, has_pin) 
  ON public.profiles 
  TO authenticated, anon;

-- 7.3. Sécurisation de la fonction d'incrémentation du Pot (RPC)
-- S'assurer que la fonction existe d'abord pour éviter l'erreur 42883 si exécutée hors ordre
CREATE OR REPLACE FUNCTION public.increment_cycle_pot(p_cycle_id UUID, p_amount BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.cycles 
  SET pot_amount = pot_amount + p_amount 
  WHERE id = p_cycle_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Retirer l'accès public par défaut
REVOKE EXECUTE ON FUNCTION public.increment_cycle_pot(UUID, BIGINT) FROM public, anon, authenticated;
-- Autoriser uniquement le rôle service_role (Admin / API Route)
GRANT EXECUTE ON FUNCTION public.increment_cycle_pot(UUID, BIGINT) TO service_role;

-- 7.4. Verrouiller la table des paiements
-- Remplacer user_inserts_own_payments par une politique stricte
DROP POLICY IF EXISTS "user_inserts_own_payments" ON public.payments;

CREATE POLICY "user_inserts_own_pending_payments" ON public.payments 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND status = 'pending' -- Autorise le client à insérer uniquement en statut "pending"
  );
