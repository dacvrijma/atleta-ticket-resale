"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { useEvents } from "@/context/EventsContext"
import { useTickets } from "@/hooks/useTickets"
import { useAutoRefresh } from "@/hooks/useAutoRefresh"
import { useAlertSettings } from "@/hooks/useAlertSettings"
import { matchesQuery } from "@/utils/matchTickets"
import { TicketList } from "@/components/TicketList"

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { getEvent } = useEvents()
  const event = getEvent(id)

  const [refreshKey, setRefreshKey] = useState(0)

  const { tickets, loading, error, lastRefreshed } = useTickets(
    event?.eventId ?? "",
    refreshKey
  )

  const { countdown, intervalMinutes, setIntervalMinutes, triggerRefresh } =
    useAutoRefresh({
      onRefresh: () => setRefreshKey((k) => k + 1),
    })

  const { query, autoOpen } = useAlertSettings()

  // Use refs so the effect always sees the latest query/autoOpen values
  // without re-running when they change (we only want to trigger on new fetches)
  const queryRef = useRef(query)
  const autoOpenRef = useRef(autoOpen)
  useEffect(() => { queryRef.current = query }, [query])
  useEffect(() => { autoOpenRef.current = autoOpen }, [autoOpen])

  useEffect(() => {
    if (!lastRefreshed) return
    const q = queryRef.current
    const open = autoOpenRef.current
    if (!q.trim() || !open) return
    const match = tickets.find(
      (reg) => reg.resale.available && matchesQuery(reg, q)
    )
    if (match?.resale.public_url) {
      window.open(match.resale.public_url, "_blank")
    }
  }, [lastRefreshed, tickets])

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

      {/* Refresh controls */}
      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 rounded border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
        {/* Last refreshed */}
        <span>
          Last refreshed:{" "}
          <span className="font-medium text-gray-900">
            {lastRefreshed ? formatTime(lastRefreshed) : "—"}
          </span>
        </span>

        {/* Countdown */}
        <span>
          Next refresh in:{" "}
          <span
            className="font-mono font-medium text-gray-900"
            aria-label={`Next refresh in ${formatCountdown(countdown)}`}
          >
            {formatCountdown(countdown)}
          </span>
        </span>

        {/* Interval controls */}
        <span className="flex items-center gap-2">
          Interval:
          <button
            onClick={() => setIntervalMinutes(intervalMinutes - 1)}
            disabled={intervalMinutes <= 1}
            aria-label="Decrease interval"
            className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>
          <span className="w-14 text-center font-medium text-gray-900">
            {intervalMinutes} min
          </span>
          <button
            onClick={() => setIntervalMinutes(intervalMinutes + 1)}
            aria-label="Increase interval"
            className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
          >
            +
          </button>
        </span>

        {/* Manual refresh */}
        <button
          onClick={triggerRefresh}
          disabled={loading}
          aria-label="Refresh tickets"
          className="ml-auto rounded bg-gray-900 px-3 py-1 text-xs font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? "Refreshing…" : "Refresh now"}
        </button>
      </div>

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
