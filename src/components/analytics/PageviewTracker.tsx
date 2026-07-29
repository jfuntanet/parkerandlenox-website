'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { pushEvent } from '@/lib/analytics'

/**
 * Rastrea page_view en cada cambio de ruta client-side (Next.js SPA).
 * Fires también en initial mount — el guard de first-mount daba problemas para debugging.
 * GA4 con `send_page_view: true` (default) también trackea initial + Enhanced Measurement
 * cubre SPA nav — puede haber overlap pequeño; ver GTM para deduplicar si molesta.
 */
export function PageviewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    pushEvent('page_view', {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [pathname])

  return null
}
