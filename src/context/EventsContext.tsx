"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"

export interface Event {
  id: string
  title: string
  eventId: string
}

interface EventsContextValue {
  events: Event[]
  addEvent: (event: Omit<Event, "id">) => string
  getEvent: (id: string) => Event | undefined
}

const EventsContext = createContext<EventsContextValue | null>(null)

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([])

  const addEvent = useCallback((event: Omit<Event, "id">) => {
    const id = crypto.randomUUID()
    setEvents((prev) => [...prev, { ...event, id }])
    return id
  }, [])

  const getEvent = useCallback(
    (id: string) => events.find((e) => e.id === id),
    [events]
  )

  return (
    <EventsContext.Provider value={{ events, addEvent, getEvent }}>
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
