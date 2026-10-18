-- ==============================================================================
-- MOMEN.POTRAIT PHOTOGRAPHY STUDIO — COMPLETE PRODUCTION DATABASE SCHEMA
-- Migration: 20261018000000_init_momen_potrait.sql
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. ADMIN PROFILES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT 'Admin Studio',
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. PACKAGES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  photo_count_text TEXT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. PORTFOLIO ITEMS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Portrait', 'Couple', 'Graduation', 'Family', 'Event', 'Editorial')),
  image_url TEXT NOT NULL,
  storage_path TEXT,
  description TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. BOOKINGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  customer_email TEXT,
  package_id UUID REFERENCES public.packages(id) ON DELETE RESTRICT NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  session_location TEXT NOT NULL DEFAULT 'Studio MOMEN.POTRAIT (Senopati)',
  notes TEXT,
  total_price NUMERIC NOT NULL CHECK (total_price >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. BUSINESS HOURS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL UNIQUE CHECK (day_of_week BETWEEN 0 AND 6),
  is_open BOOLEAN NOT NULL DEFAULT true,
  open_time TIME NOT NULL DEFAULT '09:00:00',
  close_time TIME NOT NULL DEFAULT '19:00:00',
  slot_interval_minutes INTEGER NOT NULL DEFAULT 60
);

-- ------------------------------------------------------------------------------
-- 6. BLOCKED DATES & SLOTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blocked_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. SITE SETTINGS, TESTIMONIALS & FAQS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_role TEXT,
  session_type TEXT,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_bookings_date_status ON public.bookings(session_date, status);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON public.bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_whatsapp ON public.bookings(customer_whatsapp);
