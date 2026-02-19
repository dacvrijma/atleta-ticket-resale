import { renderHook, waitFor, cleanup } from "@testing-library/react"
import { describe, it, expect, vi, afterEach } from "vitest"
import { useTickets } from "@/hooks/useTickets"

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const TEST_EVENT_ID = "SdUE6lPR70dK"

function makeRegistration(id: string) {
  return {
    id,
    resale: {
      id,
      available: true,
      total_amount: 4200,
      fee: 210,
      public_url: "https://example.com/buy",
      public_token: "token",
      upgrades: [],
    },
    ticket: {
      id: "t1",
      title: "MEN SOLO HEAVY",
      units: 1,
      description: "",
      business: false,
      image: null,
    },
    promotion: null,
    time_slot: {
      id: "ts1",
      start_date: "2026-03-01",
      start_time: "09:10:00",
      title: null,
      multi_date: false,
    },
    required_attributes: [],
    start_time: null,
    corral_name: null,
  }
}

function mockProxySuccess(registrations: ReturnType<typeof makeRegistration>[]) {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(
      JSON.stringify({
        data: { event: { registrations_for_sale: registrations } },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  )
}

describe("useTickets", () => {
  it("starts in loading state", () => {
    vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useTickets(TEST_EVENT_ID))

    expect(result.current.loading).toBe(true)
    expect(result.current.tickets).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it("returns tickets on success", async () => {
    const reg = makeRegistration("1")
    mockProxySuccess([reg])

    const { result } = renderHook(() => useTickets(TEST_EVENT_ID))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.tickets).toEqual([reg])
    expect(result.current.error).toBeNull()
  })

  it("returns empty array when API returns no registrations", async () => {
    mockProxySuccess([])

    const { result } = renderHook(() => useTickets(TEST_EVENT_ID))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.tickets).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it("sets error on non-2xx response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Forbidden", { status: 403 })
    )

    const { result } = renderHook(() => useTickets(TEST_EVENT_ID))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe("Request failed with status 403")
    expect(result.current.tickets).toEqual([])
  })

  it("sets error on network failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"))

    const { result } = renderHook(() => useTickets(TEST_EVENT_ID))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe("Failed to fetch")
    expect(result.current.tickets).toEqual([])
  })

  it("calls the proxy with eventId in the body", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ data: { event: { registrations_for_sale: [] } } }),
        { status: 200 }
      )
    )

    renderHook(() => useTickets(TEST_EVENT_ID))

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledOnce())

    const [calledUrl, calledOptions] = fetchSpy.mock.calls[0]
    expect(calledUrl).toBe("/api/tickets")
    expect(calledOptions).toMatchObject({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: expect.any(AbortSignal),
    })

    const body = JSON.parse(calledOptions!.body as string)
    expect(body.eventId).toBe(TEST_EVENT_ID)
  })

  it("lastRefreshed is null before the first fetch completes", () => {
    vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useTickets(TEST_EVENT_ID))

    expect(result.current.lastRefreshed).toBeNull()
  })

  it("sets lastRefreshed to a Date after a successful fetch", async () => {
    mockProxySuccess([])
    const before = new Date()

    const { result } = renderHook(() => useTickets(TEST_EVENT_ID))

    await waitFor(() => expect(result.current.loading).toBe(false))

    const after = new Date()
    expect(result.current.lastRefreshed).toBeInstanceOf(Date)
    expect(result.current.lastRefreshed!.getTime()).toBeGreaterThanOrEqual(
      before.getTime()
    )
    expect(result.current.lastRefreshed!.getTime()).toBeLessThanOrEqual(
      after.getTime()
    )
  })

  it("does not set lastRefreshed when the fetch fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Forbidden", { status: 403 })
    )

    const { result } = renderHook(() => useTickets(TEST_EVENT_ID))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.lastRefreshed).toBeNull()
  })

  it("refetches when refreshKey changes", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ data: { event: { registrations_for_sale: [] } } }),
        { status: 200 }
      )
    )

    const { rerender } = renderHook(
      ({ key }: { key: number }) => useTickets(TEST_EVENT_ID, key),
      { initialProps: { key: 0 } }
    )

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1))

    rerender({ key: 1 })

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2))
  })
})
