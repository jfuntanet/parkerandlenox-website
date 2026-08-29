import { SalaSelector }      from '@/components/sections/SalaSelector'
import { CarreleraPreview }  from '@/components/sections/CarreleraPreview'
import { CicloCard }         from '@/components/ui/CicloCard'
import { AboutSection }      from '@/components/sections/AboutSection'
import { NewsletterSection } from '@/components/sections/NewsletterSection'
import { BannersSection }    from '@/components/sections/BannersSection'
import { ScrollReveal }      from '@/components/ui/ScrollReveal'
import { getEvents, getPackages } from '@/lib/api'
import type { TicketEvent }  from '@/types/api'

export const dynamic = 'force-dynamic'

const VENUE_DESCRIPTIONS = {
  es: 'Speakeasy con dos salas —Parker & Lenox— jazz en vivo, HiFi listening y vinyl bar en la Ciudad de México.',
  en: 'A two-room speakeasy —Parker & Lenox— with live jazz, HiFi listening and vinyl bar in Mexico City.',
} as const

// H1 real de la home (no visible: el hero es el split Parker/Lenox, sin encabezado tipográfico).
const H1 = {
  es: 'Parker & Lenox — jazz en vivo y vinyl bar en la Ciudad de México',
  en: 'Parker & Lenox — live jazz and vinyl bar in Mexico City',
} as const

const MAPS_URL = 'https://maps.google.com/?q=Calle+Gral.+Prim+100,+Ju%C3%A1rez,+Cuauht%C3%A9moc,+06600+Ciudad+de+M%C3%A9xico'

function venueJsonLd(locale: 'es' | 'en', events: TicketEvent[]) {
  return {
    '@context': 'https://schema.org',
    '@type': ['MusicVenue', 'BarOrPub'],
    name: 'Parker & Lenox',
    url: locale === 'es' ? 'https://parkerandlenox.com' : `https://parkerandlenox.com/${locale}`,
    logo: 'https://parkerandlenox.com/parker-lenox-logo.webp',
    image: 'https://parkerandlenox.com/og-plx.jpg',
    description: VENUE_DESCRIPTIONS[locale],
    telephone: '+525521835107',
    email: 'hello@parkerandlenox.com',
    priceRange: '$$-$$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Calle Gral. Prim 100',
      addressLocality: 'Juárez, Cuauhtémoc',
      postalCode: '06600',
      addressRegion: 'CDMX',
      addressCountry: 'MX',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '18:00',
        closes: '02:00',
      },
    ],
    hasMap: MAPS_URL,
    acceptsReservations: 'https://parkerandlenox.com/#cartelera',
    currenciesAccepted: 'MXN',
    publicAccess: true,
    isAccessibleForFree: false,
    hasMenu: [
      'https://parkerandlenox.com/cocina',
      'https://parkerandlenox.com/cocteles',
    ],
    sameAs: [
      'https://instagram.com/parkerandlenox/',
      'https://facebook.com/parkerandlenox',
      'https://tiktok.com/@parkerandlenox_',
    ],
    // Los próximos eventos, para que la home compita en consultas de agenda
    // ("jazz cdmx hoy") y no sólo con la ficha del venue.
    event: events.slice(0, 12).map(e => ({
      '@type': 'MusicEvent',
      name: e.title,
      startDate: e.time ? `${e.date}T${e.time}:00-06:00` : e.date,
      url: `https://parkerandlenox.com/cartelera/${e.slug}`,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      ...(e.imageUrl ? { image: e.imageUrl } : {}),
      location: { '@type': 'MusicVenue', name: `Parker & Lenox — ${e.venue}` },
    })),
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const [events, packages] = await Promise.all([
    getEvents().catch(() => []),
    getPackages().catch(() => []),
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(venueJsonLd(locale as 'es' | 'en', events)) }}
      />
      <h1 className="sr-only">{H1[locale as 'es' | 'en'] ?? H1.es}</h1>
      <SalaSelector />
      {packages.length > 0 && (
        <section className="px-3 md:px-16 pt-10 pb-4">
          <div className="flex flex-col gap-6">
            {packages.map(pkg => (
              <CicloCard key={pkg.slug} pkg={pkg} />
            ))}
          </div>
        </section>
      )}
      <CarreleraPreview events={events} />
      <AboutSection />
      <NewsletterSection />
      <BannersSection />
      <ScrollReveal />
    </>
  )
}
