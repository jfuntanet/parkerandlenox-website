import { notFound } from 'next/navigation'
import { GrainOverlay } from '@/components/ui/GrainOverlay'
import { getEventDetail } from '@/lib/api'
import { formatDate, formatPrice, formatTime } from '@/lib/format'
import { initiateCheckout } from '@/lib/actions'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const detail = await getEventDetail(slug).catch(() => null)
  return {
    title: detail ? `${detail.event.title} — Checkout | Not a Bot` : 'Checkout | Not a Bot',
  }
}

export default async function CheckoutPage({ params }: Props) {
  const { slug } = await params

  const detail = await getEventDetail(slug).catch(() => notFound())
  const { event, ticketTypes, salesActive } = detail
  if (!salesActive) notFound()

  return (
    <div className="relative min-h-screen pt-32 pb-24">
      <GrainOverlay />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 60% 20%, #1a0a15 0%, transparent 50%)' }}
      />

      <div className="relative z-10 px-6 md:px-12 max-w-2xl mx-auto">
        <div className="mb-10">
          <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2">{event.venue}</p>
          <h1 className="font-serif text-3xl md:text-4xl font-light text-cream">{event.title}</h1>
          <p className="font-sans text-sm text-cream-muted mt-1">
            {formatDate(event.date)} · {formatTime(event.time)}
          </p>
        </div>

        <form action={initiateCheckout} className="flex flex-col gap-6">
          <input type="hidden" name="slug" value={slug} />

          <fieldset className="border-0 p-0 m-0">
            <legend className="block font-sans text-xs uppercase tracking-widest text-cream-muted mb-3">
              Tipo de boleto
            </legend>
            {ticketTypes.map((tt) => (
              <label
                key={tt.id}
                className="flex items-center justify-between border border-cream/10 px-4 py-3 mb-2 cursor-pointer hover:border-gold/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="ticketTypeId"
                    value={tt.id}
                    defaultChecked={ticketTypes[0]?.id === tt.id}
                    style={{ accentColor: 'var(--color-gold)' }}
                  />
                  <span className="font-sans text-sm text-cream">{tt.name}</span>
                </div>
                <span className="font-sans text-sm text-gold">{formatPrice(tt.price)}</span>
              </label>
            ))}
          </fieldset>

          <div>
            <label htmlFor="quantity" className="block font-sans text-xs uppercase tracking-widest text-cream-muted mb-3">
              Cantidad
            </label>
            <select
              id="quantity"
              name="quantity"
              className="w-full bg-canvas border border-cream/20 px-4 py-3 font-sans text-sm text-cream focus:border-gold/40 focus:outline-none"
            >
              {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                <option key={n} value={n}>{n} boleto{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="customerName" className="block font-sans text-xs uppercase tracking-widest text-cream-muted mb-3">
              Tu nombre
            </label>
            <input
              id="customerName"
              type="text"
              name="customerName"
              required
              placeholder="Nombre completo"
              className="w-full bg-canvas border border-cream/20 px-4 py-3 font-sans text-sm text-cream placeholder:text-cream-dim focus:border-gold/40 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="customerEmail" className="block font-sans text-xs uppercase tracking-widest text-cream-muted mb-3">
              Tu email
            </label>
            <input
              id="customerEmail"
              type="email"
              name="customerEmail"
              required
              placeholder="correo@ejemplo.com"
              className="w-full bg-canvas border border-cream/20 px-4 py-3 font-sans text-sm text-cream placeholder:text-cream-dim focus:border-gold/40 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full border border-gold/40 px-8 py-4 font-sans text-xs uppercase tracking-widest text-gold hover:bg-gold/10 transition-colors duration-500"
          >
            Continuar al pago →
          </button>

          <p className="font-sans text-xs text-cream-dim text-center">
            Serás redirigido a Stripe para completar el pago de forma segura.
          </p>
        </form>
      </div>
    </div>
  )
}
