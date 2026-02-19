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

const mockGetEvent = vi.hoisted(() => vi.fn())

vi.mock("@/context/EventsContext", () => ({
  useEvents: () => ({ getEvent: mockGetEvent }),
}))

const mockUseAlertSettings = vi.hoisted(() =>
  vi.fn(() => ({ query: "", autoOpen: false, playSound: false, sendNotification: false }))
)

vi.mock("@/hooks/useAlertSettings", () => ({
  useAlertSettings: mockUseAlertSettings,
}))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  mockGetEvent.mockReset()
  mockUseAlertSettings.mockReset()
  mockUseAlertSettings.mockReturnValue({ query: "", autoOpen: false, playSound: false, sendNotification: false })
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

  describe("alert auto-open", () => {
    it("opens the buy URL when autoOpen is ON and a ticket title matches the query", async () => {
      mockGetEvent.mockReturnValue(TEST_EVENT)
      mockUseAlertSettings.mockReturnValue({ query: "MEN SOLO", autoOpen: true, playSound: false, sendNotification: false })
      mockFetchSuccess([makeRegistration("1")])
      const windowOpenSpy = vi.spyOn(window, "open").mockReturnValue(null)

      render(<EventDetailPage />)

      await waitFor(() => {
        expect(windowOpenSpy).toHaveBeenCalledWith("https://example.com/buy", "_blank")
      })
    })

    it("does NOT open a tab when autoOpen is OFF even if a ticket matches", async () => {
      mockGetEvent.mockReturnValue(TEST_EVENT)
      mockUseAlertSettings.mockReturnValue({ query: "MEN SOLO", autoOpen: false, playSound: false, sendNotification: false })
      mockFetchSuccess([makeRegistration("1")])
      const windowOpenSpy = vi.spyOn(window, "open").mockReturnValue(null)

      render(<EventDetailPage />)

      await waitFor(() =>
        expect(screen.getByText("MEN SOLO HEAVY")).toBeInTheDocument()
      )
      expect(windowOpenSpy).not.toHaveBeenCalled()
    })

    it("does NOT open a tab when the query is empty", async () => {
      mockGetEvent.mockReturnValue(TEST_EVENT)
      mockUseAlertSettings.mockReturnValue({ query: "", autoOpen: true, playSound: false, sendNotification: false })
      mockFetchSuccess([makeRegistration("1")])
      const windowOpenSpy = vi.spyOn(window, "open").mockReturnValue(null)

      render(<EventDetailPage />)

      await waitFor(() =>
        expect(screen.getByText("MEN SOLO HEAVY")).toBeInTheDocument()
      )
      expect(windowOpenSpy).not.toHaveBeenCalled()
    })

    it("does NOT open a tab when no tickets match the query", async () => {
      mockGetEvent.mockReturnValue(TEST_EVENT)
      mockUseAlertSettings.mockReturnValue({ query: "WOMEN", autoOpen: true, playSound: false, sendNotification: false })
      mockFetchSuccess([makeRegistration("1")])
      const windowOpenSpy = vi.spyOn(window, "open").mockReturnValue(null)

      render(<EventDetailPage />)

      await waitFor(() =>
        expect(screen.getByText("MEN SOLO HEAVY")).toBeInTheDocument()
      )
      expect(windowOpenSpy).not.toHaveBeenCalled()
    })

    it("opens only the first matching ticket's URL when multiple tickets match", async () => {
      mockGetEvent.mockReturnValue(TEST_EVENT)
      mockUseAlertSettings.mockReturnValue({ query: "MEN SOLO", autoOpen: true, playSound: false, sendNotification: false })
      const reg1 = { ...makeRegistration("1"), resale: { ...makeRegistration("1").resale, public_url: "https://example.com/buy/1" } }
      const reg2 = { ...makeRegistration("2"), resale: { ...makeRegistration("2").resale, public_url: "https://example.com/buy/2" } }
      mockFetchSuccess([reg1, reg2])
      const windowOpenSpy = vi.spyOn(window, "open").mockReturnValue(null)

      render(<EventDetailPage />)

      await waitFor(() => {
        expect(windowOpenSpy).toHaveBeenCalledTimes(1)
        expect(windowOpenSpy).toHaveBeenCalledWith("https://example.com/buy/1", "_blank")
      })
    })

    it("does NOT open a tab when no tickets are returned", async () => {
      mockGetEvent.mockReturnValue(TEST_EVENT)
      mockUseAlertSettings.mockReturnValue({ query: "MEN SOLO", autoOpen: true, playSound: false, sendNotification: false })
      mockFetchSuccess([])
      const windowOpenSpy = vi.spyOn(window, "open").mockReturnValue(null)

      render(<EventDetailPage />)

      await waitFor(() =>
        expect(screen.getByText("No tickets available at the moment.")).toBeInTheDocument()
      )
      expect(windowOpenSpy).not.toHaveBeenCalled()
    })
  })

  describe("play sound on match", () => {
    it("creates AudioContext when playSound is ON and a match is found", async () => {
      const mockOscillator = {
        connect: vi.fn(),
        frequency: { value: 0 },
        type: "sine" as OscillatorType,
        start: vi.fn(),
        stop: vi.fn(),
      }
      const mockGainNode = {
        connect: vi.fn(),
        gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      }
      const AudioContextSpy = vi.fn(function () {
        return {
          createOscillator: vi.fn(() => mockOscillator),
          createGain: vi.fn(() => mockGainNode),
          destination: {},
          currentTime: 0,
        }
      })
      globalThis.AudioContext = AudioContextSpy as unknown as typeof AudioContext

      mockGetEvent.mockReturnValue(TEST_EVENT)
      mockUseAlertSettings.mockReturnValue({ query: "MEN SOLO", autoOpen: false, playSound: true, sendNotification: false })
      mockFetchSuccess([makeRegistration("1")])

      render(<EventDetailPage />)

      await waitFor(() => {
        expect(AudioContextSpy).toHaveBeenCalled()
      })
    })

    it("does NOT create AudioContext when playSound is OFF", async () => {
      const AudioContextSpy = vi.fn()
      globalThis.AudioContext = AudioContextSpy as unknown as typeof AudioContext

      mockGetEvent.mockReturnValue(TEST_EVENT)
      mockUseAlertSettings.mockReturnValue({ query: "MEN SOLO", autoOpen: false, playSound: false, sendNotification: false })
      mockFetchSuccess([makeRegistration("1")])

      render(<EventDetailPage />)

      await waitFor(() =>
        expect(screen.getByText("MEN SOLO HEAVY")).toBeInTheDocument()
      )
      expect(AudioContextSpy).not.toHaveBeenCalled()
    })
  })

  describe("send notification on match", () => {
    it("fires a Notification when sendNotification is ON and permission is granted", async () => {
      const NotificationSpy = vi.fn()
      Object.defineProperty(NotificationSpy, "permission", {
        value: "granted",
        configurable: true,
      })
      globalThis.Notification = NotificationSpy as unknown as typeof Notification

      mockGetEvent.mockReturnValue(TEST_EVENT)
      mockUseAlertSettings.mockReturnValue({ query: "MEN SOLO", autoOpen: false, playSound: false, sendNotification: true })
      mockFetchSuccess([makeRegistration("1")])

      render(<EventDetailPage />)

      await waitFor(() => {
        expect(NotificationSpy).toHaveBeenCalledWith("Ticket match found!", {
          body: "MEN SOLO HEAVY",
        })
      })
    })

    it("does NOT fire a Notification when sendNotification is OFF", async () => {
      const NotificationSpy = vi.fn()
      Object.defineProperty(NotificationSpy, "permission", {
        value: "granted",
        configurable: true,
      })
      globalThis.Notification = NotificationSpy as unknown as typeof Notification

      mockGetEvent.mockReturnValue(TEST_EVENT)
      mockUseAlertSettings.mockReturnValue({ query: "MEN SOLO", autoOpen: false, playSound: false, sendNotification: false })
      mockFetchSuccess([makeRegistration("1")])

      render(<EventDetailPage />)

      await waitFor(() =>
        expect(screen.getByText("MEN SOLO HEAVY")).toBeInTheDocument()
      )
      expect(NotificationSpy).not.toHaveBeenCalled()
    })

    it("does NOT fire a Notification when permission is not granted", async () => {
      const NotificationSpy = vi.fn()
      Object.defineProperty(NotificationSpy, "permission", {
        value: "default",
        configurable: true,
      })
      globalThis.Notification = NotificationSpy as unknown as typeof Notification

      mockGetEvent.mockReturnValue(TEST_EVENT)
      mockUseAlertSettings.mockReturnValue({ query: "MEN SOLO", autoOpen: false, playSound: false, sendNotification: true })
      mockFetchSuccess([makeRegistration("1")])

      render(<EventDetailPage />)

      await waitFor(() =>
        expect(screen.getByText("MEN SOLO HEAVY")).toBeInTheDocument()
      )
      expect(NotificationSpy).not.toHaveBeenCalled()
    })
  })

  describe("auto-refresh pause on match", () => {
    it("shows 'Auto-refresh paused' when a match is found", async () => {
      mockGetEvent.mockReturnValue(TEST_EVENT)
      mockUseAlertSettings.mockReturnValue({ query: "MEN SOLO", autoOpen: false, playSound: false, sendNotification: false })
      mockFetchSuccess([makeRegistration("1")])

      render(<EventDetailPage />)

      await waitFor(() => {
        expect(screen.getByText("Auto-refresh paused")).toBeInTheDocument()
      })
    })

    it("shows Resume button when auto-refresh is paused", async () => {
      mockGetEvent.mockReturnValue(TEST_EVENT)
      mockUseAlertSettings.mockReturnValue({ query: "MEN SOLO", autoOpen: false, playSound: false, sendNotification: false })
      mockFetchSuccess([makeRegistration("1")])

      render(<EventDetailPage />)

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Resume auto-refresh" })).toBeInTheDocument()
      })
    })

    it("does NOT show 'Auto-refresh paused' when no match is found", async () => {
      mockGetEvent.mockReturnValue(TEST_EVENT)
      mockUseAlertSettings.mockReturnValue({ query: "WOMEN", autoOpen: false, playSound: false, sendNotification: false })
      mockFetchSuccess([makeRegistration("1")])

      render(<EventDetailPage />)

      await waitFor(() =>
        expect(screen.getByText("MEN SOLO HEAVY")).toBeInTheDocument()
      )
      expect(screen.queryByText("Auto-refresh paused")).not.toBeInTheDocument()
    })

    it("clicking Resume restores the countdown display", async () => {
      mockGetEvent.mockReturnValue(TEST_EVENT)
      mockUseAlertSettings.mockReturnValue({ query: "MEN SOLO", autoOpen: false, playSound: false, sendNotification: false })
      mockFetchSuccess([makeRegistration("1")])

      render(<EventDetailPage />)

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Resume auto-refresh" })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole("button", { name: "Resume auto-refresh" }))

      await waitFor(() => {
        expect(screen.getByText(/Next refresh in:/)).toBeInTheDocument()
      })
    })
  })
})
