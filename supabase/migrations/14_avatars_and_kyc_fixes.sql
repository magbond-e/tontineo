-- 1. Add kyc_doc_type to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS kyc_doc_type TEXT;

-- 2. Grant SELECT on the new column
GRANT SELECT (kyc_doc_type) ON public.profiles TO authenticated, anon;

-- 3. Create 'avatars' bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true, 
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 4. Allow public read of avatars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Allow public read of avatars'
  ) THEN
    CREATE POLICY "Allow public read of avatars" ON storage.objects
      FOR SELECT USING (bucket_id = 'avatars');
  END IF;
END $$;

-- 5. Allow authenticated users to manage their avatars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Allow authenticated upload of avatars'
  ) THEN
    CREATE POLICY "Allow authenticated upload of avatars" ON storage.objects
      FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Allow authenticated update of avatars'
  ) THEN
    CREATE POLICY "Allow authenticated update of avatars" ON storage.objects
      FOR UPDATE TO authenticated USING (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Allow authenticated delete of avatars'
  ) THEN
    CREATE POLICY "Allow authenticated delete of avatars" ON storage.objects
      FOR DELETE TO authenticated USING (bucket_id = 'avatars');
  END IF;
END $$;
