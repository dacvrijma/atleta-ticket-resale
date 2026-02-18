import { render, screen, cleanup, waitFor } from "@testing-library/react"
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
})
