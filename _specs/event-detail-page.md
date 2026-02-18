# Spec for Event Detail Page

branch: claude/feature/event-detail-page

## Summary

Implement the event detail page at `/events/[id]`. The page displays the event title and a dense list of available resale tickets. Each ticket row shows the ticket title, promotion name, price (formatted in euros from cent amount), time slot info, and a "Buy now" button that opens the ticket's `public_url` in a new tab. Data is sourced from a typed model based on the Atleta resale API response shape. For this spec, a mock data file seeded with the exact provided JSON sample is used to populate the page.

## Functional Requirements

- The page heading displays the event name (derived from the event's associated ticket data / promotion title — use the promotion title as the event/page title).
- The ticket list renders one row per `resellableRegistration` entry in the response.
- Each ticket row displays:
  - **Ticket title** (`ticket.title`) and **promotion name** (`promotion.title`) — shown together, e.g. "MEN SOLO HEAVY · GYMRACE"
  - **Price** — `resale.amount + resale.fee` divided by 100, formatted as euros (e.g. `€ 44.10`). This is the total price the buyer pays including the resale fee.
  - **Time slot** — formatted date and time from `time_slot.start_date` and `time_slot.start_time`, e.g. "Sunday, 1 March · 09:10"
  - **"Buy now" button** — opens `resale.public_url` in a new tab
- Only tickets where `resale.available === true` are shown.
- The layout is dense (compact rows, not large cards like the screenshot reference).
- Mock data lives in a dedicated file and matches the exact JSON sample provided, with the single entry duplicated to demonstrate a list.

## Data Models

Define TypeScript interfaces/types for the following shapes from the API response:

- `ResaleRegistration` — top-level item: id, resale, ticket, promotion, time_slot, required_attributes, start_time, corral_name
- `Resale` — id, resellable, available, amount, total_amount, fee, public_url, public_token, time_left, total_time
- `Ticket` — id, title, units, description, business, image
- `Promotion` — id, title
- `TimeSlot` — id, start_date, start_time, title, multi_date
- `ApiResponse` — wraps `data.resellableRegistration` and `data.event`

Models live in `src/types/resale.ts`.

## Possible Edge Cases

- No tickets available (`resale.available === false`) — those rows are filtered out; show an empty state message if none remain.
- `time_slot.start_time` is null — display date only, omit time portion.
- `time_slot.title` is set — use it instead of formatting the date/time.
- `promotion` is null — show only the ticket title without the separator.

## Acceptance Criteria

- [ ] `/events/[id]` renders the event/promotion title as the page heading.
- [ ] A list of ticket rows is shown, each with title + promotion, price in euros, time slot, and a Buy now button.
- [ ] Clicking "Buy now" opens `resale.public_url` in a new tab.
- [ ] Only tickets with `resale.available === true` are rendered.
- [ ] An empty state is shown when there are no available tickets.
- [ ] TypeScript types for the API response are defined in `src/types/resale.ts`.
- [ ] Mock data file contains the exact sample entry (duplicated to show a list).
- [ ] Displayed price is the total buyer price (`amount + fee`) in euros with two decimal places (cents ÷ 100).

## Open Questions

- How should the event title be sourced? The API response doesn't include a standalone event name field — should we use the promotion title, or will a future API call provide an event name?
- Should the event ID from the URL (`/events/[id]`) be used to filter mock data, or should the page always show all mock entries for now?

## Testing Guidelines

Create test file(s) in `./tests` for the new feature, without going too heavy:

- Event detail page renders the promotion title as the heading.
- Each available ticket row shows title, total price (amount + fee), and time slot.
- Tickets with `resale.available === false` are not rendered.
- The "Buy now" link has the correct `href` pointing to `public_url`.
