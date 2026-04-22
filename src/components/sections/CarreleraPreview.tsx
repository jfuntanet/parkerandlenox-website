import Link from 'next/link'
import { ConcertCard } from '@/components/ui/ConcertCard'
import type { TicketEvent } from '@/types/api'

interface Props {
  events: TicketEvent[]
}

export function CarreleraPreview({ events }: Props) {
  const preview = events.slice(0, 4)

  return (
    <section className="px-8 md:px-16 py-20 border-t border-white/[0.08]">
      <div className="flex items-center gap-6 mb-12 reveal">
        <div className="flex-1 h-px"
          style={{ background: 'linear-gradient(to right, rgba(160,120,74,0.35), transparent)' }} />
        <span className="font-mono text-[0.6rem] tracking-[0.5em] uppercase"
          style={{ color: 'var(--color-parker-concrete)' }}>
          Programa — Esta semana
        </span>
        <div className="flex-1 h-px"
          style={{ background: 'linear-gradient(to left, rgba(192,32,42,0.35), transparent)' }} />
      </div>

      {preview.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.06]">
          {preview.map((event, i) => (
            <div key={event.slug} className={`bg-black reveal reveal-delay-${Math.min(i + 1, 3)}`}>
              <ConcertCard event={event} />
            </div>
          ))}
        </div>
      ) : (
        <p className="font-body text-center py-12" style={{ color: 'rgba(237,232,220,0.5)' }}>
          No hay conciertos programados esta semana.
        </p>
      )}

      <div className="text-center mt-10 reveal reveal-delay-2">
        <Link
          href="/cartelera"
          className="inline-flex items-center gap-4 font-mono text-[0.65rem] tracking-[0.3em] uppercase hover:text-cream transition-colors hoverable"
          style={{ color: 'rgba(237,232,220,0.5)' }}
        >
          <span className="w-8 h-px block" style={{ background: 'var(--color-parker-bronze)' }} />
          Cartelera completa
          <span className="w-8 h-px block" style={{ background: 'var(--color-parker-bronze)' }} />
        </Link>
      </div>
    </section>
  )
}
