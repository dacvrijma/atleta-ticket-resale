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

  it("returns playSound=false by default", () => {
    const { result } = renderHook(() => useAlertSettings())
    expect(result.current.playSound).toBe(false)
  })

  it("restores playSound=true from localStorage", () => {
    localStorage.setItem("alert_play_sound", "true")
    const { result } = renderHook(() => useAlertSettings())
    expect(result.current.playSound).toBe(true)
  })

  it("persists playSound to localStorage via setPlaySound", () => {
    const { result } = renderHook(() => useAlertSettings())
    act(() => { result.current.setPlaySound(true) })
    expect(localStorage.getItem("alert_play_sound")).toBe("true")
    expect(result.current.playSound).toBe(true)
  })

  it("returns sendNotification=false by default", () => {
    const { result } = renderHook(() => useAlertSettings())
    expect(result.current.sendNotification).toBe(false)
  })

  it("restores sendNotification=true from localStorage", () => {
    localStorage.setItem("alert_send_notification", "true")
    const { result } = renderHook(() => useAlertSettings())
    expect(result.current.sendNotification).toBe(true)
  })

  it("persists sendNotification to localStorage via setSendNotification", () => {
    const { result } = renderHook(() => useAlertSettings())
    act(() => { result.current.setSendNotification(true) })
    expect(localStorage.getItem("alert_send_notification")).toBe("true")
    expect(result.current.sendNotification).toBe(true)
  })
})
