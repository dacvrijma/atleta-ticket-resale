"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface Event {
  id: string;
  name: string;
  curlCommand: string;
  projectId: string;
}

interface EventsContextValue {
  events: Event[];
  addEvent: (event: Omit<Event, "id">) => void;
}

const EventsContext = createContext<EventsContextValue | null>(null);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);

  const addEvent = useCallback((event: Omit<Event, "id">) => {
    setEvents((prev) => [
      ...prev,
      { ...event, id: crypto.randomUUID() },
    ]);
  }, []);

  return (
    <EventsContext.Provider value={{ events, addEvent }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return context;
}
