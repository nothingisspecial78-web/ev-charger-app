# Testing, Deployment, and Demo

## 1. Four-Hour Schedule

| Time | Activity | Exit condition |
|---|---|---|
| 00–30 | Plan, architecture, schema, team assignment | P0 and contracts agreed |
| 30–120 | Core build and integration | Driver-to-owner request loop works |
| 120–180 | UI polish, superadmin basics, WOW Factor | P0 complete; features frozen |
| 180–210 | Testing, security checks, bug fixing | No known blocker in core workflow |
| 210–240 | Deploy, verify production, rehearse demo | Live URL and repeatable demo |

**Feature freeze:** minute 180. Only blocking fixes after this point.

## 2. Three Human Team Responsibilities

### Member A — Orchestrator, Product, Integration, Release
- Maintains scope and P0 checklist.
- Owns routing/shared types and integration contracts.
- Resolves conflicts and reviews agent output.
- Verifies production deployment and leads the demo.

### Member B — Frontend and Design
- Owns discovery, detail, request forms, shared UI components, responsive styling.
- Adds loading, empty, validation, and error states.
- Verifies UI consistency against `04-UI-UX-SPEC.md`.

### Member C — Backend and Security
- Owns schema, indexes, RLS, SQL functions, role provisioning, seed data.
- Implements charger and request data operations.
- Tests cross-user/cross-owner access and role escalation.

If one person has limited backend experience, Member A can take integration while Member C focuses on database policies.

## 3. Critical Functional Tests

### Authentication and roles
- Driver can sign in and reach driver routes.
- Owner can sign in and reach owner routes.
- Superadmin account is provisioned through a trusted process.
- Signup does not permit `superadmin`.
- Unauthenticated users cannot access protected data or mutations.

### Charger discovery
- Only active and published chargers appear to ordinary drivers.
- Search filters by name/area/address.
- Connector, power, and status filters combine correctly.
- Empty results show a useful empty state.
- Backend errors show retry feedback.

### Request creation
- Valid future start time creates one `pending` request.
- Past time, invalid duration, or invalid charger is rejected.
- Double-clicking submit does not create accidental duplicates.
- Driver sees a success message only after the backend confirms the insert.
- Driver cannot create a request as another user.

### Owner operations
- Owner can create/edit/publish own charger.
- Owner cannot edit another owner's charger by changing an ID.
- Owner sees requests for own chargers only.
- Owner can approve/reject a pending request for own charger.
- Owner cannot decide requests for another owner's charger.
- Rejected/cancelled requests cannot be approved through an ordinary client update.

### Driver status
- Driver sees own requests only.
- Driver can cancel only own pending requests.
- Approved/rejected status persists after reload.

### Superadmin
- Superadmin sees platform-level counts and records.
- Ordinary driver/owner cannot access superadmin data or actions through direct API calls.
- Moderation actions require explicit confirmation and persist.
- If audit reasons are implemented, the reason is stored.

### UI and responsive
- No clipped controls at 360 px.
- Forms have labels and validation feedback.
- All buttons perform actions or are visibly disabled.
- Loading, empty, error, and success states are present.
- Keyboard focus is visible and dialogs are usable.

## 4. Minimum Smoke Test Before Deployment

1. Run the project's production build command (normally `npm run build`).
2. Resolve all blocking TypeScript/build errors.
3. Confirm Supabase environment variables are configured.
4. Sign in with a driver account.
5. Find a seeded charger and submit a request.
6. Sign in with the owner account and approve/reject the request.
7. Return to the driver account and verify the persisted status.
8. Attempt an unauthorized cross-owner read/update using a non-privileged session.
9. Open the deployed URL in a fresh browser session.
10. Repeat the core workflow against the deployed environment.

Only mark a test as passed after it has actually been run.

## 5. Deployment Steps

