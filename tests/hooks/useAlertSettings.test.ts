import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { renderHook, act, cleanup } from "@testing-library/react"
import { useAlertSettings } from "@/hooks/useAlertSettings"

const EVENT_ID = "test-event"
const KEY = (name: string) => `alert_${EVENT_ID}_${name}`

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe("useAlertSettings", () => {
  it("returns empty query and autoOpen=false by default", () => {
    const { result } = renderHook(() => useAlertSettings(EVENT_ID))
    expect(result.current.query).toBe("")
    expect(result.current.autoOpen).toBe(false)
  })

  it("restores query from localStorage", () => {
    localStorage.setItem(KEY("query"), "GYMRACE")
    const { result } = renderHook(() => useAlertSettings(EVENT_ID))
    expect(result.current.query).toBe("GYMRACE")
  })

  it("restores autoOpen=true from localStorage", () => {
    localStorage.setItem(KEY("auto_open"), "true")
    const { result } = renderHook(() => useAlertSettings(EVENT_ID))
    expect(result.current.autoOpen).toBe(true)
  })

  it("restores autoOpen=false from localStorage", () => {
    localStorage.setItem(KEY("auto_open"), "false")
    const { result } = renderHook(() => useAlertSettings(EVENT_ID))
    expect(result.current.autoOpen).toBe(false)
  })

  it("persists query to localStorage via setQuery", () => {
    const { result } = renderHook(() => useAlertSettings(EVENT_ID))
    act(() => { result.current.setQuery("marathon") })
    expect(localStorage.getItem(KEY("query"))).toBe("marathon")
    expect(result.current.query).toBe("marathon")
  })

  it("persists autoOpen=true to localStorage via setAutoOpen", () => {
    const { result } = renderHook(() => useAlertSettings(EVENT_ID))
    act(() => { result.current.setAutoOpen(true) })
    expect(localStorage.getItem(KEY("auto_open"))).toBe("true")
    expect(result.current.autoOpen).toBe(true)
  })

  it("persists autoOpen=false to localStorage via setAutoOpen", () => {
    const { result } = renderHook(() => useAlertSettings(EVENT_ID))
    act(() => { result.current.setAutoOpen(false) })
    expect(localStorage.getItem(KEY("auto_open"))).toBe("false")
    expect(result.current.autoOpen).toBe(false)
  })

  it("returns playSound=false by default", () => {
    const { result } = renderHook(() => useAlertSettings(EVENT_ID))
    expect(result.current.playSound).toBe(false)
  })

  it("restores playSound=true from localStorage", () => {
    localStorage.setItem(KEY("play_sound"), "true")
    const { result } = renderHook(() => useAlertSettings(EVENT_ID))
    expect(result.current.playSound).toBe(true)
  })

  it("persists playSound to localStorage via setPlaySound", () => {
    const { result } = renderHook(() => useAlertSettings(EVENT_ID))
    act(() => { result.current.setPlaySound(true) })
    expect(localStorage.getItem(KEY("play_sound"))).toBe("true")
    expect(result.current.playSound).toBe(true)
  })

  it("returns sendNotification=false by default", () => {
    const { result } = renderHook(() => useAlertSettings(EVENT_ID))
    expect(result.current.sendNotification).toBe(false)
  })

  it("restores sendNotification=true from localStorage", () => {
    localStorage.setItem(KEY("send_notification"), "true")
    const { result } = renderHook(() => useAlertSettings(EVENT_ID))
    expect(result.current.sendNotification).toBe(true)
  })

  it("persists sendNotification to localStorage via setSendNotification", () => {
    const { result } = renderHook(() => useAlertSettings(EVENT_ID))
    act(() => { result.current.setSendNotification(true) })
    expect(localStorage.getItem(KEY("send_notification"))).toBe("true")
    expect(result.current.sendNotification).toBe(true)
  })

  it("scopes settings to the given eventId — different events are independent", () => {
    localStorage.setItem("alert_event-a_query", "RUNNER")
    localStorage.setItem("alert_event-b_query", "SWIMMER")
    const { result: a } = renderHook(() => useAlertSettings("event-a"))
    const { result: b } = renderHook(() => useAlertSettings("event-b"))
    expect(a.current.query).toBe("RUNNER")
    expect(b.current.query).toBe("SWIMMER")
  })
})
