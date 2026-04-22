export interface TicketEvent {
  slug: string
  title: string
  description: string | null
  imageUrl: string | null
  date: string
  time: string
  venue: string
  brand: string
  price: number
  available: number
  totalCapacity: number
  soldOut: boolean
}

export interface TicketType {
  id: string
  name: string
  price: number
  available: number
}

export interface EventDetail {
  event: {
    title: string
    description: string | null
    imageUrl: string | null
    date: string
    time: string
    venue: string
    brand: string
  }
  ticketTypes: TicketType[]
  salesActive: boolean
}

export interface Project {
  id: string
  name: string
  artisticName: string | null
  description: string | null
  genre: string | null
  photoUrl: string | null
}

export interface Release {
  id: string
  title: string
  artist: string
  year: number
  coverImage: string | null
  description: string | null
  spotifyUrl: string | null
  bandcampUrl: string | null
  appleMusicUrl: string | null
  brand: string
  publishedAt: string
}

export interface Product {
  id: string
  title: string
  price: number
  imageUrl: string | null
  category: string
  subcategory: string | null
  brand: string
  stock: number
  memberPrice: number | null
  minLevelPoints: number | null
}
