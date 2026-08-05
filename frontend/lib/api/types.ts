export type UserRole = "user" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Document {
  id: number;
  original_filename: string;
  upload_date: string;
  status: string;
  document_type: string | null;
  confidence_score: number | null;
  raw_text: string | null;
}

export interface ExtractedField {
  id: number;
  document_id: number;
  field_name: string;
  field_value: string | null;
  is_verified: boolean;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  created_at: string | null;
  is_read: boolean;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}
