-- ============================================================
-- 06_NOTIFICATIONS_SCHEMA.SQL
-- Migration pour la gestion des notifications réelles et préférences
-- ============================================================

-- 1. Ajout des sous-colonnes de préférences de notifications WhatsApp si elles n'existent pas
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS wa_reminders_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS wa_draws_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS wa_invites_enabled BOOLEAN DEFAULT TRUE;

-- 2. Création de la table des notifications réelles
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  unread      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Activation de RLS sur la table des notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politique d'accès RLS pour les notifications
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' AND policyname = 'own_notifications'
    ) THEN
        CREATE POLICY "own_notifications" ON public.notifications
        FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;
