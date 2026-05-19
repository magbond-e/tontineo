-- ============================================================
-- 8. CORRECTIF RLS POUR LA CONFIGURATION DU CODE PIN
-- ============================================================

-- Remplacer la politique de mise à jour pour permettre la configuration du PIN.
-- La colonne `has_pin` est modifiée automatiquement par le trigger `tr_sync_profile_has_pin`.
-- Si on l'inclut dans le WITH CHECK, la mise à jour échoue car la valeur proposée (NEW) par le client 
-- pour has_pin (FALSE par défaut dans la requête client) sera remplacée par le trigger (TRUE), 
-- ce qui causera un conflit avec la valeur existante (SELECT has_pin) si elle était FALSE.
-- On retire donc has_pin de la politique de vérification stricte, puisque sa valeur est 
-- déjà garantie et forcée par le trigger interne sécurisé.

DROP POLICY IF EXISTS "user_update_personal_fields" ON profiles;

CREATE POLICY "user_update_personal_fields" ON profiles 
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    -- Sécurité : Empêcher le client d'altérer lui-même ces colonnes critiques
    wallet_balance IS NOT DISTINCT FROM (SELECT wallet_balance FROM profiles WHERE id = auth.uid()) AND
    trust_score IS NOT DISTINCT FROM (SELECT trust_score FROM profiles WHERE id = auth.uid()) AND
    is_locked IS NOT DISTINCT FROM (SELECT is_locked FROM profiles WHERE id = auth.uid()) AND
    current_plan IS NOT DISTINCT FROM (SELECT current_plan FROM profiles WHERE id = auth.uid()) AND
    failed_pin_attempts IS NOT DISTINCT FROM (SELECT failed_pin_attempts FROM profiles WHERE id = auth.uid())
    -- has_pin a été retiré car il est géré par le trigger sécurisé
  );
