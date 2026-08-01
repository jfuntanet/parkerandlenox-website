'use client'

import { useState } from 'react'
import { loadStripe, type Stripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { formatPrice } from '@/lib/format'

// Cache de instancias de Stripe (una por publishable key)
const stripeCache = new Map<string, Promise<Stripe | null>>()
function getStripe(pk: string) {
  if (!stripeCache.has(pk)) stripeCache.set(pk, loadStripe(pk))
  return stripeCache.get(pk)!
}

interface Props {
  clientSecret: string
  publishableKey: string
  total: number
  returnUrl: string
  accent: string
  onBack: () => void
}

export function StripePaymentInline({ clientSecret, publishableKey, total, returnUrl, accent, onBack }: Props) {
  // Appearance del PaymentElement — match del sitio (fondo negro, cream, dorado)
  const appearance = {
    theme: 'night' as const,
    variables: {
      colorPrimary:    'rgb(160, 120, 74)',      // bronze
      colorBackground: 'rgba(0,0,0,0.4)',
      colorText:       'rgb(237,232,220)',
      colorTextSecondary: 'rgba(237,232,220,0.6)',
      colorTextPlaceholder: 'rgba(237,232,220,0.4)',
      colorDanger:     'rgb(192,32,42)',
      fontFamily:      'var(--font-body), Georgia, serif',
      borderRadius:    '999px',
      spacingUnit:     '4px',
    },
    rules: {
      '.Input':  { border: '1px solid rgba(255,255,255,0.2)', padding: '12px 20px' },
      '.Input:focus': { border: '1px solid rgba(255,255,255,0.6)', boxShadow: 'none' },
      '.Label':  { fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(237,232,220,0.6)' },
      '.Tab':    { borderRadius: '999px', border: '1px solid rgba(255,255,255,0.15)' },
      '.TabSelected': { border: `1px solid ${'rgb(160,120,74)'}` },
      '.CheckboxInput': { borderRadius: '4px' },
    },
  }

  return (
    <div className="flex flex-col gap-5">
      <button type="button" onClick={onBack}
        className="self-start font-mono text-[0.6rem] tracking-widest uppercase text-white/40 hover:text-cream transition-colors hoverable">
        ← Editar datos
      </button>

      <Elements stripe={getStripe(publishableKey)} options={{ clientSecret, appearance }}>
        <PayInner total={total} returnUrl={returnUrl} accent={accent} />
      </Elements>
    </div>
  )
}

function PayInner({ total, returnUrl, accent }: { total: number; returnUrl: string; accent: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [paying, setPaying] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function handlePay() {
    if (!stripe || !elements) return
    setPaying(true); setErr(null)
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    })
    if (error) {
      setErr(error.message || 'No se pudo procesar el pago')
      setPaying(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PaymentElement options={{ layout: 'tabs' }} />

      {err && (
        <p className="font-mono text-[0.65rem] tracking-widest uppercase px-4 py-3 border text-center"
          style={{ borderColor: 'rgba(192,32,42,0.3)', color: 'var(--color-lenox-red)' }}>
          {err}
        </p>
      )}

      <button type="button" onClick={handlePay} disabled={!stripe || paying}
        className="w-full px-6 py-4 rounded-full font-mono text-[0.7rem] tracking-[0.3em] uppercase transition-all duration-300 hoverable flex items-center justify-center gap-4 disabled:cursor-not-allowed"
        style={{
          background: 'transparent',
          color:  paying ? 'rgba(160,120,74,0.4)' : 'var(--color-parker-bronze)',
          border: `2px solid ${paying ? 'rgba(160,120,74,0.3)' : 'var(--color-parker-bronze)'}`,
        }}>
        {paying ? (
          <span>Procesando…</span>
        ) : (
          <>
            <span>Pagar →</span>
            <span className="font-serif text-lg tracking-normal normal-case opacity-90">
              {formatPrice(total)} <span className="font-mono text-[0.55rem] tracking-widest opacity-70">MXN</span>
            </span>
          </>
        )}
      </button>
    </div>
  )
}