CREATE INDEX IF NOT EXISTS idx_packages_active_order ON public.packages(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_featured_order ON public.portfolio_items(is_featured, sort_order);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_date ON public.blocked_slots(slot_date);

-- ------------------------------------------------------------------------------
-- HELPER FUNCTION: AUTO-UPDATE updated_at
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_packages_updated_at
BEFORE UPDATE ON public.packages
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------------------------
-- ATOMIC DOUBLE-BOOKING PREVENTION RPC FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_booking_atomic(
  p_customer_name TEXT,
  p_customer_whatsapp TEXT,
  p_customer_email TEXT,
  p_package_id UUID,
  p_session_date DATE,
  p_start_time TIME,
  p_session_location TEXT DEFAULT 'Studio MOMEN.POTRAIT (Senopati)',
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pkg RECORD;
  v_duration INTERVAL;
  v_end_time TIME;
  v_reference TEXT;
  v_day_of_week INT;
  v_business_hour RECORD;
  v_is_date_blocked BOOLEAN;
  v_conflict_count INT;
  v_created_booking RECORD;
BEGIN
  -- 1. Advisory Lock based on session date to guarantee serialized execution per date
  PERFORM pg_advisory_xact_lock(hashtext('booking_' || p_session_date::text));

  -- 2. Validate session date is not in past
  IF p_session_date < (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date THEN
    RAISE EXCEPTION 'Tanggal sesi tidak boleh di masa lampau.';
  END IF;

  -- 3. Check blocked dates
  SELECT EXISTS(SELECT 1 FROM public.blocked_dates WHERE blocked_date = p_session_date) INTO v_is_date_blocked;
  IF v_is_date_blocked THEN
    RAISE EXCEPTION 'Tanggal ini ditutup oleh studio. Silakan pilih tanggal lain.';
  END IF;

  -- 4. Verify package price and duration directly from trusted table
  SELECT * INTO v_pkg FROM public.packages WHERE id = p_package_id AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Paket fotografi tidak ditemukan atau sedang dinonaktifkan.';
  END IF;

  v_duration := (v_pkg.duration_minutes || ' minutes')::interval;
  v_end_time := p_start_time + v_duration;

  -- 5. Verify operating business hours
  v_day_of_week := EXTRACT(DOW FROM p_session_date);
  SELECT * INTO v_business_hour FROM public.business_hours WHERE day_of_week = v_day_of_week;
  IF FOUND THEN
    IF NOT v_business_hour.is_open THEN
      RAISE EXCEPTION 'Studio libur pada hari tersebut.';
    END IF;
    IF p_start_time < v_business_hour.open_time OR v_end_time > v_business_hour.close_time THEN
      RAISE EXCEPTION 'Jadwal di luar jam operasional studio (09:00 - 19:00 WIB).';
    END IF;
  END IF;

  -- 6. Check conflicts against blocked slots
  SELECT COUNT(*) INTO v_conflict_count
  FROM public.blocked_slots
  WHERE slot_date = p_session_date
    AND (p_start_time, v_end_time) OVERLAPS (start_time, end_time);

  IF v_conflict_count > 0 THEN
    RAISE EXCEPTION 'Slot waktu tersebut diblokir oleh admin studio.';
  END IF;

  -- 7. Check conflicts against active bookings (pending & confirmed only; cancelled does NOT block)
  SELECT COUNT(*) INTO v_conflict_count
  FROM public.bookings
  WHERE session_date = p_session_date
    AND status IN ('pending', 'confirmed')
    AND (p_start_time, v_end_time) OVERLAPS (start_time, end_time);

  IF v_conflict_count > 0 THEN
    RAISE EXCEPTION 'Slot waktu tersebut baru saja dipesan oleh pelanggan lain. Silakan pilih jam lain.';
  END IF;

  -- 8. Generate unique booking reference
  v_reference := 'MP-' || to_char(p_session_date, 'YYYYMM') || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));

  -- 9. Insert new booking
  INSERT INTO public.bookings (
    booking_reference,
    customer_name,
    customer_whatsapp,
    customer_email,
    package_id,
    session_date,
    start_time,
    end_time,
    session_location,
    notes,
    total_price,
    status
  ) VALUES (
    v_reference,
    p_customer_name,
    p_customer_whatsapp,
    p_customer_email,
    p_package_id,
    p_session_date,
    p_start_time,
    v_end_time,
    p_session_location,
    p_notes,
    v_pkg.price,
    'pending'
  ) RETURNING * INTO v_created_booking;

  RETURN to_jsonb(v_created_booking);
END;
$$;

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Helper to check if current authenticated user is an authorized admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. admin_profiles RLS
CREATE POLICY "Admins can view admin profiles"
  ON public.admin_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins can manage admin profiles"
  ON public.admin_profiles FOR ALL
  TO authenticated
  USING (public.is_admin());

-- 2. packages RLS (public read active, admin full CRUD)
CREATE POLICY "Public read active packages"
  ON public.packages FOR SELECT
  TO public
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admin write packages"
  ON public.packages FOR ALL
  TO authenticated
  USING (public.is_admin());

-- 3. portfolio_items RLS (public read all, admin full CRUD)
CREATE POLICY "Public read portfolio items"
  ON public.portfolio_items FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin write portfolio items"
  ON public.portfolio_items FOR ALL
  TO authenticated
  USING (public.is_admin());

-- 4. bookings RLS
-- Customer cannot select all bookings. Only authenticated admin can view and update.
CREATE POLICY "Admin can view all bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admin can manage bookings"
  ON public.bookings FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Public can insert booking only (or via RPC)
CREATE POLICY "Public can insert bookings"
  ON public.bookings FOR INSERT
  TO public
  WITH CHECK (true);

-- 5. business_hours RLS
CREATE POLICY "Public read business hours"
  ON public.business_hours FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin manage business hours"
  ON public.business_hours FOR ALL
  TO authenticated
  USING (public.is_admin());

-- 6. blocked_dates & blocked_slots RLS
CREATE POLICY "Public read blocked dates"
  ON public.blocked_dates FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin manage blocked dates"
  ON public.blocked_dates FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admin manage blocked slots"
  ON public.blocked_slots FOR ALL
  TO authenticated
  USING (public.is_admin());

-- 7. site_settings, testimonials, faqs RLS
CREATE POLICY "Public read site settings"
  ON public.site_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin manage site settings"
  ON public.site_settings FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Public read testimonials"
  ON public.testimonials FOR SELECT
  TO public
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admin manage testimonials"
  ON public.testimonials FOR ALL
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Public read faqs"
  ON public.faqs FOR SELECT
  TO public
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admin manage faqs"
  ON public.faqs FOR ALL
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- STORAGE BUCKET CONFIGURATION (for Supabase Storage)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view portfolio bucket"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'portfolio');

CREATE POLICY "Admin can upload portfolio images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'portfolio' AND public.is_admin());

CREATE POLICY "Admin can update portfolio images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'portfolio' AND public.is_admin());

CREATE POLICY "Admin can delete portfolio images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'portfolio' AND public.is_admin());

-- ------------------------------------------------------------------------------
-- INITIAL SEED DATA
-- ------------------------------------------------------------------------------
INSERT INTO public.packages (id, slug, name, tagline, price, duration_minutes, photo_count_text, features, is_active, sort_order)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'solo-editorial', 'The Solo Editorial', 'Potret personal dengan estetika majalah fashion berkarakter kuat.', 850000, 60, '15 Foto Pilihan (High-End Retouch) + Semua File Asli', ARRAY['1 Orang / Sesi Personal', '60 Menit Sesi Foto Studio Eksklusif', '2 Pilihan Konsep & Backdrop Studio', '15 Foto Retouch Resolusi Tinggi (Editorial Grade)', 'Akses Link Google Drive Seluruh File Mentah (RAW/JPEG)', 'Pengarahan Pose Profesional oleh Fotografer', '1 Cetak Fine Art 20x30 cm + Frame Minimalis'], true, 1),
  ('a0000000-0000-0000-0000-000000000002', 'couple-intimate', 'Intimate Couple Story', 'Merayakan cinta, kehangatan, dan kedekatan dua hati dalam potret abadi.', 1350000, 90, '25 Foto Pilihan (High-End Retouch) + Semua File Asli', ARRAY['2 Orang (Pre-wedding / Anniversary / Couple Session)', '90 Menit Sesi Foto Studio / Semi-Outdoor', '3 Kali Ganti Kostum / Pakaian', '25 Foto Retouch Resolusi Tinggi', 'Akses Link Google Drive Seluruh File Mentah', 'Panduan Moodboard & Konsep Visual Personal', '2 Cetak Fine Art 20x30 cm + 1 Cetak Kanvas 30x45 cm'], true, 2),
  ('a0000000-0000-0000-0000-000000000003', 'graduation-heritage', 'Graduation & Heritage', 'Pencapaian berharga yang dirayakan bersama keluarga dan orang terkasih.', 1650000, 90, '30 Foto Pilihan (High-End Retouch) + Semua File Asli', ARRAY['Maksimal 5 Orang (Wisudawan + Keluarga Inti)', '90 Menit Sesi Foto Studio Lengkap', 'Foto Tunggal Wisuda + Foto Formasi Keluarga', '30 Foto Retouch Resolusi Tinggi', 'Akses Link Seluruh File Asli Tanpa Batas', 'Properti Jubah, Topi & Ijazah Tersedia', '1 Cetak Kanvas Keluarga 40x60 cm Elegan'], true, 3),
  ('a0000000-0000-0000-0000-000000000004', 'family-generations', 'Family Generations', 'Warisan kenangan keluarga lintas generasi yang penuh tawa dan kehangatan.', 2250000, 120, '40 Foto Pilihan (High-End Retouch) + Semua File Asli', ARRAY['Hingga 10 Anggota Keluarga', '120 Menit Sesi Studio Nyaman & Ramah Anak/Lansia', 'Formasi Lengkap, Kakek-Nenek, Anak & Cucu', '40 Foto Retouch Resolusi Tinggi', 'Akses Link Seluruh File Mentah', 'Lounge Privat & Refreshment Ringan Selama Sesi', '1 Album Premium Hardcover 20x30 cm (20 Halaman)'], true, 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.business_hours (day_of_week, is_open, open_time, close_time, slot_interval_minutes)
VALUES
  (0, true, '09:00:00', '19:00:00', 60),
  (1, true, '09:00:00', '19:00:00', 60),
  (2, true, '09:00:00', '19:00:00', 60),
  (3, true, '09:00:00', '19:00:00', 60),
  (4, true, '09:00:00', '19:00:00', 60),
  (5, true, '09:00:00', '19:00:00', 60),
  (6, true, '09:00:00', '19:00:00', 60)
ON CONFLICT (day_of_week) DO NOTHING;

INSERT INTO public.site_settings (key, value)
VALUES
  ('hero_headline', '"Every Moment Deserves to Be Remembered."'::jsonb),
  ('hero_subheadline', '"Studio fotografi editorial & portrait di Jakarta. Menghadirkan karya visual yang intim, abadi, dan bercerita tentang jati diri Anda."'::jsonb),
  ('studio_name', '"MOMEN.POTRAIT"'::jsonb),
  ('studio_address', '"Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan 12190"'::jsonb),
  ('whatsapp_number', '"6281234567890"'::jsonb),
  ('instagram_username', '"@momen.potrait"'::jsonb),
  ('email_contact', '"hello@momenpotrait.com"'::jsonb),
  ('operating_hours_text', '"Senin – Minggu: 09:00 – 19:00 WIB"'::jsonb)
ON CONFLICT (key) DO NOTHING;
