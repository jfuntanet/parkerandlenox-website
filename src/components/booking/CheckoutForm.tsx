'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { loadStripe, type Stripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { MerchUpsell, cartSubtotal, type MerchProduct, type CartMap } from './MerchUpsell'
import { formatPrice, formatDateShort, formatTime } from '@/lib/format'
import { pushEvent } from '@/lib/analytics'
import type { EventDetail } from '@/types/api'

interface Props {
  slug: string
  event: EventDetail['event']
  ticketTypes: EventDetail['ticketTypes']
  accent: string
  initialQty?: number
  mode?: 'form-only' | 'from-extras' | 'full'
}

const stripeCache = new Map<string, Promise<Stripe | null>>()
function getStripe(pk: string) {
  if (!stripeCache.has(pk)) stripeCache.set(pk, loadStripe(pk))
  return stripeCache.get(pk)!
}

const inputCls = 'w-full rounded-full border border-white/20 bg-black/40 px-4 py-2.5 font-body text-sm md:text-base text-cream placeholder:text-white/40 focus:border-white/60 focus:outline-none'
const stripeAppearance = {
  theme: 'night' as const,
  variables: {
    colorPrimary:    'rgb(160, 120, 74)',
    colorBackground: 'transparent',
    colorText:       'rgb(237,232,220)',
    colorTextSecondary: 'rgba(237,232,220,0.6)',
    colorTextPlaceholder: 'rgba(237,232,220,0.4)',
    colorDanger:     'rgb(192,32,42)',
    fontFamily:      'var(--font-body), Georgia, serif',
    borderRadius:    '12px',
    spacingUnit:     '4px',
  },
  rules: {
    '.Input':  { borderRadius: '999px', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 20px', backgroundColor: 'transparent' },
    '.Input:focus': { border: '1px solid rgba(255,255,255,0.6)', boxShadow: 'none' },
    '.Label':  { fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(237,232,220,0.6)' },
    '.Tab':    { borderRadius: '999px', border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'transparent' },
    '.TabSelected': { border: '1px solid rgb(160,120,74)', backgroundColor: 'transparent' },
    '.Block':  { backgroundColor: 'transparent', border: 'none' },
    '.CheckboxInput': { borderRadius: '4px' },
  },
}

// ─── Componente reusable de card de paso (accordion) ───
interface StepCardProps {
  step: number
  logicalId: number
  title: string
  isOpen: boolean
  isDone: boolean
  isLocked: boolean
  optional?: boolean
  summary?: string
  onOpen: () => void
  accent: string
  children: React.ReactNode
}
function StepCard({ step, logicalId, title, isOpen, isDone, isLocked, optional, summary, onOpen, accent, children }: StepCardProps) {
  const tEv = useTranslations('event')
  const tOpt = useTranslations('checkoutFlow')
  const canClick = !isOpen && !isLocked
  return (
    <section id={`step-${logicalId}`} className="rounded-xl border transition-colors overflow-hidden scroll-mt-24"
      style={{
        background: isOpen ? '#1a1a1a' : (isLocked ? 'rgba(0,0,0,0.4)' : 'rgba(26,26,26,0.6)'),
        borderColor: isOpen ? accent : 'rgba(255,255,255,0.10)',
      }}>
      <button type="button" onClick={canClick ? onOpen : undefined} disabled={!canClick}
        className={`w-full flex items-center gap-4 px-5 md:px-6 py-4 ${canClick ? 'hover:bg-white/[0.02] hoverable cursor-pointer' : ''}`}>
        {/* Número o check */}
        <span className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-serif text-lg leading-none"
          style={{
            background: isDone ? accent : 'transparent',
            color: isDone ? 'var(--color-black)' : (isOpen ? accent : 'rgba(160,120,74,0.5)'),
            border: isDone ? 'none' : `1.5px solid ${isOpen ? accent : 'rgba(160,120,74,0.3)'}`,
          }}>
          {isDone ? '✓' : step}
        </span>
        {/* Título + resumen */}
        <div className="flex-1 text-left min-w-0">
          <p className="font-serif text-xl md:text-2xl leading-tight flex items-center gap-2 flex-wrap"
            style={{ color: isLocked ? 'rgba(237,232,220,0.35)' : 'rgb(237,232,220)' }}>
            <span>{title}</span>
            {optional && (
              <span className="font-mono text-[0.7rem] tracking-[0.25em] uppercase text-white/55 border border-white/20 rounded-full px-2.5 py-0.5 leading-none">
                {tOpt('optional').replace(/^\(|\)$/g, '')}
              </span>
            )}
          </p>
          {isDone && !isOpen && summary && (
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-white/60 mt-1.5 truncate">
              {summary}
            </p>
          )}
        </div>
        {/* Estado a la derecha */}
        {isDone && !isOpen && (
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-white/55 flex-shrink-0">{tEv('editStep')}</span>
        )}
        {isLocked && (
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-white/40 flex-shrink-0">{tEv('pendingStep')}</span>
        )}
      </button>

      {/* Abrir / cerrar: mount instantáneo + suave fade-in del contenido para señalizar progresión */}
      {isOpen && (
        <div className="px-5 md:px-6 pb-6 pt-2 border-t border-white/[0.06] animate-step-open">
          {children}
        </div>
      )}
    </section>
  )
}

export function CheckoutForm({ slug, event, ticketTypes, accent, initialQty = 1, mode = 'full' }: Props) {
  const t = useTranslations('event')
  const tFlow = useTranslations('checkoutFlow')
  const tMerch = useTranslations('merch')
  const router = useRouter()
  const storageKey = 'plx-checkout-' + slug

  // Estado principal — arranca en el primer set con cupo (no dejar preseleccionado uno agotado)
  const _firstAvailable = ticketTypes.find(t => (t.available ?? 1) > 0) ?? ticketTypes[0]
  const [ticketTypeId, setTicketTypeId] = useState(_firstAvailable?.id ?? '')
  const [quantity, setQuantity]         = useState(Math.max(1, Math.min(10, initialQty)))
  const [customerName, setCustomerName]   = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [guests, setGuests]               = useState<{ name?: string; email?: string }[]>([])
  const [customerNotes, setCustomerNotes] = useState('')
  const [couponCode, setCouponCode]       = useState('')
  const [couponApplied, setCouponApplied] = useState<{code:string; discountType:'percent'|'fixed'; discountValue:number} | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError]     = useState<string | null>(null)
  const [merchCart, setMerchCart]         = useState<CartMap>(new Map())
  const [merchProducts, setMerchProducts] = useState<MerchProduct[] | null>(null)
  const [checkout, setCheckout]           = useState<{ clientSecret: string; publishableKey: string } | null>(null)
  const [submitting, setSubmitting]       = useState(false)
  const [submitError, setSubmitError]     = useState<string | null>(null)
  const [paying, setPaying]               = useState(false)

  // Stepper state
  const [activeStep, setActiveStep] = useState(1)
  const [completed, setCompleted]   = useState<Set<number>>(new Set())

  // Hidratar desde sessionStorage
  useEffect(() => {
    if (mode !== 'from-extras') return
    try {
      const raw = sessionStorage.getItem(storageKey)
      if (!raw) { router.replace('/cartelera/' + slug); return }
      const d = JSON.parse(raw)
      if (d.quantity) setQuantity(Number(d.quantity))
      if (d.ticketTypeId) setTicketTypeId(d.ticketTypeId)
    } catch { router.replace('/cartelera/' + slug) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  // Cálculos
  const selectedType = ticketTypes.find(t => t.id === ticketTypeId) ?? ticketTypes[0]
  const ticketsUnit = selectedType ? Number(selectedType.price) : 0
  const ticketsSubtotal = ticketsUnit * quantity
  const merchSubtotal = cartSubtotal(merchCart, merchProducts)
  const subtotal = ticketsSubtotal + merchSubtotal
  // El cupón sólo aplica al subtotal de boletos, NO al merch (así lo hace el backend
  // — el discount se resta al unitPrice del ticket, no al extraAmount).
  const discount = couponApplied
    ? (couponApplied.discountType === 'percent'
        ? Math.round(ticketsSubtotal * (couponApplied.discountValue / 100))
        : Math.min(ticketsSubtotal, couponApplied.discountValue * quantity))
    : 0
  const grandTotal = Math.max(0, subtotal - discount)
  const guestSlots = Math.max(0, quantity - 1)
  const hasGuests = guestSlots > 0

  // Sincronizar guests con quantity
  useEffect(() => {
    setGuests(prev => {
      if (prev.length === guestSlots) return prev
      const next = prev.slice(0, guestSlots)
      while (next.length < guestSlots) next.push({})
      return next
    })
  }, [guestSlots])

  // NOTA: el auto-fire de loadPayment se removió a propósito. Todo el flujo de
  // "crear PaymentIntent" y "pagar" ahora se dispara ÚNICAMENTE desde el CTA
  // principal del sidebar (handleMainCTA). Esto elimina cualquier redirect
  // accidental cuando el usuario aplica un cupón o cambia la cantidad.

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)
  const canFinishStep1 = customerName.trim().length >= 2 && isValidEmail

  function invalidateCheckout() {
    if (checkout) setCheckout(null)
    if (submitError) setSubmitError(null)
  }

  // Mapeo de step lógico → step visible.
  // Con acompañantes: 1 (comprador) → 3 (extras) → 4 (pago) → 2 (acompañantes, al final, opcional).
  // Sin acompañantes: se omite el 2.
  const stepMap: number[] = [1, 3, 4]  // Datos comprador · Extras (opcional) · Pago
  const OPTIONAL_STEPS = [3]  // extras es el único opcional
  function visualNum(logical: number) { return stepMap.indexOf(logical) + 1 }
  const totalSteps = stepMap.length

  function goToStep(n: number) {
    if (activeStep === n) return
    setSubmitError(null)
    setActiveStep(n)
    // 'nearest' hace scroll mínimo — sólo si la card no cabe en pantalla.
    // Deja las cards anteriores visibles cuando hay espacio suficiente.
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        const el = document.getElementById(`step-${n}`)
        if (el) el.scrollIntoView({ behavior: 'auto', block: 'nearest' })
      })
    }
  }
  function completeStep(n: number, next: number) {
    setCompleted(prev => new Set(prev).add(n))
    goToStep(next)
  }

  async function applyCoupon() {
    if (!couponCode.trim()) return
    setCouponLoading(true); setCouponError(null)
    try {
      const res = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, code: couponCode.trim() }),
      })
      const data = await res.json()
      if (!res.ok || data.valid === false || data.error) {
        setCouponError(data.error || t('couponInvalid')); setCouponApplied(null)
      } else {
        setCouponApplied({
          code: data.code || couponCode.trim().toUpperCase(),
          discountType: data.discountType || 'percent',
          discountValue: Number(data.discountValue || 0),
        })
        invalidateCheckout()
      }
    } catch { setCouponError(t('couponValidateError')) }
    finally { setCouponLoading(false) }
  }
  function removeCoupon() { setCouponApplied(null); setCouponError(null); setCouponCode(''); invalidateCheckout() }

  async function loadPayment(opts: { manual?: boolean } = {}) {
    // Guard defensivo: si el total es $0 y no es click explícito del usuario,
    // NO seguimos. Esto evita redirects automáticos a la pantalla de éxito
    // cuando el cupón cubre 100% del monto.
    if (!opts.manual && grandTotal === 0) return
    setSubmitting(true); setSubmitError(null)
    try {
      const validGuests = guests.filter(g => (g.name && g.name.trim()) || (g.email && g.email.trim()))
      const extraItems = Array.from(merchCart.entries()).map(([productId, q]) => ({ productId, quantity: q }))
      // Marketing Analytics: el beacon (Beacon.tsx) expone el sid (cookie pl_sid) y las UTMs
      // en window.__PL_SID / __PL_UTM. Los mandamos para que el core atribuya la orden a la
      // sesión (orders.last_session_hash + last_utm_*). Sin esto la vista Fuentes ve 0 órdenes.
      const _w = (typeof window !== 'undefined' ? window : undefined) as unknown as {
        __PL_SID?: string
        __PL_UTM?: { source?: string | null; medium?: string | null; campaign?: string | null; content?: string | null }
      } | undefined
      const _plSid = _w?.__PL_SID || null
      const _plUtm = _w?.__PL_UTM || null
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug, ticketTypeId, quantity, customerName, customerEmail,
          guests: validGuests.length ? validGuests : undefined,
          couponCode: couponApplied ? couponApplied.code : (couponCode.trim() || undefined),
          customerNotes: customerNotes.trim() || undefined,
          extraItems: extraItems.length ? extraItems : undefined,
          session_hash_source: _plSid || undefined,
          utm_source: _plUtm?.source || undefined,
          utm_medium: _plUtm?.medium || undefined,
          utm_campaign: _plUtm?.campaign || undefined,
          utm_content: _plUtm?.content || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) { setSubmitError(data.error || t('paymentStartError')); return }
      // Reserva gratis (jams, cortesías al 100%, etc.): el core ya confirmó, generó tokens y mandó emails.
      // No hay clientSecret; brincamos directo a la pantalla de éxito.
      if (data.orderId && !data.clientSecret) {
        try { sessionStorage.removeItem(storageKey) } catch {}
        router.push('/checkout/success?order_id=' + encodeURIComponent(data.orderId) + '&free=1')
        return
      }
      setCheckout({ clientSecret: data.clientSecret, publishableKey: data.publishableKey })
    } catch { setSubmitError(t('connectionError')) }
    finally { setSubmitting(false) }
  }

  const payFnRef = useRef<null | (() => Promise<void>)>(null)
  const returnUrl = typeof window !== 'undefined' ? `${window.location.origin}/checkout/success` : '/checkout/success'
  async function handlePayClick() {
    if (!payFnRef.current) return
    setPaying(true); setSubmitError(null)
    try { await payFnRef.current() }
    finally { setPaying(false) }
  }

  // Handler unificado del CTA principal del sidebar.
  // 3 caminos según el estado del carrito:
  // - $0: confirma reserva gratis (loadPayment manual → redirect a success)
  // - >0 y sin PaymentIntent: brinca al paso 4 y prepara el pago (loadPayment manual)
  // - >0 y con PaymentIntent: dispara el confirm de Stripe
  async function handleMainCTA() {
    if (grandTotal === 0) { await loadPayment({ manual: true }); return }
    if (!checkout)         { await loadPayment({ manual: true }); return }
    handlePayClick()
  }

  // ═══════════════════════════════════════════════════════════
  // MODO FORM-ONLY: landing — solo cantidad y CTA
  // ═══════════════════════════════════════════════════════════
  if (mode === 'form-only') {
    return (
      <form onSubmit={(e) => {
        e.preventDefault()
        try { sessionStorage.setItem(storageKey, JSON.stringify({ quantity, ticketTypeId })) } catch {}
        // Tracking: begin_checkout (GA4 e-commerce) + InitiateCheckout (Meta Pixel)
        const selectedTt = ticketTypes.find(t => t.id === ticketTypeId)
        pushEvent('begin_checkout', {
          ecommerce: {
            currency: 'MXN',
            value: ticketsSubtotal,
            items: [{
              item_id: slug,
              item_name: event.title,
              item_variant: selectedTt?.name || 'General',
              item_category: event.venue,
              price: ticketsUnit,
              quantity,
            }],
          },
        })
        router.push('/cartelera/' + slug + '/checkout')
      }} className="flex flex-col gap-3 md:gap-5">
        <div className="flex items-center justify-between gap-4 py-2 md:py-5">
          <p className="font-serif text-3xl md:text-4xl font-light text-cream leading-none">
            {formatPrice(ticketsUnit)}
            <span className="font-mono text-xs ml-1.5 tracking-widest align-middle text-white/50">MXN</span>
          </p>
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Menos" disabled={quantity<=1}
              onClick={() => setQuantity(q => Math.max(1, q-1))}
              className="w-10 h-10 rounded-full flex items-center justify-center font-serif text-xl leading-none hover:opacity-80 disabled:opacity-30 transition-opacity hoverable"
              style={{ background: 'var(--color-parker-bronze)', color: 'var(--color-black)' }}>−</button>
            <span className="font-serif text-3xl text-cream min-w-[2ch] text-center leading-none">{quantity}</span>
            <button type="button" aria-label="Más" disabled={quantity>=10}
              onClick={() => setQuantity(q => Math.min(10, q+1))}
              className="w-10 h-10 rounded-full flex items-center justify-center font-serif text-xl leading-none hover:opacity-80 disabled:opacity-30 transition-opacity hoverable"
              style={{ background: 'var(--color-parker-bronze)', color: 'var(--color-black)' }}>+</button>
          </div>
        </div>

        {ticketTypes.length > 1 && (
          <fieldset className="border-0 p-0 m-0">
            <legend className="sr-only">{t('ticketTypeLegend')}</legend>
            {ticketTypes.map(tt => {
              const isSoldOut = (tt.available ?? 1) <= 0
              return (
                <label key={tt.id} className={`flex items-center justify-between border-b border-white/10 py-3 transition-colors ${isSoldOut ? 'cursor-not-allowed opacity-70' : 'hover:border-white/25 hoverable cursor-pointer'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" checked={ticketTypeId===tt.id} onChange={()=>!isSoldOut && setTicketTypeId(tt.id)} disabled={isSoldOut} style={{accentColor: accent}} />
                    <span className={`font-body text-base ${isSoldOut ? 'line-through text-cream/50' : 'text-cream'}`}>{tt.name}</span>
                    {isSoldOut && (
                      <span className="font-mono text-[0.65rem] tracking-widest uppercase font-bold" style={{ color: 'var(--color-lenox-red)' }}>{t('soldOut')}</span>
                    )}
                  </div>
                  <span className={`font-mono text-sm ${isSoldOut ? 'line-through opacity-50' : ''}`} style={{color: accent}}>{formatPrice(tt.price)}</span>
                </label>
              )
            })}
          </fieldset>
        )}

        <button type="submit"
          className="w-full mt-0 md:mt-2 px-5 py-2.5 rounded-full font-mono text-[0.7rem] tracking-[0.3em] uppercase transition-all duration-300 hoverable flex items-center justify-center gap-3 hover:bg-[color:var(--color-parker-bronze)] hover:text-[color:var(--color-black)]"
          style={{
            background: 'transparent',
            color:  'var(--color-parker-bronze)',
            border: '2px solid var(--color-parker-bronze)',
          }}>
          <span>{quantity === 1 ? t('buyTicketOne') : t('buyTicketMany', { qty: quantity })}</span>
          <span className="font-serif text-base tracking-normal normal-case opacity-90">
            {formatPrice(ticketsSubtotal)} <span className="font-mono text-[0.55rem] tracking-widest opacity-70">MXN</span>
          </span>
        </button>
      </form>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // MODO FROM-EXTRAS: accordion de 4 pasos + sidebar
  // ═══════════════════════════════════════════════════════════

  // Summaries por paso completado
  const summary1 = `${customerName || '—'} · ${customerEmail || '—'}`
  const merchCount = Array.from(merchCart.values()).reduce((s, q) => s + q, 0)
  const summary3Parts: string[] = []
  if (customerNotes.trim()) summary3Parts.push(t('withNote'))
  if (merchCount > 0) summary3Parts.push(merchCount === 1 ? t('merchPieceOne', { n: 1 }) : t('merchPieceMany', { n: merchCount }))
  const summary3 = summary3Parts.length ? summary3Parts.join(' · ') : t('noExtras')

  const summaryLines: { id: string; title: string; image: string | null; qty: number; unit: number; sub: number }[] =
    merchProducts && merchProducts.length
      ? (Array.from(merchCart.entries())
          .map(([pid, q]) => {
            const p = merchProducts.find(x => x.id === pid)
            if (!p) return null
            return { id: pid, title: p.title, image: p.imageUrl, qty: q, unit: Number(p.price), sub: Number(p.price) * q }
          })
          .filter(Boolean) as { id: string; title: string; image: string | null; qty: number; unit: number; sub: number }[])
      : []

  const continueBtnCls = 'self-center w-full sm:w-1/2 mt-6 px-6 py-3.5 rounded-full font-mono text-[0.7rem] tracking-[0.3em] uppercase transition-all duration-300 hoverable flex items-center justify-center gap-3 disabled:cursor-not-allowed'
  const continueBtnStyle = (enabled: boolean) => ({
    background: 'transparent',
    color:  enabled ? 'var(--color-parker-bronze)' : 'rgba(160,120,74,0.35)',
    border: `2px solid ${enabled ? 'var(--color-parker-bronze)' : 'rgba(160,120,74,0.25)'}`,
  })

  // ¿El paso está bloqueado? Bloqueado si algún paso previo (según stepMap) no está completado.
  // Los pasos opcionales (extras, acompañantes) no bloquean a los siguientes.
  function isLocked(logical: number) {
    for (const prev of stepMap) {
      if (prev >= logical) break
      if (OPTIONAL_STEPS.includes(prev)) continue
      if (!completed.has(prev)) return true
    }
    return false
  }

  const payload = (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14">
      {/* COLUMNA IZQUIERDA — card único con datos + extras */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <button type="button" onClick={() => router.push('/cartelera/' + slug)}
          className="self-start font-mono text-sm tracking-[0.2em] uppercase text-white/60 hover:text-cream transition-colors hoverable mb-3">
          {tFlow('backToEvent')}
        </button>

        <section className="rounded-xl border border-white/[0.10] p-6 md:p-8 flex flex-col gap-8"
          style={{ background: '#1a1a1a' }}>

          {/* Datos del comprador */}
          <div>
            <p className="font-mono text-sm tracking-[0.25em] uppercase mb-4" style={{ color: accent }}>
              {tFlow('buyerData')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" required placeholder={tFlow('yourNameRequired')}
                value={customerName}
                onChange={e => { setCustomerName(e.target.value); invalidateCheckout() }}
                className={inputCls} />
              <input type="email" required placeholder={tFlow('yourEmailRequired')}
                value={customerEmail}
                onChange={e => { setCustomerEmail(e.target.value); invalidateCheckout() }}
                className={inputCls} />
            </div>
            <p className="font-body text-sm leading-relaxed text-white/55 mt-3 px-1">
              {tFlow('receiveTicketsHint')}
            </p>
          </div>

          <div className="h-px bg-white/[0.08]" />

          {/* Requerimientos especiales */}
          <div>
            <p className="font-mono text-sm tracking-[0.25em] uppercase mb-4" style={{ color: accent }}>
              {tFlow('specialRequirements')} <span className="font-body normal-case tracking-normal text-white/40 text-xs ml-2">{tFlow('optional')}</span>
            </p>
            <textarea placeholder={tFlow('specialRequirementsPlaceholder')}
              value={customerNotes}
              onChange={e => { setCustomerNotes(e.target.value); invalidateCheckout() }}
              rows={3}
              className="w-full rounded-2xl border border-white/20 bg-black/40 px-5 py-3 font-body text-base text-cream placeholder:text-white/40 focus:border-white/60 focus:outline-none resize-none" />
            <p className="font-body text-base md:text-sm leading-relaxed text-white/60 mt-3 px-1">
              {tFlow('staffWillSee')}
            </p>
          </div>

          <div className="h-px bg-white/[0.08]" />

          {/* Merch */}
          <div>
            <div className="text-center pb-4">
              <p className="font-mono text-sm tracking-[0.25em] uppercase mb-3" style={{ color: accent }}>
                {tFlow('officialCollection')}
              </p>
              <p className="font-body text-base md:text-sm max-w-md mx-auto leading-relaxed" style={{ color: 'rgba(237,232,220,0.7)' }}>
                {tFlow('merchDescription')}
              </p>
            </div>
            <MerchUpsellWrapper cart={merchCart}
              onChange={(c) => { setMerchCart(c); invalidateCheckout() }}
              accent={accent}
              onProducts={setMerchProducts} />
          </div>
        </section>
      </div>

      {/* SIDEBAR — resumen sticky */}
      <aside className="lg:col-span-4 lg:sticky lg:top-24 self-start rounded-xl border border-white/[0.10] p-6 flex flex-col gap-5" style={{ background: '#1a1a1a' }}>
        <p className="font-mono text-sm tracking-[0.35em] uppercase" style={{ color: accent }}>
          {tFlow('orderSummary')}
        </p>

        {/* Header del evento — póster grande + venue/título/fecha */}
        <div className="flex gap-4">
          {event.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.imageUrl} alt="" className="w-24 h-32 rounded-lg object-cover flex-shrink-0 bg-black" />
          )}
          <div className="flex flex-col min-w-0 flex-1 gap-1.5">
            <div className="flex items-center gap-2">
              <span className="w-4 h-px block" style={{ background: accent }} />
              <span className="font-mono text-[0.6rem] tracking-[0.3em] uppercase" style={{ color: accent }}>
                {event.venue}
              </span>
            </div>
            <p className="font-serif text-lg leading-tight text-cream line-clamp-3">
              {event.title}
            </p>
            <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-white/60 mt-auto">
              {formatDateShort(event.date)}
              {selectedType?.startTime
                ? ` · ${formatTime(selectedType.startTime)}`
                : (event.time && ticketTypes.length <= 1 ? ` · ${formatTime(event.time)}` : '')}
            </p>
          </div>
        </div>

        <div className="h-px bg-white/[0.06]" />

        {/* Boletos: selector de cantidad + subtotal */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button type="button" aria-label={tMerch('decrease')} disabled={quantity <= 1}
              onClick={() => { setQuantity(q => Math.max(1, q - 1)); invalidateCheckout() }}
              className="w-7 h-7 rounded-full flex items-center justify-center font-serif text-base leading-none hover:opacity-80 disabled:opacity-30 transition-opacity hoverable"
              style={{ background: 'var(--color-parker-bronze)', color: 'var(--color-black)' }}>−</button>
            <span className="font-mono text-sm tracking-widest uppercase text-white min-w-[6.5ch] text-center">
              {quantity === 1 ? tFlow('ticketOne') : tFlow('ticketMany', { n: quantity })}
            </span>
            <button type="button" aria-label={tMerch('increase')} disabled={quantity >= 10}
              onClick={() => { setQuantity(q => Math.min(10, q + 1)); invalidateCheckout() }}
              className="w-7 h-7 rounded-full flex items-center justify-center font-serif text-base leading-none hover:opacity-80 disabled:opacity-30 transition-opacity hoverable"
              style={{ background: 'var(--color-parker-bronze)', color: 'var(--color-black)' }}>+</button>
          </div>
          <p className="font-body text-base text-cream flex-shrink-0">{formatPrice(ticketsSubtotal)}</p>
        </div>

        {summaryLines.length > 0 && (
          <>
            <div className="h-px bg-white/[0.06]" />
            {summaryLines.map(l => {
              const stock = merchProducts?.find(p => p.id === l.id)?.stock ?? 10
              const maxQty = Math.min(10, stock)
              const setQty = (nextQty: number) => {
                const next = new Map(merchCart)
                if (nextQty <= 0) next.delete(l.id)
                else next.set(l.id, nextQty)
                setMerchCart(next)
                invalidateCheckout()
              }
              return (
                <div key={l.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {l.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={l.image} alt="" className="w-12 h-12 rounded-md object-contain flex-shrink-0 bg-black p-1" />
                    )}
                    <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                      <p className="font-body text-sm text-cream leading-tight line-clamp-2">{l.title}</p>
                      <div className="flex items-center gap-2">
                        <button type="button" aria-label={tFlow('removeOne')} onClick={() => setQty(l.qty - 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center font-serif text-sm leading-none hover:opacity-80 transition-opacity hoverable"
                          style={{ background: 'var(--color-parker-bronze)', color: 'var(--color-black)' }}>−</button>
                        <span className="font-mono text-xs text-white min-w-[1.5ch] text-center">{l.qty}</span>
                        <button type="button" aria-label={tFlow('addOne')} disabled={l.qty >= maxQty} onClick={() => setQty(l.qty + 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center font-serif text-sm leading-none hover:opacity-80 disabled:opacity-30 transition-opacity hoverable"
                          style={{ background: 'var(--color-parker-bronze)', color: 'var(--color-black)' }}>+</button>
                        <span className="font-mono text-[0.65rem] tracking-widest uppercase text-white/40 ml-1">
                          × {formatPrice(l.unit)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="font-body text-base text-cream flex-shrink-0">{formatPrice(l.sub)}</p>
                </div>
              )
            })}
          </>
        )}

        {discount > 0 && (
          <>
            <div className="h-px bg-white/[0.06]" />
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-mono text-xs tracking-[0.25em] uppercase" style={{ color: accent }}>
                {tFlow('discount')}
                {couponApplied && <span className="ml-2 font-body normal-case tracking-normal opacity-70">({couponApplied.code})</span>}
              </p>
              <p className="font-body text-base flex-shrink-0" style={{ color: accent }}>− {formatPrice(discount)}</p>
            </div>
          </>
        )}

        <div className="h-px bg-white/[0.15] mt-2" />
        <div className="flex items-baseline justify-between gap-3 pt-1">
          <p className="font-mono text-sm tracking-[0.3em] uppercase text-white/70">{tFlow('total')}</p>
          <p className="font-serif text-3xl font-light" style={{ color: accent }}>
            {formatPrice(grandTotal)}
            <span className="font-mono text-[0.55rem] ml-1.5 tracking-widest align-middle text-white/50">MXN</span>
          </p>
        </div>

        {/* ── Cupón ── */}
        <div className="pt-2">
          <div className="relative">
            <input type="text" value={couponCode}
              onChange={e => { setCouponCode(e.target.value); setCouponError(null) }}
              disabled={!!couponApplied}
              placeholder={tFlow('couponInputPlaceholder')}
              className="w-full rounded-full border border-white/20 bg-black/40 px-4 py-2.5 pr-20 font-body text-sm text-cream placeholder:text-white/40 focus:border-white/60 focus:outline-none disabled:opacity-50" />
            {couponApplied ? (
              <button type="button" onClick={removeCoupon}
                className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[0.6rem] tracking-widest uppercase text-white/60 hover:text-cream hoverable">
                {tFlow('removeCoupon')}
              </button>
            ) : (
              <button type="button" onClick={applyCoupon} disabled={!couponCode.trim() || couponLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[0.6rem] tracking-widest uppercase hover:opacity-70 disabled:opacity-30 hoverable"
                style={{ color: accent }}>
                {couponLoading ? '...' : t('applyCoupon')}
              </button>
            )}
          </div>
          {couponApplied && (
            <div className="mt-2 px-3 py-2 rounded-lg border flex items-center gap-2"
              style={{ borderColor: `${accent}55`, background: 'rgba(160,120,74,0.08)' }}>
              <span className="font-serif text-base leading-none" style={{ color: accent }}>✓</span>
              <span className="font-mono text-xs tracking-[0.15em] uppercase truncate" style={{ color: accent }}>
                {couponApplied.code} · {couponApplied.discountType === 'percent' ? `${couponApplied.discountValue}% off` : formatPrice(couponApplied.discountValue) + ' off'}
              </span>
            </div>
          )}
          {couponError && <p className="mt-2 font-body text-sm" style={{ color: 'var(--color-lenox-red)' }}>{couponError}</p>}
        </div>

        {/* ── Método de pago (Stripe PaymentElement) — solo cuando checkout está cargado y hay monto ── */}
        {checkout && grandTotal > 0 && (
          <div className="pt-2">
            <p className="font-mono text-sm tracking-[0.25em] uppercase mb-3" style={{ color: accent }}>
              {tFlow('paymentMethod')}
            </p>
            <div className="pt-1">
              <PayInnerElement returnUrl={returnUrl} payFnRef={payFnRef} onErr={setSubmitError} />
            </div>
          </div>
        )}
        {submitError && (
          <p className="font-mono text-[0.65rem] tracking-widest uppercase px-4 py-3 border text-center"
            style={{ borderColor: 'rgba(192,32,42,0.3)', color: 'var(--color-lenox-red)' }}>
            {submitError}
          </p>
        )}

        {/* ── CTA principal ── */}
        {(() => {
          const ready = canFinishStep1
          const label =
            !ready         ? t('completeYourData')
            : grandTotal === 0 ? t('confirmReservation')
            : checkout     ? t('pay',    { price: formatPrice(grandTotal) })
            :               t('payNow', { price: formatPrice(grandTotal) })
          const busy = submitting || paying
          const enabled = ready && !busy
          return (
            <button type="button" onClick={handleMainCTA} disabled={!enabled}
              className={`w-full mt-1 px-5 py-3.5 rounded-full font-mono text-sm tracking-[0.25em] uppercase transition-all duration-300 hoverable disabled:cursor-not-allowed ${enabled ? 'hover:opacity-90' : ''}`}
              style={{
                background: enabled ? accent : 'transparent',
                color:      enabled ? 'var(--color-black)' : 'rgba(160,120,74,0.4)',
                border:     `2px solid ${enabled ? accent : 'rgba(160,120,74,0.25)'}`,
              }}>
              {busy ? t('processing') : label}
            </button>
          )
        })()}

        <p className="font-mono text-[0.5rem] tracking-widest uppercase text-white/35 mt-1 leading-relaxed">
          {t('ticketsByEmailHint')}
        </p>
      </aside>
    </div>
  )

  if (checkout) {
    return (
      <Elements stripe={getStripe(checkout.publishableKey)} options={{ clientSecret: checkout.clientSecret, appearance: stripeAppearance }}>
        {payload}
      </Elements>
    )
  }
  return payload
}

// ─── PaymentElement wrapper que registra confirmPayment en un ref ───
function PayInnerElement({ returnUrl, payFnRef, onErr }: {
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
      if (error) onErr(error.message || 'Could not process the payment')
    }
    return () => { payFnRef.current = null }
  }, [stripe, elements, returnUrl, payFnRef, onErr])

  return <PaymentElement options={{ layout: 'tabs' }} />
}

// ─── MerchUpsell wrapper que reporta products al padre ───
interface MerchUpsellWrapperProps {
  cart: CartMap
  onChange: (next: CartMap) => void
  accent: string
  onProducts: (products: MerchProduct[]) => void
}
function MerchUpsellWrapper({ cart, onChange, accent, onProducts }: MerchUpsellWrapperProps) {
  useEffect(() => {
    let alive = true
    fetch('/api/merch').then(r => r.json()).then(d => {
      if (!alive || !Array.isArray(d)) return
      onProducts(d)
    }).catch(() => {})
    return () => { alive = false }
  }, [onProducts])
  return <MerchUpsell cart={cart} onChange={onChange} accent={accent} />
}
