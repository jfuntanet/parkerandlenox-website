'use client'

// Marketing Analytics — beacon de pageviews a core (alimenta el panel de
// humans-app → /marketing/analytics). Portado del sitio WordPress viejo de
// parkerandlenox.com (Code Snippet PHP) que se perdió en la migración a
// Next.js. Mismo patrón que /opt/lenox-records/src/components/analytics/Beacon.tsx:
//  - Cookie pl_sid (30d) — UUID v4 plano que identifica al navegador.
//  - Captura utm_* del URL al cargar y los persiste en sessionStorage para
//    que viajen al checkout aunque el usuario navegue por varias páginas.
//  - Envía un pageview a core.notabot.mx/v1/analytics/event-view via
//    navigator.sendBeacon (fire-and-forget, no rompe UX si falla).
//  - Expone window.__PL_SID y window.__PL_UTM por si el CheckoutForm los lee.
//
// Se renderiza una vez en el layout raíz (dentro de <Suspense>, porque usa
// useSearchParams). usePathname/useSearchParams cambian sin remount → el
// useEffect re-dispara el beacon en navegación SPA (next/link).

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function uuid(): string {
  if (typeof crypto !== 'undefined' && (crypto as Crypto).getRandomValues) {
    const b = new Uint8Array(16)
    crypto.getRandomValues(b)
    b[6] = (b[6] & 0x0f) | 0x40
    b[8] = (b[8] & 0x3f) | 0x80
    const h = Array.from(b, x => ('0' + x.toString(16)).slice(-2))
    return `${h[0]}${h[1]}${h[2]}${h[3]}-${h[4]}${h[5]}-${h[6]}${h[7]}-${h[8]}${h[9]}-${h[10]}${h[11]}${h[12]}${h[13]}${h[14]}${h[15]}`
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.floor(Math.random() * 16)
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'))
  return m ? m[1] : null
}

function setCookie(name: string, value: string, days = 30): void {
  const exp = new Date()
  exp.setDate(exp.getDate() + days)
  document.cookie = `${name}=${value}; expires=${exp.toUTCString()}; path=/; SameSite=Lax`
}

// Extrae el "slug" del evento de la página actual para enviarlo al beacon.
// En Parker & Lenox (Next.js) los eventos viven en /cartelera/[slug] y el
// checkout en /checkout/[slug]:
//   /cartelera/luz-varela-par-1177 → "luz-varela-par-1177"
//   /checkout/luz-varela-par-1177  → "luz-varela-par-1177"
//   /  ·  /cocteles  ·  /cartelera → slug=null (pageview a nivel sitio)
function slugFromPathname(path: string): string | null {
  const m = path.match(/^\/(cartelera|checkout)\/([^/]+)\/?$/)
  if (m && m[2] !== 'success' && m[2] !== 'gracias') return m[2]
  return null
}

interface UTMs {
  source: string | null
  medium: string | null
  campaign: string | null
  content: string | null
}

// Las UTMs se persisten en sessionStorage para que sobrevivan navegación
// interna (cartelera → evento → checkout). Si la persona refresca página,
// se actualiza con las nuevas (si vienen) o mantiene las anteriores.
function readPersistedUTMs(): UTMs {
  try {
    const raw = sessionStorage.getItem('__pl_utm')
    if (raw) return JSON.parse(raw) as UTMs
  } catch { /* sessionStorage puede estar bloqueado */ }
  return { source: null, medium: null, campaign: null, content: null }
}

function persistUTMs(utm: UTMs): void {
  try {
    sessionStorage.setItem('__pl_utm', JSON.stringify(utm))
  } catch { /* no-op */ }
}

export default function Beacon() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    try {
      // 1) Cookie pl_sid (30d)
      let sid = getCookie('pl_sid')
      if (!sid) {
        sid = uuid()
        setCookie('pl_sid', sid)
      }

      // 2) UTMs: del URL actual si vienen; sino las persistidas; sino vacías.
      const qsSource = searchParams?.get('utm_source')
      const qsMedium = searchParams?.get('utm_medium')
      const qsCampaign = searchParams?.get('utm_campaign')
      const qsContent = searchParams?.get('utm_content')
      const persisted = readPersistedUTMs()
      const utm: UTMs = {
        source:   qsSource   ?? persisted.source,
        medium:   qsMedium   ?? persisted.medium,
        campaign: qsCampaign ?? persisted.campaign,
        content:  qsContent  ?? persisted.content,
      }
      // Solo persistimos si hubo UTM en el URL (no machacar al navegar interno).
      if (qsSource || qsMedium || qsCampaign || qsContent) {
        persistUTMs(utm)
      }

      // 3) Globales para que CheckoutForm los lea sin re-fetch
      ;(window as unknown as { __PL_SID?: string }).__PL_SID = sid
      ;(window as unknown as { __PL_UTM?: UTMs }).__PL_UTM = utm

      // 4) Beacon a core (fire-and-forget)
      const payload = {
        site: 'parker_lenox',
        slug: slugFromPathname(pathname || ''),
        sid,
        utm_source:   utm.source,
        utm_medium:   utm.medium,
        utm_campaign: utm.campaign,
        utm_content:  utm.content,
        ref: typeof document !== 'undefined' && document.referrer
          ? (new URL(document.referrer)).host
          : null,
        coupon: searchParams?.get('coupon') ?? searchParams?.get('cupon') ?? null,
      }
      const url = 'https://core.notabot.mx/v1/analytics/event-view'
      const body = JSON.stringify(payload)
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([body], { type: 'text/plain;charset=UTF-8' }))
      } else {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        }).catch(() => { /* nunca rompemos UX */ })
      }
    } catch {
      /* never break UX */
    }
  }, [pathname, searchParams])

  return null
}
