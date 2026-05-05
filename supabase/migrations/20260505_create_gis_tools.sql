-- Create the gis_tools table
CREATE TABLE IF NOT EXISTS gis_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,                    -- e.g. 'HEAT ISLAND DETECTION'
  description text,                       -- tool description paragraph
  tool_logic_url text,                    -- the URL for ACCESS_TOOL_LOGIC link
  icon_name text DEFAULT 'Database',      -- Lucide icon name string
  category text,                          -- 'Urban Planning' | 'Environmental' | 'Hydrography'
  is_active bool DEFAULT true,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS: public SELECT, authenticated write
ALTER TABLE gis_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read gis_tools"
  ON gis_tools FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Admin can manage gis_tools"
  ON gis_tools FOR ALL TO authenticated USING (true);

-- Seed with current hardcoded values
INSERT INTO gis_tools (title, description, tool_logic_url, icon_name, category, display_order) VALUES
  ('HEAT ISLAND DETECTION',
   'Processing thermal bands to map urban temperature deltas and microclimate zones.',
   '#', 'Thermometer', 'Urban Planning', 1),
  ('NDVI VEGETATION INDEX',
   'Analyzing multispectral reflectance to determine biomass health and agricultural output.',
   '#', 'Leaf', 'Environmental', 2),
  ('HYDROGRAPHIC ANALYSIS',
   'Subsurface terrain modeling and drainage basin calculation via automated DEM processing.',
   '#', 'Droplets', 'Hydrography', 3);
