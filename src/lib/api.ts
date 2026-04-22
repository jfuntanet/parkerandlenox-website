import type { TicketEvent, EventDetail } from '@/types/api'

const BASE = process.env.CORE_API_URL!
const KEY  = process.env.CORE_API_KEY!

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': KEY,
    },
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`API error ${res.status} on ${path}`)
  return res.json()
}

export async function getEvents(): Promise<TicketEvent[]> {
  return apiFetch('/v1/tickets/public/events?brand=parker_lenox')
}

export async function getEventDetail(slug: string): Promise<EventDetail> {
  return apiFetch(`/v1/tickets/events/${slug}/availability`)
}
