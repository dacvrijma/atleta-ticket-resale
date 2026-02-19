import { render, screen, cleanup, waitFor, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, afterEach } from "vitest"
import EventDetailPage from "@/app/events/[id]/page"

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "test-id" }),
}))

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

const mockGetEvent = vi.fn()

vi.mock("@/context/EventsContext", () => ({
  useEvents: () => ({ getEvent: mockGetEvent }),
}))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  mockGetEvent.mockReset()
})

const TEST_EVENT = {
  id: "test-id",
  title: "Test Event",
  eventId: "SdUE6lPR70dK",
}

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

function mockFetchSuccess(registrations: ReturnType<typeof makeRegistration>[]) {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(
      JSON.stringify({ data: { event: { registrations_for_sale: registrations } } }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  )
}

describe("EventDetailPage", () => {
  it("shows event not found when event does not exist", () => {
    mockGetEvent.mockReturnValue(undefined)
    vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {}))

    render(<EventDetailPage />)
    expect(screen.getByText("Event not found.")).toBeInTheDocument()
  })

  it("shows loading state while fetching tickets", () => {
    mockGetEvent.mockReturnValue(TEST_EVENT)
    vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {}))

    render(<EventDetailPage />)
    expect(screen.getByText("Loading tickets…")).toBeInTheDocument()
  })

  it("shows ticket list on successful fetch", async () => {
    mockGetEvent.mockReturnValue(TEST_EVENT)
    mockFetchSuccess([makeRegistration("1")])

    render(<EventDetailPage />)

    await waitFor(() => {
      expect(screen.getByText("MEN SOLO HEAVY")).toBeInTheDocument()
    })
  })

  it("shows empty state when no tickets are available", async () => {
    mockGetEvent.mockReturnValue(TEST_EVENT)
    mockFetchSuccess([])

    render(<EventDetailPage />)

    await waitFor(() => {
      expect(
        screen.getByText("No tickets available at the moment.")
      ).toBeInTheDocument()
    })
  })

  it("shows error state on fetch failure", async () => {
    mockGetEvent.mockReturnValue(TEST_EVENT)
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Forbidden", { status: 403 })
    )

    render(<EventDetailPage />)

    await waitFor(() => {
      expect(
        screen.getByText("Request failed with status 403")
      ).toBeInTheDocument()
    })
  })

  it("shows refresh controls when an event is found", () => {
    mockGetEvent.mockReturnValue(TEST_EVENT)
    vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {}))

    render(<EventDetailPage />)

    expect(screen.getByText(/Last refreshed:/)).toBeInTheDocument()
    expect(screen.getByText(/Next refresh in:/)).toBeInTheDocument()
    expect(screen.getByText(/Interval:/)).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Refresh tickets" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Decrease interval" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Increase interval" })
    ).toBeInTheDocument()
  })

  it("shows a dash for last refreshed before the first fetch completes", () => {
    mockGetEvent.mockReturnValue(TEST_EVENT)
    vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {}))

    render(<EventDetailPage />)

    expect(screen.getByText("—")).toBeInTheDocument()
  })

  it("replaces the dash with a timestamp after a successful fetch", async () => {
    mockGetEvent.mockReturnValue(TEST_EVENT)
    mockFetchSuccess([])

    render(<EventDetailPage />)

    await waitFor(() => {
      expect(screen.queryByText("—")).not.toBeInTheDocument()
    })
  })

  it("Refresh now button triggers an additional fetch", async () => {
    mockGetEvent.mockReturnValue(TEST_EVENT)
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ data: { event: { registrations_for_sale: [] } } }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    )

    render(<EventDetailPage />)

    await waitFor(() =>
      expect(
        screen.getByText("No tickets available at the moment.")
      ).toBeInTheDocument()
    )
    expect(fetchSpy).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole("button", { name: "Refresh tickets" }))

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2))
  })

  it("shows the default interval as 1 min", () => {
    mockGetEvent.mockReturnValue(TEST_EVENT)
    vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {}))

    render(<EventDetailPage />)

    expect(screen.getByText("1 min")).toBeInTheDocument()
  })

  it("Increase interval button increments the displayed interval", () => {
    mockGetEvent.mockReturnValue(TEST_EVENT)
    vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {}))

    render(<EventDetailPage />)

    fireEvent.click(screen.getByRole("button", { name: "Increase interval" }))

    expect(screen.getByText("2 min")).toBeInTheDocument()
  })

  it("Decrease interval button is disabled when interval is already 1 min", () => {
    mockGetEvent.mockReturnValue(TEST_EVENT)
    vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {}))

    render(<EventDetailPage />)

    expect(
      screen.getByRole("button", { name: "Decrease interval" })
    ).toBeDisabled()
  })

  it("Decrease interval button becomes enabled after increasing the interval", () => {
    mockGetEvent.mockReturnValue(TEST_EVENT)
    vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {}))

    render(<EventDetailPage />)

    fireEvent.click(screen.getByRole("button", { name: "Increase interval" }))

    expect(
      screen.getByRole("button", { name: "Decrease interval" })
    ).not.toBeDisabled()
  })
})
