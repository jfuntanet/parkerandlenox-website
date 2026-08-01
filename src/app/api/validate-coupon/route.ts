import { NextRequest, NextResponse } from 'next/server'

const BASE    = process.env.CORE_API_URL!
const API_KEY = process.env.CORE_API_KEY!

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { slug, code } = body as { slug?: string; code?: string }
  if (!slug || !code) return NextResponse.json({ error: 'slug and code required' }, { status: 400 })

  const res = await fetch(`${BASE}/v1/tickets/validate-coupon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: JSON.stringify({ slug, code }),
    cache: 'no-store',
  })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
