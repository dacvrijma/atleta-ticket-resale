import { describe, it, expect } from "vitest"
import { matchesQuery } from "@/utils/matchTickets"
import { ResaleRegistration } from "@/types/resale"

function makeReg(ticketTitle: string, promotionTitle?: string): ResaleRegistration {
  return {
    id: "reg-1",
    ticket: { id: "t1", title: ticketTitle, units: 1, description: "", business: false, image: null },
    promotion: promotionTitle ? { id: "p1", title: promotionTitle } : null,
    time_slot: { id: "ts1", start_date: "2026-03-01", start_time: null, title: null, multi_date: false },
    resale: {
      id: "r1",
      available: true,
      total_amount: 4200,
      fee: 210,
      public_url: "https://example.com/buy",
      public_token: "xxx",
      upgrades: [],
    },
    required_attributes: [],
    start_time: null,
    corral_name: null,
  }
}

describe("matchesQuery", () => {
  it("returns false for an empty query", () => {
    expect(matchesQuery(makeReg("MEN SOLO HEAVY"), "")).toBe(false)
  })

  it("returns false for a whitespace-only query", () => {
    expect(matchesQuery(makeReg("MEN SOLO HEAVY"), "   ")).toBe(false)
  })

  it("matches ticket title (exact case)", () => {
    expect(matchesQuery(makeReg("MEN SOLO HEAVY"), "MEN SOLO")).toBe(true)
  })

  it("matches ticket title case-insensitively", () => {
    expect(matchesQuery(makeReg("MEN SOLO HEAVY"), "men solo")).toBe(true)
  })

  it("returns false when query does not appear in title or promotion", () => {
    expect(matchesQuery(makeReg("MEN SOLO HEAVY"), "WOMEN")).toBe(false)
  })

  it("matches promotion title (subtitle) case-insensitively", () => {
    expect(matchesQuery(makeReg("MEN SOLO HEAVY", "GYMRACE"), "gymrace")).toBe(true)
  })

  it("matches promotion title when ticket title does not match", () => {
    expect(matchesQuery(makeReg("MEN SOLO HEAVY", "GYMRACE"), "GYMRACE")).toBe(true)
  })

  it("returns false when promotion is null and query does not match title", () => {
    expect(matchesQuery(makeReg("MEN SOLO HEAVY"), "gymrace")).toBe(false)
  })

  it("matches a partial substring in the ticket title", () => {
    expect(matchesQuery(makeReg("MEN SOLO HEAVY"), "HEAVY")).toBe(true)
  })

  it("treats query as plain text, not a regex", () => {
    // A dot in regex matches any char; here it should only match a literal dot
    expect(matchesQuery(makeReg("MEN SOLO HEAVY"), "MEN.SOLO")).toBe(false)
  })

  describe("combined display text matching", () => {
    it("matches the full combined 'Title · Promotion' string copied from the UI", () => {
      expect(matchesQuery(makeReg("MEN SOLO HEAVY", "GYMRACE"), "MEN SOLO HEAVY · GYMRACE")).toBe(true)
    })

    it("matches a cross-boundary substring spanning title and promotion", () => {
      expect(matchesQuery(makeReg("MEN SOLO HEAVY", "GYMRACE"), "HEAVY · GYMRACE")).toBe(true)
    })

    it("matches a query that contains the literal separator character", () => {
      // " · " is in the combined display string, so it matches (query is not empty after trim)
      expect(matchesQuery(makeReg("MEN SOLO HEAVY", "GYMRACE"), " · ")).toBe(true)
    })
  })
})
