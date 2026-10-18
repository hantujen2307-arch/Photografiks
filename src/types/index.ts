export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface PackageItem {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  image_url?: string;
  price: number;
  duration_minutes: number;
  photo_count_text: string;
  features: string[];
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: 'Portrait' | 'Couple' | 'Graduation' | 'Family' | 'Event' | 'Editorial';
  image_url: string;
  storage_path?: string;
  description?: string;
  is_featured: boolean;
  sort_order: number;
  created_at?: string;
}

export interface Booking {
  id: string;
  booking_reference: string;
  customer_name: string;
  customer_whatsapp: string;
  customer_email?: string;
  package_id: string;
  package?: PackageItem;
  session_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  session_location: string;
  notes?: string;
  total_price: number;
  status: BookingStatus;
  admin_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BusinessHours {
  id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  is_open: boolean;
  open_time: string;
  close_time: string;
  slot_interval_minutes: number;
}

export interface BlockedDate {
  id: string;
  blocked_date: string;
  reason?: string;
  created_at?: string;
}

export interface BlockedSlot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  reason?: string;
  created_at?: string;
}

export interface SiteSettings {
  id?: string;
  hero_headline: string;
  hero_subheadline: string;
  hero_image_url?: string;
  hero_secondary_image_url?: string;
  studio_name: string;
  studio_tagline: string;
  studio_address: string;
  whatsapp_number: string;
  instagram_username: string;
  tiktok_username?: string;
  email_contact: string;
  operating_hours_text: string;
  about_story: string;
  about_philosophy: string;
}

export interface TestimonialItem {
  id: string;
  client_name: string;
  client_role?: string;
  session_type?: string;
  content: string;
  rating: number;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
}

export interface AdminProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: 'superadmin' | 'admin';
  created_at?: string;
}
