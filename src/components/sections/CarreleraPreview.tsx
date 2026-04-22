import Link from 'next/link'
import type { TicketEvent } from '@/types/api'

export function CarreleraPreview({ events }: { events: TicketEvent[] }) {
  return (
    <section className="py-20 overflow-hidden">

      {/* Título enorme + link desktop */}
      <div
        className="flex items-baseline justify-between mb-8"
        style={{ paddingLeft: 'clamp(24px, 4vw, 48px)', paddingRight: 'clamp(24px, 4vw, 48px)' }}
      >
        <h2
          className="font-serif italic text-cream"
          style={{
            fontSize: 'clamp(72px, 10vw, 140px)',
            fontWeight: 700,
            lineHeight: 0.9,
          }}
        >
          Cartelera
        </h2>
        <Link
          href="/cartelera"
          className="hidden md:block font-sans text-cream-muted hover:text-cream transition-colors flex-shrink-0 ml-8"
          style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase' }}
        >
          Ver todo →
        </Link>
      </div>

      {/* Scroll horizontal cinemático */}
      {events.length > 0 ? (
        <div
          className="flex gap-4 no-scrollbar"
          style={{
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            paddingLeft: 'clamp(24px, 4vw, 48px)',
            paddingRight: '80px',
            paddingBottom: '8px',
          }}
        >
          {events.map((e) => (
            <div key={e.slug} className="flex-shrink-0 w-80 snap-start">
              {/* Placeholder for horizontal card - will be implemented in Task 6 */}
              <div className="bg-gradient-to-br from-gold/10 to-transparent rounded-lg p-6 border border-gold/20">
                <h3 className="font-serif text-lg text-cream">{e.title}</h3>
                <p className="text-cream-muted text-sm mt-2">{e.venue}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p
          className="font-sans text-cream-muted"
          style={{
            paddingLeft: 'clamp(24px, 4vw, 48px)',
            fontSize: '14px',
          }}
        >
          No hay conciertos próximos. Vuelve pronto.
        </p>
      )}

      {/* Link móvil */}
      <div className="mt-6 md:hidden" style={{ paddingLeft: 'clamp(24px, 4vw, 48px)' }}>
        <Link
          href="/cartelera"
          className="font-sans text-gold"
          style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase' }}
        >
          Ver cartelera completa →
        </Link>
      </div>

    </section>
  )
}
