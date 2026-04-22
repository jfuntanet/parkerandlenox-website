import Link from 'next/link'
import type { TicketEvent } from '@/types/api'
import { formatDate, formatPrice } from '@/lib/format'

interface Props {
  event: TicketEvent
  showVenue?: boolean
}

const VENUE_COLORS: Record<string, string> = {
  parker: 'var(--color-parker-bronze)',
  lenox:  'var(--color-lenox-red)',
}

function venueAccent(venueName: string): string {
  const lower = venueName.toLowerCase()
  if (lower.includes('parker')) return VENUE_COLORS.parker
  if (lower.includes('lenox'))  return VENUE_COLORS.lenox
  return VENUE_COLORS.parker
}

export function ConcertCard({ event, showVenue = true }: Props) {
  const accent = venueAccent(event.venue)

  return (
    <Link
      href={`/cartelera/${event.slug}`}
      className="group block border border-white/[0.08] p-6 hover:border-white/20 transition-all duration-500 hoverable"
      style={{ background: 'rgba(255,255,255,0.01)' }}
    >
      {showVenue && (
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-px block" style={{ background: accent }} />
          <span className="font-mono text-[0.55rem] tracking-[0.3em] uppercase" style={{ color: accent }}>
            {event.venue}
          </span>
        </div>
      )}

      <p className="font-mono text-[0.6rem] tracking-[0.2em] text-white/30 mb-2">
        {formatDate(event.date)}
      </p>

      <h3 className="font-serif text-2xl font-normal leading-tight mb-3 group-hover:text-cream transition-colors">
        {event.title}
      </h3>

      <div className="flex items-center justify-between mt-4">
        <span className="font-mono text-sm" style={{ color: accent }}>
          {event.soldOut ? 'Agotado' : formatPrice(event.price)}
        </span>
        <span className="font-mono text-[0.6rem] tracking-widest uppercase text-white/30 group-hover:text-cream transition-colors">
          {event.soldOut ? '—' : 'Boletos →'}
        </span>
      </div>
    </Link>
  )
}
