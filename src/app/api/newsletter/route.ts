import { NextRequest, NextResponse } from 'next/server'

// Alta de newsletter → endpoint propio multicanal (mcp-meta-ads) → Listmonk lista Parker & Lenox,
// con atribución de origen (src=web-parker). Antes iba directo a core sin fuente.
const SUBSCRIBE_URL = 'https://notabot.mx/newsletter/subscribe'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const name  = typeof body.name  === 'string' ? body.name.trim()  : ''
  if (!email) return NextResponse.json({ error: 'Falta email' }, { status: 400 })

  const res = await fetch(SUBSCRIBE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, name, brand: 'pl', src: 'web-parker' }),
    cache: 'no-store',
  })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
