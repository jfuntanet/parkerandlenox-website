import type { MetadataRoute } from 'next'
import { getEvents } from '@/lib/api'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://parkerandlenox.com'

// dynamic (no SSG): CORE_API_URL/KEY solo están en runtime env; con SSG los eventos no cargarían.
// Google crawlea sitemap una vez al día — el hit de una llamada al core es aceptable.
export const dynamic = 'force-dynamic'

type Freq = 'daily' | 'weekly' | 'monthly' | 'yearly'

// Español sin prefijo, inglés bajo /en (localePrefix: 'as-needed').
// Cada entrada declara sus alternates para que Google no trate /en como duplicado.
function entry(path: string, lastModified: Date, changeFrequency: Freq, priority: number) {
  const es = `${BASE}${path === '/' ? '/' : path}`
  const en = `${BASE}/en${path === '/' ? '' : path}`
  const languages = { es, en, 'x-default': es }
  return [
    { url: es, lastModified, changeFrequency, priority, alternates: { languages } },
    { url: en, lastModified, changeFrequency, priority: Math.max(0.1, priority - 0.1), alternates: { languages } },
  ]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Rutas estáticas — always fresh
  const staticRoutes: MetadataRoute.Sitemap = [
    ...entry('/',                    now, 'daily',   1.0),
    ...entry('/cartelera',           now, 'daily',   0.9),
    ...entry('/cocteles',            now, 'weekly',  0.7),
    ...entry('/cocina',              now, 'weekly',  0.7),
    ...entry('/faqs',                now, 'monthly', 0.6),
    ...entry('/musicos',             now, 'monthly', 0.6),
    ...entry('/prensa',              now, 'monthly', 0.6),
    ...entry('/aviso-de-privacidad', now, 'yearly',  0.3),
    ...entry('/politicas-de-compra', now, 'yearly',  0.3),
  ]

  // Rutas dinámicas — eventos activos de core.
  // Sólo ES: el contenido del evento (título y descripción) viene del core en español,
  // así que /en/cartelera/<slug> sería un duplicado, no una traducción.
  let eventRoutes: MetadataRoute.Sitemap = []
  try {
    const events = await getEvents()
    eventRoutes = events.map(e => ({
      url:             `${BASE}/cartelera/${e.slug}`,
      lastModified:    now,
      changeFrequency: 'daily' as const,
      priority:        0.8,
    }))
  } catch {
    // Si core no responde, el sitemap sale sólo con estáticas — no rompemos el build
  }

  return [...staticRoutes, ...eventRoutes]
}
