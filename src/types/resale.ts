export interface Resale {
  id: string
  available: boolean
  total_amount: number
  fee: number
  public_url: string
  public_token: string
  upgrades: unknown[]
}

export interface TicketImage {
  id: string
  url: string
}

export interface Ticket {
  id: string
  title: string
  units: number
  description: string
  business: boolean
  image: TicketImage | null
}

export interface Promotion {
  id: string
  title: string
}

export interface TimeSlot {
  id: string
  start_date: string
  start_time: string | null
  title: string | null
  multi_date: boolean
}

export interface ResaleRegistration {
  id: string
  resale: Resale
  ticket: Ticket
  promotion: Promotion | null
  time_slot: TimeSlot
  required_attributes: string[]
  start_time: string | null
  corral_name: string | null
}

export interface ResaleApiResponse {
  data: {
    event: {
      registrations_for_sale: ResaleRegistration[]
    }
  }
}
