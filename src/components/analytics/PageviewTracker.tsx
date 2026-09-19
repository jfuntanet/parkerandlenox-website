'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { pushEvent, fbqTrack } from '@/lib/analytics'

/**
 * Rastrea page_view en cada cambio de ruta client-side (Next.js SPA).
 * Fires también en initial mount — el guard de first-mount daba problemas para debugging.
 * GA4 con `send_page_view: true` (default) también trackea initial + Enhanced Measurement
 * cubre SPA nav — puede haber overlap pequeño; ver GTM para deduplicar si molesta.
 */
export function PageviewTracker() {
  const pathname = usePathname()
  // El PageView inicial de Meta lo dispara el snippet de TrackingScripts.
  // Aqui solo se cubren las navegaciones client-side: en un SPA el snippet
  // no se vuelve a ejecutar al navegar. Sin este guard, la primera vista
  // se contaria dos veces.
  const primeraVista = useRef(true)

  useEffect(() => {
    pushEvent('page_view', {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    })
    if (primeraVista.current) {
      primeraVista.current = false
      return
    }
    fbqTrack('PageView')
  }, [pathname])

  return null
}
