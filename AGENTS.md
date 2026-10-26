# AGENTS.md — VoltSpot Agent Operating Manual

## 1. Mission

Deliver the approved VoltSpot MVP within 240 minutes. Build a beautiful, believable, secure, deployed web application with persistent data and a repeatable driver-to-owner request demo.

The project specifications are authoritative. Do not add features or change role semantics, schema contracts, visual direction, or stack without the orchestrator's approval.

## 2. Orchestrator

The primary coding agent is the single orchestrator and final decision-maker for implementation coordination.

Responsibilities:
- Inspect repository and existing tooling before editing.
- Maintain P0/P1/P2 checklist and time budget.
- Establish shared types, route contracts, schema contracts, and file ownership.
- Delegate only independent tasks.
- Integrate and resolve conflicts.
- Review security and UI consistency.
- Keep the app runnable and deployable.
- Stop optional feature work at minute 180.
- Report only tests and deployment outcomes actually verified.

## 3. Agent Selection

Use the smallest useful agent team supported by the environment.

Recommended:
- **Planner:** brief architecture and task order; no prolonged planning.
- **Frontend Worker:** discovery, detail/request forms, owner screens, shared components.
- **Backend/Security Worker:** schema, RLS, SQL functions, seed data, auth roles.
- **Reviewer:** inspect implementation against specs and identify concrete defects.
- **QA/Deployment Worker:** build checks, smoke tests, hosting configuration.

Do not launch all agents automatically. If only one agent is available, the orchestrator executes these roles sequentially. If two agents are available, prioritize frontend and backend/security, then review the integrated result.

## 4. Task Order and Time Budget

### Phase 1 — 00–30 minutes
- Planner proposes a short architecture and task split.
- Backend worker confirms schema and RLS contracts.
- Frontend worker confirms routes, shared types, and key screen structure.
- Orchestrator resolves disagreements immediately.
- Deliverable: implementation checklist and file ownership.

### Phase 2 — 30–120 minutes
- Backend: Auth/profile setup, tables, constraints, RLS, request decision operations.
- Frontend: app shell, authentication, discovery, details, request form/list.
- Orchestrator: integration contracts, shared query functions/types, running build.
- Deliverable: complete driver-to-owner workflow.

### Phase 3 — 120–180 minutes
- Frontend: visual polish, responsive behavior, owner dashboard/listings, status states.
- Backend: owner and superadmin operations, metrics, policy verification.
- Reviewer: test cross-owner access, role escalation, status transitions.
- Orchestrator: resolve integration gaps and freeze features at minute 180.
- Deliverable: P0 complete and polished enough for demo.

### Phase 4 — 180–210 minutes
- QA/reviewer runs build, workflow, role isolation, and responsive smoke tests.
- Backend fixes critical policy/data defects.
- Frontend fixes blocking UI/form defects.
- Deliverable: verified release candidate.

### Phase 5 — 210–240 minutes
- Deployment owner configures hosting and production environment.
- QA runs the core workflow against the deployed URL.
- Orchestrator rehearses demo and confirms fallback.
- No new features.
- Deliverable: verified deployment or clearly reported blocker and fallback.

## 5. File Ownership

Adapt paths to the repository, but keep ownership explicit.

| Area | Primary owner | Review |
|---|---|---|
| App entry, router, integration | Orchestrator | Reviewer |
| Shared UI tokens/components | Frontend worker | Orchestrator |
| Discovery/detail/request screens | Frontend worker | Reviewer |
| Owner/superadmin UI | Frontend worker | Orchestrator |
| Schema/migrations/seed SQL | Backend worker | Security reviewer |
| RLS and SQL functions | Backend worker | Orchestrator + reviewer |
| Supabase client/data service | Backend worker or agreed shared owner | Orchestrator |
| Deployment configuration | Orchestrator/QA | Reviewer |
| Final smoke tests | QA/reviewer | Orchestrator |

Never allow multiple agents to edit the same file concurrently. If shared changes are unavoidable, one agent owns the edit and others provide patches/instructions.

## 6. Integration Contracts

