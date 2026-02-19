import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { renderHook, act, cleanup } from "@testing-library/react"
import { useAlertSettings } from "@/hooks/useAlertSettings"

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe("useAlertSettings", () => {
  it("returns empty query and autoOpen=false by default", () => {
    const { result } = renderHook(() => useAlertSettings())
    expect(result.current.query).toBe("")
    expect(result.current.autoOpen).toBe(false)
  })

  it("restores query from localStorage", () => {
    localStorage.setItem("alert_query", "GYMRACE")
    const { result } = renderHook(() => useAlertSettings())
    expect(result.current.query).toBe("GYMRACE")
  })

  it("restores autoOpen=true from localStorage", () => {
    localStorage.setItem("alert_auto_open", "true")
    const { result } = renderHook(() => useAlertSettings())
    expect(result.current.autoOpen).toBe(true)
  })

  it("restores autoOpen=false from localStorage", () => {
    localStorage.setItem("alert_auto_open", "false")
    const { result } = renderHook(() => useAlertSettings())
    expect(result.current.autoOpen).toBe(false)
  })

  it("persists query to localStorage via setQuery", () => {
    const { result } = renderHook(() => useAlertSettings())
    act(() => { result.current.setQuery("marathon") })
    expect(localStorage.getItem("alert_query")).toBe("marathon")
    expect(result.current.query).toBe("marathon")
  })

  it("persists autoOpen=true to localStorage via setAutoOpen", () => {
    const { result } = renderHook(() => useAlertSettings())
    act(() => { result.current.setAutoOpen(true) })
    expect(localStorage.getItem("alert_auto_open")).toBe("true")
    expect(result.current.autoOpen).toBe(true)
  })

  it("persists autoOpen=false to localStorage via setAutoOpen", () => {
    const { result } = renderHook(() => useAlertSettings())
    act(() => { result.current.setAutoOpen(false) })
    expect(localStorage.getItem("alert_auto_open")).toBe("false")
    expect(result.current.autoOpen).toBe(false)
  })
})
