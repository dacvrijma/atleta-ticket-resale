import { renderHook, act, cleanup } from "@testing-library/react"
import { describe, it, expect, vi, afterEach } from "vitest"
import { useAutoRefresh } from "@/hooks/useAutoRefresh"

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe("useAutoRefresh", () => {
  it("starts with a 60-second countdown (default 1-minute interval)", () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useAutoRefresh({ onRefresh: vi.fn() }))
    expect(result.current.countdown).toBe(60)
    expect(result.current.intervalMinutes).toBe(1)
  })

  it("respects a custom defaultIntervalMinutes", () => {
    vi.useFakeTimers()
    const { result } = renderHook(() =>
      useAutoRefresh({ onRefresh: vi.fn(), defaultIntervalMinutes: 3 })
    )
    expect(result.current.countdown).toBe(180)
    expect(result.current.intervalMinutes).toBe(3)
  })

  it("decrements countdown by one every second", () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useAutoRefresh({ onRefresh: vi.fn() }))

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(result.current.countdown).toBe(57)
  })

  it("calls onRefresh and resets the countdown when it reaches zero", () => {
    vi.useFakeTimers()
    const onRefresh = vi.fn()
    const { result } = renderHook(() => useAutoRefresh({ onRefresh }))

    act(() => {
      vi.advanceTimersByTime(60 * 1000)
    })

    expect(onRefresh).toHaveBeenCalledTimes(1)
    expect(result.current.countdown).toBe(60)
  })

  it("calls onRefresh again on subsequent intervals", () => {
    vi.useFakeTimers()
    const onRefresh = vi.fn()
    renderHook(() => useAutoRefresh({ onRefresh }))

    act(() => {
      vi.advanceTimersByTime(2 * 60 * 1000)
    })

    expect(onRefresh).toHaveBeenCalledTimes(2)
  })

  it("triggerRefresh calls onRefresh and resets the countdown immediately", () => {
    vi.useFakeTimers()
    const onRefresh = vi.fn()
    const { result } = renderHook(() => useAutoRefresh({ onRefresh }))

    // Advance partway through the interval
    act(() => {
      vi.advanceTimersByTime(15 * 1000)
    })
    expect(result.current.countdown).toBe(45)

    act(() => {
      result.current.triggerRefresh()
    })

    expect(onRefresh).toHaveBeenCalledTimes(1)
    expect(result.current.countdown).toBe(60)
  })

  it("setIntervalMinutes updates the interval and resets the countdown", () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useAutoRefresh({ onRefresh: vi.fn() }))

    act(() => {
      result.current.setIntervalMinutes(3)
    })

    expect(result.current.intervalMinutes).toBe(3)
    expect(result.current.countdown).toBe(180)
  })

  it("setIntervalMinutes clamps the minimum interval to 1 minute", () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useAutoRefresh({ onRefresh: vi.fn() }))

    act(() => {
      result.current.setIntervalMinutes(0)
    })

    expect(result.current.intervalMinutes).toBe(1)
  })

  it("fires onRefresh at the updated interval after setIntervalMinutes", () => {
    vi.useFakeTimers()
    const onRefresh = vi.fn()
    const { result } = renderHook(() => useAutoRefresh({ onRefresh }))

    act(() => {
      result.current.setIntervalMinutes(2)
    })

    act(() => {
      vi.advanceTimersByTime(120 * 1000)
    })

    expect(onRefresh).toHaveBeenCalledTimes(1)
    expect(result.current.countdown).toBe(120)
  })
})
