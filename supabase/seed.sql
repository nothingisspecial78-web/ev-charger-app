-- ==============================================================================
-- VoltSpot Seed Data (Fictional, realistic records)
-- Conforms to 06-TESTING-DEPLOYMENT-DEMO.md
-- ==============================================================================

-- 1. SEED PROFILES
-- Demo User UUIDs
-- Driver: 'd1111111-1111-1111-1111-111111111111'
-- Owner:  'a2222222-2222-2222-2222-222222222222'
-- Admin:  's3333333-3333-3333-3333-333333333333'

INSERT INTO public.profiles (id, display_name, role, phone)
VALUES
  ('d1111111-1111-1111-1111-111111111111', 'Rahul Driver', 'driver', '+91 98765 43210'),
  ('a2222222-2222-2222-2222-222222222222', 'Kiran (Charge Point Host)', 'admin', '+91 98450 12345'),
  ('s3333333-3333-3333-3333-333333333333', 'Ananya (Platform Admin)', 'superadmin', '+91 94470 99999')
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role;

-- 2. SEED CHARGERS (Owned by Kiran)
INSERT INTO public.chargers (
  id,
  owner_id,
  name,
  description,
  address,
  area,
  latitude,
  longitude,
  connector_types,
  power_kw,
  price_per_kwh,
  access_notes,
  availability_status,
  is_published,
  is_active
)
VALUES
  (
    'c1111111-0000-0000-0000-000000000001',
    'a2222222-2222-2222-2222-222222222222',
    'Central Market Fast Charge',
    'High-speed DC fast charger located in the secure ground parking lot of Central Commercial Complex. Well-lit area with café nearby.',
    'Plot 14, Commercial Lane, Near Central Market, Kozhikode, Kerala 673001',
    'Kozhikode Central',
    11.2588,
    75.7804,
    ARRAY['CCS2'],
    60,
    18.50,
    'Entry via Gate 2. Inform security guard you are charging at VoltSpot bay #3.',
    'available',
    true,
    true
  ),
  (
    'c1111111-0000-0000-0000-000000000002',
    'a2222222-2222-2222-2222-222222222222',
    'Riverside AC Point',
    'Reliable AC destination charger beside Riverside Avenue. Ideal for longer parking and overnight replenishment.',
    'Riverside Avenue, Near Municipal Bridge, Tirur, Kerala 676101',
    'Tirur Riverside',
    10.9147,
    75.9229,
    ARRAY['Type 2'],
    22,
    14.00,
    'Direct driveway access 24/7. RFID tag not required; activation handled via VoltSpot approval.',
    'available',
    true,
    true
  ),
  (
    'c1111111-0000-0000-0000-000000000003',
    'a2222222-2222-2222-2222-222222222222',
    'Station Road Charge Hub',
    'Convenient rapid charging right across the railway station transit terminal.',
    'Station Road, Near Railway Junction, Malappuram, Kerala 676505',
    'Malappuram Station Road',
    11.0732,
    76.0740,
    ARRAY['CCS2', 'Type 2'],
    30,
    16.00,
    'Bay is currently occupied by a local commuter vehicle during peak morning hours.',
    'busy',
    true,
    true
  ),
  (
    'c1111111-0000-0000-0000-000000000004',
    'a2222222-2222-2222-2222-222222222222',
    'Calicut Bypass DC Express',
    'Dual-gun 120kW ultra-rapid charger right off the national highway bypass.',
    'NH 66 Bypass Road, Pantheeramkavu, Kozhikode, Kerala 673019',
    'Kozhikode Bypass',
    11.2185,
    75.8341,
    ARRAY['CCS2', 'CHAdeMO'],
    120,
    21.00,
    'Dedicated wide bays suitable for larger SUVs and electric vans.',
    'available',
    true,
    true
  ),
  (
    'c1111111-0000-0000-0000-000000000005',
    'a2222222-2222-2222-2222-222222222222',
    'Hillside Eco Point (Maintenance)',
    'Community charger undergoing routine terminal software calibration.',
    'Wayanad Ghat Road Junction, Lakkidi, Kerala 673576',
    'Wayanad Hills',
    11.5167,
    76.0333,
    ARRAY['Type 2'],
    7.4,
    12.00,
    'Temporarily offline for scheduled hardware diagnostics.',
    'offline',
    true,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- 3. SEED BOOKING REQUESTS
INSERT INTO public.booking_requests (
  id,
  charger_id,
  driver_id,
  requested_start,
  duration_minutes,
  driver_note,
  status
)
VALUES
  (
    'r1111111-0000-0000-0000-000000000001',
    'c1111111-0000-0000-0000-000000000001',
    'd1111111-1111-1111-1111-111111111111',
    NOW() + INTERVAL '2 hours',
    45,
    'Driving a Tata Nexon EV with 18% charge remaining. Arriving around 4:30 PM.',
    'pending'
  ),
  (
    'r1111111-0000-0000-0000-000000000002',
    'c1111111-0000-0000-0000-000000000002',
    'd1111111-1111-1111-1111-111111111111',
    NOW() - INTERVAL '1 day',
    60,
    'Overnight top-up session requested.',
    'approved'
  )
ON CONFLICT (id) DO NOTHING;
