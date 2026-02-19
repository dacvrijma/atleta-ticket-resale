"use client"

import { useState } from "react"

export interface AlertSettingsState {
  query: string
  autoOpen: boolean
  playSound: boolean
  sendNotification: boolean
  setQuery: (q: string) => void
  setAutoOpen: (v: boolean) => void
  setPlaySound: (v: boolean) => void
  setSendNotification: (v: boolean) => void
}

export function useAlertSettings(eventId: string): AlertSettingsState {
  const QUERY_KEY = `alert_${eventId}_query`
  const AUTO_OPEN_KEY = `alert_${eventId}_auto_open`
  const PLAY_SOUND_KEY = `alert_${eventId}_play_sound`
  const SEND_NOTIFICATION_KEY = `alert_${eventId}_send_notification`

  const [query, setQueryState] = useState<string>(() => {
    if (typeof window === "undefined") return ""
    return localStorage.getItem(QUERY_KEY) ?? ""
  })

  const [autoOpen, setAutoOpenState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(AUTO_OPEN_KEY) === "true"
  })

  const [playSound, setPlaySoundState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(PLAY_SOUND_KEY) === "true"
  })

  const [sendNotification, setSendNotificationState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(SEND_NOTIFICATION_KEY) === "true"
  })

  const setQuery = (q: string) => {
    setQueryState(q)
    localStorage.setItem(QUERY_KEY, q)
  }

  const setAutoOpen = (v: boolean) => {
    setAutoOpenState(v)
    localStorage.setItem(AUTO_OPEN_KEY, String(v))
  }

  const setPlaySound = (v: boolean) => {
    setPlaySoundState(v)
    localStorage.setItem(PLAY_SOUND_KEY, String(v))
  }

  const setSendNotification = (v: boolean) => {
    setSendNotificationState(v)
    localStorage.setItem(SEND_NOTIFICATION_KEY, String(v))
  }

  return { query, autoOpen, playSound, sendNotification, setQuery, setAutoOpen, setPlaySound, setSendNotification }
}
