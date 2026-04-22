import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { GrainOverlay } from '@/components/ui/GrainOverlay'
import { getEventDetail } from '@/lib/api'
import { formatDate, formatPrice, formatTime } from '@/lib/format'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ slug: string }> }

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

  return (
    <div className="relative min-h-screen pt-24">
      <GrainOverlay />

      <div className="relative h-[60vh] w-full overflow-hidden">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover image-painted"
            priority
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 30% 40%, #3d1202 0%, #0d0905 70%)' }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-12 max-w-6xl mx-auto">
          <p className="font-sans text-xs uppercase tracking-widest text-gold mb-3">
            {formatDate(event.date)} · {formatTime(event.time)}
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-light text-cream text-shadow-warm">
            {event.title}
          </h1>
          <p className="font-sans text-sm text-cream-muted mt-2">{event.venue}</p>
        </div>
      </div>

      <div className="relative z-10 px-6 md:px-12 py-16 max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          {event.description && (
            <>
              <h2 className="font-serif text-2xl font-light text-cream mb-4">Sobre el evento</h2>
              <p className="font-sans text-sm text-cream-muted leading-relaxed">{event.description}</p>
            </>
          )}
        </div>

        <div className="border border-cream/10 p-6 self-start">
          {salesActive && firstType ? (
            <>
              <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2">Boletos</p>
              <p className="font-serif text-3xl font-light text-cream mb-1">
                {formatPrice(firstType.price)}
              </p>
              <p className="font-sans text-xs text-cream-muted mb-6">
                {firstType.available} disponibles
              </p>
              <Link
                href={`/checkout/${slug}`}
                className="block w-full text-center border border-gold/40 px-6 py-3 font-sans text-xs uppercase tracking-widest text-gold hover:bg-gold/10 transition-colors duration-500"
              >
                Comprar boletos
              </Link>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="font-sans text-sm text-cream-muted">
                {salesActive ? 'Agotado' : 'Venta no disponible'}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 md:px-12 pb-12 max-w-6xl mx-auto">
        <Link href="/cartelera" className="font-sans text-xs uppercase tracking-widest text-cream-muted hover:text-cream transition-colors">
          ← Cartelera
        </Link>
      </div>
    </div>
  )
}
