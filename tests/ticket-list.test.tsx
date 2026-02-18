import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import { TicketList } from "@/components/TicketList"
import { ResaleRegistration } from "@/types/resale"

afterEach(() => {
  cleanup()
})

function makeRegistration(
  overrides: Partial<ResaleRegistration> & { id: string }
): ResaleRegistration {
  return {
    resale: {
      id: overrides.id,
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
    promotion: {
      id: "p1",
      title: "GYMRACE",
    },
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
    ...overrides,
  }
}

describe("TicketList", () => {
  it("renders ticket title and promotion", () => {
    render(
      <TicketList registrations={[makeRegistration({ id: "1" })]} />
    )
    expect(screen.getByText("MEN SOLO HEAVY")).toBeInTheDocument()
    expect(screen.getByText("· GYMRACE")).toBeInTheDocument()
  })

  it("shows total price (total_amount + fee) in euros", () => {
    render(
      <TicketList registrations={[makeRegistration({ id: "1" })]} />
    )
    // 4200 + 210 = 4410 cents = €44.10
    expect(screen.getByText("€ 44.10")).toBeInTheDocument()
  })

  it("shows formatted time slot", () => {
    render(
      <TicketList registrations={[makeRegistration({ id: "1" })]} />
    )
    expect(screen.getByText("Sunday 1 March · 09:10")).toBeInTheDocument()
  })

  it("filters out unavailable tickets", () => {
    const unavailable = makeRegistration({
      id: "2",
      resale: {
        id: "2",
        available: false,
        total_amount: 5000,
        fee: 250,
        public_url: "https://example.com/nope",
        public_token: "t",
        upgrades: [],
      },
      ticket: {
        id: "t2",
        title: "SOLD OUT TICKET",
        units: 1,
        description: "",
        business: false,
        image: null,
      },
    })

    render(
      <TicketList registrations={[makeRegistration({ id: "1" }), unavailable]} />
    )
    expect(screen.getByText("MEN SOLO HEAVY")).toBeInTheDocument()
    expect(screen.queryByText("SOLD OUT TICKET")).not.toBeInTheDocument()
  })

  it("shows empty state when no tickets are available", () => {
    const unavailable = makeRegistration({
      id: "1",
      resale: {
        id: "1",
        available: false,
        total_amount: 5000,
        fee: 250,
        public_url: "https://example.com",
        public_token: "t",
        upgrades: [],
      },
    })

    render(<TicketList registrations={[unavailable]} />)
    expect(
      screen.getByText("No tickets available at the moment.")
    ).toBeInTheDocument()
  })

  it("renders Buy now link with correct href", () => {
    render(
      <TicketList registrations={[makeRegistration({ id: "1" })]} />
    )
    const link = screen.getByText("Buy now ›")
    expect(link).toHaveAttribute("href", "https://example.com/buy")
    expect(link).toHaveAttribute("target", "_blank")
  })
})
