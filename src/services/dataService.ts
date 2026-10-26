import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  Charger,
  BookingRequest,
  Profile,
  AdminAuditLog,
  ChargerFilters,
  SuperadminMetrics,
} from '@/types';

// Default realistic seed data matching supabase/seed.sql
const INITIAL_PROFILES: Profile[] = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    display_name: 'Rahul Driver',
    role: 'driver',
    phone: '+91 98765 43210',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    display_name: 'Kiran (Charge Point Host)',
    role: 'admin',
    phone: '+91 98450 12345',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 's3333333-3333-3333-3333-333333333333',
    display_name: 'Ananya (Platform Admin)',
    role: 'superadmin',
    phone: '+91 94470 99999',
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
];

const INITIAL_CHARGERS: Charger[] = [
  {
    id: 'c1111111-0000-0000-0000-000000000001',
    owner_id: 'a2222222-2222-2222-2222-222222222222',
    name: 'Central Market Fast Charge',
    description: 'High-speed DC fast charger located in the secure ground parking lot of Central Commercial Complex. Well-lit area with café and restroom nearby.',
    address: 'Plot 14, Commercial Lane, Near Central Market, Kozhikode, Kerala 673001',
    area: 'Kozhikode Central',
    latitude: 11.2588,
    longitude: 75.7804,
    connector_types: ['CCS2'],
    power_kw: 60,
    price_per_kwh: 18.5,
    access_notes: 'Entry via Gate 2. Inform security guard you are charging at VoltSpot bay #3.',
    availability_status: 'available',
    is_published: true,
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'c1111111-0000-0000-0000-000000000002',
    owner_id: 'a2222222-2222-2222-2222-222222222222',
    name: 'Riverside AC Point',
    description: 'Reliable AC destination charger beside Riverside Avenue. Ideal for longer parking and overnight replenishment.',
    address: 'Riverside Avenue, Near Municipal Bridge, Tirur, Kerala 676101',
    area: 'Tirur Riverside',
    latitude: 10.9147,
    longitude: 75.9229,
    connector_types: ['Type 2'],
    power_kw: 22,
    price_per_kwh: 14.0,
    access_notes: 'Direct driveway access 24/7. RFID tag not required; activation handled via VoltSpot approval.',
    availability_status: 'available',
    is_published: true,
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'c1111111-0000-0000-0000-000000000003',
    owner_id: 'a2222222-2222-2222-2222-222222222222',
    name: 'Station Road Charge Hub',
    description: 'Convenient rapid charging right across the railway station transit terminal.',
    address: 'Station Road, Near Railway Junction, Malappuram, Kerala 676505',
    area: 'Malappuram Station Road',
    latitude: 11.0732,
    longitude: 76.074,
    connector_types: ['CCS2', 'Type 2'],
    power_kw: 30,
    price_per_kwh: 16.0,
    access_notes: 'Bay is currently occupied by a local commuter vehicle during peak morning hours.',
    availability_status: 'busy',
    is_published: true,
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'c1111111-0000-0000-0000-000000000004',
    owner_id: 'a2222222-2222-2222-2222-222222222222',
    name: 'Calicut Bypass DC Express',
    description: 'Dual-gun 120kW ultra-rapid charger right off the national highway bypass.',
    address: 'NH 66 Bypass Road, Pantheeramkavu, Kozhikode, Kerala 673019',
    area: 'Kozhikode Bypass',
    latitude: 11.2185,
    longitude: 75.8341,
    connector_types: ['CCS2', 'CHAdeMO'],
    power_kw: 120,
    price_per_kwh: 21.0,
    access_notes: 'Dedicated wide bays suitable for larger SUVs and electric vans.',
    availability_status: 'available',
    is_published: true,
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'c1111111-0000-0000-0000-000000000005',
    owner_id: 'a2222222-2222-2222-2222-222222222222',
    name: 'Hillside Eco Point (Maintenance)',
    description: 'Community charger undergoing routine terminal software calibration.',
    address: 'Wayanad Ghat Road Junction, Lakkidi, Kerala 673576',
    area: 'Wayanad Hills',
    latitude: 11.5167,
    longitude: 76.0333,
    connector_types: ['Type 2'],
    power_kw: 7.4,
    price_per_kwh: 12.0,
    access_notes: 'Temporarily offline for scheduled hardware diagnostics.',
    availability_status: 'offline',
    is_published: true,
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

const INITIAL_REQUESTS: BookingRequest[] = [
  {
    id: 'r1111111-0000-0000-0000-000000000001',
    charger_id: 'c1111111-0000-0000-0000-000000000001',
    driver_id: 'd1111111-1111-1111-1111-111111111111',
    requested_start: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
    duration_minutes: 45,
    driver_note: 'Driving a Tata Nexon EV with 18% charge remaining. Arriving around 4:30 PM.',
    status: 'pending',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'r1111111-0000-0000-0000-000000000002',
    charger_id: 'c1111111-0000-0000-0000-000000000002',
    driver_id: 'd1111111-1111-1111-1111-111111111111',
    requested_start: new Date(Date.now() - 86400000).toISOString(),
    duration_minutes: 60,
    driver_note: 'Overnight top-up session requested.',
    status: 'approved',
    owner_response_note: 'Bay reserved. Safe journey!',
    decided_by: 'a2222222-2222-2222-2222-222222222222',
    decided_at: new Date(Date.now() - 80000000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 80000000).toISOString(),
  },
];

const STORAGE_KEYS = {
  CHARGERS: 'voltspot_chargers',
  REQUESTS: 'voltspot_requests',
  PROFILES: 'voltspot_profiles',
  AUDIT_LOGS: 'voltspot_audit_logs',
};

// Local storage storage helper
class LocalStore {
  static get<T>(key: string, defaultVal: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) {
        localStorage.setItem(key, JSON.stringify(defaultVal));
        return defaultVal;
      }
      return JSON.parse(data) as T;
    } catch {
      return defaultVal;
    }
  }

  static set<T>(key: string, val: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }

  static reset(): void {
    localStorage.setItem(STORAGE_KEYS.CHARGERS, JSON.stringify(INITIAL_CHARGERS));
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_PROFILES));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
  }
}

