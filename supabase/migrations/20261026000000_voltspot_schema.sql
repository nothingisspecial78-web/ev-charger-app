-- ==============================================================================
-- VoltSpot PostgreSQL Schema & Row Level Security (RLS) Specification
-- Conforms to 03-DATABASE-AND-BACKEND.md, SECURITY.md, and AGENTS.md
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES

-- Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL CHECK (char_length(trim(display_name)) >= 2 AND char_length(display_name) <= 100),
  role TEXT NOT NULL DEFAULT 'driver' CHECK (role IN ('driver', 'admin', 'superadmin')),
  phone TEXT CHECK (phone IS NULL OR char_length(phone) <= 20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chargers Table
CREATE TABLE IF NOT EXISTS public.chargers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(trim(name)) >= 3 AND char_length(name) <= 100),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 1000),
  address TEXT NOT NULL CHECK (char_length(trim(address)) >= 5 AND char_length(address) <= 300),
  area TEXT CHECK (area IS NULL OR char_length(area) <= 100),
  latitude NUMERIC CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
  longitude NUMERIC CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180)),
  connector_types TEXT[] NOT NULL DEFAULT '{}' CHECK (array_length(connector_types, 1) > 0),
  power_kw NUMERIC NOT NULL CHECK (power_kw > 0 AND power_kw <= 500),
  price_per_kwh NUMERIC CHECK (price_per_kwh IS NULL OR price_per_kwh >= 0),
  access_notes TEXT CHECK (access_notes IS NULL OR char_length(access_notes) <= 500),
  availability_status TEXT NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'offline')),
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Booking Requests Table
CREATE TABLE IF NOT EXISTS public.booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charger_id UUID NOT NULL REFERENCES public.chargers(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  requested_start TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 15 AND duration_minutes <= 720),
  driver_note TEXT CHECK (driver_note IS NULL OR char_length(driver_note) <= 500),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  owner_response_note TEXT CHECK (owner_response_note IS NULL OR char_length(owner_response_note) <= 500),
  decided_by UUID REFERENCES public.profiles(id),
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin Audit Log Table
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_chargers_owner_id ON public.chargers(owner_id);
CREATE INDEX IF NOT EXISTS idx_chargers_discovery ON public.chargers(is_published, is_active, availability_status);
CREATE INDEX IF NOT EXISTS idx_chargers_area ON public.chargers(area);
CREATE INDEX IF NOT EXISTS idx_booking_requests_charger ON public.booking_requests(charger_id, status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_driver ON public.booking_requests(driver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON public.booking_requests(status, created_at DESC);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chargers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Helper functions for trusted role checks
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'superadmin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.profiles;
CREATE POLICY "Public can view basic profile info"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update own non-privileged profile" ON public.profiles;
CREATE POLICY "Users can update own non-privileged profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() AND
    -- Role cannot be self-updated or elevated
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- CHARGERS POLICIES
DROP POLICY IF EXISTS "Anyone can view active and published chargers" ON public.chargers;
CREATE POLICY "Anyone can view active and published chargers"
  ON public.chargers FOR SELECT
  TO authenticated
  USING (
    (is_active = true AND is_published = true) OR
    owner_id = auth.uid() OR
    public.is_superadmin()
  );

DROP POLICY IF EXISTS "Owners can insert chargers" ON public.chargers;
CREATE POLICY "Owners can insert chargers"
  ON public.chargers FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid() AND
    (public.get_auth_role() IN ('admin', 'superadmin'))
  );

DROP POLICY IF EXISTS "Owners can update own chargers" ON public.chargers;
CREATE POLICY "Owners can update own chargers"
  ON public.chargers FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid() OR public.is_superadmin())
  WITH CHECK (
    (owner_id = auth.uid() AND is_active = (SELECT is_active FROM public.chargers WHERE id = id)) OR
    public.is_superadmin()
  );

DROP POLICY IF EXISTS "Owners can delete own chargers" ON public.chargers;
CREATE POLICY "Owners can delete own chargers"
  ON public.chargers FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid() OR public.is_superadmin());

-- BOOKING REQUESTS POLICIES
DROP POLICY IF EXISTS "Drivers and owners can view relevant requests" ON public.booking_requests;
CREATE POLICY "Drivers and owners can view relevant requests"
  ON public.booking_requests FOR SELECT
  TO authenticated
  USING (
    driver_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.chargers c WHERE c.id = charger_id AND c.owner_id = auth.uid()) OR
    public.is_superadmin()
  );

DROP POLICY IF EXISTS "Drivers can create requests" ON public.booking_requests;
CREATE POLICY "Drivers can create requests"
  ON public.booking_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    driver_id = auth.uid() AND
    status = 'pending' AND
    requested_start > NOW() AND
    EXISTS (SELECT 1 FROM public.chargers c WHERE c.id = charger_id AND c.is_active = true AND c.is_published = true)
  );

