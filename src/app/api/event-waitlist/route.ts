import { NextRequest, NextResponse } from 'next/server'

// Proxy al core para guardar interés en eventos sold-out.
// Mantiene la API key del core fuera del bundle cliente.
const BASE    = process.env.CORE_API_URL!
const API_KEY = process.env.CORE_API_KEY!

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const slug  = typeof body.slug  === 'string' ? body.slug.trim()  : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const name  = typeof body.name  === 'string' ? body.name.trim()  : ''
  const subscribeNewsletter = body.subscribeNewsletter === true

  if (!slug)  return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  const res = await fetch(`${BASE}/v1/tickets/public/event-waitlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({ slug, email, name, subscribeNewsletter }),
    cache: 'no-store',
  })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
