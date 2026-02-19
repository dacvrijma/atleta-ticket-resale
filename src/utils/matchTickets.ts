import { ResaleRegistration } from "@/types/resale"

/**
 * Returns true if the registration's ticket title or promotion title
 * contains the query string (case-insensitive). Returns false for an
 * empty or whitespace-only query.
 */
export function matchesQuery(reg: ResaleRegistration, query: string): boolean {
  const trimmed = query.trim()
  if (!trimmed) return false
  const lower = trimmed.toLowerCase()
  if (reg.ticket.title.toLowerCase().includes(lower)) return true
  if (reg.promotion?.title.toLowerCase().includes(lower)) return true
  return false
}
