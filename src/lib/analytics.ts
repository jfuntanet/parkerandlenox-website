// Helpers para tracking client-side. Empujan al dataLayer (GTM/GA4) y a fbq (Meta Pixel).
// GTM y Meta Pixel ya están instalados en layout.tsx (ver TrackingScripts).

interface DataLayerWindow extends Window {
  dataLayer?: Record<string, unknown>[]
}
interface FbqWindow extends Window {
  fbq?: (action: string, event: string, params?: Record<string, unknown>) => void
}

export function pushEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return
  const w = window as DataLayerWindow
  w.dataLayer = w.dataLayer || []
  // GA4 recomienda limpiar `ecommerce` antes del siguiente evento para no arrastrar items del anterior.
  if (params.ecommerce) w.dataLayer.push({ ecommerce: null })
  w.dataLayer.push({ event: name, ...params })
}

export function fbqTrack(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return
  const w = window as FbqWindow
  if (typeof w.fbq === 'function') w.fbq('track', event, params)
}
