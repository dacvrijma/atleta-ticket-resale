# Spec for event-detail-api-fetch

branch: claude/feature/event-detail-api-fetch
figma_component (if used): N/A

## Summary

When a user navigates to an event detail page, the app fetches ticket data from the event's URL using the headers stored alongside the event. The response is parsed and used to populate the ticket list. The page handles loading, empty, and error states gracefully.

## Functional Requirements

- When the event detail page mounts, trigger a fetch request to the event's stored URL
- Include all headers that were captured as part of the event (from the curl import) in the fetch request
- Parse the API response and extract the list of tickets
- Populate the ticket list UI with the fetched ticket data
- Show a loading state while the request is in flight
- Show an empty state when the response contains no tickets
- Show an error state when the request fails (network error, non-2xx response, parse failure)
- The fetch should only run once on page load (not on every render)

## Figma Design Reference (only if referenced)

N/A

## Possible Edge Cases

- The event URL is unreachable or returns a non-2xx status
- The response body is not valid JSON or does not match the expected ticket schema
- The response contains an empty tickets array
- Headers stored with the event are malformed or missing
- The user navigates away before the fetch completes (cleanup/abort)
- Very large ticket lists (performance consideration)

## Acceptance Criteria

- Navigating to an event detail page triggers a fetch to the event's URL with the correct headers
- Tickets returned by the API are displayed in the ticket list
- A loading indicator is visible while the fetch is in progress
- An empty state message is shown when no tickets are returned
- An error message is shown when the fetch fails for any reason
- No duplicate fetches occur on re-renders

## Open Questions

- What is the exact shape of the API response? Which field(s) contain the ticket list?
- Should the user be able to manually retry after an error?
- Should the fetch be re-triggered if the user revisits the page (cache behavior)?

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Renders loading state immediately on mount
- Renders ticket list when fetch resolves successfully with tickets
- Renders empty state when fetch resolves with an empty ticket list
- Renders error state when fetch rejects or returns a non-2xx response
- Fetch is called with the correct URL and headers from the event
