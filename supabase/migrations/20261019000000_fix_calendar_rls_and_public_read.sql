-- Migration: Fix RLS policies on blocked_slots and blocked_dates
-- 1. Ensure public has SELECT access on blocked_slots so the booking wizard can check unavailable slots
-- 2. Ensure only authenticated admins can manage (INSERT, UPDATE, DELETE) blocked_slots and blocked_dates
-- 3. Preserve RLS enabled without exposing write operations to public

-- 1. Ensure RLS is enabled (safe and idempotent)
ALTER TABLE IF EXISTS public.blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.business_hours ENABLE ROW LEVEL SECURITY;

-- 2. Public read for blocked_slots (missing from initial migration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'blocked_slots' 
      AND policyname = 'Public read blocked slots'
  ) THEN
    CREATE POLICY "Public read blocked slots"
      ON public.blocked_slots FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- 3. Public read for blocked_dates (ensure exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'blocked_dates' 
      AND policyname = 'Public read blocked dates'
  ) THEN
    CREATE POLICY "Public read blocked dates"
      ON public.blocked_dates FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- 4. Admin manage policies (strictly for authenticated admins verified by public.is_admin())
DO $$
BEGIN
  -- blocked_slots admin manage
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'blocked_slots' 
      AND policyname = 'Admin manage blocked slots'
  ) THEN
    CREATE POLICY "Admin manage blocked slots"
      ON public.blocked_slots FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;

  -- blocked_dates admin manage
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'blocked_dates' 
      AND policyname = 'Admin manage blocked dates'
  ) THEN
    CREATE POLICY "Admin manage blocked dates"
      ON public.blocked_dates FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;
