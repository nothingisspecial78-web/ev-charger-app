# EV Charger Finder — Project Overview

## 1. Product Summary

**Working name:** VoltSpot  
**Product type:** Responsive web application for discovering EV chargers and requesting charging sessions.  
**Tagline:** Find a plug. Request a slot. Get moving.

VoltSpot connects EV drivers with charger owners through a simple, trustworthy discovery and reservation-request workflow. Charger owners manage their own listings and respond to requests. A superadmin oversees platform users, listings, reservations, and operational metrics.

## 2. Problem

EV drivers may struggle to discover suitable chargers, understand their location and charging specifications, and know whether a charger owner can accommodate them. Charger owners need a straightforward way to publish accurate charger details and handle requests. Platform operators need visibility and controls to maintain listing quality and manage abuse.

## 3. Target Users

1. **Driver:** searches chargers, filters results, views details, and requests a charging session.
2. **Charger owner (Admin):** creates and maintains charger listings and approves or rejects requests for their own chargers.
3. **Platform Superadmin:** oversees users, listings, requests, and platform-level metrics.

“Admin” means a charger owner, not a global administrator. The `superadmin` role is platform-wide and must never be self-assignable.

## 4. Product Value

- Drivers can find relevant chargers and submit a structured request.
- Owners control their listings and reservation decisions.
- The platform operator can review activity and moderate problematic listings.
- A map-and-list discovery experience makes the product value understandable in seconds.

## 5. Approved Hackathon MVP

### P0 — Must work

- Authentication with Supabase Auth.
- Role-aware app navigation for driver, charger owner, and superadmin.
- Driver charger discovery with search and filters (connector, charger type/power, availability status, and location text).
- Charger detail view showing address/area, connector types, power, pricing if supplied, access notes, owner/listing status, and availability label.
- Driver submits a request with date/time, expected duration, and optional note.
- Owner sees requests for their own chargers and approves or rejects them.
- Request status updates persist and are visible to the driver.
- Owner can create, edit, publish/unpublish, and deactivate their own charger listings.
- Superadmin can review users, chargers, and requests; deactivate a listing and change a request status only through explicit administrative actions.
- Database-backed data, loading/error/empty states, validation, and role-based authorization.
- Responsive, polished interface with a working signature interaction.
- Production deployment and verified smoke test.

### P1 — Only after all P0 acceptance criteria pass

- Map view using a configured map provider; otherwise use a polished location-aware list with map placeholder removed, not faked.
- Favorite chargers.
- Owner summary analytics (requests, approval rate, active listings).
- Superadmin date-range filters and CSV export.
- Realtime request status updates using Supabase Realtime.
- Charger photos using Supabase Storage with safe file limits.

### P2 — Out of scope

- Payments, refunds, invoicing, and owner payouts.
- Live charger telemetry, hardware integrations, or guaranteed live availability.
- Automatic route planning, navigation, and battery-range prediction.
- Identity verification, driver’s license checks, and background checks.
- Native mobile apps, push notifications, SMS, and email delivery beyond configured Auth emails.
- Dynamic pricing, recurring bookings, waitlists, and complex calendar conflict management.
- AI chatbot or recommendation engine.
- Multi-country tax, legal, and currency workflows.

## 6. Signature WOW Factor: “Find → Request → Owner Decision”

A driver opens the discovery screen, selects a charger, submits a request, and sees a clear request timeline. In the owner view, the request appears immediately (Realtime if implemented, otherwise on refresh/navigation), and the owner approves or rejects it. The driver sees the persisted status change.

### Technical flow

1. Frontend queries published and active charger listings.
2. Driver submits a validated request.
3. Supabase/Postgres checks authorization and stores a pending request.
4. Owner reads only requests connected to their own chargers.
5. Owner decision updates the request status through an authorized database operation.
6. Driver sees the updated status from the database; Realtime is an enhancement, not a prerequisite.

### Visual result

