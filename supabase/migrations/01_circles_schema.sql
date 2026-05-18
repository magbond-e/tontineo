-- ============================================================
-- 0. PROFILS UTILISATEURS (Table Principale)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id                UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name         TEXT,
  phone             TEXT UNIQUE,
  avatar_url        TEXT,
  trust_score       INTEGER DEFAULT 50 CHECK (trust_score BETWEEN 0 AND 100),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_profile" ON profiles FOR ALL USING (auth.uid() = id);

-- Les profils publics (pour l'affichage des membres)
CREATE POLICY "public_profiles" ON profiles FOR SELECT USING (true);

-- Trigger pour créer le profil automatiquement lors de l'inscription (Auth Supabase)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, avatar_url)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 
    new.phone,
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill pour les utilisateurs existants qui n'ont pas encore de profil
INSERT INTO public.profiles (id, full_name, phone, avatar_url)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)),
  phone,
  raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 1. CERCLES DE TONTINE
-- ============================================================
-- ============================================================
CREATE TABLE IF NOT EXISTS circles (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id      UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name              TEXT NOT NULL,
  description       TEXT,
  icon_emoji        TEXT DEFAULT '💰',
  frequency         TEXT NOT NULL CHECK (frequency IN ('Journalier','Hebdomadaire','Mensuel','Annuel')),
  amount            BIGINT NOT NULL CHECK (amount > 0),  -- En FCFA
  max_members       INTEGER NOT NULL CHECK (max_members BETWEEN 2 AND 200),
  current_members   INTEGER DEFAULT 0,
  draw_type         TEXT NOT NULL CHECK (draw_type IN ('Aléatoire IA','Liste Fixe')),
  late_penalty_pct  INTEGER DEFAULT 0,    -- % pénalité sur retard (ou montant fixe selon implémentation)
  status            TEXT DEFAULT 'En attente' CHECK (status IN ('En attente','En cours','Terminés')),
  pot_collected     BIGINT DEFAULT 0,
  pot_target        BIGINT DEFAULT 0,
  invite_token      TEXT UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. MEMBERSHIPS (table de jonction)
-- ============================================================
CREATE TABLE IF NOT EXISTS memberships (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id       UUID REFERENCES circles(id) ON DELETE CASCADE NOT NULL,
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status          TEXT DEFAULT 'active' CHECK (status IN ('pending','active','suspended','left')),
  role            TEXT DEFAULT 'member' CHECK (role IN ('member','co-organizer')),
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(circle_id, user_id)
);

-- ============================================================
-- 3. ROW LEVEL SECURITY — ACTIVATION
-- ============================================================
ALTER TABLE circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3.5. SECURITY DEFINER HELPER FUNCTIONS FOR RLS (Prevents infinite recursion)
-- ============================================================

-- Fonction pour vérifier si un utilisateur est membre d'un cercle (bypasse RLS)
CREATE OR REPLACE FUNCTION public.check_is_circle_member(p_circle_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.memberships 
    WHERE circle_id = p_circle_id AND user_id = p_user_id AND status IN ('active', 'pending')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un utilisateur est l'organisateur d'un cercle (bypasse RLS)
CREATE OR REPLACE FUNCTION public.check_is_circle_organizer(p_circle_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.circles 
    WHERE id = p_circle_id AND organizer_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 4. POLICIES RLS
-- ============================================================

-- Circles : organisateur = tout (CRUD)
CREATE POLICY "organizer_manages_circle" ON circles
  FOR ALL USING (auth.uid() = organizer_id);

-- Circles : Les membres peuvent lire les détails de leur cercle
CREATE POLICY "members_see_circle" ON circles
  FOR SELECT USING (
    public.check_is_circle_member(id, auth.uid())
  );

-- Memberships : Chacun peut voir/gérer ses propres adhésions
CREATE POLICY "own_membership" ON memberships
  FOR ALL USING (auth.uid() = user_id);

-- Memberships : L'organisateur peut voir et gérer les membres de son cercle
CREATE POLICY "organizer_manages_memberships" ON memberships
  FOR ALL USING (
    public.check_is_circle_organizer(circle_id, auth.uid())
  );

-- Memberships : Les membres d'un même cercle peuvent se voir
CREATE POLICY "co_members_see_memberships" ON memberships
  FOR SELECT USING (
    public.check_is_circle_member(circle_id, auth.uid())
  );
