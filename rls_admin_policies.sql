-- =============================================
-- GAP-02: RLS Write Policies for Authenticated Admin
-- Run this in Supabase SQL Editor
-- =============================================
-- These policies ensure only authenticated users can write to admin tables.
-- Public READ is already granted; this adds authenticated-only WRITE guards.

-- ── page_content ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow admin write on page_content" ON page_content;
CREATE POLICY "Allow admin write on page_content"
  ON page_content
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ── cv_uploads ────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow admin write on cv_uploads" ON cv_uploads;
CREATE POLICY "Allow admin write on cv_uploads"
  ON cv_uploads
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ── site_settings ─────────────────────────────────────────────
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on site_settings" ON site_settings;
CREATE POLICY "Allow public read on site_settings"
  ON site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin write on site_settings" ON site_settings;
CREATE POLICY "Allow admin write on site_settings"
  ON site_settings
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ── projects ──────────────────────────────────────────────────
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on projects" ON projects;
CREATE POLICY "Allow public read on projects"
  ON projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin write on projects" ON projects;
CREATE POLICY "Allow admin write on projects"
  ON projects
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ── testimonials ──────────────────────────────────────────────
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on testimonials" ON testimonials;
CREATE POLICY "Allow public read on testimonials"
  ON testimonials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin write on testimonials" ON testimonials;
CREATE POLICY "Allow admin write on testimonials"
  ON testimonials
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ── client_enquiries ──────────────────────────────────────────
ALTER TABLE client_enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert on client_enquiries" ON client_enquiries;
CREATE POLICY "Allow public insert on client_enquiries"
  ON client_enquiries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select on client_enquiries" ON client_enquiries;
CREATE POLICY "Allow public select on client_enquiries"
  ON client_enquiries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin update/delete on client_enquiries" ON client_enquiries;
CREATE POLICY "Allow admin update/delete on client_enquiries"
  ON client_enquiries
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ── gis_folders ───────────────────────────────────────────────
ALTER TABLE gis_folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on gis_folders" ON gis_folders;
CREATE POLICY "Allow public read on gis_folders"
  ON gis_folders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin write on gis_folders" ON gis_folders;
CREATE POLICY "Allow admin write on gis_folders"
  ON gis_folders
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ── Storage Buckets ───────────────────────────────────────────
-- Run these in the Supabase Dashboard → Storage → Policies
-- Or via SQL:

-- project-covers bucket: public read, auth write
INSERT INTO storage.buckets (id, name, public)
  VALUES ('project-covers', 'project-covers', true)
  ON CONFLICT (id) DO UPDATE SET public = true;
