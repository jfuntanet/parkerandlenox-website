export const dynamic = 'force-dynamic'

import { SalaSelector }      from '@/components/sections/SalaSelector'
import { CarreleraPreview }  from '@/components/sections/CarreleraPreview'
import { NewsletterSection } from '@/components/sections/NewsletterSection'
import { BannersSection }    from '@/components/sections/BannersSection'
import { ScrollReveal }      from '@/components/ui/ScrollReveal'
import { getEvents }         from '@/lib/api'

const VENUE_JSONLD = {
  '@context': 'https://schema.org',
  '@type': ['MusicVenue', 'BarOrPub'],
  name: 'Parker & Lenox',
  url: 'https://parkerandlenox.com',
  logo: 'https://parkerandlenox.com/parker-lenox-logo.webp',
  image: 'https://parkerandlenox.com/og-plx.jpg',
  description: 'Speakeasy con dos salas —Parker & Lenox— jazz en vivo, HiFi listening y vinyl bar en la Ciudad de México.',
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

export default async function HomePage() {
  const events = await getEvents().catch(() => [])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(VENUE_JSONLD) }}
      />
      <SalaSelector />
      <CarreleraPreview events={events} />
      <NewsletterSection />
      <BannersSection />
      <ScrollReveal />
    </>
  )
}
