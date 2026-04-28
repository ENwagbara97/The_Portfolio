-- ==============================================================================
-- EBUBE_CHUKWU.sh // Storage Bucket Initialization & RLS Policies
-- Execute this script in your Supabase SQL Editor
-- ==============================================================================

-- 1. Create Buckets (if they don't exist)
INSERT INTO storage.buckets (id, name, public) VALUES ('cv-uploads', 'cv-uploads', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('project-covers', 'project-covers', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('project-pdfs', 'project-pdfs', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('project-media', 'project-media', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- 2. Configure RLS Policies for cv-uploads
DROP POLICY IF EXISTS "Public Access for cv-uploads" ON storage.objects;
CREATE POLICY "Public Access for cv-uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'cv-uploads');

DROP POLICY IF EXISTS "Admin Upload for cv-uploads" ON storage.objects;
CREATE POLICY "Admin Upload for cv-uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'cv-uploads' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Update for cv-uploads" ON storage.objects;
CREATE POLICY "Admin Update for cv-uploads" ON storage.objects
  FOR UPDATE USING (bucket_id = 'cv-uploads' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Delete for cv-uploads" ON storage.objects;
CREATE POLICY "Admin Delete for cv-uploads" ON storage.objects
  FOR DELETE USING (bucket_id = 'cv-uploads' AND auth.role() = 'authenticated');

-- 3. Configure RLS Policies for project-covers
DROP POLICY IF EXISTS "Public Access for project-covers" ON storage.objects;
CREATE POLICY "Public Access for project-covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-covers');

DROP POLICY IF EXISTS "Admin Upload for project-covers" ON storage.objects;
CREATE POLICY "Admin Upload for project-covers" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'project-covers' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Update for project-covers" ON storage.objects;
CREATE POLICY "Admin Update for project-covers" ON storage.objects
  FOR UPDATE USING (bucket_id = 'project-covers' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Delete for project-covers" ON storage.objects;
CREATE POLICY "Admin Delete for project-covers" ON storage.objects
  FOR DELETE USING (bucket_id = 'project-covers' AND auth.role() = 'authenticated');

-- 4. Configure RLS Policies for project-pdfs
DROP POLICY IF EXISTS "Public Access for project-pdfs" ON storage.objects;
CREATE POLICY "Public Access for project-pdfs" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-pdfs');

DROP POLICY IF EXISTS "Admin Upload for project-pdfs" ON storage.objects;
CREATE POLICY "Admin Upload for project-pdfs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'project-pdfs' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Update for project-pdfs" ON storage.objects;
CREATE POLICY "Admin Update for project-pdfs" ON storage.objects
  FOR UPDATE USING (bucket_id = 'project-pdfs' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Delete for project-pdfs" ON storage.objects;
CREATE POLICY "Admin Delete for project-pdfs" ON storage.objects
  FOR DELETE USING (bucket_id = 'project-pdfs' AND auth.role() = 'authenticated');

-- 5. Configure RLS Policies for project-media
DROP POLICY IF EXISTS "Public Access for project-media" ON storage.objects;
CREATE POLICY "Public Access for project-media" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-media');

DROP POLICY IF EXISTS "Admin Upload for project-media" ON storage.objects;
CREATE POLICY "Admin Upload for project-media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'project-media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Update for project-media" ON storage.objects;
CREATE POLICY "Admin Update for project-media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'project-media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Delete for project-media" ON storage.objects;
CREATE POLICY "Admin Delete for project-media" ON storage.objects
  FOR DELETE USING (bucket_id = 'project-media' AND auth.role() = 'authenticated');

-- 6. Configure RLS Policies for avatars
DROP POLICY IF EXISTS "Public Access for avatars" ON storage.objects;
CREATE POLICY "Public Access for avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Admin Upload for avatars" ON storage.objects;
CREATE POLICY "Admin Upload for avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Update for avatars" ON storage.objects;
CREATE POLICY "Admin Update for avatars" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Delete for avatars" ON storage.objects;
CREATE POLICY "Admin Delete for avatars" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Done! Your storage infrastructure is fully configured.
