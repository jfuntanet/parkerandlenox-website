import { NextRequest, NextResponse } from 'next/server'

const BASE    = process.env.CORE_API_URL!
const API_KEY = process.env.CORE_API_KEY!

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const res = await fetch(`${BASE}/v1/tickets/public/tickets/update-and-send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