// Initialise storage if first run
if (typeof window !== 'undefined') {
  LocalStore.get(STORAGE_KEYS.CHARGERS, INITIAL_CHARGERS);
  LocalStore.get(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
  LocalStore.get(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  LocalStore.get(STORAGE_KEYS.AUDIT_LOGS, []);
}

export const DataService = {
  // RESET DEMO DATA
  resetDemoData(): void {
    LocalStore.reset();
  },

  // 1. GET PUBLISHED CHARGERS FOR DRIVER DISCOVERY
  async getPublishedChargers(filters?: ChargerFilters): Promise<Charger[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('chargers')
          .select('*, owner:profiles(display_name, phone)')
          .eq('is_published', true)
          .eq('is_active', true);

        if (filters?.query) {
          query = query.or(`name.ilike.%${filters.query}%,area.ilike.%${filters.query}%,address.ilike.%${filters.query}%`);
        }
        if (filters?.status && filters.status !== 'all') {
          query = query.eq('availability_status', filters.status);
        }
        if (filters?.minPower && filters.minPower !== 'all') {
          query = query.gte('power_kw', filters.minPower);
        }
        if (filters?.connector && filters.connector !== 'all') {
          query = query.contains('connector_types', [filters.connector]);
        }

        const { data, error } = await query;
        if (!error && data) return data as Charger[];
      } catch (err) {
        console.warn('Supabase query failed, falling back to local persistent store:', err);
      }
    }

    // Local fallback
    let list = LocalStore.get<Charger[]>(STORAGE_KEYS.CHARGERS, INITIAL_CHARGERS)
      .filter(c => c.is_published && c.is_active);

    const profiles = LocalStore.get<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);

    if (filters?.query) {
      const q = filters.query.toLowerCase().trim();
      list = list.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          (c.area && c.area.toLowerCase().includes(q)) ||
          c.address.toLowerCase().includes(q)
      );
    }

    if (filters?.connector && filters.connector !== 'all') {
      list = list.filter(c => c.connector_types.includes(filters.connector as any));
    }

    if (filters?.minPower && filters.minPower !== 'all') {
      list = list.filter(c => c.power_kw >= Number(filters.minPower));
    }

    if (filters?.status && filters.status !== 'all') {
      list = list.filter(c => c.availability_status === filters.status);
    }

    if (filters?.sortBy === 'power_desc') {
      list.sort((a, b) => b.power_kw - a.power_kw);
    } else if (filters?.sortBy === 'power_asc') {
      list.sort((a, b) => a.power_kw - b.power_kw);
    } else if (filters?.sortBy === 'price_asc') {
      list.sort((a, b) => (a.price_per_kwh || 0) - (b.price_per_kwh || 0));
    } else if (filters?.sortBy === 'name_asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list.map(c => ({
      ...c,
      owner: profiles.find(p => p.id === c.owner_id),
    }));
  },

  // 2. GET CHARGER BY ID
  async getChargerById(id: string): Promise<Charger | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('chargers')
          .select('*, owner:profiles(display_name, phone)')
          .eq('id', id)
          .single();
        if (!error && data) return data as Charger;
      } catch (err) {
        console.warn('Supabase fetch charger failed, fallback to local store:', err);
      }
    }

    const chargers = LocalStore.get<Charger[]>(STORAGE_KEYS.CHARGERS, INITIAL_CHARGERS);
    const charger = chargers.find(c => c.id === id);
    if (!charger) return null;

    const profiles = LocalStore.get<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    return {
      ...charger,
      owner: profiles.find(p => p.id === charger.owner_id),
    };
  },

  // 3. OWNER: GET OWN CHARGERS
  async getOwnerChargers(ownerId: string): Promise<Charger[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('chargers')
          .select('*')
          .eq('owner_id', ownerId)
          .order('created_at', { ascending: false });
        if (!error && data) return data as Charger[];
      } catch (err) {
        console.warn('Supabase get owner chargers failed:', err);
      }
    }

    const chargers = LocalStore.get<Charger[]>(STORAGE_KEYS.CHARGERS, INITIAL_CHARGERS);
    return chargers.filter(c => c.owner_id === ownerId);
  },

  // 4. OWNER: CREATE CHARGER
  async createCharger(
    ownerId: string,
    input: Omit<Charger, 'id' | 'owner_id' | 'created_at' | 'updated_at'>
  ): Promise<Charger> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('chargers')
          .insert({
            ...input,
            owner_id: ownerId,
          })
          .select()
          .single();
        if (!error && data) return data as Charger;
      } catch (err) {
        console.warn('Supabase create charger failed:', err);
      }
    }

    const newCharger: Charger = {
      ...input,
      id: 'c-' + Math.random().toString(36).substring(2, 9),
      owner_id: ownerId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const chargers = LocalStore.get<Charger[]>(STORAGE_KEYS.CHARGERS, INITIAL_CHARGERS);
    chargers.unshift(newCharger);
    LocalStore.set(STORAGE_KEYS.CHARGERS, chargers);
    return newCharger;
  },

  // 5. OWNER: UPDATE CHARGER
  async updateCharger(
    chargerId: string,
    ownerId: string,
    updates: Partial<Charger>
  ): Promise<Charger> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('chargers')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', chargerId)
          .eq('owner_id', ownerId)
          .select()
          .single();
        if (!error && data) return data as Charger;
      } catch (err) {
        console.warn('Supabase update charger failed:', err);
      }
    }

    const chargers = LocalStore.get<Charger[]>(STORAGE_KEYS.CHARGERS, INITIAL_CHARGERS);
    const index = chargers.findIndex(c => c.id === chargerId && c.owner_id === ownerId);
    if (index === -1) {
      throw new Error('Charger not found or unauthorized');
    }

    chargers[index] = {
      ...chargers[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    LocalStore.set(STORAGE_KEYS.CHARGERS, chargers);
    return chargers[index];
  },

  // 6. DRIVER: CREATE BOOKING REQUEST
  async createBookingRequest(input: {
    charger_id: string;
    driver_id: string;
    requested_start: string;
    duration_minutes: number;
    driver_note?: string;
  }): Promise<BookingRequest> {
    // Validate future start time
    const start = new Date(input.requested_start).getTime();
    if (isNaN(start) || start <= Date.now()) {
      throw new Error('Requested start time must be in the future');
    }

    if (input.duration_minutes < 15 || input.duration_minutes > 720) {
      throw new Error('Duration must be between 15 and 720 minutes');
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('booking_requests')
          .insert({
            charger_id: input.charger_id,
            driver_id: input.driver_id,
            requested_start: input.requested_start,
            duration_minutes: input.duration_minutes,
            driver_note: input.driver_note || null,
            status: 'pending',
          })
          .select('*, charger:chargers(*)')
          .single();
        if (!error && data) return data as BookingRequest;
      } catch (err) {
        console.warn('Supabase create request failed:', err);
      }
    }

    const chargers = LocalStore.get<Charger[]>(STORAGE_KEYS.CHARGERS, INITIAL_CHARGERS);
    const charger = chargers.find(c => c.id === input.charger_id);
    if (!charger) {
      throw new Error('Target charger not found');
    }

    const newRequest: BookingRequest = {
      id: 'req-' + Math.random().toString(36).substring(2, 9),
      charger_id: input.charger_id,
      driver_id: input.driver_id,
      requested_start: input.requested_start,
      duration_minutes: input.duration_minutes,
      driver_note: input.driver_note || null,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      charger,
    };

    const requests = LocalStore.get<BookingRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    requests.unshift(newRequest);
    LocalStore.set(STORAGE_KEYS.REQUESTS, requests);

    return newRequest;
  },

  // 7. DRIVER: GET OWN REQUESTS
  async getDriverRequests(driverId: string): Promise<BookingRequest[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('booking_requests')
          .select('*, charger:chargers(*)')
          .eq('driver_id', driverId)
          .order('created_at', { ascending: false });
        if (!error && data) return data as BookingRequest[];
      } catch (err) {
        console.warn('Supabase get driver requests failed:', err);
      }
    }

    const requests = LocalStore.get<BookingRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    const chargers = LocalStore.get<Charger[]>(STORAGE_KEYS.CHARGERS, INITIAL_CHARGERS);

    return requests
      .filter(r => r.driver_id === driverId)
      .map(r => ({
        ...r,
        charger: chargers.find(c => c.id === r.charger_id),
      }));
  },

  // 8. OWNER: GET REQUESTS FOR OWN CHARGERS
  async getOwnerRequests(ownerId: string): Promise<BookingRequest[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('booking_requests')
          .select('*, charger:chargers!inner(*), driver:profiles!driver_id(display_name, phone)')
          .eq('charger.owner_id', ownerId)
          .order('created_at', { ascending: false });
        if (!error && data) return data as BookingRequest[];
      } catch (err) {
        console.warn('Supabase get owner requests failed:', err);
      }
    }

    const requests = LocalStore.get<BookingRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    const chargers = LocalStore.get<Charger[]>(STORAGE_KEYS.CHARGERS, INITIAL_CHARGERS);
    const profiles = LocalStore.get<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);

    const ownedChargerIds = new Set(chargers.filter(c => c.owner_id === ownerId).map(c => c.id));

    return requests
      .filter(r => ownedChargerIds.has(r.charger_id))
      .map(r => ({
        ...r,
        charger: chargers.find(c => c.id === r.charger_id),
        driver: profiles.find(p => p.id === r.driver_id),
      }));
  },

  // 9. OWNER: APPROVE REQUEST
  async approveBookingRequest(
    requestId: string,
    ownerId: string,
    responseNote?: string
  ): Promise<BookingRequest> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc('approve_booking_request', {
          p_request_id: requestId,
          p_note: responseNote || null,
        });
        if (!error) {
          const updated = await this.getRequestById(requestId);
          if (updated) return updated;
        }
      } catch (err) {
        console.warn('Supabase approve rpc failed:', err);
      }
    }

    const requests = LocalStore.get<BookingRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    const chargers = LocalStore.get<Charger[]>(STORAGE_KEYS.CHARGERS, INITIAL_CHARGERS);

    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) throw new Error('Request not found');

    const charger = chargers.find(c => c.id === requests[index].charger_id);
    if (!charger || charger.owner_id !== ownerId) {
      throw new Error('Unauthorized: You do not own the charger for this request');
    }

    if (requests[index].status !== 'pending') {
      throw new Error(`Cannot approve request in ${requests[index].status} status`);
    }

    requests[index] = {
      ...requests[index],
      status: 'approved',
      owner_response_note: responseNote || 'Session approved by host.',
      decided_by: ownerId,
      decided_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      charger,
    };

    LocalStore.set(STORAGE_KEYS.REQUESTS, requests);
    return requests[index];
  },

  // 10. OWNER: REJECT REQUEST
  async rejectBookingRequest(
    requestId: string,
    ownerId: string,
    responseNote?: string
  ): Promise<BookingRequest> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc('reject_booking_request', {
          p_request_id: requestId,
          p_note: responseNote || null,
        });
        if (!error) {
          const updated = await this.getRequestById(requestId);
          if (updated) return updated;
        }
      } catch (err) {
        console.warn('Supabase reject rpc failed:', err);
      }
    }

    const requests = LocalStore.get<BookingRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    const chargers = LocalStore.get<Charger[]>(STORAGE_KEYS.CHARGERS, INITIAL_CHARGERS);

    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) throw new Error('Request not found');

    const charger = chargers.find(c => c.id === requests[index].charger_id);
    if (!charger || charger.owner_id !== ownerId) {
      throw new Error('Unauthorized: You do not own the charger for this request');
    }

    if (requests[index].status !== 'pending') {
      throw new Error(`Cannot reject request in ${requests[index].status} status`);
    }

    requests[index] = {
      ...requests[index],
      status: 'rejected',
      owner_response_note: responseNote || 'Session declined by host.',
      decided_by: ownerId,
      decided_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      charger,
    };

    LocalStore.set(STORAGE_KEYS.REQUESTS, requests);
    return requests[index];
  },

  // 11. DRIVER: CANCEL OWN REQUEST
  async cancelOwnRequest(requestId: string, driverId: string): Promise<BookingRequest> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc('cancel_own_request', {
          p_request_id: requestId,
        });
        if (!error) {
          const updated = await this.getRequestById(requestId);
          if (updated) return updated;
        }
      } catch (err) {
        console.warn('Supabase cancel rpc failed:', err);
      }
    }

    const requests = LocalStore.get<BookingRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) throw new Error('Request not found');

    if (requests[index].driver_id !== driverId) {
      throw new Error('Unauthorized: Drivers can only cancel their own requests');
    }

    if (requests[index].status !== 'pending') {
      throw new Error(`Cannot cancel request in ${requests[index].status} status`);
    }

    requests[index] = {
      ...requests[index],
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    };

    LocalStore.set(STORAGE_KEYS.REQUESTS, requests);
    return requests[index];
  },

  // 12. GET REQUEST BY ID HELPER
  async getRequestById(requestId: string): Promise<BookingRequest | null> {
    const requests = LocalStore.get<BookingRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    const chargers = LocalStore.get<Charger[]>(STORAGE_KEYS.CHARGERS, INITIAL_CHARGERS);
    const req = requests.find(r => r.id === requestId);
    if (!req) return null;
    return {
      ...req,
      charger: chargers.find(c => c.id === req.charger_id),
    };
  },

  // 13. SUPERADMIN: METRICS
  async getSuperadminMetrics(): Promise<SuperadminMetrics> {
    const users = LocalStore.get<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    const chargers = LocalStore.get<Charger[]>(STORAGE_KEYS.CHARGERS, INITIAL_CHARGERS);
    const requests = LocalStore.get<BookingRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);

    return {
      totalUsers: users.length,
      activeListings: chargers.filter(c => c.is_active && c.is_published).length,
      pendingRequests: requests.filter(r => r.status === 'pending').length,
      approvedRequests: requests.filter(r => r.status === 'approved').length,
      totalRequests: requests.length,
    };
  },

  // 14. SUPERADMIN: GET ALL DATA
  async getAllUsers(): Promise<Profile[]> {
    return LocalStore.get<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  },

  async getAllChargers(): Promise<Charger[]> {
    const chargers = LocalStore.get<Charger[]>(STORAGE_KEYS.CHARGERS, INITIAL_CHARGERS);
    const profiles = LocalStore.get<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    return chargers.map(c => ({
      ...c,
      owner: profiles.find(p => p.id === c.owner_id),
    }));
  },

  async getAllRequests(): Promise<BookingRequest[]> {
    const requests = LocalStore.get<BookingRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    const chargers = LocalStore.get<Charger[]>(STORAGE_KEYS.CHARGERS, INITIAL_CHARGERS);
    const profiles = LocalStore.get<Profile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);

    return requests.map(r => ({
      ...r,
      charger: chargers.find(c => c.id === r.charger_id),
      driver: profiles.find(p => p.id === r.driver_id),
    }));
  },

  // 15. SUPERADMIN: MODERATE CHARGER (ACTIVATE/DEACTIVATE)
  async moderateCharger(
    chargerId: string,
    isActive: boolean,
    adminId: string,
    reason?: string
  ): Promise<Charger> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.rpc('moderate_charger', {
          p_charger_id: chargerId,
          p_is_active: isActive,
          p_reason: reason || null,
        });
      } catch (err) {
        console.warn('Supabase moderate rpc failed:', err);
      }
    }

    const chargers = LocalStore.get<Charger[]>(STORAGE_KEYS.CHARGERS, INITIAL_CHARGERS);
    const index = chargers.findIndex(c => c.id === chargerId);
    if (index === -1) throw new Error('Charger not found');

    chargers[index] = {
      ...chargers[index],
      is_active: isActive,
      updated_at: new Date().toISOString(),
    };

    LocalStore.set(STORAGE_KEYS.CHARGERS, chargers);

    // Record audit log
    const logs = LocalStore.get<AdminAuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    logs.unshift({
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      actor_id: adminId,
      action: isActive ? 'REACTIVATE_CHARGER' : 'DEACTIVATE_CHARGER',
      entity_type: 'charger',
      entity_id: chargerId,
      reason: reason || 'Superadmin moderation action',
      created_at: new Date().toISOString(),
    });
    LocalStore.set(STORAGE_KEYS.AUDIT_LOGS, logs);

    return chargers[index];
  },

  // 16. SUPERADMIN: OVERRIDE REQUEST (e.g. CANCEL WITH REASON)
  async superadminCancelRequest(
    requestId: string,
    adminId: string,
    reason?: string
  ): Promise<BookingRequest> {
    const requests = LocalStore.get<BookingRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) throw new Error('Request not found');

    requests[index] = {
      ...requests[index],
      status: 'cancelled',
      owner_response_note: reason ? `Admin override: ${reason}` : 'Cancelled by platform admin',
      decided_by: adminId,
      decided_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    LocalStore.set(STORAGE_KEYS.REQUESTS, requests);

    // Record audit log
    const logs = LocalStore.get<AdminAuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    logs.unshift({
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      actor_id: adminId,
      action: 'CANCEL_REQUEST_OVERRIDE',
      entity_type: 'booking_request',
      entity_id: requestId,
      reason: reason || 'Platform intervention',
      created_at: new Date().toISOString(),
    });
    LocalStore.set(STORAGE_KEYS.AUDIT_LOGS, logs);

    return requests[index];
  },
};
