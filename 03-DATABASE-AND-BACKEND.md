# Database and Backend Specification

## 1. Architecture

- **Frontend:** React + Vite + TypeScript.
- **Backend:** Supabase managed serverless services.
- **Data:** PostgreSQL.
- **Authentication:** Supabase Auth.
- **Authorization:** PostgreSQL Row Level Security (RLS) and narrowly scoped SQL functions where needed.
- **Optional:** Supabase Realtime for request status changes; Supabase Storage for charger photos.
- **Hosting:** Vercel or Netlify.

The browser may use the Supabase anon/publishable key. Never expose the service-role key in frontend code, Vite environment variables prefixed for browser exposure, source control, or demo instructions.

## 2. Data Model

Use UUID primary keys, `timestamptz` timestamps, foreign keys, and indexes for common filters. Adapt SQL syntax to the current Supabase/PostgreSQL version.

### `profiles`

| Column | Type | Rules |
|---|---|---|
| `id` | uuid | PK, references `auth.users(id)` with cascade delete |
| `display_name` | text | Required, trimmed, reasonable length limit |
| `role` | text/enum | `driver`, `admin`, `superadmin`; default `driver` |
| `phone` | text nullable | Optional; do not expose publicly by default |
| `created_at` | timestamptz | Default now |
| `updated_at` | timestamptz | Maintained on update |

**Security note:** Profile creation should be handled by a trusted trigger or safe insert flow. Client policies must prevent users from changing their own role. Superadmin role assignment must be performed by a trusted database/admin process, never by signup form input.

### `chargers`

| Column | Type | Rules |
|---|---|---|
| `id` | uuid | PK |
| `owner_id` | uuid | FK to `profiles.id`, required |
| `name` | text | Required, 3–100 chars |
| `description` | text nullable | Length-limited |
| `address` | text | Required |
| `area` | text nullable | Searchable locality/area |
| `latitude` | numeric nullable | Range -90 to 90 |
| `longitude` | numeric nullable | Range -180 to 180 |
| `connector_types` | text[] | At least one supported connector |
| `power_kw` | numeric | Positive and within a configured sensible bound |
| `price_per_kwh` | numeric nullable | Non-negative; currency explicitly displayed |
| `access_notes` | text nullable | Length-limited |
| `availability_status` | text | Owner-reported `available`, `busy`, `offline` |
| `is_published` | boolean | Default false |
| `is_active` | boolean | Default true; superadmin can deactivate |
| `created_at` | timestamptz | Default now |
| `updated_at` | timestamptz | Maintained on update |

Avoid claiming that owner-reported status is hardware-confirmed live availability. Use supported connector values consistently in frontend filters and validation.

### `booking_requests`

| Column | Type | Rules |
|---|---|---|
| `id` | uuid | PK |
| `charger_id` | uuid | FK to `chargers.id` |
| `driver_id` | uuid | FK to `profiles.id` |
| `requested_start` | timestamptz | Required, must be in future at creation |
| `duration_minutes` | integer | Positive, within defined limit (e.g. 15–720) |
| `driver_note` | text nullable | Length-limited |
| `status` | text | `pending`, `approved`, `rejected`, `cancelled` |
| `owner_response_note` | text nullable | Optional, length-limited |
| `decided_by` | uuid nullable | FK to profiles |
| `decided_at` | timestamptz nullable | Set on decision |
| `created_at` | timestamptz | Default now |
| `updated_at` | timestamptz | Maintained on update |

Create indexes on `chargers(owner_id)`, `chargers(is_published, is_active, availability_status)`, `booking_requests(charger_id, status)`, `booking_requests(driver_id, created_at desc)`, and `booking_requests(status, created_at desc)`.

### Optional P1: `admin_audit_log`

Fields: `id`, `actor_id`, `action`, `entity_type`, `entity_id`, `reason`, `created_at`. Inserts must be restricted to trusted functions or authorized superadmin operations. Never let ordinary users insert arbitrary audit records.

## 3. Relationships

- `profiles.id` ↔ `auth.users.id` (one profile per account).
- One owner profile has many chargers.
- One charger has many booking requests.
- One driver profile has many booking requests.
- `booking_requests.decided_by` references the owner/superadmin who made the decision.

## 4. RLS Policy Requirements

Enable RLS on every table exposed through the Supabase API.

### Profiles

- Authenticated users may read only fields necessary for the feature; avoid exposing phone/email broadly.
- A user may update their own editable profile fields only.
- A user cannot update `role`, `id`, or privileged fields.
- Superadmin access must be determined from a trusted profile/claim, not request payload.

### Chargers