-- 5. ATOMIC BUSINESS OPERATION FUNCTIONS (SECURITY DEFINER)
-- Prevents race conditions and arbitrary status updates

-- Approve Request (Owner of charger only)
CREATE OR REPLACE FUNCTION public.approve_booking_request(
  p_request_id UUID,
  p_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request RECORD;
BEGIN
  SELECT r.*, c.owner_id
  INTO v_request
  FROM public.booking_requests r
  JOIN public.chargers c ON c.id = r.charger_id
  WHERE r.id = p_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found';
  END IF;

  IF v_request.status != 'pending' THEN
    RAISE EXCEPTION 'Request is already in % state and cannot be approved', v_request.status;
  END IF;

  IF v_request.owner_id != auth.uid() AND NOT public.is_superadmin() THEN
    RAISE EXCEPTION 'Unauthorized: only the charger owner can approve requests';
  END IF;

  UPDATE public.booking_requests
  SET
    status = 'approved',
    owner_response_note = p_note,
    decided_by = auth.uid(),
    decided_at = NOW(),
    updated_at = NOW()
  WHERE id = p_request_id;

  RETURN jsonb_build_object('success', true, 'status', 'approved');
END;
$$;

-- Reject Request (Owner of charger only)
CREATE OR REPLACE FUNCTION public.reject_booking_request(
  p_request_id UUID,
  p_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request RECORD;
BEGIN
  SELECT r.*, c.owner_id
  INTO v_request
  FROM public.booking_requests r
  JOIN public.chargers c ON c.id = r.charger_id
  WHERE r.id = p_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found';
  END IF;

  IF v_request.status != 'pending' THEN
    RAISE EXCEPTION 'Request is already in % state and cannot be rejected', v_request.status;
  END IF;

  IF v_request.owner_id != auth.uid() AND NOT public.is_superadmin() THEN
    RAISE EXCEPTION 'Unauthorized: only the charger owner can reject requests';
  END IF;

  UPDATE public.booking_requests
  SET
    status = 'rejected',
    owner_response_note = p_note,
    decided_by = auth.uid(),
    decided_at = NOW(),
    updated_at = NOW()
  WHERE id = p_request_id;

  RETURN jsonb_build_object('success', true, 'status', 'rejected');
END;
$$;

-- Cancel Own Request (Driver only, pending only)
CREATE OR REPLACE FUNCTION public.cancel_own_request(
  p_request_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request RECORD;
BEGIN
  SELECT * INTO v_request
  FROM public.booking_requests
  WHERE id = p_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found';
  END IF;

  IF v_request.driver_id != auth.uid() AND NOT public.is_superadmin() THEN
    RAISE EXCEPTION 'Unauthorized: drivers can only cancel their own requests';
  END IF;

  IF v_request.status != 'pending' AND NOT public.is_superadmin() THEN
    RAISE EXCEPTION 'Cannot cancel request with status %', v_request.status;
  END IF;

  UPDATE public.booking_requests
  SET
    status = 'cancelled',
    decided_by = auth.uid(),
    decided_at = NOW(),
    updated_at = NOW()
  WHERE id = p_request_id;

  RETURN jsonb_build_object('success', true, 'status', 'cancelled');
END;
$$;

-- Moderate Charger (Superadmin only)
CREATE OR REPLACE FUNCTION public.moderate_charger(
  p_charger_id UUID,
  p_is_active BOOLEAN,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_superadmin() THEN
    RAISE EXCEPTION 'Unauthorized: platform superadmin only';
  END IF;

  UPDATE public.chargers
  SET is_active = p_is_active, updated_at = NOW()
  WHERE id = p_charger_id;

  INSERT INTO public.admin_audit_log (actor_id, action, entity_type, entity_id, reason)
  VALUES (auth.uid(), CASE WHEN p_is_active THEN 'REACTIVATE_CHARGER' ELSE 'DEACTIVATE_CHARGER' END, 'charger', p_charger_id, p_reason);

  RETURN jsonb_build_object('success', true, 'is_active', p_is_active);
END;
$$;

-- 6. USER SIGNUP TRIGGER (Defaults to driver, allows owner only if requested, blocks superadmin)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_display_name TEXT;
BEGIN
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'driver');
  -- Security guard: never allow self-signup as superadmin
  IF v_role NOT IN ('driver', 'admin') THEN
    v_role := 'driver';
  END IF;

  v_display_name := COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1));

  INSERT INTO public.profiles (id, display_name, role, phone)
  VALUES (new.id, v_display_name, v_role, new.raw_user_meta_data->>'phone');

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
