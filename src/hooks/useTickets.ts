"use client"

import { useEffect, useState } from "react"
import { ResaleApiResponse, ResaleRegistration } from "@/types/resale"

interface UseTicketsResult {
  tickets: ResaleRegistration[]
  loading: boolean
  error: string | null
}

export function useTickets(eventId: string): UseTicketsResult {
  const [tickets, setTickets] = useState<ResaleRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchTickets() {
      try {
        const response = await fetch("/api/tickets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId }),
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const json: ResaleApiResponse = await response.json()
        setTickets(json.data.event.registrations_for_sale)
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchTickets()

    return () => controller.abort()
  }, [eventId])

  return { tickets, loading, error }
}
