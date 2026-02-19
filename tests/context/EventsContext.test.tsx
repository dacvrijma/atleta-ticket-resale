"use client"

import { render, screen, cleanup, act } from "@testing-library/react"
import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { EventsProvider, useEvents } from "@/context/EventsContext"

const STORAGE_KEY = "atleta_events"

function TestConsumer() {
  const { events, addEvent, getEvent } = useEvents()
  return (
    <div>
      <span data-testid="count">{events.length}</span>
      {events.map((e) => (
        <span key={e.id} data-testid={`event-${e.id}`}>{e.title}</span>
      ))}
      <button
        onClick={() => addEvent({ title: "Test Event", eventId: "abc123" })}
      >
        Add
      </button>
      <button
        onClick={() => {
          const found = getEvent(events[0]?.id ?? "")
          if (found) {
            document.title = found.title
          }
        }}
      >
        Get First
      </button>
    </div>
  )
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
})

describe("EventsContext localStorage persistence", () => {
  it("writes events to localStorage when an event is added", async () => {
    render(
      <EventsProvider>
        <TestConsumer />
      </EventsProvider>
    )

    await act(async () => {
      screen.getByText("Add").click()
    })

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
    expect(stored).toHaveLength(1)
    expect(stored[0].title).toBe("Test Event")
    expect(stored[0].eventId).toBe("abc123")
  })

  it("loads events from localStorage on mount", () => {
    const seedEvents = [
      { id: "id-1", title: "Persisted Event", eventId: "evt1" },
      { id: "id-2", title: "Another Event", eventId: "evt2" },
    ]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedEvents))

    render(
      <EventsProvider>
        <TestConsumer />
      </EventsProvider>
    )

    expect(screen.getByTestId("count").textContent).toBe("2")
    expect(screen.getByText("Persisted Event")).toBeInTheDocument()
    expect(screen.getByText("Another Event")).toBeInTheDocument()
  })

  it("initializes with empty array when localStorage has invalid JSON", () => {
    localStorage.setItem(STORAGE_KEY, "not valid json{{{")

    render(
      <EventsProvider>
        <TestConsumer />
      </EventsProvider>
    )

    expect(screen.getByTestId("count").textContent).toBe("0")
  })

  it("initializes with empty array when localStorage key is missing", () => {
    render(
      <EventsProvider>
        <TestConsumer />
      </EventsProvider>
    )

    expect(screen.getByTestId("count").textContent).toBe("0")
  })

  it("getEvent works with persisted events", () => {
    const seedEvents = [
      { id: "id-1", title: "Find Me", eventId: "evt1" },
    ]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedEvents))

    render(
      <EventsProvider>
        <TestConsumer />
      </EventsProvider>
    )

    act(() => {
      screen.getByText("Get First").click()
    })

    expect(document.title).toBe("Find Me")
  })
})
