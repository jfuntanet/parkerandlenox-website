import type { TicketEvent, EventDetail, Project, Release, Product } from '@/types/api'

const BASE = process.env.CORE_API_URL!
const API_KEY = process.env.CORE_API_KEY!

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      ...options?.headers,
    },
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`API error ${res.status} on ${path}`)
  return res.json()
}

export async function getEvents(): Promise<TicketEvent[]> {
  return apiFetch('/v1/tickets/public/events?brand=notabot')
}

export async function getEventDetail(slug: string): Promise<EventDetail> {
  return apiFetch(`/v1/tickets/events/${slug}/availability`)
}

export async function getProjects(): Promise<Project[]> {
  return apiFetch('/v1/projects/public')
}

export async function getReleases(): Promise<Release[]> {
  return apiFetch('/v1/releases')
}

export async function getRelease(id: string): Promise<Release> {
  return apiFetch(`/v1/releases/${id}`)
}

export async function getProducts(): Promise<Product[]> {
  return apiFetch('/v1/products/public')
}
