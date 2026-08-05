'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { TicketEvent } from '@/types/api'
import { formatDateShort, formatPrice } from '@/lib/format'

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
  const t = useTranslations('event')
  const accent = venueAccent(event.venue)

  return (
    <Link
      href={`/cartelera/${event.slug}`}
      className="group flex flex-col h-full max-w-[75%] sm:max-w-none mx-auto border border-white/[0.12] rounded-xl hoverable overflow-hidden hover:border-white/[0.30] hover:-translate-y-0.5 transition-all duration-300"
      style={{ background: '#1a1a1a' }}
    >
      {event.imageUrl && (
        <div className="relative aspect-[4/5] overflow-hidden bg-black/40">
          <img
            src={event.imageUrl}
            alt={event.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-contain"
          />
          {event.soldOut && (
            <div className="absolute inset-0 flex items-start justify-center pt-[22%] bg-black/60">
              <span className="font-serif italic text-2xl sm:text-3xl" style={{ color: 'var(--color-lenox-red)' }}>{t('cardSoldOut')}</span>
            </div>
          )}
        </div>
      )}

      <div className="p-3 sm:p-5 flex flex-col flex-1">
      {showVenue && (
        <div className="flex items-center justify-end gap-2 sm:gap-3 mb-2 sm:mb-4">
          <span className="font-mono text-[0.45rem] sm:text-[0.55rem] tracking-[0.3em] uppercase" style={{ color: accent }}>
            {event.venue}
          </span>
          <span className="w-6 sm:w-8 h-px block" style={{ background: accent }} />
        </div>
      )}

      <p className="font-mono text-[0.55rem] sm:text-[0.65rem] tracking-[0.25em] uppercase text-white/70 mb-2 sm:mb-3 whitespace-nowrap text-center">
        {formatDateShort(event.date)}
      </p>
      <div className="flex-1 flex flex-col items-center justify-center pt-0 pb-3 sm:pt-1 sm:pb-6">
        <h3 className="font-serif text-base sm:text-xl font-normal leading-tight text-center">
          {event.title}
        </h3>
      </div>

      <div className="pt-2 sm:pt-4 flex flex-col gap-2 sm:gap-3">
        {!event.soldOut && (
          <p className="font-serif text-base sm:text-xl text-center" style={{ color: accent }}>
            {event.price > 0 ? formatPrice(event.price) : t('freeEntry')}
          </p>
        )}
        <span className="w-full text-center px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-full font-mono text-[0.55rem] sm:text-[0.65rem] tracking-[0.25em] uppercase transition-opacity group-hover:opacity-80"
          style={{ border: `1.5px solid ${accent}`, color: accent, backgroundColor: 'transparent' }}>
          {event.soldOut ? t('cardWaitlist') : event.price > 0 ? t('cardBuyTickets') : t('cardMoreInfo')}
        </span>
      </div>
      </div>
    </Link>
  )
}
