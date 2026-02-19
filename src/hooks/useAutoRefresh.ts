"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface UseAutoRefreshOptions {
  onRefresh: () => void
  defaultIntervalMinutes?: number
}

interface UseAutoRefreshResult {
  countdown: number
  intervalMinutes: number
  paused: boolean
  setIntervalMinutes: (minutes: number) => void
  setPaused: (paused: boolean) => void
  triggerRefresh: () => void
}

export function useAutoRefresh({
  onRefresh,
  defaultIntervalMinutes = 1,
}: UseAutoRefreshOptions): UseAutoRefreshResult {
  const [intervalMinutes, setIntervalMinutesState] = useState(defaultIntervalMinutes)
  const [paused, setPausedState] = useState(false)

  const [endTime, setEndTime] = useState(() => Date.now() + defaultIntervalMinutes * 60_000)
  const [countdown, setCountdown] = useState(defaultIntervalMinutes * 60)

  const onRefreshRef = useRef(onRefresh)
  const intervalMinutesRef = useRef(intervalMinutes)
  const endTimeRef = useRef(endTime)
  const pausedRef = useRef(paused)

  useEffect(() => { onRefreshRef.current = onRefresh }, [onRefresh])
  useEffect(() => { intervalMinutesRef.current = intervalMinutes }, [intervalMinutes])
  useEffect(() => { endTimeRef.current = endTime }, [endTime])
  useEffect(() => { pausedRef.current = paused }, [paused])

  // Reset endTime when interval changes
  useEffect(() => {
    const newEnd = Date.now() + intervalMinutes * 60_000
    setEndTime(newEnd)
    setCountdown(intervalMinutes * 60)
  }, [intervalMinutes])

  // Reset endTime when unpausing
  useEffect(() => {
    if (!paused) {
      const newEnd = Date.now() + intervalMinutesRef.current * 60_000
      setEndTime(newEnd)
      setCountdown(intervalMinutesRef.current * 60)
    }
  }, [paused])

  const tick = useCallback(() => {
    if (pausedRef.current) return
    const remaining = Math.round((endTimeRef.current - Date.now()) / 1000)
    if (remaining <= 0) {
      onRefreshRef.current()
      const newEnd = Date.now() + intervalMinutesRef.current * 60_000
      endTimeRef.current = newEnd
      setEndTime(newEnd)
      setCountdown(intervalMinutesRef.current * 60)
    } else {
      setCountdown(remaining)
    }
  }, [])

  // Countdown ticker
  useEffect(() => {
    if (paused) return
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [paused, tick])

  // Catch up immediately when the tab becomes visible again
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        tick()
      }
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [tick])

  const setIntervalMinutes = useCallback((minutes: number) => {
    const clamped = Math.max(1, minutes)
    setIntervalMinutesState(clamped)
  }, [])

  const setPaused = useCallback((value: boolean) => {
    setPausedState(value)
  }, [])

  const triggerRefresh = useCallback(() => {
    onRefreshRef.current()
    const newEnd = Date.now() + intervalMinutesRef.current * 60_000
    endTimeRef.current = newEnd
    setEndTime(newEnd)
    setCountdown(intervalMinutesRef.current * 60)
  }, [])

  return { countdown, intervalMinutes, paused, setIntervalMinutes, setPaused, triggerRefresh }
}
