# UI/UX Specification — VoltSpot

## 1. Design Goal

Create a polished mobility product that feels trustworthy, quick, and calm. Avoid generic dashboard clutter, excessive gradients, oversized empty hero sections, or decorative elements that compete with charger discovery.

**Core visual story:** Search is effortless; charger details are clear; requesting a session feels safe and predictable.

## 2. Visual Identity

- **Product name:** VoltSpot
- **Tagline:** Find a plug. Request a slot. Get moving.
- **Personality:** Confident, practical, modern, environmentally aware without relying on clichéd leaf imagery.
- **Icon style:** Lucide outline icons, consistent 1.75–2 px stroke.
- **Illustrations:** Optional, minimal; prioritize real interface content.

## 3. Design Tokens

Use CSS variables/Tailwind theme tokens. Suggested palette:

| Token | Value | Usage |
|---|---|---|
| `--background` | `#F5F7F4` | App canvas |
| `--surface` | `#FFFFFF` | Cards, dialogs, forms |
| `--foreground` | `#17231F` | Main text |
| `--muted` | `#66736D` | Supporting text |
| `--border` | `#E1E7E2` | Dividers, outlines |
| `--primary` | `#174D3A` | Main actions, navigation |
| `--primary-foreground` | `#FFFFFF` | Text on primary |
| `--accent` | `#C8F169` | Small highlight, key metric, active filter |
| `--accent-foreground` | `#17231F` | Text on accent |
| `--success` | `#237A4B` | Approved/available |
| `--warning` | `#A96712` | Pending |
| `--danger` | `#B93838` | Rejected, destructive actions |
| `--info` | `#2867A5` | Informational status |

Do not use the lime accent for long paragraphs or low-contrast text. Verify contrast for all text and focus states.

### Typography

- Preferred: Inter; use system sans-serif fallback if font setup delays delivery.
- Page title: 28–32 px desktop, 24–28 px mobile, weight 650–700.
- Section title: 18–22 px, weight 600.
- Card title: 16–18 px, weight 600.
- Body: 14–16 px, line height 1.45–1.6.
- Metadata: 12–13 px, line height 1.4.
- Numeric metrics: 28–36 px, tabular numerals.

### Spacing and shape

- Base spacing unit: 4 px.
- Common gaps: 8, 12, 16, 20, 24, 32 px.
- Card radius: 16 px.
- Inputs/buttons: 10–12 px radius.
- Pill radius: 999 px.
- Card border: 1 px solid token border; shadow should be subtle and used sparingly.
- Content max width: 1280 px; readable form width: 640–720 px.

## 4. Application Shell

### Desktop

- Fixed or sticky left sidebar for authenticated owner/superadmin areas; 240 px wide.
- Driver discovery uses a compact top bar: logo, search/location control, navigation, profile menu.
- Main content begins with page title and short supporting copy.
- Use a 12-column grid or simple responsive grid; do not over-engineer.
- Sidebar active item has a light green surface, dark-green text, and a slim accent indicator.
- Main content has 24–32 px padding.

### Mobile

- No permanently open desktop sidebar.
- Use compact top bar and bottom navigation for primary driver screens if practical.
- Filters open in a sheet/dialog.
- Cards stack in one column; actions are full-width when needed.
- Touch targets at least 44 × 44 px.
- Avoid horizontal scrolling except for compact filter chips.

## 5. Screen Specifications

### `/` — Landing

- Top navigation with VoltSpot wordmark and Sign in / Find chargers CTA.
- Hero headline: “Your next charge starts here.”
- Supporting copy explains discover → request → owner confirmation.
- One primary CTA: “Find a charger”.
- A product preview card showing a realistic charger result, clearly illustrative if not loaded from data.
- Three short trust/value points: clear specs, owner-managed listings, request status tracking.
- Keep the landing screen concise; authenticated users should reach discovery quickly.

### `/chargers` — Driver Discovery (primary demo screen)

**This is the first screen to polish.**

- Page heading “Find your next charge” and one-line explanation.
- Search input with placeholder “Search area, address, or charger name”.
- Filter row: connector, power, status, sort; show active filters as removable chips.
- Desktop layout: result list in a 1–2 column card grid; real map side panel only if provider integration is complete.
- Mobile: full-width search, horizontally scrollable filter chips, single-column results.
- Each charger card includes:
  - charger name and locality
  - availability badge (`Available`, `Busy`, `Offline`) labelled owner-reported
  - connector chips
  - power in kW
  - price only if set, with currency
  - “View details” action
- Empty state: friendly explanation and “Clear filters”.
- Loading state: skeleton cards.
- Error state: retry action and nontechnical message.
- Do not fabricate distance, live occupancy, or map positions.

### `/chargers/:id` — Charger Detail and Request

- Breadcrumb/back link to results.
- Header with charger name, locality, status, and key specs.
- Detail grid: connector, max power, price, address, access notes, owner description.
- If photos exist, use a compact gallery; otherwise use a designed neutral icon panel, not broken-image placeholders.
- Request form in a distinct card:
  - requested start date/time
  - duration selector
  - optional note
  - concise disclaimer: “This is a request. The owner must confirm it.”
