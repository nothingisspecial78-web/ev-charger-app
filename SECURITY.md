# SECURITY.md — VoltSpot

## 1. Security Objectives

Protect account identity, charger-owner boundaries, booking-request data, and platform administration. Ensure that hiding UI elements is never treated as authorization. Apply least privilege from the first database migration.

## 2. Threat Model

Consider:
- A driver attempting to read or change another driver's requests.
- An owner attempting to manage another owner's chargers.
- A user attempting to promote their account to `superadmin`.
- A browser client attempting to call privileged operations directly.
- Malicious or malformed form input.
- Accidental exposure of service-role credentials.
- Public discovery exposing private owner contact details.
- A race condition where two owners/admin actions attempt to decide the same request.
- A malicious listing or note containing script/HTML content.
- Misleading claims about real-time charger availability.

## 3. Authentication

- Use Supabase Auth; do not implement custom password storage.
- Require authentication for discovery actions that expose non-public data and for all mutations.
- Configure production site URL and redirect allowlist.
- Do not rely on a client-provided user ID as identity; use `auth.uid()` in policies/functions.
- Avoid logging passwords, access tokens, refresh tokens, or session objects.
- Do not place secrets in query parameters or client-visible error messages.

## 4. Authorization and Role Safety

- Roles: `driver`, `admin` (charger owner), `superadmin`.
- Signup must never accept `superadmin`.
- Users must not be able to update their own `role` field.
- Prefer a trusted database trigger or controlled provisioning process for role assignment.
- A superadmin account must be seeded/provisioned through a trusted channel.
- Route guards improve UX but are not security controls.
- Verify role and ownership in RLS policies and privileged SQL functions.
- Do not trust `owner_id`, `driver_id`, `decided_by`, or request status supplied by the browser.

## 5. Row Level Security

- Enable RLS on every table exposed through Supabase APIs.
- Define explicit SELECT/INSERT/UPDATE/DELETE policies; avoid broad `USING (true)` policies for private data.
- Public/driver charger reads must be restricted to active, published listings.
- Owners may access only chargers they own and requests for those chargers.
- Drivers may access only their own requests.
- Superadmin access must derive from trusted identity/role data.
- Test policies using separate accounts and direct API attempts, not only the UI.
- Review policy recursion and `SECURITY DEFINER` function behavior carefully.

## 6. Safe State Transitions

- Initial request status must be set server-side to `pending`.
- Driver can cancel only their own pending request.
- Owner can approve/reject only pending requests for a charger they own.
- Prevent changing `driver_id`, `charger_id`, `created_at`, `decided_by`, and privileged fields through ordinary updates.
- Prefer atomic SQL functions for approve/reject/cancel operations; check current state and caller authorization inside the operation.
- For `SECURITY DEFINER` functions, set a fixed safe `search_path`, schema-qualify objects, validate caller identity, and grant execute only to the intended role.
- Handle zero affected rows as a failure, not a success message.

## 7. Data Protection and Privacy

- Collect only data needed for the workflow.
- Do not publicly expose phone numbers, emails, or authentication metadata.
- Show driver display name to owners only where needed for request handling.
- Do not include sensitive personal data in demo records.
- Avoid logging free-text notes unless necessary for debugging.
- Provide clear disclosure that charger availability is owner-reported in the MVP.
- Establish a retention/deletion approach before production use beyond a hackathon.

## 8. Input Validation

- Validate on the client for usability and enforce critical rules in PostgreSQL/functions.
- Trim and length-limit names, addresses, descriptions, notes, and response notes.
- Validate connector values against a controlled list.
- Validate power > 0, non-negative price, and coordinate ranges.
- Validate future request start time and bounded positive duration.
- Treat all user content as plain text; never inject with `dangerouslySetInnerHTML`.
- Use parameterized Supabase queries; do not concatenate untrusted input into raw SQL.
- Use safe file type/size limits if Storage photos are implemented.

## 9. Secrets and Environment

- Browser may receive only the Supabase URL and anon/publishable key intended for public clients.
- **Never expose the service-role key** in `VITE_*`, frontend bundles, Git, screenshots, or public documentation.
- Keep server-side secrets in trusted Supabase Edge Function/hosting secret settings.
- Commit `.env.example` with placeholders only.
- Add `.env`, credentials, exported user data, and private demo notes to `.gitignore`.
- Rotate any secret accidentally committed or shared.

## 10. Abuse and Operational Risks

- Add reasonable form limits and avoid uncontrolled repeated submissions.
- Disable submit while a request is processing.
- Use database constraints and transactions for important state changes.
- Do not claim charger is live or hardware-verified without a real integration.
- Treat user-submitted charger listings as unverified until moderation is available.
- Destructive superadmin actions should require confirmation and a reason.
- If audit logs are implemented, users must not be able to forge or edit them.

## 11. Deployment Security

- Configure Auth redirect URLs to trusted domains only.
- Restrict any map-provider browser key by domain and API scope.
- Verify production RLS and database schema, not just local development.
- Do not expose Supabase management credentials in CI logs.
- Use HTTPS hosting.
- Check browser console and network requests for leaked secrets.
- Keep dependency count small and avoid unreviewed packages.

## 12. Required Verification Checklist

- [ ] RLS enabled on all API-exposed tables.
- [ ] Driver cannot read another driver's requests.
- [ ] Owner cannot read/update another owner's chargers or requests.
- [ ] User cannot assign or self-update to `superadmin`.
- [ ] Request status cannot be forged through broad updates.
- [ ] Superadmin actions require trusted role authorization.
- [ ] Invalid dates, durations, coordinates, and prices are rejected.
- [ ] User content is rendered as text, not executable HTML.
- [ ] Service-role key is absent from frontend code and repository.
- [ ] Environment variables use placeholders in examples.
- [ ] Production redirect URLs are restricted.
- [ ] Core operations fail safely and do not show false success.
- [ ] Known limitations are documented honestly.

## 13. Known MVP Limitations

- Charger availability is owner-reported, not hardware telemetry.
- A request is not a guaranteed reservation unless owner-approved and the product explicitly defines it as such.
- Payments, owner payouts, identity verification, dispute handling, and production-grade booking conflict resolution are out of scope.
- RLS and SQL functions must be reviewed against the deployed schema; this document alone does not prove the application is secure.
- Do not claim compliance certification or a completed security audit.
