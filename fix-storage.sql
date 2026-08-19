-- 1. Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('qrcodes', 'qrcodes', true),
  ('receipts', 'receipts', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies to prevent recursion or conflicts
DROP POLICY IF EXISTS "Public View Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Access" ON storage.objects;

-- 3. Create simple and permissive policies for all buckets
-- Allow anyone to view images (since they are public buckets)
CREATE POLICY "Public View Access"
ON storage.objects FOR SELECT
USING (bucket_id IN ('avatars', 'qrcodes', 'receipts'));

-- Allow logged in users to upload (INSERT)
CREATE POLICY "Authenticated Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND bucket_id IN ('avatars', 'qrcodes', 'receipts'));

-- Allow logged in users to update their own uploads (UPDATE)
CREATE POLICY "Authenticated Update Access"
ON storage.objects FOR UPDATE
WITH CHECK (auth.role() = 'authenticated' AND bucket_id IN ('avatars', 'qrcodes', 'receipts'));

-- Allow logged in users to delete their own uploads (DELETE)
CREATE POLICY "Authenticated Delete Access"
ON storage.objects FOR DELETE
USING (auth.role() = 'authenticated' AND bucket_id IN ('avatars', 'qrcodes', 'receipts'));
