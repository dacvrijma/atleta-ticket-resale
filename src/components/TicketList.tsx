"use client"

import { ResaleRegistration } from "@/types/resale"

function formatPrice(amountCents: number, feeCents: number): string {
  const total = (amountCents + feeCents) / 100
  return `€ ${total.toFixed(2)}`
}

function formatTimeSlot(
  startDate: string,
  startTime: string | null,
  title: string | null
): string {
  if (title) return title

  const date = new Date(startDate + "T00:00:00")
  const dateStr = date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  if (!startTime) return dateStr

  const timeParts = startTime.split(":")
  const timeStr = `${timeParts[0]}:${timeParts[1]}`
  return `${dateStr} · ${timeStr}`
}

export function TicketList({
  registrations,
}: {
  registrations: ResaleRegistration[]
}) {
  const available = registrations.filter((r) => r.resale.available)

  if (available.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        No tickets available at the moment.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {available.map((reg) => (
        <div
          key={reg.id}
          className="flex items-center justify-between rounded border border-gray-200 px-4 py-3"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">
              {reg.ticket.title}
              {reg.promotion && (
                <span className="font-normal text-gray-500">
                  {" "}
                  · {reg.promotion.title}
                </span>
              )}
            </p>
            <p className="text-sm font-medium text-blue-700">
              {formatPrice(reg.resale.total_amount, reg.resale.fee)}
            </p>
            <p className="text-xs text-gray-500">
              {formatTimeSlot(
                reg.time_slot.start_date,
                reg.time_slot.start_time,
                reg.time_slot.title
              )}
            </p>
          </div>
          <a
            href={reg.resale.public_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 shrink-0 rounded bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800"
          >
            Buy now &rsaquo;
          </a>
        </div>
      ))}
    </div>
  )
}
