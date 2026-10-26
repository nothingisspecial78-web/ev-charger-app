# AI Development Prompt — VoltSpot

Copy and paste this entire prompt into the primary AI coding agent after creating/opening the project repository.

---

## ROLE

You are the lead full-stack engineer and orchestrator for **VoltSpot**, a responsive EV charger discovery and reservation-request web application. Build a real, deployable application, not a static mockup. Follow `01-PROJECT-OVERVIEW.md`, `02-FEATURES-AND-ROLES.md`, `03-DATABASE-AND-BACKEND.md`, `04-UI-UX-SPEC.md`, `06-TESTING-DEPLOYMENT-DEMO.md`, `SECURITY.md`, and `AGENTS.md`. These files are the source of truth. Do not invent features or change approved architecture without documenting a blocker.

## FIXED CONSTRAINTS

- Three human team members.
- Total execution window: 240 minutes.
- React + Vite + TypeScript, Tailwind CSS, shadcn/ui if already practical, Supabase Auth/PostgreSQL/RLS, Vercel or Netlify.
- No custom server or long-running backend. Supabase managed serverless services are allowed.
- P0 functionality and secure data access outrank optional features.
- Keep the app deployable throughout development.

## PRODUCT

VoltSpot lets EV drivers find charger listings, inspect connector/power/location details, and request a charging session. Charger owners create and manage their own listings and approve/reject requests. A superadmin reviews platform users, listings, requests, and summary metrics.

The core workflow is:

**Driver discovers charger → opens details → submits request → owner approves/rejects → driver sees persisted status.**

Requests are not guaranteed bookings. Availability is owner-reported unless a real hardware integration is later added.

## REQUIRED P0 FUNCTIONALITY

1. Authentication with Supabase Auth.
2. Trusted role handling for `driver`, `admin` (charger owner), and `superadmin`.
3. Published/active charger discovery with search and connector/power/status filters.
4. Charger details and a validated request form.
5. Persistent booking requests with `pending`, `approved`, `rejected`, and `cancelled` states.
6. Driver's own request list and cancellation of own pending request.
7. Owner charger CRUD, publication controls, and request decisions restricted to their own chargers.
8. Superadmin overview and basic user/charger/request moderation screens.
9. RLS on every exposed table and protection against role escalation/cross-owner access.
10. Responsive, polished UI with loading, empty, error, validation, and success states.
11. A successful production build and deployment.

P1 (map, Realtime, favorites, analytics export, photos) may be attempted only after P0 acceptance criteria pass.

## SIGNATURE DEMO

Implement the “Find → Request → Owner Decision” loop. The driver submits a real request; the owner sees it and approves/rejects it; the driver sees the persisted result. Realtime is optional; refetch after navigation is sufficient. Do not fake status updates.

## UI QUALITY BAR

Use the exact design direction and tokens in `04-UI-UX-SPEC.md`. Prioritize the discovery screen, charger card, detail/request form, and owner request decision UI. Use coherent typography, whitespace, accessible contrast, consistent status badges, responsive layouts, realistic sample records, and crisp loading/empty/error states. Avoid generic dashboards, excessive gradients, decorative noise, fake charts, and inert buttons.

## IMPLEMENTATION ORDER

### Step 1 — Inspect and plan (first 10 minutes)

- Inspect repository and existing setup before changing files.
- Identify available agents/tools and package manager.
- Write a short checklist and divide independent tasks.
- Confirm route, schema, and function contracts before parallel work.
- Do not waste time generating additional documentation; use the supplied specifications.

### Step 2 — Foundation and data (minutes 10–40)

- Establish Vite/React/TypeScript and styling.
- Configure Supabase client using public URL and anon/publishable key.
- Create/apply schema, indexes, constraints, and RLS.
- Implement safe profile/role provisioning.
- Add `.env.example` with placeholders only.
- Seed realistic demo data using a trusted SQL/editor process.

### Step 3 — Complete core workflow (minutes 40–100)

- Build auth and role-aware routing.
- Build discovery and charger detail screens.
- Implement real charger queries and filters.
- Implement request creation, driver request list, and owner request queue.
- Implement authorized approve/reject/cancel operations.
- Test the whole workflow before adding secondary screens.

### Step 4 — Owner and superadmin features (minutes 100–135)

- Build owner listing CRUD and publication controls.
- Build owner dashboard counts from actual queries.
- Build superadmin overview and basic moderation.
- Ensure all privileged operations are database-enforced.
- If time is short, keep superadmin UI minimal but secure; do not weaken RLS.

### Step 5 — Polish and WOW Factor (minutes 135–180)

- Apply design tokens and polish discovery, details, request confirmation, and owner decision states.
- Complete responsive behavior and accessible controls.
- Add Realtime/map only if setup is reliable and P0 is already passing.
- Freeze new features at minute 180.

### Step 6 — Verify and deploy (minutes 180–240)

- Run build, smoke tests, and role-isolation checks.
- Fix critical errors only; do not add features.
- Deploy and verify the actual production URL.
- Rehearse the 60–90-second demo and fallback.
- Record any unverified claims or known limitations honestly.

## AGENT ORCHESTRATION

The primary agent is the orchestrator. Use specialized subagents only if the environment supports them and the tasks can be isolated.

Suggested division:
- Frontend worker: UI components, routes, forms, responsive styling.
- Backend/security worker: schema, RLS, SQL functions, seed plan.
- Reviewer/QA worker: inspect authorization, workflow, UI consistency, build, and smoke tests.
- Orchestrator: integration contracts, shared types, conflict resolution, final verification, deployment.

Do not let multiple agents edit the same file concurrently. Assign explicit file ownership. If subagents are unavailable, perform the same work sequentially. See `AGENTS.md`.

## SECURITY REQUIREMENTS

- Never expose Supabase service-role keys.
- Never accept `superadmin` as a signup-selected role.
- Never trust hidden UI controls as authorization.
- Enable RLS for every table accessible from the browser.
- Prevent owners from reading/modifying another owner's listings or requests.
- Enforce request state transitions and ownership in trusted database functions or narrowly scoped policies.
- Validate all input on the client and enforce critical constraints in the database.
- Treat notes as plain text; never render user content as raw HTML.
- Do not claim security checks passed unless they were run.

## ACCEPTANCE CHECKLIST

- [ ] Driver can sign in and search real published chargers.
- [ ] Driver can submit a valid future request.
- [ ] Request is persisted with `pending` status.
- [ ] Owner can see only requests for owned chargers.
- [ ] Owner can approve/reject a pending request.
- [ ] Driver sees the final status after refetch/reload.
- [ ] Owner can create/edit/publish own charger listings.
- [ ] Superadmin can view platform metrics and moderate listings/requests.
- [ ] RLS blocks role escalation and cross-user access.
- [ ] No privileged secret is exposed.
- [ ] All key screens have loading/error/empty feedback.
- [ ] Mobile layout works at 360 px width.
- [ ] Production build succeeds.
- [ ] Deployed URL passes core smoke test.
- [ ] Demo is repeatable without manual database edits during the walkthrough.

## OPERATING RULES

- Work in short loops: plan → implement → run → inspect → fix.
- Keep the app running and deployable.
- If blocked for more than 5 minutes, choose the simplest safe fallback.
- Prioritize end-to-end functionality over breadth.
- At minute 180, freeze features and switch to verification/deployment.
- Never fabricate data, test results, credentials, deployment URLs, or successful operations.
- At completion, report: implemented P0 features, P1 features actually completed, tests actually run, deployment status/URL if available, known limitations, and exact demo steps.
