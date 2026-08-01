import { NextRequest, NextResponse } from 'next/server'

const BASE    = process.env.CORE_API_URL!
const API_KEY = process.env.CORE_API_KEY!

export async function GET(req: NextRequest) {
  const pi      = req.nextUrl.searchParams.get('pi')
  const orderId = req.nextUrl.searchParams.get('orderId')
  if (!pi && !orderId) {
    return NextResponse.json({ error: 'pi or orderId required' }, { status: 400 })
  }
  const qs = orderId ? 'orderId=' + encodeURIComponent(orderId) : 'pi=' + encodeURIComponent(pi as string)
  const res = await fetch(`${BASE}/v1/tickets/public/order-by-pi?${qs}`, {
    headers: { 'x-api-key': API_KEY },
    cache: 'no-store',
  })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
