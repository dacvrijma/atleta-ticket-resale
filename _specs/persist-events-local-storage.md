# Spec for persist-events-local-storage

branch: claude/feature/persist-events-local-storage

## Summary

Events added by the user are currently lost on every page refresh because they are stored only in React state (in-memory). This spec covers persisting the events list to `localStorage` so that events survive page reloads and browser restarts.

## Functional Requirements

- When an event is added, it must be immediately saved to `localStorage`.
- On app load, events must be read from `localStorage` and used as the initial state.
- When an event is removed (if/when that feature exists), `localStorage` must be updated accordingly.
- If `localStorage` is unavailable or contains invalid/corrupt data, the app must fall back gracefully to an empty events list without crashing.
- All existing event fields (`id`, `title`, `eventId`) must be preserved correctly across reloads.
- Alert settings and any other per-event data stored alongside events must also be persisted.

## Possible Edge Cases

- `localStorage` is disabled or blocked by the browser (e.g. private/incognito mode in some browsers).
- Stored JSON is malformed or from an older schema version that is missing fields.
- A user opens the app in multiple tabs simultaneously — writes from one tab should not silently overwrite another tab's in-flight changes.
- Very large numbers of events could approach `localStorage` size limits (~5 MB).
- Server-side rendering: `localStorage` is not available on the server, so access must be guarded to client-only execution.

## Acceptance Criteria

- Adding an event and refreshing the page shows the same event still listed in the sidebar.
- Closing and reopening the browser still shows previously added events.
- Starting the app with no prior `localStorage` data shows an empty state without errors.
- Corrupted or unparseable `localStorage` data is silently discarded and replaced with an empty list.
- No console errors or crashes related to `localStorage` access during SSR or in environments where it is unavailable.

## Open Questions

- Should there be a migration strategy if the stored event schema changes in a future release?
- Should alert settings (currently stored per-event) be co-located in the same `localStorage` key as events, or kept in their own separate key?

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Events added to the context are written to `localStorage`.
- On mount, events are loaded from `localStorage` and appear in the events list.
- If `localStorage` contains invalid JSON, the context initialises with an empty array and does not throw.
- If `localStorage` is not available (simulated), the context initialises with an empty array and does not throw.
