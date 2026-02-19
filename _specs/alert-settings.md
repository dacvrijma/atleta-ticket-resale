# Spec for Alert Settings

branch: claude/add-alert-settings-Hvk1M

## Summary
Add an "Alert Settings" section to the sidebar (or settings area) where users can configure automatic ticket alerts. The user provides a text query; after every data refresh, all tickets are scanned and if any ticket's title or subtitle contains the query (case-insensitive), an action is triggered. If the "Auto Open" toggle is enabled, the buy-ticket link for the first matching ticket is automatically opened in a new browser tab.

## Functional Requirements
- The Alert Settings section contains:
  - A text input labelled "Match Query" where the user types a search string
  - A toggle switch labelled "Auto Open" (on/off)
- Settings are persisted in localStorage so they survive page reloads
- After every ticket refresh cycle, all fetched tickets are checked against the saved query
- A ticket is considered a match if its title OR subtitle contains the query string (case-insensitive, trimmed)
- An empty query string disables matching entirely (no tickets are matched)
- When Auto Open is ON and at least one ticket matches, the buy-ticket URL of the **first** matching ticket is opened in a new tab (`window.open(url, '_blank')`)
- When Auto Open is OFF, matching is still evaluated (for future UI indicators) but no tab is opened
- If there are multiple matches, only the first match is acted upon

## Possible Edge Cases
- Empty query: no matching should occur
- Whitespace-only query: treated as empty (no match)
- Query with special regex characters: matched as a plain substring, not a regex
- No tickets returned from refresh: no match, no tab opened
- Ticket missing a subtitle: only the title is checked
- Match found but the ticket has no buy link: skip opening a tab gracefully
- Auto Open toggled off mid-session: previously scheduled opens are not triggered

## Acceptance Criteria
- Alert Settings section is visible in the UI
- Typing a query and toggling Auto Open persists across page reloads (localStorage)
- After a refresh, if a ticket title or subtitle matches the query (case-insensitive), the first match's buy link opens in a new tab (when Auto Open is ON)
- No tab is opened when Auto Open is OFF, even if there is a match
- No tab is opened when the query is empty or whitespace-only
- No tab is opened when no tickets match

## Open Questions
- Should the Alert Settings appear inside the existing Sidebar, or in a dedicated settings panel?
- Should there be visual feedback (e.g. a highlight or toast) when a match is found, regardless of the Auto Open toggle?

## Testing Guidelines
Create a test file in `tests/components/AlertSettings.test.tsx` and `tests/alertMatching.test.ts` for the matching logic. Test for:
- Rendering the Match Query input and Auto Open toggle
- Persisting and restoring values from localStorage
- Match function returns true when title contains query (case-insensitive)
- Match function returns true when subtitle contains query (case-insensitive)
- Match function returns false for empty/whitespace query
- Match function returns false when neither title nor subtitle matches
- After refresh with Auto Open ON and a match, `window.open` is called with the first match's buy URL
- After refresh with Auto Open OFF, `window.open` is NOT called even with a match
- Only the first matching ticket's link is opened when multiple tickets match
