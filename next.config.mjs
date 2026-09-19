import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'core.notabot.mx' },
    ],
  },
  async redirects() {
    return [
      // ─── QR de la cartelera FÍSICA → /reservaciones, que nunca existió ───
      // El cartel colgado manda a esa ruta y la gente se estrellaba en un 404.
      // No se puede reimprimir el papel, así que el redirect le pega la UTM al
      // vuelo para que esos escaneos por fin se midan (utm_content=qr-reservaciones
      // los separa del QR nuevo).
      { source: '/reservaciones',      destination: '/cartelera?utm_source=cartelera&utm_medium=qr&utm_campaign=cartelera-impresa&utm_content=qr-reservaciones', permanent: true },
      { source: '/reservaciones/',     destination: '/cartelera?utm_source=cartelera&utm_medium=qr&utm_campaign=cartelera-impresa&utm_content=qr-reservaciones', permanent: true },
      { source: '/en/reservaciones',   destination: '/cartelera?utm_source=cartelera&utm_medium=qr&utm_campaign=cartelera-impresa&utm_content=qr-reservaciones', permanent: true },
      { source: '/en/reservaciones/',  destination: '/cartelera?utm_source=cartelera&utm_medium=qr&utm_campaign=cartelera-impresa&utm_content=qr-reservaciones', permanent: true },
      { source: '/reservations',       destination: '/cartelera?utm_source=cartelera&utm_medium=qr&utm_campaign=cartelera-impresa&utm_content=qr-reservaciones', permanent: true },
      { source: '/en/reservations',    destination: '/cartelera?utm_source=cartelera&utm_medium=qr&utm_campaign=cartelera-impresa&utm_content=qr-reservaciones', permanent: true },

      // ─── Boletos (WP) → Cartelera (Next) — CRÍTICO para links compartidos ───
      { source: '/boletos',         destination: '/cartelera',       permanent: true },
      { source: '/boletos/',        destination: '/cartelera',       permanent: true },
      { source: '/boletos/:slug',   destination: '/cartelera/:slug',  permanent: true },
      { source: '/boletos/:slug/',  destination: '/cartelera/:slug',  permanent: true },

      // ─── /eventos/* (WP legacy) → cartelera ───
      { source: '/eventos',           destination: '/cartelera', permanent: true },
      { source: '/eventos/',          destination: '/cartelera', permanent: true },
      { source: '/eventos/:path*',    destination: '/cartelera', permanent: true },

      // ─── WooCommerce muerto ───
      { source: '/carrito',            destination: '/', permanent: true },
      { source: '/carrito/',           destination: '/', permanent: true },
      { source: '/finalizar-compra',   destination: '/', permanent: true },
      { source: '/finalizar-compra/',  destination: '/', permanent: true },
      { source: '/tienda',             destination: '/', permanent: true },
      { source: '/tienda/',            destination: '/', permanent: true },

      // ─── Formularios de músicos viejos → nuevo form ───
      { source: '/form-musico',       destination: '/musicos', permanent: true },
      { source: '/form-musico/',      destination: '/musicos', permanent: true },
      { source: '/form-musico-copy',  destination: '/musicos', permanent: true },
      { source: '/form-musico-copy/', destination: '/musicos', permanent: true },
      { source: '/form-selector',     destination: '/musicos', permanent: true },
      { source: '/form-selector/',    destination: '/musicos', permanent: true },

      // ─── Rename /comida → /cocina (jul 2026) ───
      { source: '/comida',            destination: '/cocina',   permanent: true },
      { source: '/comida/',           destination: '/cocina',   permanent: true },

      // ─── Sub-menús de bebidas (WP) → /cocteles (consolidado) ───
      { source: '/destilados',        destination: '/cocteles', permanent: true },
      { source: '/destilados/',       destination: '/cocteles', permanent: true },
      { source: '/licores',           destination: '/cocteles', permanent: true },
      { source: '/licores/',          destination: '/cocteles', permanent: true },
      { source: '/sin-alcohol',       destination: '/cocteles', permanent: true },
      { source: '/sin-alcohol/',      destination: '/cocteles', permanent: true },
      { source: '/vinos-y-cerveza',   destination: '/cocteles', permanent: true },
      { source: '/vinos-y-cerveza/',  destination: '/cocteles', permanent: true },

      // ─── Internos/admin del WP que no aplican en el nuevo ───
      { source: '/cierre-diario',     destination: '/', permanent: true },
      { source: '/cierre-diario/',    destination: '/', permanent: true },
      { source: '/conciertos2',       destination: '/cartelera', permanent: true },
      { source: '/conciertos2/',      destination: '/cartelera', permanent: true },
    ]
  },
}

export default withNextIntl(nextConfig)
