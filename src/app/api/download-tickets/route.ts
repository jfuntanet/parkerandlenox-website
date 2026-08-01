import { NextRequest, NextResponse } from 'next/server'

const BASE    = process.env.CORE_API_URL!
const API_KEY = process.env.CORE_API_KEY!

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const pi      = url.searchParams.get('pi')
  const orderId = url.searchParams.get('orderId')
  if (!pi && !orderId) {
    return NextResponse.json({ error: 'pi or orderId required' }, { status: 400 })
  }

  const token     = url.searchParams.get('token')
  const hideTotal = url.searchParams.get('hideTotal')
  const parts = [pi ? `pi=${encodeURIComponent(pi)}` : `orderId=${encodeURIComponent(orderId!)}`]
  if (token) parts.push(`token=${encodeURIComponent(token)}`)
  if (hideTotal === '1' || hideTotal === 'true') parts.push('hideTotal=1')
  const qs = parts.join('&')
  const res = await fetch(`${BASE}/v1/tickets/public/order-pdf?${qs}`, {
    headers: { 'x-api-key': API_KEY },
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return NextResponse.json({ error: text || 'PDF generation failed' }, { status: res.status })
  }

  // Stream the PDF back to the client with proper download headers
  return new NextResponse(res.body, {
    status: 200,
    headers: {
      'Content-Type': res.headers.get('content-type') || 'application/pdf',
      'Content-Disposition': res.headers.get('content-disposition') || 'attachment; filename="boletos.pdf"',
    },
  })
}
