"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useEvents } from "@/context/EventsContext"
import { useTickets } from "@/hooks/useTickets"
import { useAutoRefresh } from "@/hooks/useAutoRefresh"
import { useAlertSettings } from "@/hooks/useAlertSettings"
import { matchesQuery } from "@/utils/matchTickets"
import { TicketList } from "@/components/TicketList"
import { AlertSettings } from "@/components/AlertSettings"

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

function playAlertSound() {
  try {
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.frequency.value = 880
    oscillator.type = "sine"
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.5)
  } catch {
    // AudioContext not available (e.g. in tests)
  }
}

function sendMatchNotification(ticketTitle: string, url?: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return
  if (Notification.permission !== "granted") return
  const notification = new Notification("Ticket match found!", {
    body: ticketTitle,
  })
  if (url) {
    notification.onclick = () => {
      window.open(url, "_blank")
      window.focus()
    }
  }
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { getEvent, removeEvent } = useEvents()
  const event = getEvent(id)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [refreshKey, setRefreshKey] = useState(0)

  const { tickets, loading, error, lastRefreshed } = useTickets(
    event?.eventId ?? "",
    refreshKey
  )

  const { countdown, intervalMinutes, paused, setIntervalMinutes, setPaused, triggerRefresh } =
    useAutoRefresh({
      onRefresh: () => setRefreshKey((k) => k + 1),
    })

  // Single hook call — both the matching logic and AlertSettings UI share this state
  const alertSettings = useAlertSettings(event?.id ?? "")
  const { query, autoOpen, playSound, sendNotification } = alertSettings

  // Use refs so the effect always sees the latest values
  // without re-running when they change (we only want to trigger on new fetches)
  const queryRef = useRef(query)
  const autoOpenRef = useRef(autoOpen)
  const playSoundRef = useRef(playSound)
  const sendNotificationRef = useRef(sendNotification)
  useEffect(() => { queryRef.current = query }, [query])
  useEffect(() => { autoOpenRef.current = autoOpen }, [autoOpen])
  useEffect(() => { playSoundRef.current = playSound }, [playSound])
  useEffect(() => { sendNotificationRef.current = sendNotification }, [sendNotification])

  useEffect(() => {
    if (!lastRefreshed) return
    const q = queryRef.current?.trim() ?? ""
    const match = q
      ? tickets.find((reg) => reg.resale.available && matchesQuery(reg, q))
      : tickets.find((reg) => reg.resale.available)
    if (!match) return

    if (autoOpenRef.current && match.resale.public_url) {
      window.open(match.resale.public_url, "_blank", `popup,width=${screen.width},height=${screen.height},left=0,top=0`)
    }
    if (playSoundRef.current) {
      playAlertSound()
    }
    if (sendNotificationRef.current) {
      sendMatchNotification(match.ticket.title, match.resale.public_url)
    }
    // Pause auto-refresh when a match is found
    setPaused(true)
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
      <div className="mb-4 flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-900">{event.title}</h1>
        <a
          href={`https://atleta.cc/e/${event.eventId}/resale`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded bg-gray-900 px-3 py-1 text-xs font-semibold text-white hover:bg-gray-700"
        >
          Resale page
        </a>
        {showDeleteConfirm ? (
          <span className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Are you sure?</span>
            <button
              onClick={() => {
                removeEvent(id)
                router.push("/")
              }}
              className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-500"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-500"
          >
            Delete event
          </button>
        )}
      </div>

      {/* Refresh controls */}
      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
        {/* Last refreshed */}
        <span>
          Last refreshed:{" "}
          <span className="font-medium text-gray-900">
            {lastRefreshed ? formatTime(lastRefreshed) : "—"}
          </span>
        </span>

        {paused ? (
          /* Paused state — show re-enable toggle */
          <span className="flex items-center gap-2 text-amber-600">
            <span className="font-medium">Auto-refresh paused</span>
            <button
              onClick={() => setPaused(false)}
              aria-label="Resume auto-refresh"
              className="rounded bg-amber-600 px-2 py-0.5 text-xs font-semibold text-white hover:bg-amber-500"
            >
              Resume
            </button>
          </span>
        ) : (
          /* Running state — show countdown */
          <span>
            Next refresh in:{" "}
            <span
              className="font-mono font-medium text-gray-900"
              aria-label={`Next refresh in ${formatCountdown(countdown)}`}
            >
              {formatCountdown(countdown)}
            </span>
          </span>
        )}

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

      {/* Alert settings — per-event, below the refresh bar */}
      <div className="mb-6 rounded border border-gray-200 bg-gray-50">
        <AlertSettings {...alertSettings} />
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
