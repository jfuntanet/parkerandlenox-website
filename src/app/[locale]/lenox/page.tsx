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

  const SECTIONS = ['entrar', 'barra'] as const

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
          {/* Mismo wordmark que el hero con el monograma deslizado hasta Lenox:
              serif itálica en rojo, con el eyebrow Hi-Fi al lado. */}
          <h1 className="flex flex-wrap items-baseline justify-center gap-x-6 gap-y-1">
            <span className="font-serif italic font-bold leading-none text-[clamp(3rem,8.5vw,6rem)] md:text-[clamp(4.5rem,12.75vw,9rem)]"
              style={{ color: 'var(--color-lenox-red)' }}>
              {t('h1')}
            </span>
            <span className="font-mono uppercase tracking-[0.5em] text-[0.6rem] md:text-[1.05rem]"
              style={{ color: 'var(--color-lenox-red)' }}>
              {t('hifi')}
            </span>
          </h1>
          <p className="mt-7 font-serif font-light text-cream leading-snug"
            style={{ fontSize: 'clamp(1.35rem, 2.2vw, 1.9rem)' }}>
            {t('subtitle')}
          </p>
          <div className="mt-6 mx-auto h-px w-16"
            style={{ background: 'var(--color-lenox-red)', opacity: 0.5 }} />
          <p className="mt-8 font-body font-light leading-relaxed"
            style={{ fontSize: 'clamp(1.08rem, 1.45vw, 1.32rem)', color: 'rgba(237,232,220,0.72)' }}>
            {t('intro')}
          </p>

          {/* Desvío para quien llegó buscando concierto: Lenox no lo es.
              Va aparte del intro, no enterrado en él. */}
          <p className="mt-10 mx-auto max-w-xl border-l-2 pl-5 text-left font-body font-light leading-relaxed"
            style={{ borderColor: 'var(--color-parker-bronze)', fontSize: 'clamp(0.98rem, 1.15vw, 1.1rem)', color: 'rgba(237,232,220,0.6)' }}>
            {t.rich('pointer', {
              link: chunks => (
                <Link href="/cartelera" className="border-b transition-colors hoverable"
                  style={{ color: 'var(--color-parker-bronze)', borderColor: 'rgba(160,120,74,0.5)' }}>
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </section>

        <section className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-16">
            {SECTIONS.map(k => (
              <div key={k}>
                <div className="h-px w-8 mb-5" style={{ background: 'var(--color-parker-bronze)', opacity: 0.6 }} />
                <h2 className="font-serif font-light text-cream leading-snug mb-4"
                  style={{ fontSize: 'clamp(1.4rem, 2.1vw, 1.85rem)' }}>
                  {t(`${k}.title`)}
                </h2>
                <p className="font-body font-light leading-relaxed"
                  style={{ fontSize: 'clamp(1rem, 1.15vw, 1.12rem)', color: 'rgba(237,232,220,0.68)' }}>
                  {t(`${k}.body`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24 max-w-2xl mx-auto text-center">
          <div className="h-px w-24 mx-auto mb-8"
            style={{ background: 'linear-gradient(to right, transparent, rgba(160,120,74,0.4), transparent)' }} />
          <p className="font-serif font-light text-cream mb-7"
            style={{ fontSize: 'clamp(1.3rem, 2vw, 1.75rem)' }}>
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
