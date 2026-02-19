"use client"

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"

export interface Event {
  id: string
  title: string
  eventId: string
}

interface EventsContextValue {
  events: Event[]
  addEvent: (event: Omit<Event, "id">) => string
  removeEvent: (id: string) => void
  getEvent: (id: string) => Event | undefined
}

const STORAGE_KEY = "atleta_events"

const EventsContext = createContext<EventsContextValue | null>(null)

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  }, [events])

  const addEvent = useCallback((event: Omit<Event, "id">) => {
    const id = crypto.randomUUID()
    setEvents((prev) => [...prev, { ...event, id }])
    return id
  }, [])

  const removeEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const getEvent = useCallback(
    (id: string) => events.find((e) => e.id === id),
    [events]
  )

  return (
    <EventsContext.Provider value={{ events, addEvent, removeEvent, getEvent }}>
      {children}
    </EventsContext.Provider>
  )
}

export function useEvents() {
  const context = useContext(EventsContext)
  if (!context) {
    throw new Error("useEvents must be used within an EventsProvider")
  }
  return context
}
