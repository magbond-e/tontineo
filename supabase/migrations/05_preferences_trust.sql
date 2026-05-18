-- ============================================================
-- 05_PREFERENCES_TRUST.SQL
-- Migration pour la gestion 100% BDD des paramètres et de la confiance
-- ============================================================

-- 1. Ajout des préférences et informations directement dans le profil utilisateur
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS wa_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- 2. Création de la table Historique des impacts de confiance (trust_events)
CREATE TABLE IF NOT EXISTS trust_events (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  circle_id   UUID REFERENCES circles(id),
  event_type  TEXT NOT NULL,
  points      INTEGER NOT NULL,
  score_before INTEGER NOT NULL,
  score_after  INTEGER NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Activation de RLS sur trust_events
ALTER TABLE trust_events ENABLE ROW LEVEL SECURITY;

-- Politique de sécurité : l'utilisateur peut voir ses propres événements
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'trust_events' AND policyname = 'own_trust_events'
    ) THEN
        CREATE POLICY "own_trust_events" ON trust_events
        FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;
