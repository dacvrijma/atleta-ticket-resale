"use client"

import { useEffect, useRef, useState } from "react"

interface UseAutoRefreshOptions {
  onRefresh: () => void
  defaultIntervalMinutes?: number
}

interface UseAutoRefreshResult {
  countdown: number
  intervalMinutes: number
  setIntervalMinutes: (minutes: number) => void
  triggerRefresh: () => void
}

export function useAutoRefresh({
  onRefresh,
  defaultIntervalMinutes = 1,
}: UseAutoRefreshOptions): UseAutoRefreshResult {
  const [intervalMinutes, setIntervalMinutesState] = useState(defaultIntervalMinutes)
  const [countdown, setCountdown] = useState(defaultIntervalMinutes * 60)

  const onRefreshRef = useRef(onRefresh)
  const intervalMinutesRef = useRef(intervalMinutes)

  useEffect(() => {
    onRefreshRef.current = onRefresh
  }, [onRefresh])

  useEffect(() => {
    intervalMinutesRef.current = intervalMinutes
  }, [intervalMinutes])

  // Reset countdown when interval changes
  useEffect(() => {
    setCountdown(intervalMinutes * 60)
  }, [intervalMinutes])

  // Countdown ticker — restarts whenever intervalMinutes changes so the
  // closure always sees the up-to-date value when resetting to full interval.
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onRefreshRef.current()
          return intervalMinutesRef.current * 60
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [intervalMinutes])

  const setIntervalMinutes = (minutes: number) => {
    const clamped = Math.max(1, minutes)
    setIntervalMinutesState(clamped)
  }

  const triggerRefresh = () => {
    onRefreshRef.current()
    setCountdown(intervalMinutesRef.current * 60)
  }

  return { countdown, intervalMinutes, setIntervalMinutes, triggerRefresh }
}
