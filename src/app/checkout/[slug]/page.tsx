export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link         from 'next/link'
import { getEventDetail }                     from '@/lib/api'
import { initiateCheckout }                   from '@/lib/actions'
import { formatDate, formatPrice, formatTime } from '@/lib/format'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const detail   = await getEventDetail(slug).catch(() => null)
  return {
    title: detail ? `${detail.event.title} — Boletos | Parker & Lenox` : 'Checkout | Parker & Lenox',
  }
}

export default async function CheckoutPage({
  params,
  searchParams,
}: Props & { searchParams: Promise<{ cancelled?: string }> }) {
  const { slug } = await params
  const sp       = await searchParams

  const detail = await getEventDetail(slug).catch(() => notFound())
  const { event, ticketTypes, salesActive } = detail
  if (!salesActive) notFound()

  const accent = event.venue.toLowerCase().includes('lenox')
    ? 'var(--color-lenox-red)'
    : 'var(--color-parker-bronze)'

  return (
    <div className="relative min-h-screen pt-32 pb-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 60% 20%, rgba(92,26,26,0.12) 0%, transparent 50%)' }}
      />

      <div className="relative z-10 px-8 md:px-16 max-w-xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-5 h-px block" style={{ background: accent }} />
            <p className="font-mono text-[0.6rem] tracking-widest uppercase" style={{ color: accent }}>
              {event.venue}
            </p>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-light text-cream">{event.title}</h1>
          <p className="font-mono text-[0.6rem] text-white/30 mt-2 tracking-widest">
            {formatDate(event.date)} · {formatTime(event.time)}
          </p>
        </div>

        {sp.cancelled && (
          <p className="mb-6 font-mono text-[0.65rem] tracking-widest uppercase px-4 py-3 border"
            style={{ borderColor: 'rgba(192,32,42,0.3)', color: 'var(--color-lenox-red)' }}>
            Pago cancelado. Puedes intentarlo de nuevo.
          </p>
        )}

        <form action={initiateCheckout} className="flex flex-col gap-6">
          <input type="hidden" name="slug" value={slug} />

          <fieldset className="border-0 p-0 m-0">
            <legend className="block font-mono text-[0.6rem] tracking-widest uppercase text-white/40 mb-3">
              Tipo de boleto
            </legend>
            {ticketTypes.map((tt, i) => (
              <label
                key={tt.id}
                className="flex items-center justify-between border border-white/10 px-4 py-3 mb-2 cursor-none hover:border-white/20 transition-colors hoverable"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="ticketTypeId"
                    value={tt.id}
                    defaultChecked={i === 0}
                    style={{ accentColor: accent }}
                  />
                  <span className="font-body text-base text-cream">{tt.name}</span>
                </div>
                <span className="font-mono text-sm" style={{ color: accent }}>
                  {formatPrice(tt.price)}
                </span>
              </label>
            ))}
          </fieldset>

          <div>
            <label htmlFor="quantity" className="block font-mono text-[0.6rem] tracking-widest uppercase text-white/40 mb-3">
              Cantidad
            </label>
            <select
              id="quantity"
              name="quantity"
              className="w-full border border-white/10 px-4 py-3 font-body text-base text-cream focus:border-white/30 focus:outline-none"
              style={{ background: 'var(--color-black)' }}
            >
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <option key={n} value={n}>{n} boleto{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="customerName" className="block font-mono text-[0.6rem] tracking-widest uppercase text-white/40 mb-3">
              Tu nombre
            </label>
            <input
              id="customerName"
              type="text"
              name="customerName"
              required
              placeholder="Nombre completo"
              className="w-full border border-white/10 px-4 py-3 font-body text-base text-cream placeholder:text-white/20 focus:border-white/30 focus:outline-none"
              style={{ background: 'var(--color-black)' }}
            />
          </div>

          <div>
            <label htmlFor="customerEmail" className="block font-mono text-[0.6rem] tracking-widest uppercase text-white/40 mb-3">
              Email
            </label>
            <input
              id="customerEmail"
              type="email"
              name="customerEmail"
              required
              placeholder="tu@email.com"
              className="w-full border border-white/10 px-4 py-3 font-body text-base text-cream placeholder:text-white/20 focus:border-white/30 focus:outline-none"
              style={{ background: 'var(--color-black)' }}
            />
            <p className="mt-2 font-mono text-[0.55rem] tracking-widest text-white/25">
              Recibirás tus boletos en este correo.
            </p>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-4 font-mono text-[0.65rem] tracking-[0.3em] uppercase text-cream border transition-colors duration-500 hover:bg-white/5 hoverable"
            style={{ borderColor: `${accent}60` }}
          >
            Ir a pagar →
          </button>
        </form>

        <div className="mt-8">
          <Link href={`/cartelera/${slug}`} className="font-mono text-[0.6rem] tracking-widest uppercase text-white/25 hover:text-cream transition-colors hoverable">
            ← Volver al evento
          </Link>
        </div>
      </div>
    </div>
  )
}
