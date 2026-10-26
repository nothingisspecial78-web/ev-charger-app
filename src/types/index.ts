// ==============================================================================
// VoltSpot Shared Types & Integration Contracts
// Conforms to 02-FEATURES-AND-ROLES.md, 03-DATABASE-AND-BACKEND.md, and AGENTS.md
// ==============================================================================

export type UserRole = 'driver' | 'admin' | 'superadmin';

export interface Profile {
  id: string;
  display_name: string;
  role: UserRole;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type ConnectorType = 'CCS2' | 'Type 2' | 'CHAdeMO' | 'GB/T' | 'Tesla';

export const SUPPORTED_CONNECTORS: ConnectorType[] = [
  'CCS2',
  'Type 2',
  'CHAdeMO',
  'GB/T',
  'Tesla',
];

export type AvailabilityStatus = 'available' | 'busy' | 'offline';

export interface Charger {
  id: string;
  owner_id: string;
  name: string;
  description?: string | null;
  address: string;
  area?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  connector_types: ConnectorType[];
  power_kw: number;
  price_per_kwh?: number | null;
  access_notes?: string | null;
  availability_status: AvailabilityStatus;
  is_published: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  owner?: Pick<Profile, 'display_name' | 'phone'>;
}

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface BookingRequest {
  id: string;
  charger_id: string;
  driver_id: string;
  requested_start: string;
  duration_minutes: number;
  driver_note?: string | null;
  status: RequestStatus;
  owner_response_note?: string | null;
  decided_by?: string | null;
  decided_at?: string | null;
  created_at: string;
  updated_at: string;
  charger?: Charger;
  driver?: Pick<Profile, 'display_name' | 'phone'>;
}

export interface AdminAuditLog {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  reason?: string | null;
  created_at: string;
  actor?: Pick<Profile, 'display_name'>;
}

export interface ChargerFilters {
  query?: string;
  connector?: ConnectorType | 'all';
  minPower?: number | 'all';
  status?: AvailabilityStatus | 'all';
  sortBy?: 'power_desc' | 'power_asc' | 'price_asc' | 'name_asc';
}

export interface SuperadminMetrics {
  totalUsers: number;
  activeListings: number;
  pendingRequests: number;
  approvedRequests: number;
  totalRequests: number;
}
