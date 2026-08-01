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
  return apiFetch('/v1/tickets/public/events?brand=parker_lenox&includeFree=true')
}

export async function getEventDetail(slug: string): Promise<EventDetail> {
  return apiFetch(`/v1/tickets/events/${slug}/availability`)
}

// -- Menús (comida + coctelería) --

export interface MenuItem {
  id: string
  name: string
  name_en: string | null
  description: string | null
  description_en: string | null
  image_url: string | null
  portion_size: string | null
  price: number
  price_bottle: number | null
  category: string
  subcategory: string | null
  sort_order: number
}

export interface MenuSection {
  id: string
  name: string
  sort_order: number
  items: MenuItem[]
}

export interface Menu {
  id: string
  name: string
  sections: MenuSection[]
}

export async function getMenus(): Promise<Menu[]> {
  return apiFetch<Menu[]>('/v1/menu/parker_lenox')
}

export function findMenuByKeyword(menus: Menu[], keyword: string): Menu | undefined {
  return menus.find(m => m.name.toLowerCase().includes(keyword.toLowerCase()))
}
