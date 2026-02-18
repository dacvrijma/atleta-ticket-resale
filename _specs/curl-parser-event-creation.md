# Spec for Curl Parser Event Creation

branch: claude/feature/curl-parser-event-creation

## Summary

Update the add-event flow so the user only provides a **title** and a **curl command** (both required). The curl command is the raw string copied from the Proxyman GraphQL call to the Atleta API. On submission, the app parses the curl command to extract the request URL, all HTTP headers (including cookies), and the Referer header value as a separate `resaleUrl` field. The resulting Event object (`title`, `url`, `headers`, `resaleUrl`) is persisted in context and the user is navigated to the event's detail page, which temporarily renders the Event object as formatted JSON.

## Functional Requirements

- The sidebar add-event form is simplified to two required fields:
  - **Title** — free-text name for the event.
  - **Curl command** — a large textarea for pasting the raw curl string. Include a hint/helper text: "Paste the curl command copied from the GraphQL call via Proxyman."
- Remove the existing "Project ID" field from the form.
- On submission, parse the curl command string to extract:
  - **url** — the request URL (the first quoted string after `curl`).
  - **headers** — a key-value record of all `-H` header values and `--cookie` values (cookie should be stored as a `Cookie` header entry).
  - **resaleUrl** — the value of the `Referer` header, if present. This is optional.
- The parsed data is stored in the Event model which now has these properties:
  - `id` — auto-generated UUID (unchanged).
  - `title` — user-provided name.
  - `url` — parsed API endpoint URL.
  - `headers` — `Record<string, string>` of all extracted headers.
  - `resaleUrl` — the Referer header value, or `null` if not present.
- After a successful add, navigate programmatically to `/events/[id]` for the new event.
- The event detail page at `/events/[id]` displays the Event object as formatted JSON (temporary, will be replaced in a future spec).
- Events remain in-memory via the existing `EventsContext`.

## Possible Edge Cases

- Curl command contains line continuations (`\` followed by newline) — the parser must handle multi-line curl strings.
- Curl command uses double quotes instead of single quotes around header values or the URL.
- Curl command has no Referer header — `resaleUrl` should be `null`.
- Curl command has no `-H` headers at all — `headers` should be an empty object, URL should still be extracted.
- User pastes extra whitespace or leading/trailing newlines — trim before parsing.
- Curl command includes `--cookie` flag — store value as a `Cookie` header.
- Curl command includes flags like `--data-raw`, `--proxy`, `-X` — these should be ignored by the parser (only URL, headers, and cookies are needed).

## Acceptance Criteria

- [ ] The add-event form has exactly two fields: Title and Curl Command (both required).
- [ ] Helper text below the curl command textarea reads "Paste the curl command copied from the GraphQL call via Proxyman."
- [ ] Submitting with an empty field shows a validation error.
- [ ] The curl parser correctly extracts the URL from the curl command.
- [ ] The curl parser correctly extracts all `-H` headers into a `Record<string, string>`.
- [ ] The curl parser extracts `--cookie` values as a `Cookie` header.
- [ ] The Referer header value is stored separately as `resaleUrl`.
- [ ] After adding an event, the app navigates to `/events/[id]`.
- [ ] The event detail page shows the Event object as formatted JSON.
- [ ] The Event model no longer has `curlCommand` or `projectId` fields.

## Open Questions

- Should the raw curl command string also be stored on the Event for potential re-parsing later, or is the parsed data sufficient? No
- Should we validate that the URL looks like an Atleta API endpoint, or accept any URL? Yes

## Testing Guidelines

Create test file(s) in the `./tests` folder for the new feature, without going too heavy:

- The curl parser extracts the URL from a single-line curl command.
- The curl parser extracts the URL from a multi-line curl command (with `\` continuations).
- The curl parser extracts all `-H` headers into a key-value record.
- The curl parser extracts `--cookie` as a `Cookie` header.
- The curl parser returns the Referer header value as `resaleUrl`.
- The curl parser returns `null` for `resaleUrl` when no Referer header is present.
- The add-event form validates that both fields are required.
