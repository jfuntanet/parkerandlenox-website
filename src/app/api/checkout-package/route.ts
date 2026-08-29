import { NextRequest, NextResponse } from 'next/server'

const BASE    = process.env.CORE_API_URL!
const API_KEY = process.env.CORE_API_KEY!

// Proxy server-side al core para el checkout de un "Ciclo" (paquete). Inyecta la
// API key y usa intentMode (PaymentIntent) igual que /api/create-checkout, para
// montar el mismo PaymentElement embebido.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const {
    packageSlug, customerName, customerEmail, guestName,
    session_hash_source, utm_source, utm_medium, utm_campaign, utm_content,
  } = body as {
    packageSlug: string
    customerName: string
    customerEmail: string
    guestName?: string
    session_hash_source?: string
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
    utm_content?: string
  }

  if (!packageSlug || !customerName || !customerEmail) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const res = await fetch(`${BASE}/v1/tickets/checkout-package`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: JSON.stringify({
      packageSlug, customerName, customerEmail,
      guestName: guestName || customerName,
      intentMode: true,
      session_hash_source: session_hash_source || undefined,
      utm_source: utm_source || undefined,
      utm_medium: utm_medium || undefined,
      utm_campaign: utm_campaign || undefined,
      utm_content: utm_content || undefined,
    }),
    cache: 'no-store',
  })

  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
