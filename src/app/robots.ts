import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://staging.parkerandlenox.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Bloquea zonas privadas/no-indexables
        disallow: [
          '/api/',            // endpoints internos
          '/checkout/',       // páginas de pago (incluye success con datos sensibles)
          '/cartelera/*/checkout/', // checkout flow por evento
          '/prensa/archivo',  // archivo completo de menciones (mantén el prensa curado indexado)
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}
