import { SalaSelector }      from '@/components/sections/SalaSelector'
import { CarreleraPreview }  from '@/components/sections/CarreleraPreview'
import { NewsletterSection } from '@/components/sections/NewsletterSection'
import { BannersSection }    from '@/components/sections/BannersSection'
import { ScrollReveal }      from '@/components/ui/ScrollReveal'
import { getEvents }         from '@/lib/api'

export const dynamic = 'force-dynamic'

const VENUE_DESCRIPTIONS = {
  es: 'Speakeasy con dos salas —Parker & Lenox— jazz en vivo, HiFi listening y vinyl bar en la Ciudad de México.',
  en: 'A two-room speakeasy —Parker & Lenox— with live jazz, HiFi listening and vinyl bar in Mexico City.',
} as const

function venueJsonLd(locale: 'es' | 'en') {
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
    sameAs: [
      'https://instagram.com/parkerandlenox/',
      'https://facebook.com/parkerandlenox',
      'https://tiktok.com/@parkerandlenox_',
    ],
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const events = await getEvents().catch(() => [])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(venueJsonLd(locale as 'es' | 'en')) }}
      />
      <SalaSelector />
      <CarreleraPreview events={events} />
      <NewsletterSection />
      <BannersSection />
      <ScrollReveal />
    </>
  )
}
