-- Create 'avatars' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

-- Set max file size to 50MB (52428800 bytes)
UPDATE storage.buckets 
SET file_size_limit = 52428800 
WHERE id = 'avatars';

-- Allow public access to read avatars
DROP POLICY IF EXISTS "Public Access for avatars" ON storage.objects;
CREATE POLICY "Public Access for avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars
DROP POLICY IF EXISTS "Admin Upload for avatars" ON storage.objects;
CREATE POLICY "Admin Upload for avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their avatars
DROP POLICY IF EXISTS "Admin Update for avatars" ON storage.objects;
CREATE POLICY "Admin Update for avatars" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete avatars
DROP POLICY IF EXISTS "Admin Delete for avatars" ON storage.objects;
CREATE POLICY "Admin Delete for avatars" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
