export interface Project {
  id: string;
  title: string;
  slug: string;
  type: 'GIS' | 'UX' | 'Hybrid';
  category_tags: string[];
  client_name: string | null;
  project_date: string | null;
  short_description: string | null;
  case_study_content: any;
  case_study_html: string | null;
  cover_image_url: string | null;
  media_gallery: MediaItem[];
  pdf_report_url: string | null;
  geojson_url: string | null;
  gis_metadata: GISMetadata;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface CaseStudyModule {
  phase: string;
  title: string;
  content: string;
  images?: string[];
  code?: string;
}

export interface MediaItem {
  url: string;
  type: 'image' | 'video' | 'pdf';
  caption?: string;
}

export interface GISMetadata {
  coordinate_system?: string;
  data_points?: number;
  tools?: string[];
}

export interface Testimonial {
  id: string;
  quote_text: string;
  person_name: string;
  person_role: string | null;
  person_company: string | null;
  avatar_url: string | null;
  star_rating: number;
  is_published: boolean;
  display_order: number;
  created_at: string;
}

export interface ClientEnquiry {
  id: string;
  full_name: string;
  email: string;
  service_interest: string | null;
  project_description: string | null;
  budget_range: string | null;
  read_by_admin: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  title: string;
  description: string | null;
  lucide_icon: string;
  is_active: boolean;
  display_order: number;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  updated_at: string;
}

export interface GISFolder {
  id: string;
  folder_name: string;
  display_order: number;
}

export interface PageContent {
  id: string;
  page: string;
  section: string;
  field_key: string;
  field_value: string | null;
  field_type: string;
  updated_at: string;
}

export interface CVUpload {
  id: string;
  file_name: string;
  file_url: string;
  is_active: boolean;
  uploaded_at: string;
}