- Authenticated users may read chargers only when `is_active = true AND is_published = true`, unless they own the charger or are a superadmin.
- Owners may insert a charger only with `owner_id = auth.uid()` and a profile role of `admin`.
- Owners may update/delete only their own chargers; protect `owner_id`, `is_active`, and privileged moderation fields from ordinary owner updates.
- Owners may publish/unpublish their own listings.
- Only superadmins may deactivate/reactivate another user's listing.
- Do not rely on UI route guards as security.

### Booking requests

- Drivers may insert requests only when `driver_id = auth.uid()`, the charger is active/published, and the start time/duration is valid.
- Drivers may read their own requests.
- Drivers may cancel only their own pending requests.
- Owners may read requests only for chargers they own.
- Owners may approve/reject only pending requests for their own chargers.
- Superadmins may read all requests and perform explicit, auditable moderation actions.
- Do not allow broad `UPDATE` policies that let a client change arbitrary columns or bypass state transitions.

**Important implementation detail:** RLS policies alone can be awkward for enforcing column-level and state-transition constraints. Prefer narrowly scoped PostgreSQL functions (e.g. `approve_booking_request`, `reject_booking_request`, `cancel_own_request`) that validate caller, current state, and ownership, then update atomically. Revoke execute from `public` and grant only to `authenticated` as appropriate. Use `SECURITY DEFINER` only with a fixed safe `search_path`, strict identity checks, and minimal privileges.

## 5. Authentication and Role Provisioning

- Use Supabase Auth email/password for the MVP.
- Signup accepts display name and the allowed self-selectable role `driver` or `admin`, if owner onboarding is open.
- Never accept `superadmin` from user input.
- Prefer default signup role `driver`; provision owner accounts through a controlled admin process or approved owner onboarding.
- Seed the demo superadmin through SQL/editor or a trusted server-side administrative process. Never ship service-role credentials to the browser.
- Redirect users based on role after loading their profile.
- Enforce roles in RLS/functions, not just frontend routing.

## 6. CRUD and Operation Contracts

- `listPublishedChargers(filters)` → published active listings only.
- `getCharger(id)` → published active charger, or own/admin-authorized record.
- `createCharger(input)` → owner only; validate and return created row.
- `updateOwnCharger(id, input)` → owner-only, restricted fields.
- `setOwnChargerPublication(id, is_published)` → owner-only.
- `createBookingRequest(input)` → authenticated driver, validated future start and duration, pending status set server-side.
- `listMyRequests()` → current driver's requests.
- `listOwnerRequests()` → requests for current owner's chargers.
- `decideBookingRequest(id, decision, note)` → owner of charger or authorized superadmin; only pending state.
- `cancelMyPendingRequest(id)` → current driver, pending only.
- `getSuperadminMetrics()` → superadmin only; aggregate counts.
- `moderateCharger(id, active, reason)` → superadmin only; record reason if audit log exists.

Do not allow clients to choose `created_at`, `decided_by`, role, or initial request status.

## 7. Validation

- Trim strings and enforce length limits on both client and database where practical.
- Validate coordinates and positive power values.
- Validate supported connector types against a shared list.
- Validate price as non-negative and clearly define currency (e.g. INR) in the UI.
- Reject requests in the past and invalid durations.
- Treat user-entered notes as plain text; never render as raw HTML.
- Add unique/foreign-key/check constraints where appropriate.
- Handle duplicate submissions by disabling submit while pending and, if feasible, use an idempotency token or unique constraint.

## 8. Environment Variables

Frontend environment variables (names are examples):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` or current Supabase publishable key variable
- `VITE_MAP_PROVIDER_KEY` only if using a provider that explicitly permits browser-side keys and restricts them by domain

Never use `VITE_SUPABASE_SERVICE_ROLE_KEY`. Keep server-side secrets only in trusted serverless/Edge Function secrets. Commit `.env.example` with placeholders, never real credentials.

## 9. Realtime and Maps

- Realtime is P1. Core behavior must work after a query/refetch even if subscriptions fail.
- If using a map, configure provider key restrictions and handle missing key gracefully.
- If map setup threatens the schedule, deliver text search and location cards; do not show a fake interactive map.
- Availability is listing-owner reported, not a promise that a physical charger is operational.

## 10. Error Handling and Observability

- Show useful, non-sensitive messages to users.
- Log diagnostic errors without secrets, access tokens, or unnecessary personal data.
- Avoid returning raw database errors to end users.
- Use transaction-safe status updates and check affected row count.
- Never show success before the backend confirms the write.

## 11. Backend Definition of Done

- Schema and indexes applied successfully.
- RLS enabled on all API-exposed tables.
- Role escalation blocked.
- Cross-owner charger/request access blocked.
- Driver-to-owner request lifecycle works with persistent data.
- No service-role secret in browser bundle or repository.
- Deployed app can read and write production-configured data.
