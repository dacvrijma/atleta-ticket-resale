import { mockRegistrations } from "@/data/mock-resale"
import { TicketList } from "@/components/TicketList"

type Params = Promise<{ id: string }>

export default async function EventDetailPage({ params }: { params: Params }) {
  const { id } = await params

  // For now, use all mock registrations regardless of event id
  const registrations = mockRegistrations
  const eventTitle =
    registrations[0]?.promotion?.title ?? `Event ${id}`

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-xl font-bold text-gray-900">{eventTitle}</h1>
      <TicketList registrations={registrations} />
    </div>
  )
}
