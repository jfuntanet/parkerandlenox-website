import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

const SITE_URL = 'https://parkerandlenox.com'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'lenox' })
  const path = locale === 'es' ? '/lenox' : `/${locale}/lenox`
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: path,
      languages: { es: '/lenox', en: '/en/lenox', 'x-default': '/lenox' },
    },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}${path}`,
      title: t('metaTitle'),
      description: t('metaDescription'),
    },
  }
}

// Lenox como entidad propia dentro del venue: es una sala distinta, con horario
// y reglas de acceso distintas a las de Parker.
function lenoxJsonLd(desc: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BarOrPub',
    name: 'Lenox',
    alternateName: 'Lenox — listening bar de Parker & Lenox',
    description: desc,
    url: `${SITE_URL}/lenox`,
    telephone: '+525521835107',
    priceRange: '$$-$$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Calle Gral. Prim 100',
      addressLocality: 'Juárez, Cuauhtémoc',
      postalCode: '06600',
      addressRegion: 'CDMX',
      addressCountry: 'MX',
    },
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '18:00',
      closes: '02:00',
    }],
    isAccessibleForFree: true,
    acceptsReservations: 'False',
    containedInPlace: {
      '@type': 'MusicVenue',
      name: 'Parker & Lenox',
      url: SITE_URL,
    },
  }
}

export default async function LenoxPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'lenox' })

  const SECTIONS = ['entrar', 'suena', 'barra', 'donde'] as const

  return (
    <div className="relative min-h-screen pt-28 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(lenoxJsonLd(t('metaDescription'))) }}
      />
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at 75% 10%, rgba(192,32,42,0.12) 0%, transparent 55%)' }} />

      <div className="relative z-10 px-6 sm:px-12 md:px-20">
        <section className="max-w-3xl mx-auto text-center mb-20">
          <p className="font-mono text-[0.6rem] tracking-[0.5em] uppercase mb-5"
            style={{ color: 'var(--color-lenox-red)' }}>
            {t('eyebrow')}
          </p>
          <h1 className="font-serif font-light text-cream leading-[1.03]"
            style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)' }}>
            {t('h1')}
          </h1>
          <div className="mt-6 mx-auto h-px w-16"
            style={{ background: 'var(--color-lenox-red)', opacity: 0.5 }} />
          <p className="mt-7 font-body font-light leading-relaxed"
            style={{ fontSize: 'clamp(0.98rem, 1.15vw, 1.12rem)', color: 'rgba(237,232,220,0.7)' }}>
            {t('intro')}
          </p>
        </section>

        <section className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
            {SECTIONS.map(k => (
              <div key={k}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-6 h-px" style={{ background: 'var(--color-parker-bronze)' }} />
                  <h2 className="font-mono uppercase tracking-[0.35em]"
                    style={{ color: 'var(--color-parker-bronze)', fontSize: 'clamp(0.65rem, 0.75vw, 0.75rem)' }}>
                    {t(`${k}.title`)}
                  </h2>
                </div>
                <p className="font-body font-light leading-relaxed"
                  style={{ fontSize: 'clamp(0.92rem, 1vw, 1.02rem)', color: 'rgba(237,232,220,0.68)' }}>
                  {t(`${k}.body`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24 max-w-2xl mx-auto text-center">
          <div className="h-px w-24 mx-auto mb-8"
            style={{ background: 'linear-gradient(to right, transparent, rgba(160,120,74,0.4), transparent)' }} />
          <p className="font-serif font-light text-cream mb-6"
            style={{ fontSize: 'clamp(1.15rem, 1.8vw, 1.55rem)' }}>
            {t('cta.title')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/cartelera"
              className="inline-flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.3em] uppercase px-5 py-2.5 border transition-colors hoverable"
              style={{ borderColor: 'var(--color-parker-bronze)', color: 'var(--color-parker-bronze)' }}>
              {t('cta.cartelera')}
            </Link>
            <Link href="/cocteles"
              className="inline-flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.3em] uppercase px-5 py-2.5 border border-white/15 text-white/60 hover:text-cream hover:border-white/40 transition-colors hoverable">
              {t('cta.cocteles')}
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
