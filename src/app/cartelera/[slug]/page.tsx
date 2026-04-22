export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link         from 'next/link'
import Image        from 'next/image'
import { getEventDetail }                     from '@/lib/api'
import { formatDate, formatPrice, formatTime } from '@/lib/format'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const detail   = await getEventDetail(slug).catch(() => null)
  return {
    title: detail ? `${detail.event.title} — Parker & Lenox` : 'Evento — Parker & Lenox',
  }
}

function venueAccent(venueName: string): string {
  if (venueName.toLowerCase().includes('lenox')) return 'var(--color-lenox-red)'
  return 'var(--color-parker-bronze)'
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params

  let detail
  try {
    detail = await getEventDetail(slug)
  } catch {
    notFound()
  }

  const { event, ticketTypes, salesActive } = detail
  const firstType = ticketTypes[0]
  const accent    = venueAccent(event.venue)

  return (
    <div className="relative min-h-screen pt-24">
      <div className="relative h-[65vh] w-full overflow-hidden">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
            style={{ filter: 'contrast(1.1) saturate(0.7) sepia(0.1)' }}
            priority
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 30% 40%, var(--color-parker-red) 0%, var(--color-black) 70%)' }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 px-8 md:px-16 pb-12 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-6 h-px block" style={{ background: accent }} />
            <p className="font-mono text-[0.6rem] tracking-[0.4em] uppercase" style={{ color: accent }}>
              {event.venue} · {formatDate(event.date)} · {formatTime(event.time)}
            </p>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-light text-cream leading-tight">
            {event.title}
          </h1>
        </div>
      </div>

      <div className="relative z-10 px-8 md:px-16 py-16 max-w-5xl mx-auto grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          {event.description && (
            <>
              <h2 className="font-serif text-2xl font-light text-cream mb-4">Sobre el evento</h2>
              <p className="font-body text-base leading-relaxed" style={{ color: 'rgba(237,232,220,0.7)' }}>
                {event.description}
              </p>
            </>
          )}
        </div>

        <div className="border border-white/10 p-6 self-start">
          {salesActive && firstType ? (
            <>
              <p className="font-mono text-[0.6rem] tracking-widest uppercase mb-2" style={{ color: accent }}>
                Boletos
              </p>
              <p className="font-serif text-3xl font-light text-cream mb-1">
                {formatPrice(firstType.price)}
              </p>
              <p className="font-mono text-[0.6rem] text-white/30 mb-6">
                {firstType.available} disponibles
              </p>
              <Link
                href={`/checkout/${slug}`}
                className="block w-full text-center px-6 py-3 font-mono text-[0.6rem] tracking-widest uppercase text-cream border transition-colors duration-500 hover:bg-white/5 hoverable"
                style={{ borderColor: `${accent}60` }}
              >
                Comprar boletos
              </Link>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="font-body text-sm" style={{ color: 'rgba(237,232,220,0.5)' }}>
                {salesActive ? 'Agotado' : 'Venta no disponible'}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="px-8 md:px-16 pb-12 max-w-5xl mx-auto">
        <Link href="/cartelera" className="font-mono text-[0.6rem] tracking-widest uppercase text-white/30 hover:text-cream transition-colors hoverable">
          ← Cartelera
        </Link>
      </div>
    </div>
  )
}
