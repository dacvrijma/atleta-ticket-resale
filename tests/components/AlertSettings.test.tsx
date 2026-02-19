import { render, screen, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, afterEach, beforeEach } from "vitest"
import { AlertSettings } from "@/components/AlertSettings"

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe("AlertSettings", () => {
  it("renders the Alert Settings heading", () => {
    render(<AlertSettings />)
    expect(screen.getByText("Alert Settings")).toBeInTheDocument()
  })

  it("renders the Match Query input", () => {
    render(<AlertSettings />)
    expect(screen.getByLabelText(/match query/i)).toBeInTheDocument()
  })

  it("renders the Auto Open checkbox", () => {
    render(<AlertSettings />)
    expect(screen.getByRole("checkbox", { name: /auto open/i })).toBeInTheDocument()
  })

  it("Auto Open checkbox is unchecked by default", () => {
    render(<AlertSettings />)
    expect(screen.getByRole("checkbox", { name: /auto open/i })).not.toBeChecked()
  })

  it("Match Query input is empty by default", () => {
    render(<AlertSettings />)
    expect(screen.getByLabelText(/match query/i)).toHaveValue("")
  })

  it("updates the Match Query input on typing", async () => {
    const user = userEvent.setup()
    render(<AlertSettings />)
    const input = screen.getByLabelText(/match query/i)
    await user.type(input, "GYMRACE")
    expect(input).toHaveValue("GYMRACE")
  })

  it("persists query to localStorage when typing", async () => {
    const user = userEvent.setup()
    render(<AlertSettings />)
    await user.type(screen.getByLabelText(/match query/i), "marathon")
    expect(localStorage.getItem("alert_query")).toBe("marathon")
  })

  it("toggles Auto Open on click", async () => {
    const user = userEvent.setup()
    render(<AlertSettings />)
    const toggle = screen.getByRole("checkbox", { name: /auto open/i })
    await user.click(toggle)
    expect(toggle).toBeChecked()
    await user.click(toggle)
    expect(toggle).not.toBeChecked()
  })

  it("persists autoOpen to localStorage when toggled", async () => {
    const user = userEvent.setup()
    render(<AlertSettings />)
    await user.click(screen.getByRole("checkbox", { name: /auto open/i }))
    expect(localStorage.getItem("alert_auto_open")).toBe("true")
  })

  it("restores query from localStorage on mount", () => {
    localStorage.setItem("alert_query", "HEAVY")
    render(<AlertSettings />)
    expect(screen.getByLabelText(/match query/i)).toHaveValue("HEAVY")
  })

  it("restores Auto Open state from localStorage on mount", () => {
    localStorage.setItem("alert_auto_open", "true")
    render(<AlertSettings />)
    expect(screen.getByRole("checkbox", { name: /auto open/i })).toBeChecked()
  })

  it("persists values across re-mounts (simulating page reload)", async () => {
    const user = userEvent.setup()
    const { unmount } = render(<AlertSettings />)
    await user.type(screen.getByLabelText(/match query/i), "heavy")
    await user.click(screen.getByRole("checkbox", { name: /auto open/i }))
    unmount()

    render(<AlertSettings />)
    expect(screen.getByLabelText(/match query/i)).toHaveValue("heavy")
    expect(screen.getByRole("checkbox", { name: /auto open/i })).toBeChecked()
  })
})
