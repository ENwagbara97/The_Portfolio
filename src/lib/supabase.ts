import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Project = {
  id: string;
  title: string;
  slug: string;
  type: 'GIS' | 'UX' | 'Hybrid';
  category_tags: string[];
  client_name: string;
  project_date: string;
  short_description: string;
  case_study_content: any[];
  cover_image_url: string;
  media_gallery: any[];
  pdf_report_url: string;
  geojson_url: string;
  gis_metadata: any;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
};

export type Testimonial = {
  id: string;
  quote_text: string;
  person_name: string;
  person_role: string;
  person_company: string;
  avatar_url: string;
  star_rating: number;
  is_published: boolean;
  display_order: number;
  created_at: string;
};

export type ClientEnquiry = {
  id: string;
  full_name: string;
  email: string;
  service_interest: string;
  project_description: string;
  budget_range: string;
  read_by_admin: boolean;
  created_at: string;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  lucide_icon: string;
  is_active: boolean;
  display_order: number;
};

export type PageContent = {
  id: string;
  page: string;
  section: string;
  field_key: string;
  field_value: string | null;
  field_type: string;
  updated_at: string;
};

export type CVUpload = {
  id: string;
  file_name: string;
  file_url: string;
  is_active: boolean;
  uploaded_at: string;
};
