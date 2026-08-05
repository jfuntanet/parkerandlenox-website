'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { pushEvent } from '@/lib/analytics'

interface Ticket {
  token: string
  position: number
  guestName: string | null
  guestEmail: string | null
  recipientEmail: string | null
  emailSent: boolean
}
interface OrderInfo {
  orderId: string
  eventName: string
  eventDate: string
  eventTime: string
  venue: string
  venueAddress?: string | null
  buyerName: string
  buyerEmail: string
  pax: number
  totalAmount?: number
}
interface OrderPayload {
  order: OrderInfo
  tickets: Ticket[]
}

interface Props {
  paymentIntent: string
  redirectStatus: string
  orderId?: string
  isFree?: boolean
}

const inputCls = 'w-full rounded-full border border-white/20 bg-black/40 px-5 py-3 font-body text-base text-cream placeholder:text-white/40 focus:border-white/60 focus:outline-none'
const accent = 'var(--color-parker-bronze)'

export function SuccessView({ paymentIntent, redirectStatus, orderId, isFree }: Props) {
  const t = useTranslations('success')
  const [data, setData] = useState<OrderPayload | null>(null)
  const [err, setErr]   = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Edits locales por token (nombre + email)
  const [edits, setEdits] = useState<Record<string, { name: string; email: string }>>({})
  const [saveErr, setSaveErr] = useState<string | null>(null)
  const [savedFlash, setSavedFlash] = useState<string | null>(null)
  // Estado por token para acciones per-boleto (envio/descarga)
  const [busyToken, setBusyToken] = useState<string | null>(null)
  const [downloadingAll, setDownloadingAll] = useState(false)
  // Toggle "regalo": oculta el total del boleto (visual + PDF descargado)
  const [hideTotal, setHideTotal] = useState(false)

  // Carrusel horizontal de boletos
  const carouselRef = useRef<HTMLDivElement>(null)
  const [carouselCanLeft, setCarouselCanLeft]   = useState(false)
  const [carouselCanRight, setCarouselCanRight] = useState(false)
  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    const check = () => {
      const atStart = el.scrollLeft <= 4
      const atEnd   = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
      setCarouselCanLeft(!atStart)
      setCarouselCanRight(!atEnd && el.scrollWidth > el.clientWidth + 4)
    }
    check()
    el.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      el.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [data])
  const scrollCarousel = (dir: 1 | -1) => {
    const el = carouselRef.current
    if (!el) return
    // Scrollea un ticket a la vez (~380px con gap)
    el.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  // Guard para no disparar el evento `purchase` más de una vez por orderId
  const purchaseFiredRef = useRef<string | null>(null)

  // Fetch de la orden (con reintentos porque el webhook puede tardar 1-2s en marcar paid)
  useEffect(() => {
    if (!paymentIntent && !orderId) { setErr(t('missingPaymentId')); setLoading(false); return }
    let cancelled = false
    let tries = 0
    async function attempt() {
      tries++
      try {
        const qs = orderId ? ('orderId=' + encodeURIComponent(orderId)) : ('pi=' + encodeURIComponent(paymentIntent))
        const res = await fetch('/api/order-by-pi?' + qs, { cache: 'no-store' })
        const d = await res.json()
        if (cancelled) return
        if (res.ok && d.order) {
          setData(d)
          // Inicializar edits desde el estado actual
          const initial: Record<string, { name: string; email: string }> = {}
          d.tickets.forEach((t: Ticket) => {
            initial[t.token] = { name: t.guestName || '', email: t.guestEmail || '' }
          })
          setEdits(initial)
          setLoading(false)
          // Tracking: purchase (una vez por orderId)
          const oid = d.order.orderId as string
          if (purchaseFiredRef.current !== oid) {
            purchaseFiredRef.current = oid
            const value = Number(d.order.totalAmount) || 0
            pushEvent('purchase', {
              ecommerce: {
                transaction_id: oid,
                value,
                currency: 'MXN',
                items: [{
                  item_id: d.order.eventName,
                  item_name: d.order.eventName,
                  item_category: d.order.venue,
                  quantity: d.order.pax,
                  price: d.order.pax > 0 ? value / d.order.pax : 0,
                }],
              },
            })
          }
          return
        }
        if (res.status === 409 && tries < 8) {
          // Pago aún no confirmado; reintenta cada 1.5s hasta 8 intentos (12s)
          setTimeout(attempt, 1500)
          return
        }
        setErr(d.error || t('orderNotFound'))
        setLoading(false)
      } catch {
        if (tries < 5) { setTimeout(attempt, 1500); return }
        setErr(t('connectionError')); setLoading(false)
      }
    }
    attempt()
    return () => { cancelled = true }
  }, [paymentIntent, orderId])

  function setField(token: string, field: 'name' | 'email', value: string) {
    setEdits(prev => ({ ...prev, [token]: { ...prev[token], [field]: value } }))
  }

  // Descarga UN boleto específico (por token) o TODOS (sin token).
  async function downloadPdf(token?: string) {
    const key = token || '__all__'
    if (token) setBusyToken(token); else setDownloadingAll(true)
    setSaveErr(null); setSavedFlash(null)
    try {
      const parts = [orderId ? 'orderId=' + encodeURIComponent(orderId) : 'pi=' + encodeURIComponent(paymentIntent)]
      if (token) parts.push('token=' + encodeURIComponent(token))
      if (hideTotal) parts.push('hideTotal=1')
      const res = await fetch('/api/download-tickets?' + parts.join('&'), { cache: 'no-store' })
      if (!res.ok) { setSaveErr(t('pdfFailed')); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = token
        ? `boleto-${(edits[token]?.name || 'invitado').replace(/\s+/g, '-') || 'invitado'}.pdf`
        : `boletos-${data!.order.orderId.slice(0,8).toUpperCase()}.pdf`
      document.body.appendChild(a); a.click(); a.remove()
      URL.revokeObjectURL(url)
      setSavedFlash(token ? t('ticketDownloaded') : t('pdfsDownloaded'))
    } catch { setSaveErr(t('connectionError')) }
    finally { if (token) setBusyToken(prev => prev === token ? null : prev); else setDownloadingAll(false); void key }
  }

  // Envía por correo UN boleto (usa /api/update-and-send con un solo token).
  async function sendByEmail(token: string) {
    if (!data) return
    setBusyToken(token); setSaveErr(null); setSavedFlash(null)
    try {
      const found = data.tickets.find(x => x.token === token)
      if (!found) return
      const payload = [{
        token,
        name:  edits[token]?.name || '',
        email: edits[token]?.email || '',
      }]
      const res = await fetch('/api/update-and-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderId
          ? { orderId, tickets: payload }
          : { paymentIntentId: paymentIntent, tickets: payload }
        ),
      })
      const d = await res.json()
      if (!res.ok || d.error) { setSaveErr(d.error || t('sendFailed')); return }
      setSavedFlash(t('ticketEmailed'))
      // Refetch para reflejar emailSent
      fetch('/api/order-by-pi?' + (orderId ? 'orderId=' + encodeURIComponent(orderId) : 'pi=' + encodeURIComponent(paymentIntent)), { cache: 'no-store' })
        .then(r => r.json())
        .then(d2 => { if (d2.order) setData(d2) })
        .catch(() => {})
    } catch { setSaveErr(t('connectionError')) }
    finally { setBusyToken(prev => prev === token ? null : prev) }
  }

  // Renders
  if (redirectStatus && redirectStatus !== 'succeeded') {
    return (
      <StatePage
        eyebrow={t('state.paymentIncompleteEyebrow')}
        title={t('state.paymentIncompleteTitle')}
        subtitle={t('state.paymentIncompleteSubtitle', { status: redirectStatus })}
        cta={<Link href="/" className="pill-cta">{t('state.backHome')}</Link>}
      />
    )
  }

  if (loading) {
    return (
      <StatePage
        eyebrow={t('state.processingEyebrow')}
        title={t('state.confirmingTitle')}
        subtitle={t('state.confirmingSubtitle')}
        spinner
      />
    )
  }

  if (err || !data) {
    return (
      <StatePage
        eyebrow={t('state.errorEyebrow')}
        title={t('state.orderNotFoundTitle')}
        subtitle={err || t('state.orderNotFoundSubtitle')}
        code={paymentIntent || orderId}
        cta={<Link href="/" className="pill-cta">{t('state.backHome')}</Link>}
      />
    )
  }

  const buyerCode = data.order.orderId.slice(0, 8).toUpperCase()

  return (
    <div className="relative min-h-screen pt-16 md:pt-20 pb-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero de confirmación — compacto para caber en una pantalla */}
        <div className="text-center mb-6 md:mb-8">
          <span className="font-serif block mb-2" style={{ color: accent, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', lineHeight: 1 }}>✓</span>
          <h1 className="font-serif font-light leading-[1.05]"
            style={{ color: accent, fontSize: 'clamp(1.75rem, 3.5vw, 2.6rem)' }}>
            {isFree ? t('reservationConfirmed') : t('paymentConfirmed')}
          </h1>
          <p className="font-serif text-base md:text-lg font-light text-cream leading-tight mt-2">
            {data.order.eventName}
          </p>
          <p className="font-mono text-xs tracking-widest uppercase text-white/50 mt-1.5">
            {t('orderLabel')} #{buyerCode}
          </p>
        </div>

        {/* Sección Boletos */}
        <section className="rounded-xl border border-white/[0.10] p-6 md:p-8" style={{ background: '#1a1a1a' }}>
          <div className="mb-6 flex items-start gap-3 px-4 py-3 rounded-xl border"
            style={{ borderColor: `${accent}40`, background: 'rgba(160,120,74,0.06)' }}>
            <span className="font-serif text-lg leading-none mt-0.5" style={{ color: accent }}>✉</span>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <span className="font-mono text-xs tracking-[0.2em] uppercase" style={{ color: accent }}>
                {t('ticketsSentBanner')}
              </span>
              <span className="font-body text-sm text-white/70">
                {t.rich('ticketsSentDetail', {
                  email: () => <span style={{ color: accent }}>{data.order.buyerEmail}</span>,
                }) as React.ReactNode}
              </span>
            </div>
          </div>

          <div className="relative">
            {/* Flecha izquierda */}
            <button type="button" aria-label={t('ticketPrev')}
              onClick={() => scrollCarousel(-1)}
              disabled={!carouselCanLeft}
              className="hidden md:flex absolute left-0 top-[35%] -translate-y-1/2 -translate-x-4 z-10 items-center justify-center w-10 h-10 rounded-full border transition-opacity hoverable disabled:opacity-0 disabled:pointer-events-none"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', borderColor: `${accent}55`, color: accent }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
            </button>
            {/* Flecha derecha */}
            <button type="button" aria-label={t('ticketNext')}
              onClick={() => scrollCarousel(1)}
              disabled={!carouselCanRight}
              className="hidden md:flex absolute right-0 top-[35%] -translate-y-1/2 translate-x-4 z-10 items-center justify-center w-10 h-10 rounded-full border transition-opacity hoverable disabled:opacity-0 disabled:pointer-events-none"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', borderColor: `${accent}55`, color: accent }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </button>

            <div ref={carouselRef}
              className="flex gap-5 md:gap-6 justify-center overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 md:mx-0 md:px-1
                         [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {data.tickets.map((tk, i) => {
                const e = edits[tk.token] || { name: '', email: '' }
                const isBuyer = i === 0
                const displayName = e.name || tk.guestName || (isBuyer ? data.order.buyerName : t('companionName', { n: i }))
                return (
                  <div key={tk.token} className="snap-start shrink-0 w-[calc(100vw-4rem)] max-w-[300px] md:w-[300px] flex flex-col gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input type="text"
                        placeholder={isBuyer ? t('yourName') : t('companionName', { n: i })}
                        value={e.name}
                        onChange={ev => setField(tk.token, 'name', ev.target.value)}
                        className={inputCls + ' text-sm py-2'} />
                      <input type="email"
                        placeholder={isBuyer ? t('yourEmail') : t('companionEmail')}
                        value={e.email}
                        onChange={ev => setField(tk.token, 'email', ev.target.value)}
                        className={inputCls + ' text-sm py-2'} />
                    </div>
                    <TicketRender
                      ticket={tk}
                      order={data.order}
                      buyerCode={buyerCode}
                      displayName={displayName}
                      position={i + 1}
                      total={data.tickets.length}
                      hideTotal={hideTotal}
                    />
                    {/* Acciones por boleto */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <button type="button"
                        onClick={() => sendByEmail(tk.token)}
                        disabled={busyToken === tk.token}
                        title={t('sendEmail')}
                        className="flex flex-col items-center gap-1 py-2 rounded-lg border transition-colors hoverable disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ borderColor: 'rgba(255,255,255,0.10)', color: accent }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        <span className="font-mono text-[0.5rem] tracking-[0.15em] uppercase text-white/60">{t('actionEmail')}</span>
                      </button>
                      <button type="button" disabled title={t('comingSoon')}
                        className="flex flex-col items-center gap-1 py-2 rounded-lg border opacity-40 cursor-not-allowed"
                        style={{ borderColor: 'rgba(255,255,255,0.10)', color: accent }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                        <span className="font-mono text-[0.5rem] tracking-[0.15em] uppercase text-white/60">{t('actionWhatsApp')}</span>
                      </button>
                      <button type="button"
                        onClick={() => downloadPdf(tk.token)}
                        disabled={busyToken === tk.token}
                        title={t('downloadPdf')}
                        className="flex flex-col items-center gap-1 py-2 rounded-lg border transition-colors hoverable disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ borderColor: 'rgba(255,255,255,0.10)', color: accent }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        <span className="font-mono text-[0.5rem] tracking-[0.15em] uppercase text-white/60">{t('actionPdf')}</span>
                      </button>
                    </div>
                    {tk.emailSent && tk.recipientEmail && (
                      <p className="font-mono text-[0.55rem] tracking-widest uppercase text-center" style={{ color: accent }}>
                        ✓ {t('sentTo')} {tk.recipientEmail}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Toggle: ocultar total (para regalar el boleto) */}
          <div className="mt-6 flex justify-center">
            <label className="inline-flex items-center gap-3 cursor-pointer hoverable px-4 py-2 rounded-full border transition-colors"
              style={{ borderColor: hideTotal ? accent : 'rgba(255,255,255,0.12)', background: hideTotal ? 'rgba(160,120,74,0.08)' : 'transparent' }}>
              <input type="checkbox" checked={hideTotal}
                onChange={e => setHideTotal(e.target.checked)}
                className="w-4 h-4 accent-current"
                style={{ accentColor: accent }} />
              <span className="font-mono text-xs tracking-[0.2em] uppercase" style={{ color: hideTotal ? accent : 'rgba(237,232,220,0.55)' }}>
                {t('hideTotalToggle')}
              </span>
            </label>
          </div>
          {hideTotal && (
            <p className="mt-2 text-center font-body text-xs" style={{ color: 'rgba(237,232,220,0.5)' }}>
              {t('hideTotalHint')}
            </p>
          )}

          {/* Descarga total + flashes */}
          <div className="mt-4 flex flex-col items-center gap-3">
            {savedFlash && (
              <p className="font-mono text-[0.65rem] tracking-widest uppercase text-center px-4 py-2 border rounded-full"
                style={{ borderColor: `${accent}40`, color: accent }}>
                ✓ {savedFlash}
              </p>
            )}
            {saveErr && (
              <p className="font-mono text-[0.65rem] tracking-widest uppercase text-center px-4 py-2 border rounded-full"
                style={{ borderColor: 'rgba(192,32,42,0.3)', color: 'var(--color-lenox-red)' }}>
                {saveErr}
              </p>
            )}
            {data.tickets.length > 1 && (
              <button type="button" onClick={() => downloadPdf()} disabled={downloadingAll}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full font-mono text-xs tracking-[0.25em] uppercase transition-colors hoverable disabled:cursor-not-allowed"
                style={{
                  background: downloadingAll ? 'transparent' : accent,
                  color:      downloadingAll ? 'rgba(160,120,74,0.4)' : 'var(--color-black)',
                  border:     `2px solid ${downloadingAll ? 'rgba(160,120,74,0.3)' : accent}`,
                }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                {downloadingAll ? t('preparing') : t('downloadAll', { n: data.tickets.length })}
              </button>
            )}
          </div>
        </section>

        {/* Navegación */}
        <div className="text-center mt-10">
          <Link href="/" className="font-mono text-[0.65rem] tracking-[0.3em] uppercase text-white/40 hover:text-cream transition-colors hoverable">
            {t('backHomeLink')}
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Estado simple (loading / error / redirect fail) ───
function StatePage({ eyebrow, title, subtitle, cta, code, spinner }: {
  eyebrow: string
  title: string
  subtitle?: string
  cta?: React.ReactNode
  code?: string
  spinner?: boolean
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-8 text-center">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 40% 50% at 50% 40%, rgba(160,120,74,0.15), transparent 60%)' }} />
      <div className="relative z-10 max-w-md">
        {spinner && (
          <div className="mx-auto mb-6 w-10 h-10 rounded-full border-2 border-white/10 border-t-transparent animate-spin"
            style={{ borderTopColor: accent }} />
        )}
        <p className="font-mono text-[0.6rem] tracking-[0.5em] uppercase mb-3" style={{ color: accent }}>{eyebrow}</p>
        <h1 className="font-serif text-3xl md:text-4xl font-light text-cream mb-4">{title}</h1>
        {subtitle && (
          <p className="font-body text-base mb-6" style={{ color: 'rgba(237,232,220,0.6)' }}>{subtitle}</p>
        )}
        {code && (
          <p className="font-mono text-[0.55rem] tracking-widest text-white/40 mb-6 break-all">
            {code}
          </p>
        )}
        {cta}
      </div>
      <style>{`.pill-cta { display: inline-flex; align-items: center; gap: 1rem; padding: 0.75rem 1.5rem; border-radius: 999px; border: 2px solid ${accent}; color: ${accent}; font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase; transition: background 0.3s; }
      .pill-cta:hover { background: rgba(160,120,74,0.08); }`}</style>
    </div>
  )
}

// ─── TicketRender: clona el diseño del PDF (ticket-template.html) en React ───
// Paleta y tipografía del tema Parker & Lenox del PDF.
const T = {
  paper:       '#fffdf8',
  headerBg:    '#ede4d0',
  ink:         '#1f1813',
  muted:       'rgba(31,24,19,0.55)',
  accent:      '#b48a3a',
  accentSoft:  '#d4a845',
  line:        'rgba(31,24,19,0.14)',
  perfBg:      '#1a1a1a',   // color del contenedor exterior — para que los cutouts "muerdan" el ticket
}

function TicketRender({ ticket, order, buyerCode, displayName, position, total, hideTotal }: {
  ticket: Ticket
  order: OrderInfo
  buyerCode: string
  displayName: string
  position: number
  total: number
  hideTotal?: boolean
}) {
  const t = useTranslations('success')
  const time = order.eventTime ? order.eventTime.slice(0, 5) : ''
  let doorsTime = ''
  if (time) {
    const [h, m] = time.split(':').map(Number)
    const mins = h * 60 + m - 60
    doorsTime = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
  }
  const totalStr = order.totalAmount != null && order.totalAmount > 0
    ? `$${Number(order.totalAmount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
    : t('freeEntry')
  const description = `${order.eventDate || ''} | ${order.eventName || ''}`
  const mono = 'font-mono uppercase'

  return (
    <div className="w-full mx-auto rounded-lg overflow-hidden shadow-2xl" style={{ background: T.paper, color: T.ink }}>
      {/* HEADER */}
      <div className="relative flex items-center justify-center px-5 pt-4 pb-3 border-b"
        style={{ background: T.headerBg, borderColor: 'rgba(31,24,19,0.14)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/tickets/parker-lenox-logo.png" alt="Parker & Lenox" style={{ height: 44, width: 'auto', objectFit: 'contain' }} />
        <div className="absolute right-4 top-3 text-right">
          <div className={mono} style={{ fontSize: '8.5px', letterSpacing: '1.4px', color: T.muted, fontWeight: 500 }}>{t('ticketNumber', { position, total })}</div>
          <div className="font-mono mt-0.5" style={{ fontSize: '10px', color: T.ink, fontWeight: 500 }}>#{buyerCode}</div>
        </div>
      </div>

      {/* MAIN */}
      <div className="px-5 pt-5 pb-4">
        <div className={mono} style={{ fontSize: '8.5px', letterSpacing: '1.4px', color: T.accent, fontWeight: 500, marginBottom: '8px' }}>
          {t('sessionLabel')}
        </div>
        <h1 className="font-serif italic" style={{ fontSize: '22px', lineHeight: 1.05, letterSpacing: '-0.5px', color: T.ink, fontWeight: 500 }}>
          {order.eventName}
        </h1>

        {/* Rule */}
        <div className="flex items-center gap-2" style={{ margin: '16px 0 14px' }}>
          <span style={{ width: 6, height: 6, background: T.accentSoft }} />
          <span className="flex-1" style={{ height: 1, background: T.line }} />
          <span style={{ width: 6, height: 6, background: T.accentSoft }} />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3">
          <div className="flex flex-col items-center text-center py-1">
            <div className={mono} style={{ fontSize: '8.5px', letterSpacing: '1.4px', color: T.accent, fontWeight: 500, marginBottom: '4px' }}>{t('dateLabel')}</div>
            <div style={{ fontSize: '13px', color: T.ink, fontWeight: 500 }}>{order.eventDate}</div>
          </div>
          <div className="flex flex-col items-center text-center py-1" style={{ borderLeft: `1px solid ${T.line}`, borderRight: `1px solid ${T.line}` }}>
            <div className={mono} style={{ fontSize: '8.5px', letterSpacing: '1.4px', color: T.accent, fontWeight: 500, marginBottom: '4px' }}>{t('timeLabel')}</div>
            <div style={{ fontSize: '13px', color: T.ink, fontWeight: 500 }}>{time || '—'}</div>
            {doorsTime && <div className="italic" style={{ fontSize: '9.5px', color: T.muted, marginTop: '2px' }}>{t('doorsLabel')} {doorsTime}</div>}
          </div>
          <div className="flex flex-col items-center text-center py-1">
            <div className={mono} style={{ fontSize: '8.5px', letterSpacing: '1.4px', color: T.accent, fontWeight: 500, marginBottom: '4px' }}>{t('spotsLabel')}</div>
            <div style={{ fontSize: '13px', color: T.ink, fontWeight: 500 }}>1</div>
          </div>
        </div>

        {/* Venue */}
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${T.line}` }}>
          <div className={mono} style={{ fontSize: '8.5px', letterSpacing: '1.4px', color: T.accent, fontWeight: 500, marginBottom: '4px' }}>{t('venueLabel')}</div>
          <div style={{ fontSize: '12.5px', color: T.ink, fontWeight: 500 }}>{order.venue}</div>
          {order.venueAddress && (
            <div style={{ fontSize: '11px', color: T.muted, marginTop: '2px', lineHeight: 1.3 }}>{order.venueAddress}</div>
          )}
        </div>
      </div>

      {/* Perforación */}
      <div className="relative" style={{ height: '16px' }}>
        <div className="absolute" style={{ left: '14px', right: '14px', top: '50%', borderTop: `1px dashed ${T.line}` }} />
        <div className="absolute rounded-full" style={{ left: '-12px', top: '50%', transform: 'translateY(-50%)', width: '24px', height: '24px', background: T.perfBg }} />
        <div className="absolute rounded-full" style={{ right: '-12px', top: '50%', transform: 'translateY(-50%)', width: '24px', height: '24px', background: T.perfBg }} />
      </div>

      {/* STUB */}
      <div className="flex gap-3 px-5 py-4 items-start">
        <div className="shrink-0 rounded p-0.5" style={{ background: '#fff' }}>
          <QRCodeSVG value={ticket.token} size={82} level="H" bgColor="#ffffff" fgColor="#000000" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-serif italic" style={{ fontSize: '15px', color: T.ink, fontWeight: 500, letterSpacing: '-0.2px', lineHeight: 1.1, marginBottom: '6px' }}>
            {displayName}
          </div>
          <div className="flex gap-1.5 items-baseline" style={{ marginBottom: '6px' }}>
            <span className={mono} style={{ fontSize: '8.5px', letterSpacing: '1.4px', color: T.accent, fontWeight: 500 }}>{t('orderCol')}</span>
            <span className="font-mono" style={{ fontSize: '10px', color: T.ink, fontWeight: 500 }}>#{buyerCode}</span>
          </div>
          {!hideTotal && (
            <div className="flex justify-between items-baseline" style={{ marginTop: '8px', paddingTop: '8px', borderTop: `1px dashed ${T.line}` }}>
              <span className={mono} style={{ fontSize: '8.5px', letterSpacing: '1.4px', color: T.accent, fontWeight: 500 }}>{t('totalCol')}</span>
              <span className="font-serif italic" style={{ fontSize: '18px', color: T.accent, fontWeight: 600 }}>{totalStr}</span>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${T.line}`, background: T.headerBg }}>
        <div className={`px-5 pt-2 pb-2.5 ${mono} text-center`}
          style={{ fontSize: '8px', letterSpacing: '1.3px', color: T.muted, lineHeight: 1.5 }}>
          {t('ticketFooter')}
        </div>
      </div>
    </div>
  )
}
