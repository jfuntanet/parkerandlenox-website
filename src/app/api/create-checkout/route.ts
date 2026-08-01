import { NextRequest, NextResponse } from 'next/server'

const BASE    = process.env.CORE_API_URL!
const API_KEY = process.env.CORE_API_KEY!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const {
    slug, ticketTypeId, quantity, customerName, customerEmail,
    guests, couponCode, customerNotes,
    // Marketing Analytics: sid del beacon + UTMs, para que el core atribuya la orden a la sesión.
    session_hash_source, utm_source, utm_medium, utm_campaign, utm_content,
  } = body as {
    slug: string
    ticketTypeId: string
    quantity: number
    customerName: string
    customerEmail: string
    guests?: { name?: string; email?: string }[]
    couponCode?: string
    customerNotes?: string
    session_hash_source?: string
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
    utm_content?: string
  }

  if (!slug || !ticketTypeId || !quantity || !customerName || !customerEmail) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const res = await fetch(`${BASE}/v1/tickets/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: JSON.stringify({
      slug, ticketTypeId, quantity, customerName, customerEmail,
      guests: guests && guests.length ? guests : undefined,
      couponCode: couponCode || undefined,
      customerNotes: customerNotes || undefined,
      session_hash_source: session_hash_source || undefined,
      utm_source: utm_source || undefined,
      utm_medium: utm_medium || undefined,
      utm_campaign: utm_campaign || undefined,
      utm_content: utm_content || undefined,
      intentMode: true,
      returnUrl: `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl:  `${APP_URL}/cartelera/${slug}?cancelled=1`,
    }),
    cache: 'no-store',
  })

  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
