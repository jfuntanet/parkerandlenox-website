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

// Escala el font-size del título en pasos según qué tan largo sea.
// Evita que títulos largos hagan crecer la card — en su lugar, la tipografía se achica.
function titleClass(title: string): string {
  const len = title.length
  if (len > 48) return 'text-sm leading-tight'
  if (len > 32) return 'text-base leading-tight'
  return 'text-lg leading-tight'
}

export function ConcertCardHorizontal({ event, showVenue = true }: Props) {
  const t = useTranslations('event')
  const accent = venueAccent(event.venue)

  return (
    <Link
      href={`/cartelera/${event.slug}`}
      className="group flex flex-row h-[235px] border border-white/[0.12] rounded-xl hoverable overflow-hidden hover:border-white/[0.30] hover:-translate-y-0.5 transition-all duration-300"
      style={{ background: '#1a1a1a' }}
    >
      {event.imageUrl && (
        <div className="relative w-[188px] shrink-0 h-full bg-black/40 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-contain"
          />
          {event.soldOut && (
            <div className="absolute inset-0 flex items-start justify-center pt-6 bg-black/60">
              <span className="font-serif italic text-xl" style={{ color: 'var(--color-lenox-red)' }}>
                {t('cardSoldOut')}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col flex-1 p-4 min-w-0 overflow-hidden">
        {showVenue && (
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-px block" style={{ background: accent }} />
            <span className="font-mono text-[0.5rem] tracking-[0.3em] uppercase" style={{ color: accent }}>
              {event.venue}
            </span>
          </div>
        )}

        <p className="font-mono text-[0.55rem] tracking-[0.25em] uppercase text-white/70 mb-2">
          {formatDateShort(event.date)}
        </p>

        <h3 className={`font-serif font-normal text-cream group-hover:text-white transition-colors ${titleClass(event.title)}`}
          style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
          {event.title}
        </h3>

        <div className="mt-auto pt-3 flex flex-col gap-2 items-start">
          {!event.soldOut && (
            <p className="font-serif text-base" style={{ color: accent }}>
              {event.price > 0 ? formatPrice(event.price) : t('freeEntry')}
            </p>
          )}
          <span
            className="px-3 py-1.5 rounded-full font-mono text-[0.5rem] tracking-[0.25em] uppercase whitespace-nowrap transition-opacity group-hover:opacity-80"
            style={{ border: `1.5px solid ${accent}`, color: accent, backgroundColor: 'transparent' }}
          >
            {event.soldOut ? t('cardWaitlist') : event.price > 0 ? t('cardBuyTickets') : t('cardMoreInfo')}
          </span>
        </div>
      </div>
    </Link>
  )
}
