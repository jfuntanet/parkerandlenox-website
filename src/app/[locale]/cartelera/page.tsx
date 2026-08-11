import { getTranslations } from 'next-intl/server'
import { CarreleraPreview } from '@/components/sections/CarreleraPreview'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { getEvents } from '@/lib/api'
import type { TicketEvent } from '@/types/api'

export const dynamic = 'force-dynamic'

const SITE_URL = 'https://parkerandlenox.com'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'cartelera' })
  const path = locale === 'es' ? '/cartelera' : `/${locale}/cartelera`
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: path,
      languages: { es: '/cartelera', en: '/en/cartelera', 'x-default': '/cartelera' },
    },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}${path}`,
      title: t('metaTitle'),
      description: t('metaDescription'),
    },
  }
}

// ItemList de los próximos eventos: le da a Google la agenda completa de esta URL
// (las fichas individuales ya llevan su propio MusicEvent).
function listJsonLd(events: TicketEvent[], locale: string) {
  const path = locale === 'es' ? '/cartelera' : `/${locale}/cartelera`
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Cartelera Parker & Lenox',
    url: `${SITE_URL}${path}`,
    numberOfItems: events.length,
    itemListElement: events.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'MusicEvent',
        name: e.title,
        startDate: e.time ? `${e.date}T${e.time}:00-06:00` : e.date,
        url: `${SITE_URL}/cartelera/${e.slug}`,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        ...(e.imageUrl ? { image: e.imageUrl } : {}),
        location: {
          '@type': 'MusicVenue',
          name: `Parker & Lenox — ${e.venue}`,
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Calle Gral. Prim 100',
            addressLocality: 'Juárez, Cuauhtémoc',
            postalCode: '06600',
            addressRegion: 'CDMX',
            addressCountry: 'MX',
          },
        },
      },
    })),
  }
}

export default async function CarteleraPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'cartelera' })
  const events = await getEvents().catch(() => [])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd(events, locale)) }}
      />

      <section className="pt-28 pb-4 px-6 sm:px-12 md:px-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Mismo wordmark que el hero con el monograma deslizado hasta Parker:
              serif recta en bronce, con el eyebrow Live Music al lado.
              Espejo de /lenox. */}
          <h1 className="flex flex-wrap items-baseline justify-center gap-x-6 gap-y-1">
            <span className="font-serif font-bold leading-none text-[clamp(3rem,8.5vw,6rem)] md:text-[clamp(4.5rem,12.75vw,9rem)]"
              style={{ color: 'var(--color-parker-bronze)' }}>
              {t('wordmark')}
            </span>
            <span className="font-mono uppercase tracking-[0.5em] text-[0.6rem] md:text-[1.05rem]"
              style={{ color: 'var(--color-parker-bronze)' }}>
              {t('livemusic')}
            </span>
          </h1>
          <p className="mt-7 font-serif font-light text-cream leading-snug"
            style={{ fontSize: 'clamp(1.2rem, 1.9vw, 1.65rem)' }}>
            {t('h1')}
          </p>
          <div className="mt-7 mx-auto h-px w-16"
            style={{ background: 'var(--color-parker-bronze)', opacity: 0.4 }} />
        </div>
      </section>

      <CarreleraPreview events={events} />
      <ScrollReveal />
    </>
  )
}
