# Spec for Project Scaffolding

branch: claude/feature/project-scaffolding

## Summary

Set up the core application shell for the ticket-resale scanning platform. The app consists of a persistent side panel listing all configured events, and a main content area that shows event details. Users can add new events by providing a name, pasting a curl command (which encodes the API request to scan for tickets), and specifying a project ID. The event list and add-event form live in the side panel; the detail view is out of scope for this spec.

## Functional Requirements

- The app layout has two regions: a side panel (left) and a main content area (right).
- The side panel displays a scrollable list of all added events, each shown by name.
- The side panel contains an "Add Event" button or inline form to create a new event.
- Adding an event requires three inputs:
  - **Name** — a human-readable label for the event.
  - **Curl command** — a raw curl string the user pastes in; stored as-is for later use.
  - **Project ID** — a string identifier linking the event to a project.
- After submission the new event appears immediately in the side panel list.
- Clicking an event in the list navigates to a detail route for that event (detail page content is out of scope).
- Events persist in application state for the current session (no backend required at this stage).

## Figma Design Reference (only if referenced)

N/A

## Possible Edge Cases

- User submits the add-event form with one or more empty fields — all three fields are required.
- User pastes a curl command that contains newlines or extra whitespace — store as-is without normalisation.
- Event list becomes long enough to overflow the side panel — panel should scroll independently of the main area.
- Duplicate event names — allow them (no uniqueness constraint at this stage).

## Acceptance Criteria

- [ ] The app renders a two-column layout: side panel and main content area.
- [ ] The side panel shows a list of events (empty state visible when no events exist).
- [ ] Clicking "Add Event" reveals a form with Name, Curl Command, and Project ID fields.
- [ ] Submitting the form with all fields filled adds the event to the list and closes/clears the form.
- [ ] Submitting the form with any field empty does not add the event and shows a validation message.
- [ ] Clicking an event in the list navigates to `/events/[id]` (or equivalent dynamic route).
- [ ] Side panel scrolls independently when the event list overflows.

## Open Questions

- Should events persist across page refreshes (e.g. localStorage) or is in-memory state sufficient for now?
- Is there a maximum length for the curl command input, or should it accept arbitrarily long strings?
- What should the empty state of the main content area look like before an event is selected?

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Side panel renders with an empty event list on first load.
- Submitting the add-event form with all fields populated adds the event to the list.
- Submitting the add-event form with a missing field shows a validation error and does not add the event.
- Clicking an event in the list triggers navigation to the correct event route.
