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
          <p className="font-mono text-[0.6rem] tracking-[0.5em] uppercase mb-5"
            style={{ color: 'var(--color-parker-bronze)' }}>
            {t('eyebrow')}
          </p>
          <h1 className="font-serif font-light text-cream leading-[1.05]"
            style={{ fontSize: 'clamp(2.1rem, 4.2vw, 3.6rem)' }}>
            {t('h1')}
          </h1>
          <div className="mt-6 mx-auto h-px w-16"
            style={{ background: 'var(--color-parker-bronze)', opacity: 0.4 }} />
          <p className="mt-7 font-body font-light leading-relaxed"
            style={{ fontSize: 'clamp(0.95rem, 1.1vw, 1.08rem)', color: 'rgba(237,232,220,0.68)' }}>
            {t('intro')}
          </p>
          <p className="mt-4 font-body font-light leading-relaxed"
            style={{ fontSize: 'clamp(0.9rem, 1vw, 1rem)', color: 'rgba(237,232,220,0.5)' }}>
            {t('intro2')}
          </p>
        </div>
      </section>

      <CarreleraPreview events={events} />
      <ScrollReveal />
    </>
  )
}
