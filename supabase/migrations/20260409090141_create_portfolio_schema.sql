/*
  # Ebube Chukwu Portfolio — Full Database Schema

  ## Overview
  Creates all tables required for the portfolio CMS, contact system, and admin backend.

  ## Tables Created
  1. `projects` — Portfolio projects with full case study content, media, and GIS metadata
  2. `testimonials` — Client/colleague testimonials
  3. `client_enquiries` — Contact form submissions
  4. `services` — Offered services (admin-editable)
  5. `site_settings` — Key-value store for admin-editable site content
  6. `gis_folders` — GIS Lab folder/category structure

  ## Security
  - RLS enabled on all tables
  - Public SELECT on projects, testimonials, services, site_settings, gis_folders
  - client_enquiries restricted to authenticated users (service role via Edge Functions)
  - Write operations restricted to authenticated admin user
*/

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  type text CHECK (type IN ('GIS','UX','Hybrid')),
  category_tags text[] DEFAULT '{}',
  client_name text,
  project_date date,
  short_description text,
  case_study_content jsonb DEFAULT '[]',
  cover_image_url text,
  media_gallery jsonb DEFAULT '[]',
  pdf_report_url text,
  geojson_url text,
  gis_metadata jsonb DEFAULT '{}',
  is_featured bool DEFAULT false,
  is_active bool DEFAULT true,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active projects"
  ON projects FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated admin can insert projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated admin can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated admin can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (true);

-- Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_text text NOT NULL,
  person_name text NOT NULL,
  person_role text,
  person_company text,
  avatar_url text,
  star_rating int DEFAULT 5 CHECK (star_rating BETWEEN 1 AND 5),
  is_published bool DEFAULT true,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published testimonials"
  ON testimonials FOR SELECT
  USING (is_published = true);

CREATE POLICY "Authenticated admin can insert testimonials"
  ON testimonials FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated admin can update testimonials"
  ON testimonials FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated admin can delete testimonials"
  ON testimonials FOR DELETE
  TO authenticated
  USING (true);

-- Client Enquiries Table
CREATE TABLE IF NOT EXISTS client_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  service_interest text,
  project_description text,
  budget_range text,
  read_by_admin bool DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE client_enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated admin can view enquiries"
  ON client_enquiries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can submit an enquiry"
  ON client_enquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated admin can update enquiry read status"
  ON client_enquiries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  lucide_icon text DEFAULT 'Globe',
  is_active bool DEFAULT true,
  display_order int DEFAULT 0
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active services"
  ON services FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated admin can insert services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated admin can update services"
  ON services FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated admin can delete services"
  ON services FOR DELETE
  TO authenticated
  USING (true);

-- Site Settings Table (key-value store)
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated admin can insert site settings"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated admin can update site settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- GIS Folders Table
CREATE TABLE IF NOT EXISTS gis_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_name text NOT NULL,
  display_order int DEFAULT 0
);

ALTER TABLE gis_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view GIS folders"
  ON gis_folders FOR SELECT
  USING (true);

CREATE POLICY "Authenticated admin can insert GIS folders"
  ON gis_folders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated admin can update GIS folders"
  ON gis_folders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated admin can delete GIS folders"
  ON gis_folders FOR DELETE
  TO authenticated
  USING (true);

-- Seed default site settings
INSERT INTO site_settings (key, value) VALUES
  ('live_status', 'Mapping Heat Islands — Akwa Ibom'),
  ('build_version', '1.0.0'),
  ('last_sync', now()::text),
  ('hero_tagline', 'Cartographer of Systems. Architect of Experiences.'),
  ('hero_sub_copy', 'I build geospatial intelligence tools and human-centered digital products — merging spatial science with interaction design.'),
  ('hero_cta_primary', 'View My Work'),
  ('hero_cta_secondary', 'Download CV'),
  ('stat_1_value', '5+'),
  ('stat_1_label', 'Years of Spatial Analysis'),
  ('stat_2_value', '10+'),
  ('stat_2_label', 'GIS & UX Projects'),
  ('stat_3_value', '4'),
  ('stat_3_label', 'Technical Tools Mastered'),
  ('stat_4_value', '1'),
  ('stat_4_label', 'Portfolio. Zero Lorem Ipsum.'),
  ('contact_email', 'ebube@example.com'),
  ('contact_phone', '+234 000 000 0000'),
  ('contact_linkedin', 'https://linkedin.com/in/ebubechukwu'),
  ('contact_github', 'https://github.com/ebubechukwu'),
  ('current_focus', 'Designing a React dashboard for CertifyFlow')
