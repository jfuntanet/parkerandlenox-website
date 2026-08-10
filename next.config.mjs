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
