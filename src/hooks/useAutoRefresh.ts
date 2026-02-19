"use client"

import { useEffect, useRef, useState } from "react"

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
  const [countdown, setCountdown] = useState(defaultIntervalMinutes * 60)
  const [paused, setPausedState] = useState(false)

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

  // Reset countdown to full interval when unpausing
  useEffect(() => {
    if (!paused) {
      setCountdown(intervalMinutesRef.current * 60)
    }
  }, [paused])

  // Countdown ticker — stops when paused, restarts when unpaused or interval changes
  useEffect(() => {
    if (paused) return
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
  }, [intervalMinutes, paused])

  const setIntervalMinutes = (minutes: number) => {
    const clamped = Math.max(1, minutes)
    setIntervalMinutesState(clamped)
  }

  const setPaused = (value: boolean) => {
    setPausedState(value)
  }

  const triggerRefresh = () => {
    onRefreshRef.current()
    setCountdown(intervalMinutesRef.current * 60)
  }

  return { countdown, intervalMinutes, paused, setIntervalMinutes, setPaused, triggerRefresh }
}
