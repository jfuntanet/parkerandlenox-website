export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link         from 'next/link'
import { getEventDetail }                     from '@/lib/api'
import { CheckoutForm }                       from '@/components/booking/CheckoutForm'
import { formatDateShort, formatTime }        from '@/lib/format'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const detail   = await getEventDetail(slug).catch(() => null)
  return {
    title: detail ? `${detail.event.title} — Boletos | Parker & Lenox` : 'Boletos — Parker & Lenox',
  }
}

function venueAccent(venueName: string): string {
  if (venueName.toLowerCase().includes('lenox')) return 'var(--color-lenox-red)'
  return 'var(--color-parker-bronze)'
}

export default async function CheckoutPage({ params }: Props) {
  const { slug } = await params

  let detail
  try { detail = await getEventDetail(slug) } catch { notFound() }
  const { event, ticketTypes, salesActive } = detail
  if (!salesActive) notFound()

  const accent = venueAccent(event.venue)

  return (
    <div className="relative min-h-screen pt-24 pb-16">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16">
        <CheckoutForm slug={slug} event={event} ticketTypes={ticketTypes} accent={accent} initialQty={1} mode="from-extras" />
      </div>
    </div>
  )
}
