"use client"

import { useState } from "react"

const QUERY_KEY = "alert_query"
const AUTO_OPEN_KEY = "alert_auto_open"

export interface AlertSettingsState {
  query: string
  autoOpen: boolean
  setQuery: (q: string) => void
  setAutoOpen: (v: boolean) => void
}

export function useAlertSettings(): AlertSettingsState {
  const [query, setQueryState] = useState<string>(() => {
    if (typeof window === "undefined") return ""
    return localStorage.getItem(QUERY_KEY) ?? ""
  })

  const [autoOpen, setAutoOpenState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(AUTO_OPEN_KEY) === "true"
  })

  const setQuery = (q: string) => {
    setQueryState(q)
    localStorage.setItem(QUERY_KEY, q)
  }

  const setAutoOpen = (v: boolean) => {
    setAutoOpenState(v)
    localStorage.setItem(AUTO_OPEN_KEY, String(v))
  }

  return { query, autoOpen, setQuery, setAutoOpen }
}