Agree before parallel implementation:
- Roles: `driver`, `admin`, `superadmin`.
- Request states: `pending`, `approved`, `rejected`, `cancelled`.
- Charger fields and request fields follow `03-DATABASE-AND-BACKEND.md`.
- Frontend never sends privileged role/status/actor fields that the backend should determine.
- Data functions return typed rows or explicit errors.
- Mutations report success only after Supabase confirms the operation.
- Owner request queue is scoped to chargers owned by the authenticated owner.
- Superadmin is provisioned through a trusted process, never signup.
- UI status labels/colors follow `04-UI-UX-SPEC.md`.

## 7. Coding Conventions

- TypeScript; avoid `any` unless temporarily justified.
- Keep components small and reusable.
- Separate data access from presentation where practical.
- Use shared types for database entities and status values.
- Keep validation and error states consistent.
- Use semantic HTML, accessible labels, and visible focus.
- Avoid unnecessary state libraries and dependencies.
- Do not hardcode privileged credentials or claim data is live when it is seeded.
- Use realistic, clearly fictional demo data.

## 8. Security Review Gate

Before declaring P0 complete, verify:
- RLS enabled on exposed tables.
- No self-service role escalation.
- Owner access restricted by `owner_id`.
- Driver request access restricted by `driver_id`.
- Status transitions are constrained and ownership checked.
- Superadmin actions are database-authorized.
- Service-role secret is not in frontend or repository.
- User text is safely rendered.
- Invalid input is rejected by trusted backend/database logic.

A frontend-only role guard does not pass this gate.

## 9. UI Review Gate

- Discovery is the primary polished screen.
- Charger cards and status badges are consistent.
- Forms have loading, validation, success, and error states.
- No dead buttons or fake success messages.
- No fake map, live occupancy, or fabricated analytics.
- Responsive behavior checked at 360 px and desktop.
- UI uses design tokens from `04-UI-UX-SPEC.md`.
- Avoid visual polish that hides incomplete core functionality.

## 10. Parallel vs Sequential Work

Parallelize:
- Schema/RLS implementation and isolated UI components once contracts are agreed.
- Reviewer inspection while independent implementation proceeds.
- Documentation/checklist updates that do not alter code contracts.

Keep sequential:
- Schema contract before dependent query implementation.
- Integration of shared routing/types.
- End-to-end request workflow.
- RLS verification against final schema.
- Production deployment and smoke test.
- Final demo rehearsal.

## 11. Conflict Resolution and Failure Recovery

Priority order:
1. Security and data integrity.
2. P0 end-to-end workflow.
3. Build/deployment reliability.
4. Core UI quality and accessibility.
5. P1 features.
6. Decorative polish.

When agents disagree, the orchestrator selects the simplest solution consistent with these specifications. Do not spend more than 3 minutes debating a noncritical choice.

If blocked for 5 minutes:
- Identify whether the blocker affects P0.
- Choose the simplest safe fallback.
- Record the limitation.
- Continue with the working path.

Fallbacks:
- No map key → location search and list view.
- No Realtime → refetch after navigation.
- Complex superadmin analytics → actual count cards, no fake charts.
- Agent unavailable → orchestrator executes task directly.
- Build issue near deadline → revert optional change and restore last working build.

## 12. Definition of Done

### Planner
- Short plan, route/schema contracts, ownership, risks, and phase checkpoints documented.

### Frontend worker
- Assigned screens implemented, responsive, accessible, connected to real operations, and include loading/error/empty states.

### Backend/security worker
- Schema applied, operations functional, RLS enabled, state transitions constrained, and role isolation tested.

### Reviewer
- Concrete issues identified, fixes verified where possible, and no untested claim presented as passed.

### QA/deployment worker
- Production build and smoke tests run; deployed URL verified or blocker accurately documented.

### Orchestrator
- P0 acceptance criteria checked, feature freeze respected, demo rehearsed, limitations disclosed, and final status reported.

## 13. Stop Conditions

- At minute 180, stop adding features.
- At minute 210, stop nonblocking refactors and focus on deployment.
- At minute 230, prioritize verifying the deployed workflow and preparing fallback.
- Never trade authorization or data integrity for a smoother demo.
- Never fabricate test results, credentials, analytics, or deployment status.
