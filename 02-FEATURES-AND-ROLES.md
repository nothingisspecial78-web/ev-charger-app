# Features and Roles

## 1. Roles

| Capability | Driver | Charger Owner (`admin`) | Platform Superadmin |
|---|---:|---:|---:|
| Browse published chargers | Yes | Yes | Yes |
| Submit a request | Yes | Optional, if also using driver UI | Optional |
| View own requests | Yes | If acting as driver | Platform-wide oversight |
| Create/edit own charger listings | No | Yes | Yes, for moderation/support |
| Publish/unpublish own listings | No | Yes | Yes |
| View requests for a charger | No | Only own chargers | All requests |
| Approve/reject request | No | Only requests for own chargers | Platform override with audit trail |
| View platform metrics | No | Own listing/request summary | Yes |
| Manage users and deactivate listings | No | No | Yes |
| Assign superadmin role | No | No | Not through ordinary client UI |

A person may conceptually be both a driver and a charger owner, but for the MVP use one primary role per account unless multi-role support is deliberately implemented. Do not let users change their own role.

## 2. P0 Features

### Driver

1. Sign up/sign in/sign out.
2. Browse active, published chargers.
3. Search by charger name or area/address text.
4. Filter by connector, minimum power band, and owner-reported availability.
5. View charger details: name, area/address, connector, power, price if entered, access notes, status, and owner-provided description.
6. Submit a request with requested start time, duration, and optional note.
7. View own requests and their statuses: `pending`, `approved`, `rejected`, `cancelled`.
8. Cancel own pending request.

### Charger Owner

1. View dashboard summary: active chargers, pending requests, and total requests.
2. Create a charger listing.
3. Edit own charger details.
4. Publish/unpublish or deactivate own listing.
5. View requests for own chargers.
6. Approve or reject pending requests.
7. View request details and the driver's note.
8. See clear validation and action feedback.

### Superadmin

1. View high-level counts: users, active listings, pending requests, approved requests.
2. Browse users, chargers, and requests.
3. Deactivate/reactivate a charger listing.
4. Review a listing's owner and status.
5. Cancel or override a request only through an explicit action with a reason.
6. View a simple audit trail for administrative actions if time permits; this is P1 unless already included in the schema.

## 3. P1 Features

- Real map integration and location pins.
- Realtime status updates.
- Owner analytics: approval rate, requests by status, active listings.
- Superadmin date-range filters and CSV export.
- Charger photos with file validation.
- Favorite chargers.
- Audit log UI.
- Search sorting by power, price, or recently added.

## 4. P2 Features

- Payments and payouts.
- Live hardware status/telemetry.
- Route optimization and battery-aware planning.
- Recurring reservations, waitlists, and complex conflict resolution.
- Public reviews, ratings, dispute resolution, refunds, and identity verification.
- AI recommendations, chatbot, native apps, push/SMS notifications.

## 5. User Journeys

### Driver request journey

1. Driver signs in.
2. Opens `/chargers`.
3. Searches/filters available published listings.
4. Opens `/chargers/:id`.
5. Chooses a future start time, duration, and optional note.
6. Submits a request.
7. Sees a confirmation with `pending` status.
8. Opens `/my-requests` to follow status or cancel while pending.
9. Sees `approved` or `rejected` after owner decision.

### Owner listing journey

1. Owner signs in.
2. Opens `/owner`.
3. Creates a charger with required location, connector, power, and title.
4. Saves as draft or publishes.
5. Sees the listing in `/owner/chargers`.
6. Edits, unpublishes, or deactivates only their own listing.

### Owner request journey

1. Owner opens `/owner/requests`.
2. Reviews pending requests for their chargers.
3. Opens request details.
4. Approves or rejects a pending request.
5. Sees the changed status and updated dashboard counts.

### Superadmin journey

1. Superadmin signs in through an account provisioned by a trusted process.
2. Opens `/superadmin`.
3. Reviews platform counts and recent activity.
4. Opens `/superadmin/chargers` or `/superadmin/requests`.
5. Deactivates a problematic listing or cancels a request with a reason.
6. Sees the persisted result.

## 6. Route Contract

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Landing page and primary CTA |
| `/login` | Public | Sign in |
| `/signup` | Public | Create account; role options must not include superadmin |
| `/chargers` | Authenticated | Discovery list and filters |
| `/chargers/:id` | Authenticated | Charger details and request form |
| `/my-requests` | Driver | Own requests |
| `/owner` | Owner | Summary dashboard |
| `/owner/chargers` | Owner | Own listings |
| `/owner/chargers/new` | Owner | Create listing |
| `/owner/chargers/:id/edit` | Owner | Edit own listing |
| `/owner/requests` | Owner | Requests for own chargers |
| `/superadmin` | Superadmin | Platform overview |
| `/superadmin/users` | Superadmin | User directory |
| `/superadmin/chargers` | Superadmin | Listing moderation |
| `/superadmin/requests` | Superadmin | Platform request oversight |

If time is tight, consolidate create/edit into a modal or single form route, but preserve authorization.

## 7. Request State Machine

Allowed transitions:

- `pending` → `approved`
- `pending` → `rejected`
- `pending` → `cancelled` by the requesting driver
- `approved` → `cancelled` by the owner or superadmin only if cancellation is supported and clearly confirmed

Do not allow a client to change a request from `rejected` or `cancelled` back to `approved`. Owner decisions must target only a pending request belonging to one of that owner's chargers. A database function/transaction is preferred for status transitions.

## 8. Acceptance Criteria

### AC-01 Discovery
Given a signed-in driver, when they open discovery, then only active and published listings are shown and search/filters operate on actual database data.

### AC-02 Request creation
Given a valid charger and future requested start time, when a driver submits, then one pending request is persisted and the UI shows its real ID/status. Invalid or past times are rejected.

### AC-03 Owner isolation
Given an owner, when they list or update chargers/requests, then they can access only records associated with their owner ID.

### AC-04 Owner decision
Given a pending request for an owned charger, when the owner approves/rejects it, then the status persists and the driver sees the updated status after reload or Realtime.

### AC-05 Superadmin
Given a provisioned superadmin, when they open platform screens, then platform-wide records are available and moderation actions are authorized by database policy.

### AC-06 Security
A user cannot promote themselves, modify another user's profile role, or bypass RLS by calling Supabase directly.

### AC-07 UX
Every core screen has loading, empty, error, and success feedback; destructive actions require confirmation.

### AC-08 Deployment
The production build succeeds and the deployed app can complete the driver-to-owner demo.
