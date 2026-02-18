import { render, screen, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, afterEach } from "vitest"
import { Sidebar } from "@/components/Sidebar"
import { EventsProvider } from "@/context/EventsContext"

const pushMock = vi.fn()

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: pushMock }),
}))

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

function renderSidebar() {
  return render(
    <EventsProvider>
      <Sidebar />
    </EventsProvider>
  )
}

afterEach(() => {
  cleanup()
  pushMock.mockClear()
})

describe("Sidebar", () => {
  it("renders empty state when no events exist", () => {
    renderSidebar()
    expect(screen.getByText("No events yet. Add one to get started.")).toBeInTheDocument()
  })

  it("shows the add event form when clicking Add Event", async () => {
    const user = userEvent.setup()
    renderSidebar()

    await user.click(screen.getByText("Add Event"))
    expect(screen.getByLabelText("Title")).toBeInTheDocument()
    expect(screen.getByLabelText("Event ID")).toBeInTheDocument()
  })

  it("shows hint text for event ID field", async () => {
    const user = userEvent.setup()
    renderSidebar()

    await user.click(screen.getByText("Add Event"))
    expect(
      screen.getByText("The Atleta event ID from the resale URL (e.g. SdUE6lPR70dK).")
    ).toBeInTheDocument()
  })

  it("adds an event when the form is submitted with all fields", async () => {
    const user = userEvent.setup()
    renderSidebar()

    await user.click(screen.getByText("Add Event"))
    await user.type(screen.getByLabelText("Title"), "Test Event")
    await user.type(screen.getByLabelText("Event ID"), "SdUE6lPR70dK")
    await user.click(screen.getByText("Save Event"))

    expect(screen.getByText("Test Event")).toBeInTheDocument()
    expect(screen.queryByText("No events yet. Add one to get started.")).not.toBeInTheDocument()
  })

  it("navigates to event detail after adding", async () => {
    const user = userEvent.setup()
    renderSidebar()

    await user.click(screen.getByText("Add Event"))
    await user.type(screen.getByLabelText("Title"), "Test Event")
    await user.type(screen.getByLabelText("Event ID"), "SdUE6lPR70dK")
    await user.click(screen.getByText("Save Event"))

    expect(pushMock).toHaveBeenCalledWith(expect.stringMatching(/^\/events\/.+/))
  })

  it("shows validation error when submitting with empty fields", async () => {
    const user = userEvent.setup()
    renderSidebar()

    await user.click(screen.getByText("Add Event"))
    await user.click(screen.getByText("Save Event"))

    expect(screen.getByText("All fields are required.")).toBeInTheDocument()
  })

  it("links each event to its detail route", async () => {
    const user = userEvent.setup()
    renderSidebar()

    await user.click(screen.getByText("Add Event"))
    await user.type(screen.getByLabelText("Title"), "My Event")
    await user.type(screen.getByLabelText("Event ID"), "SdUE6lPR70dK")
    await user.click(screen.getByText("Save Event"))

    const link = screen.getByText("My Event").closest("a")
    expect(link).toHaveAttribute("href", expect.stringMatching(/^\/events\/.+/))
  })
})
