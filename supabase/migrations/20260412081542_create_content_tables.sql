/*
  # Create Content Management Tables

  1. New Tables
    - `page_content` - Editable text content for all pages
    - `cv_uploads` - CV/Resume file management
    - `gis_folders` - GIS Lab folder structure

  2. Security
    - Enable RLS on all tables
    - Public read access for page_content and cv_uploads
    - Admin-only write access for page_content and cv_uploads
*/

CREATE TABLE IF NOT EXISTS page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  section text NOT NULL,
  field_key text NOT NULL,
  field_value text,
  field_type text DEFAULT 'text',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(page, section, field_key)
);

CREATE TABLE IF NOT EXISTS cv_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_url text NOT NULL,
  is_active boolean DEFAULT true,
  uploaded_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gis_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_name text NOT NULL UNIQUE,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE gis_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read page content"
  ON page_content FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update page content"
  ON page_content FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'))
  WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'));

CREATE POLICY "Authenticated users can insert page content"
  ON page_content FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'));

CREATE POLICY "Public can read cv uploads"
  ON cv_uploads FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage cv uploads"
  ON cv_uploads FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'))
  WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'));

CREATE POLICY "Public can read gis folders"
  ON gis_folders FOR SELECT
  USING (true);
