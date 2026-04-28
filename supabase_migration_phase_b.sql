-- Drop constraints or old tables if re-running
-- (Uncomment if you want to wipe it completely, but usually we just CREATE IF NOT EXISTS)

-- 1. Page content (every editable text block on every page)
CREATE TABLE IF NOT EXISTS page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,           -- 'home', 'projects', 'gis_lab', 'contact'
  section text NOT NULL,        -- 'hero', 'stats', 'cta_banner', 'footer', etc.
  field_key text NOT NULL,      -- 'headline', 'subtext', 'button_label', etc.
  field_value text,             -- the actual content
  field_type text DEFAULT 'text', -- 'text', 'textarea', 'url', 'number'
  updated_at timestamptz DEFAULT now(),
  UNIQUE(page, section, field_key)
);

-- 2. CV / Resume file
CREATE TABLE IF NOT EXISTS cv_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_url text NOT NULL,       -- Supabase Storage URL
  is_active bool DEFAULT true,  -- only one active at a time
  uploaded_at timestamptz DEFAULT now()
);

-- Turn on Row Level Security and allow public reads
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_uploads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read-only access on page_content" ON page_content;
CREATE POLICY "Allow public read-only access on page_content" 
  ON page_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read-only access on cv_uploads" ON cv_uploads;
CREATE POLICY "Allow public read-only access on cv_uploads" 
  ON cv_uploads FOR SELECT USING (true);

-- 3. Migration of existing old data (Skipped: table 'pagecontent' not found)
-- INSERT INTO page_content (page, section, field_key, field_value, field_type)
-- SELECT page, section, fieldkey, fieldvalue, fieldtype
-- FROM pagecontent
-- ON CONFLICT (page, section, field_key) DO NOTHING;

-- 4. Insert Seed Data
INSERT INTO page_content (page, section, field_key, field_value, field_type) VALUES
-- HOME PAGE: hero section
('home', 'hero', 'terminal_line_1', 'status: available_for_hire', 'text'),
('home', 'hero', 'terminal_line_2', 'location: Port_Harcourt, NG', 'text'),
('home', 'hero', 'terminal_line_3', 'expertise: [GIS, UX_Design, Spatial_Systems]', 'text'),
('home', 'hero', 'terminal_line_4', 'focus: Humanizing_Geospatial_Data', 'text'),
('home', 'hero', 'headline_part1', 'Cartographer of Systems.', 'text'),
('home', 'hero', 'headline_part2', 'Architect of Experiences.', 'text'),
('home', 'hero', 'subtext', 'I build geospatial intelligence tools and human-centered digital products — merging spatial science with interaction design.', 'textarea'),
('home', 'hero', 'cta_primary_label', 'View My Work', 'text'),
('home', 'hero', 'cta_secondary_label', 'Download CV', 'text'),
('home', 'hero', 'pill_1', 'ArcGIS Pro · Python · React', 'text'),
('home', 'hero', 'pill_2', 'GIS + UX Design', 'text'),
('home', 'hero', 'pill_3', 'Port Harcourt, NG', 'text'),

-- HOME PAGE: stats section
('home', 'stats', 'stat_1_value', '5', 'number'),
('home', 'stats', 'stat_1_label', 'Years of Spatial Analysis', 'text'),
('home', 'stats', 'stat_2_value', '10', 'number'),
('home', 'stats', 'stat_2_label', 'GIS & UX Projects', 'text'),
('home', 'stats', 'stat_3_value', '4', 'number'),
('home', 'stats', 'stat_3_label', 'Technical Tools', 'text'),
('home', 'stats', 'stat_4_value', '100', 'number'),
('home', 'stats', 'stat_4_suffix', '%', 'text'),
('home', 'stats', 'stat_4_label', 'Portfolio Quality', 'text'),

-- HOME PAGE: featured_work & cta_banner
('home', 'featured_work', 'section_title', 'Featured Work', 'text'),
('home', 'cta_banner', 'headline', 'Ready to Work Together?', 'text'),
('home', 'cta_banner', 'subtext', 'I''m available for new projects, consultations, and collaboration opportunities.', 'textarea'),
('home', 'cta_banner', 'button_label', 'Get in Touch', 'text'),

-- HOME PAGE: nav
('home', 'nav', 'live_status_text', 'Live Status', 'text'),

-- CONTACT PAGE: services
('contact', 'services', 'service_1_title', 'Spatial Analysis & GIS Mapping', 'text'),
('contact', 'services', 'service_1_description', 'Transforming raw geodata into operational maps.', 'textarea'),
('contact', 'services', 'service_2_title', 'UX Design & Prototyping', 'text'),
('contact', 'services', 'service_2_description', 'Research-backed interfaces for complex tools.', 'textarea'),
('contact', 'services', 'service_3_title', 'Automated Spatial Pipelines', 'text'),
('contact', 'services', 'service_3_description', 'Building ModelBuilder and Python workflows.', 'textarea'),

-- CONTACT PAGE: contact_info & form
('contact', 'contact_info', 'email', 'hello@ebubechukwu.sh', 'text'),
('contact', 'contact_info', 'phone', '+234 800 000 0000', 'text'),
('contact', 'contact_info', 'linkedin_url', 'https://linkedin.com/...', 'url'),
('contact', 'contact_info', 'github_url', 'https://github.com/...', 'url'),
('contact', 'contact_form', 'headline', 'Discuss your project.', 'text'),
('contact', 'contact_form', 'subtext', 'Fill this out.', 'textarea'),

-- FOOTER: footer
('footer', 'footer', 'bio_tagline', 'Cartographer of Systems. Architect of Experiences.', 'text'),
('footer', 'footer', 'copyright_text', '© 2024 Ebubechukwu Nwagbara. All rights reserved.', 'text'),
('footer', 'footer', 'email', 'hello@ebubechukwu.sh', 'text'),
('footer', 'footer', 'phone', '+234 800 000 0000', 'text'),
('footer', 'footer', 'linkedin_url', 'https://linkedin.com/...', 'url'),
('footer', 'footer', 'github_url', 'https://github.com/...', 'url'),

-- GLOBAL: global
('global', 'global', 'owner_full_name', 'Ebubechukwu Nwagbara', 'text'),
('global', 'global', 'owner_handle', 'EBUBE_CHUKWU.sh', 'text'),
('global', 'global', 'meta_title', 'Ebubechukwu Nwagbara - GIS Developer & UX Designer', 'text'),
('global', 'global', 'meta_description', 'Building geospatial intelligence tools and human-centered digital products.', 'textarea')
ON CONFLICT (page, section, field_key)
DO UPDATE SET
  field_value = EXCLUDED.field_value,
  field_type = EXCLUDED.field_type;
