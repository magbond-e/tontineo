-- ============================================================
-- 4. EXTENSION DES PROFILS & PORTEFEUILLE
-- ============================================================

-- 4.1. Ajout des colonnes de portefeuille et sécurité
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS wallet_balance BIGINT DEFAULT 0 CHECK (wallet_balance >= 0),
ADD COLUMN IF NOT EXISTS pin_code TEXT,
ADD COLUMN IF NOT EXISTS failed_pin_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS current_plan TEXT DEFAULT 'free' CHECK (current_plan IN ('free', 'pro', 'business'));

-- 4.2. Historique des transactions du portefeuille (Recharges, Retraits, Transferts)
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount            BIGINT NOT NULL CHECK (amount > 0),
  type              TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  description       TEXT,
  reference         TEXT UNIQUE, -- ex: id transaction fedapay
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  completed_at      TIMESTAMPTZ
);

ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres transactions de portefeuille
CREATE POLICY "own_wallet_tx" ON wallet_transactions FOR SELECT USING (auth.uid() = user_id);
-- (L'insertion se fera via les APIs en backend ou service_role pour sécuriser le solde)