1. Push the working project to the intended Git repository.
2. Import the repository into Vercel or Netlify.
3. Configure build command (usually `npm run build`) and output directory (`dist` for Vite).
4. Set the production Supabase URL and anon/publishable key in hosting environment settings.
5. Configure Supabase Auth site URL and allowed redirect URLs for the deployed domain.
6. Apply database migrations/schema and RLS policies to the correct Supabase project.
7. Seed demo records and provision demo roles through trusted SQL/editor/admin tooling.
8. Deploy.
9. Open the actual deployed URL and complete the smoke test.
10. Confirm no secrets or local-only paths are required.

Never paste service-role credentials into a frontend environment variable or repository. If deployment cannot be completed, report the blocker honestly and provide a local demo fallback.

## 6. Demo Data Plan

Use clearly fictional but realistic records, for example:
- **Central Market Fast Charge** — Kozhikode Central, CCS2, 60 kW, owner-reported Available.
- **Riverside AC Point** — Tirur Riverside area, Type 2, 22 kW, owner-reported Available.
- **Station Road Charge Hub** — Malappuram Station Road, CCS2, 30 kW, owner-reported Busy.

Use plausible addresses/areas only as illustrative demo content; do not imply the locations are real or verified. Do not seed fake ratings, live occupancy, or hardware telemetry.

Prepare:
- One driver account.
- One charger-owner account with at least two listings.
- One superadmin account provisioned securely.
- At least one pending request or the ability to create one live during the demo.

Store demo credentials securely in the event team's private notes; never include real passwords in the repository or public README.

## 7. WOW Factor Demo Script (60–90 seconds)

**0–10 seconds — Discover**
- Sign in as the driver.
- Open the polished charger discovery screen.
- Search for “Central” and apply a connector filter.

**10–25 seconds — Inspect**
- Open Central Market Fast Charge.
- Point out power, connector, location, owner-reported status, and access details.

**25–40 seconds — Request**
- Select a future time and duration.
- Submit the request.
- Show the backend-confirmed request reference and Pending badge.

**40–60 seconds — Owner decision**
- Switch to the owner account.
- Open the pending request and approve it.
- Show the status changing after the persisted mutation.

**60–75 seconds — Close the loop**
- Return to the driver account or request list.
- Refresh/refetch and show Approved status.

**75–90 seconds — Platform view**
- Open superadmin overview and show actual user/listing/request counts.
- Finish with the core value: discover, request, confirm.

## 8. Expected Demo Behavior

- Search results come from PostgreSQL.
- Request submission creates a real database row.
- Owner's queue reflects that row.
- Approval/rejection writes to the same row.
- Driver sees the persisted final state.
- Metrics are computed from actual records.
- No manual database edit is performed during the walkthrough.

## 9. Fallback Plan

- **Map provider unavailable:** use list-based discovery and search; do not display a fake map.
- **Realtime unavailable:** refresh/refetch the request list.
- **Email confirmation delay:** use already verified demo accounts; do not depend on signup during the live demo.
- **Seed/demo login issue:** test accounts before presentation; keep a second prepared account.
- **Superadmin screen incomplete:** demonstrate the complete driver-owner workflow first and disclose the limitation.
- **Production backend issue:** if time permits, switch to a verified deployment/configuration; otherwise use a local demo and explicitly state it is local.
- **Critical RLS failure:** do not present the app as secure or expose the affected feature publicly; fix or disable the affected operation.

## 10. Final Submission Checklist

- [ ] Production URL opens.
- [ ] Authentication and redirects work.
- [ ] Core driver-to-owner request loop works on production.
- [ ] Role access and RLS checks performed.
- [ ] No service-role secret in repository or browser bundle.
- [ ] Responsive discovery and request screens reviewed.
- [ ] No dead buttons or fake success messages.
- [ ] Demo accounts and data prepared securely.
- [ ] WOW Factor rehearsed twice.
- [ ] Known limitations recorded accurately.
- [ ] Final presentation explains value, workflow, security, and future scope.
