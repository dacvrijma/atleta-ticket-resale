# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm test          # Run all tests (vitest)
npm test -- tests/path/to/file.test.tsx  # Run a single test file
npx vitest --watch  # Watch mode
npm run lint      # ESLint
```

## Architecture

**Framework:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Vitest.

**`@/` alias** maps to `src/`.

**Layout:** The root layout (`src/app/layout.tsx`) wraps all pages in an `EventsProvider` and renders a two-column shell — `Sidebar` (left, fixed width) + `<main>` (right, scrollable flex child).

**State:** Shared event state lives in `src/context/EventsContext.tsx`. This is the single source of truth for the events list. Components that need to read or mutate events use the `useEvents()` hook.

**Routing:** Pages live under `src/app/`. The dynamic event detail route is `src/app/events/[id]/page.tsx`. The home page (`src/app/page.tsx`) is an empty state placeholder.

**Components:** Reusable UI components live in `src/components/`. The `/component` slash command uses TDD: write tests first in `tests/components/`, then implement.

## Conventions

- Client components that use hooks or browser APIs must have `"use client"` at the top.
- Components are plain `.tsx` files (no CSS Modules currently — use Tailwind utility classes).
- No semicolons in component files (enforced by the `/component` command pattern).
- Tests live in `tests/` and mirror the source structure (e.g. `tests/components/`, `tests/sidebar.test.tsx`). Always call `cleanup()` after each test when rendering multiple times in a file.
- Mock `next/navigation` and `next/link` in tests — they don't work in jsdom.

## Slash Commands

| Command | Purpose |
|---|---|
| `/spec <idea>` | Creates a `_specs/<slug>.md` and switches to a new `claude/feature/<slug>` branch. Requires a clean working tree. |
| `/component <description>` | TDD workflow: writes tests first, then implements the component. |
| `/commit-message` | Analyses staged diff and proposes a commit message. Never auto-commits. |

## Specs

Feature specs live in `_specs/`. When implementing a spec, read it first — it defines acceptance criteria and testing guidelines. Plans generated from specs are saved in `.claude/_plans/`.
