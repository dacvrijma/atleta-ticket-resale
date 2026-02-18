"use client"

import { useParams } from "next/navigation"
import { useEvents } from "@/context/EventsContext"

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { getEvent } = useEvents()
  const event = getEvent(id)

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
      <pre className="overflow-auto rounded bg-gray-100 p-4 text-xs text-gray-800">
        {JSON.stringify(event, null, 2)}
      </pre>
    </div>
  )
}