A polished discovery page transitions into a charger detail panel and a request confirmation state. The owner dashboard shows a request card with Approve and Reject actions. Status badges update from Pending to Approved or Rejected based on persisted data.

### Demo sequence (60–90 seconds)

1. Sign in as a seeded driver and search “Central”.
2. Open a charger, review connector/power/access details, and request a time.
3. Show the pending request confirmation.
4. Switch to the seeded owner account and open Requests.
5. Approve the request.
6. Return to the driver view and show the updated Approved status.
7. Briefly show superadmin overview metrics.

### Acceptance criteria

- The request exists in PostgreSQL after submission.
- A different user's session cannot read or modify another owner's request.
- Owner decision persists after refresh.
- Driver sees the resulting status after reload or Realtime delivery.
- The demo can be repeated with prepared accounts and sample data.

### Fallback

If Realtime or map integration fails, refresh the request list and use the location list. Never display fabricated live availability or a false success message.

## 7. Design Direction

**Personality:** Clean, confident, modern mobility technology; practical rather than futuristic.  
**Palette:** Deep midnight green/ink, bright electric lime accent, soft warm-gray background, white surfaces, restrained amber for pending states, red for destructive/error states.  
**Primary UI:** Driver discovery screen with filter chips, charger cards, and map/list toggle only if a real map is configured.  
**Visual quality target:** Product-grade hierarchy, clear typography, consistent spacing, useful status badges, accessible contrast, subtle transitions, realistic sample data.

Detailed tokens and screen rules are in `04-UI-UX-SPEC.md`.

## 8. Recommended Technology

- React + Vite + TypeScript
- Tailwind CSS
- shadcn/ui where already available and quick to configure
- Supabase Auth, PostgreSQL, Row Level Security, optional Realtime and Storage
- React Router
- React Hook Form + Zod if setup time permits
- Lucide icons
- Vercel or Netlify deployment

Keep the architecture simple. Use direct Supabase client queries protected by RLS for this MVP; use a serverless Edge Function only if a privileged operation cannot be safely implemented with database policies/functions.

## 9. Three-Person Team

- **Member A — Product/Orchestrator & Integration:** architecture, task board, routing, final integration, deployment.
- **Member B — Frontend/UI:** discovery, detail, request flow, responsive styling, loading/error/empty states.
- **Member C — Backend/Security:** schema, RLS, Auth roles, owner request actions, seed data, security tests.

AI agents may parallelize independent work. One orchestrator owns integration and final acceptance.

## 10. Four-Hour Execution Plan

| Time | Phase | Deliverable |
|---|---|---|
| 00–30 min | Plan and architecture | Scope, schema, route contracts, task ownership |
| 30–120 min | Core development | Auth, database, discovery, request, owner decision |
| 120–180 min | UI/UX and WOW | Polish, admin screens, optional P1 only after P0 |
| 180–210 min | Test and secure | Smoke tests, RLS checks, critical fixes |
| 210–240 min | Deploy and demo | Production URL verified, rehearsed walkthrough |

Freeze new features at minute 180. Do not consume the final 60 minutes adding optional features.

## 11. Success Criteria

- A new driver can discover a published charger and submit a request.
- The correct owner can approve/reject it.
- The driver can see the final status.
- Owner and superadmin permissions are enforced in the database, not only hidden in the UI.
- The app is responsive, visually consistent, and deployed.
- The 60–90-second demo can be repeated without editing the database manually during the walkthrough.

## 12. Key Risks and Mitigations

- **Role escalation:** never allow a client to assign `superadmin`; seed it securely or assign through a trusted server-side process.
- **False availability claims:** label availability as owner-provided listing status; do not imply hardware-confirmed real-time status.
- **Booking conflicts:** MVP requests are requests, not guaranteed reservations. Prevent duplicate decisions and communicate status clearly. Advanced overlap locking is P1/P2.
- **Map API setup delay:** ship location search and list view first.
- **Realtime failure:** use persisted state and manual refresh.
- **Time overrun:** prioritize the full driver-to-owner workflow and deploy before optional analytics.
