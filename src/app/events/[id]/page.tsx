"use client"

import { useParams } from "next/navigation"
import { useEvents } from "@/context/EventsContext"
import { useTickets } from "@/hooks/useTickets"
import { TicketList } from "@/components/TicketList"

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { getEvent } = useEvents()
  const event = getEvent(id)
  const { tickets, loading, error } = useTickets(event?.eventId ?? "")

  if (!event) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-gray-400">Event not found.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-xl font-bold text-gray-900">{event.title}</h1>
      {loading && (
        <p className="py-8 text-center text-sm text-gray-400">
          Loading tickets…
        </p>
      )}
      {error && (
        <p className="py-8 text-center text-sm text-red-500">{error}</p>
      )}
      {!loading && !error && <TicketList registrations={tickets} />}
    </div>
  )
}
