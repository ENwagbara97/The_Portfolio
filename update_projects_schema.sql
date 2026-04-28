-- Add the case_study_html column to store the rendered content for public viewing
-- and ensure the media_gallery column exists.
ALTER TABLE projects 
  ADD COLUMN IF NOT EXISTS case_study_html text,
  ADD COLUMN IF NOT EXISTS media_gallery jsonb DEFAULT '[]';

-- Update types if needed (Supabase usually handles jsonb automatically)
COMMENT ON COLUMN projects.case_study_html IS 'Rendered HTML output from TipTap editor';
COMMENT ON COLUMN projects.case_study_content IS 'Raw JSON output from TipTap editor';
