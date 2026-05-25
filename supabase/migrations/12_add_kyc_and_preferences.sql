-- ============================================================
-- 12. EXTENSION KYC & PRÉFÉRENCES DE RETRAIT
-- ============================================================

-- 1. Ajout des colonnes de statut KYC et de retrait automatique dans profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'unverified' CHECK (kyc_status IN ('unverified', 'pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS kyc_doc_front TEXT,
ADD COLUMN IF NOT EXISTS kyc_doc_back TEXT,
ADD COLUMN IF NOT EXISTS kyc_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS auto_withdraw BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS momo_number TEXT;

-- 2. Accorder le droit de SELECT sur toutes les colonnes de données personnelles et préférences
-- Cela évite l'erreur 42501 (Permission Denied) lors d'un select('*') du client
GRANT SELECT (
  city, 
  whatsapp, 
  wa_enabled, 
  sms_enabled, 
  email_enabled, 
  wa_reminders_enabled, 
  wa_draws_enabled, 
  wa_invites_enabled,
  kyc_status,
  kyc_doc_front,
  kyc_doc_back,
  kyc_verified_at,
  auto_withdraw,
  momo_number
) 
  ON public.profiles 
  TO authenticated, anon;

-- 3. Accorder le droit d'UPDATE sur auto_withdraw pour que l'utilisateur puisse le modifier
GRANT UPDATE (auto_withdraw) 
  ON public.profiles 
  TO authenticated;

-- 4. Ajouter la politique RLS d'INSERT sur profiles pour l'auto-création en cas d'absence
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'user_insert_own_profile'
  ) THEN
    CREATE POLICY "user_insert_own_profile" ON public.profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 5. Création du bucket 'kyc' dans Supabase Storage et configuration RLS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc', 
  'kyc', 
  true, 
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Autoriser la lecture publique des documents KYC (pour affichage admin/utilisateur)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Allow public read of KYC'
  ) THEN
    CREATE POLICY "Allow public read of KYC" ON storage.objects
      FOR SELECT USING (bucket_id = 'kyc');
  END IF;
END $$;

-- Autoriser les utilisateurs authentifiés à uploader leurs documents KYC
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Allow authenticated upload of KYC'
  ) THEN
    CREATE POLICY "Allow authenticated upload of KYC" ON storage.objects
      FOR INSERT TO authenticated WITH CHECK (bucket_id = 'kyc');
  END IF;
END $$;
