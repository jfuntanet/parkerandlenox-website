import { NextResponse } from 'next/server'

const BASE    = process.env.CORE_API_URL!
const API_KEY = process.env.CORE_API_KEY!

export async function GET() {
  const res = await fetch(`${BASE}/v1/store/public/products?brand=parker_lenox`, {
    headers: { 'x-api-key': API_KEY },
    next: { revalidate: 60 },
  })
  const data = await res.json().catch(() => [])
  return NextResponse.json(data, { status: res.status })
}