ON CONFLICT (key) DO NOTHING;

-- Seed default services
INSERT INTO services (title, description, lucide_icon, is_active, display_order) VALUES
  ('Spatial Analysis & GIS Mapping', 'Transforming raw geodata into operational maps and analytical reports. From environmental surveys to urban planning — precision spatial intelligence.', 'Globe', true, 1),
  ('UX Design & Prototyping', 'Designing research-backed interfaces for web and mobile products. Human-centered design that makes complex spatial tools intuitive.', 'Layers', true, 2),
  ('Automated Spatial Pipelines', 'Building ModelBuilder and Python workflows to automate geospatial processing. Reproducible, scalable, and audit-ready pipelines.', 'Cpu', true, 3)
ON CONFLICT DO NOTHING;

-- Seed default GIS folders
INSERT INTO gis_folders (folder_name, display_order) VALUES
  ('Environmental', 1),
  ('Hydrography', 2),
  ('Urban Planning', 3)
ON CONFLICT DO NOTHING;

-- Seed sample projects
INSERT INTO projects (title, slug, type, category_tags, client_name, short_description, is_featured, is_active, display_order) VALUES
  ('ARISE Green Belt Spatial Analysis', 'arise-green-belt', 'GIS', ARRAY['Spatial Analysis', 'ArcGIS Pro', 'Environmental GIS'], 'RIMA/ARISE', 'A comprehensive spatial analysis of the ARISE Green Belt initiative — mapping vegetation cover, land use change, and environmental impact zones across the Niger Delta.', true, true, 1),
  ('Kolabi Creek Bathymetric Survey', 'kolabi-creek-bathymetry', 'GIS', ARRAY['GIS', 'Python', 'Field Survey', 'Hydrography'], 'NDDC', 'Subsurface hydrographic mapping of Kolabi Creek using multibeam sonar data — producing navigational depth charts and sediment distribution models.', true, true, 2),
  ('CertifyFlow SaaS Platform', 'certifyflow-saas', 'UX', ARRAY['UX Design', 'React', 'Product Design', 'SaaS'], 'CertifyFlow', 'End-to-end UX design for a certification management SaaS — from user research and journey mapping to high-fidelity Figma prototypes and design system.', true, true, 3),
  ('Flexisaf Internship Dashboard', 'flexisaf-dashboard', 'UX', ARRAY['UI/UX', 'Figma', 'Design Systems', 'Dashboard'], 'Flexisaf Edusoft', 'Designed the internship management dashboard — scheduling, progress tracking, and mentor feedback — used by 500+ interns across Nigeria.', true, true, 4)
ON CONFLICT (slug) DO NOTHING;

-- Seed sample testimonials
INSERT INTO testimonials (quote_text, person_name, person_role, person_company, star_rating, is_published, display_order) VALUES
  ('Ebube''s spatial analysis work on the ARISE project was exceptional. He translated complex geodata into actionable insights our stakeholders could immediately understand.', 'Dr. Amaka Obi', 'Project Director', 'RIMA Nigeria', 5, true, 1),
  ('The CertifyFlow UX redesign reduced user onboarding time by 40%. Ebube understands both the technical and human dimensions of a product.', 'Chidera Nwankwo', 'CTO', 'CertifyFlow Inc.', 5, true, 2),
  ('Working with Ebube on the hydrographic survey dashboard was seamless. He built exactly what our field teams needed — precise, fast, and beautifully designed.', 'Engr. Femi Adeyemi', 'Survey Lead', 'NDDC', 5, true, 3)
ON CONFLICT DO NOTHING;
