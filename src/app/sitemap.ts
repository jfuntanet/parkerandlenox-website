import type { MetadataRoute } from 'next'
import { getEvents } from '@/lib/api'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://parkerandlenox.com'

// dynamic (no SSG): CORE_API_URL/KEY solo están en runtime env; con SSG los eventos no cargarían.
// Google crawlea sitemap una vez al día — el hit de una llamada al core es aceptable.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Rutas estáticas — always fresh
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,                     lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/cocteles`,             lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/cocina`,               lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/faqs`,                 lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/musicos`,              lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/prensa`,               lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/aviso-de-privacidad`,  lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/politicas-de-compra`,  lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ]

  // Rutas dinámicas — eventos activos de core
  let eventRoutes: MetadataRoute.Sitemap = []
  try {
    const events = await getEvents()
    eventRoutes = events.map(e => ({
      url:            `${BASE}/cartelera/${e.slug}`,
      lastModified:   now,
      changeFrequency: 'daily' as const,
      priority:       0.8,
    }))
  } catch {
    // Si core no responde, el sitemap sale sólo con estáticas — no rompemos el build
  }

  return [...staticRoutes, ...eventRoutes]
}
