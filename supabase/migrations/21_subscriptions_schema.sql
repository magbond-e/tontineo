-- ============================================================
-- 21. SUBSCRIPTIONS — Historique des abonnements payants
-- ============================================================

-- Table principale pour tracer chaque paiement d'abonnement
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan            TEXT NOT NULL CHECK (plan IN ('pro', 'business')),
  amount          BIGINT NOT NULL CHECK (amount > 0),
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  fedapay_tx_id   TEXT UNIQUE,
  started_at      TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent lire leurs propres abonnements
CREATE POLICY "own_subscriptions_select" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Colonnes supplémentaires sur profiles pour gérer l'expiration
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS plan_renewed_at TIMESTAMPTZ;

-- Permettre aux utilisateurs de lire ces colonnes
GRANT SELECT (plan_expires_at, plan_renewed_at) ON public.profiles TO authenticated, anon;

-- Index pour les requêtes d'expiration (cron job futur)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_profiles_plan_expires ON public.profiles(plan_expires_at) WHERE plan_expires_at IS NOT NULL;

-- ============================================================
-- Prix des plans (constantes de référence en commentaire)
-- Pro     : 2 000 XOF / mois
-- Business: 5 000 XOF / mois
-- ============================================================