- Submit button with idle/loading/disabled states.
- Success state displays request reference and `Pending` badge only after database success.
- Validation errors appear next to fields and in an accessible summary if needed.

### `/my-requests` — Driver Requests

- Page title and short explanation.
- Tabs or filter chips: All, Pending, Approved, Rejected, Cancelled.
- Request cards show charger name, requested time, duration, submitted date, status, and owner response note.
- Cancel action only for pending requests; confirm before cancellation.
- Empty state links back to discovery.
- Status changes must reflect database state, not local-only optimism.

### `/owner` — Owner Dashboard

- Sidebar/top navigation: Overview, My chargers, Requests, profile.
- Welcome line and compact metric cards: active listings, pending requests, total requests.
- Priority section: “Needs your attention” with pending requests.
- Recent charger list with status and quick edit.
- Keep metrics meaningful; no fake charts or inflated counts.

### `/owner/chargers` — Owner Listings

- Page heading, “Add charger” primary action.
- Table on desktop, cards on mobile.
- Columns/fields: name, area, connector, power, publication status, availability, updated date, actions.
- Actions: Edit, Publish/Unpublish, Deactivate (if supported).
- Empty state with clear create CTA.
- Show draft/unpublished listings only to their owner.

### Charger create/edit form

- Group fields into **Basics**, **Location**, **Charging details**, **Access & pricing**.
- Required fields visually marked and labelled.
- Use explicit units: kW and ₹/kWh if currency is INR.
- Connector selection uses accessible multi-select checkboxes/chips.
- Latitude/longitude optional; validate ranges.
- Sticky or bottom-aligned Save action on mobile.
- Warn before navigating away with unsaved changes if easy to implement.

### `/owner/requests` — Owner Requests

- Summary filter chips and request list.
- Request card shows driver display name only if permitted, charger, requested start, duration, note, submitted time, and current status.
- Pending cards show Approve and Reject buttons.
- Require confirmation for decision if it cannot be undone.
- After action, show persisted status and update metrics.
- Rejected/approved cards should not retain active decision buttons.

### `/superadmin` — Platform Overview

- Strong but restrained admin shell; distinct “Platform administration” label.
- Metric cards: total users, active listings, pending requests, approved requests.
- Recent requests and listings needing review.
- Do not use vanity charts unless backed by actual aggregate queries.

### `/superadmin/users`, `/superadmin/chargers`, `/superadmin/requests`

- Searchable table with responsive card fallback.
- Clear status labels and owner/driver relationships.
- Listing moderation action has a confirmation dialog and reason field if possible.
- Request override/cancellation requires a reason.
- Show empty, loading, and error states.
- Never expose sensitive authentication metadata or unnecessary contact details.

### `/login` and `/signup`

- Centered card with clear brand and concise instructions.
- Password visibility toggle if easy; accessible labels and error text.
- Disable submit during request; show server error without exposing internals.
- Signup must not offer superadmin.
- Redirect based on verified role after profile is loaded.

## 6. Component Inventory

Build reusable components for:
- `AppShell`, `TopNav`, `Sidebar`, `PageHeader`
- `ChargerCard`, `ChargerStatusBadge`, `ConnectorChip`
- `RequestCard`, `RequestStatusBadge`
- `MetricCard`, `FilterBar`, `SearchInput`
- `FormField`, `EmptyState`, `ErrorState`, `SkeletonCard`
- `ConfirmDialog`, `Toast/InlineNotice`, `LoadingButton`

Use shared tokens and component variants; do not create one-off styles for each page.

## 7. Interaction and State Rules

- Every button must perform a real action or be visibly disabled with an explanation.
- Forms validate before submit and display backend errors.
- Do not show a success toast until the backend confirms success.
- Disable submit while mutation is in flight.
- Confirm destructive actions.
- Status colors and labels must be consistent across all screens.
- Use skeletons for initial loads and empty states for legitimate zero results.
- Preserve search/filter state when navigating back if straightforward.
- Prefer accessible native controls over custom controls that take too long to implement.

## 8. Accessibility and Responsiveness

- Semantic headings in order, labels associated with fields, keyboard-accessible navigation, visible focus indicators.
- Do not communicate state by color alone; include text/icon.
- Dialogs must be keyboard-dismissible and focus managed where supported.
- Meet WCAG AA contrast as far as practical.
- Test at 360 px, 768 px, 1024 px, and 1440 px widths.
- Respect reduced-motion preferences for transitions.

## 9. Motion

- Short 120–200 ms transitions for hover/focus and sheet/dialog entry.
- Subtle card hover elevation on desktop only.
- Avoid scroll-jacking, animated counters that imply false data, and expensive background effects.

## 10. Visual QA Checklist

- The discovery page is visually polished before secondary dashboards.
- Spacing, radius, typography, and button sizes are consistent.
- All core screens have loading/error/empty states.
- Mobile layout has no clipped controls or horizontal overflow.
- Status text is readable and consistent.
- No fake map, fake realtime, fake counts, placeholder buttons, or broken images.
- The complete request journey looks and feels coherent from driver through owner decision.
