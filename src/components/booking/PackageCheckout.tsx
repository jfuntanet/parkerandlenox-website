'use client'

import { useState, useEffect, useRef } from 'react'
import { loadStripe, type Stripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import type { TicketPackage } from '@/types/api'
import { formatPrice } from '@/lib/format'

interface Props {
  pkg: TicketPackage
}

const stripeCache = new Map<string, Promise<Stripe | null>>()
function getStripe(pk: string) {
  if (!stripeCache.has(pk)) stripeCache.set(pk, loadStripe(pk))
  return stripeCache.get(pk)!
}

const inputCls = 'w-full rounded-full border border-white/20 bg-black/40 px-4 py-2.5 font-body text-sm md:text-base text-cream placeholder:text-white/40 focus:border-white/60 focus:outline-none'
const stripeAppearance = { theme: 'night' as const }
const bronze = 'var(--color-parker-bronze)'

// Checkout de un Ciclo: pide comprador (1 persona, N noches) → PaymentIntent →
// PaymentElement embebido. Un solo cobro; el core reparte en N boletos por correo.
export function PackageCheckout({ pkg }: Props) {
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [qty, setQty]     = useState(1)
  const [checkout, setCheckout] = useState<{ clientSecret: string; publishableKey: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const maxQty = Math.max(1, Math.min(10, pkg.available || 1))
  const total = pkg.price * qty

  async function startCheckout(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) { setError('Escribe tu nombre y correo.'); return }
    setSubmitting(true); setError(null)
    try {
      // Atribución: el beacon (Beacon.tsx) expone sid + UTMs en window.
      const _w = (typeof window !== 'undefined' ? window : undefined) as unknown as {
        __PL_SID?: string
        __PL_UTM?: { source?: string | null; medium?: string | null; campaign?: string | null; content?: string | null }
      } | undefined
      const _plSid = _w?.__PL_SID || null
      const _plUtm = _w?.__PL_UTM || null
      const res = await fetch('/api/checkout-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageSlug: pkg.slug,
          customerName: name.trim(),
          customerEmail: email.trim(),
          guestName: name.trim(),
          quantity: qty,
          session_hash_source: _plSid || undefined,
          utm_source: _plUtm?.source || undefined,
          utm_medium: _plUtm?.medium || undefined,
          utm_campaign: _plUtm?.campaign || undefined,
          utm_content: _plUtm?.content || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) { setError(data.error || 'No se pudo iniciar el pago.'); return }
      setCheckout({ clientSecret: data.clientSecret, publishableKey: data.publishableKey })
    } catch { setError('Error de conexión. Intenta de nuevo.') }
    finally { setSubmitting(false) }
  }

  const payFnRef = useRef<null | (() => Promise<void>)>(null)
  const [paying, setPaying] = useState(false)
  const returnUrl = typeof window !== 'undefined' ? `${window.location.origin}/checkout/success` : '/checkout/success'

  async function handlePayClick() {
    if (!payFnRef.current) return
    setPaying(true)
    await payFnRef.current()
    setPaying(false)
  }

  if (pkg.soldOut) {
    return (
      <p className="font-body text-center py-8 text-white/60">
        Este ciclo está agotado.
      </p>
    )
  }

  // Paso 1: datos del comprador
  if (!checkout) {
    return (
      <form onSubmit={startCheckout} className="flex flex-col gap-3">
        {/* Selector de cantidad (personas) */}
        <div className="flex items-center justify-between rounded-full border border-white/20 bg-black/40 px-4 py-2">
          <span className="font-body text-sm text-white/70">Personas</span>
          <div className="flex items-center gap-4">
            <button type="button" aria-label="menos" onClick={() => setQty(q => Math.max(1, q - 1))}
              disabled={qty <= 1}
              className="font-serif text-xl leading-none w-6 h-6 flex items-center justify-center disabled:opacity-30"
              style={{ color: bronze }}>−</button>
            <span className="font-serif text-lg w-5 text-center">{qty}</span>
            <button type="button" aria-label="más" onClick={() => setQty(q => Math.min(maxQty, q + 1))}
              disabled={qty >= maxQty}
              className="font-serif text-xl leading-none w-6 h-6 flex items-center justify-center disabled:opacity-30"
              style={{ color: bronze }}>+</button>
          </div>
        </div>
        <p className="font-body text-xs text-white/40 -mt-1 mb-1">
          Cada persona entra a los {pkg.nights.length} conciertos · {qty} × {formatPrice(pkg.price)}
        </p>

        <input className={inputCls} placeholder="Tu nombre" value={name}
          onChange={e => setName(e.target.value)} autoComplete="name" />
        <input className={inputCls} placeholder="Tu correo" type="email" value={email}
          onChange={e => setEmail(e.target.value)} autoComplete="email" />
        {error && <p className="font-body text-sm" style={{ color: 'var(--color-lenox-red)' }}>{error}</p>}
        <button type="submit" disabled={submitting}
          className="mt-1 px-6 py-3 rounded-full font-mono text-[0.65rem] tracking-[0.25em] uppercase transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{ border: `1.5px solid ${bronze}`, color: bronze }}>
          {submitting ? 'Un momento…' : `Continuar · ${formatPrice(total)}`}
        </button>
        <p className="font-body text-xs text-white/40 text-center mt-1">
          Recibirás {pkg.nights.length * qty} boletos ({pkg.nights.length} por persona) en tu correo.
        </p>
      </form>
    )
  }

  // Paso 2: pago
  return (
    <Elements stripe={getStripe(checkout.publishableKey)} options={{ clientSecret: checkout.clientSecret, appearance: stripeAppearance }}>
      <div className="flex flex-col gap-4">
        <PayInner returnUrl={returnUrl} payFnRef={payFnRef} onErr={setError} />
        {error && <p className="font-body text-sm" style={{ color: 'var(--color-lenox-red)' }}>{error}</p>}
        <button type="button" onClick={handlePayClick} disabled={paying}
          className="px-6 py-3 rounded-full font-mono text-[0.65rem] tracking-[0.25em] uppercase transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{ border: `1.5px solid ${bronze}`, color: bronze }}>
          {paying ? 'Procesando…' : `Pagar ${formatPrice(total)}`}
        </button>
      </div>
    </Elements>
  )
}

// Registra confirmPayment en un ref para dispararlo desde el botón externo.
function PayInner({ returnUrl, payFnRef, onErr }: {
  returnUrl: string
  payFnRef: React.MutableRefObject<null | (() => Promise<void>)>
  onErr: (m: string | null) => void
}) {
  const stripe = useStripe()
  const elements = useElements()

  useEffect(() => {
    payFnRef.current = async () => {
      if (!stripe || !elements) { onErr('Stripe no listo, intenta de nuevo'); return }
      onErr(null)
      const { error } = await stripe.confirmPayment({ elements, confirmParams: { return_url: returnUrl } })
      if (error) onErr(error.message || 'No se pudo procesar el pago')
    }
    return () => { payFnRef.current = null }
  }, [stripe, elements, returnUrl, payFnRef, onErr])

  return <PaymentElement options={{ layout: 'tabs' }} />
}
