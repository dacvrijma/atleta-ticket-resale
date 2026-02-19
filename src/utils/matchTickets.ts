import { ResaleRegistration } from "@/types/resale"

/**
 * Returns true if the registration's combined display text
 * (ticket title + optional " · " + promotion title, matching the UI)
 * contains the query string (case-insensitive). Returns false for an
 * empty or whitespace-only query.
 *
 * Matching against the full display string means that copying text
 * directly from the ticket list — including the "Title · Promotion"
 * combined line — will always produce a working query.
 */
export function matchesQuery(reg: ResaleRegistration, query: string): boolean {
  const trimmed = query.trim()
  if (!trimmed) return false
  const lower = trimmed.toLowerCase()
  const displayTitle = reg.promotion
    ? `${reg.ticket.title} · ${reg.promotion.title}`
    : reg.ticket.title
  return displayTitle.toLowerCase().includes(lower)
}
