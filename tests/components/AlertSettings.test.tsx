import { render, screen, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest"
import { AlertSettings } from "@/components/AlertSettings"

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.restoreAllMocks()
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

  describe("Play Sound toggle", () => {
    it("renders the Play Sound checkbox", () => {
      render(<AlertSettings />)
      expect(screen.getByRole("checkbox", { name: /play sound/i })).toBeInTheDocument()
    })

    it("Play Sound checkbox is unchecked by default", () => {
      render(<AlertSettings />)
      expect(screen.getByRole("checkbox", { name: /play sound/i })).not.toBeChecked()
    })

    it("toggles Play Sound on click", async () => {
      const user = userEvent.setup()
      render(<AlertSettings />)
      const toggle = screen.getByRole("checkbox", { name: /play sound/i })
      await user.click(toggle)
      expect(toggle).toBeChecked()
    })

    it("persists playSound to localStorage when toggled", async () => {
      const user = userEvent.setup()
      render(<AlertSettings />)
      await user.click(screen.getByRole("checkbox", { name: /play sound/i }))
      expect(localStorage.getItem("alert_play_sound")).toBe("true")
    })

    it("restores Play Sound state from localStorage on mount", () => {
      localStorage.setItem("alert_play_sound", "true")
      render(<AlertSettings />)
      expect(screen.getByRole("checkbox", { name: /play sound/i })).toBeChecked()
    })
  })

  describe("Send Notification toggle", () => {
    it("renders the Send Notification checkbox", () => {
      render(<AlertSettings />)
      expect(screen.getByRole("checkbox", { name: /send notification/i })).toBeInTheDocument()
    })

    it("Send Notification checkbox is disabled when permission is not granted", () => {
      Object.defineProperty(window, "Notification", {
        value: { permission: "default", requestPermission: vi.fn() },
        configurable: true,
      })
      render(<AlertSettings />)
      expect(screen.getByRole("checkbox", { name: /send notification/i })).toBeDisabled()
    })

    it("Send Notification checkbox is enabled when permission is granted", () => {
      Object.defineProperty(window, "Notification", {
        value: { permission: "granted", requestPermission: vi.fn() },
        configurable: true,
      })
      render(<AlertSettings />)
      expect(screen.getByRole("checkbox", { name: /send notification/i })).not.toBeDisabled()
    })

    it("shows Grant button when permission is default", () => {
      Object.defineProperty(window, "Notification", {
        value: { permission: "default", requestPermission: vi.fn() },
        configurable: true,
      })
      render(<AlertSettings />)
      expect(screen.getByRole("button", { name: /grant/i })).toBeInTheDocument()
    })

    it("does not show Grant button when permission is denied", () => {
      Object.defineProperty(window, "Notification", {
        value: { permission: "denied", requestPermission: vi.fn() },
        configurable: true,
      })
      render(<AlertSettings />)
      expect(screen.queryByRole("button", { name: /grant/i })).not.toBeInTheDocument()
    })

    it("shows denied message when permission is denied", () => {
      Object.defineProperty(window, "Notification", {
        value: { permission: "denied", requestPermission: vi.fn() },
        configurable: true,
      })
      render(<AlertSettings />)
      expect(screen.getByText(/permission denied by browser/i)).toBeInTheDocument()
    })

    it("enables Send Notification checkbox after permission is granted via Grant button", async () => {
      const user = userEvent.setup()
      Object.defineProperty(window, "Notification", {
        value: {
          permission: "default",
          requestPermission: vi.fn().mockResolvedValue("granted"),
        },
        configurable: true,
      })
      render(<AlertSettings />)
      await user.click(screen.getByRole("button", { name: /grant/i }))
      expect(screen.getByRole("checkbox", { name: /send notification/i })).not.toBeDisabled()
    })

    it("can toggle Send Notification when permission is granted", async () => {
      const user = userEvent.setup()
      Object.defineProperty(window, "Notification", {
        value: { permission: "granted", requestPermission: vi.fn() },
        configurable: true,
      })
      render(<AlertSettings />)
      const toggle = screen.getByRole("checkbox", { name: /send notification/i })
      await user.click(toggle)
      expect(toggle).toBeChecked()
      expect(localStorage.getItem("alert_send_notification")).toBe("true")
    })
  })
})
