export const dynamic = 'force-dynamic'

import { IntroSection }     from '@/components/sections/IntroSection'
import { SalaSelector }     from '@/components/sections/SalaSelector'
import { CarreleraPreview } from '@/components/sections/CarreleraPreview'
import { ManifestoSection } from '@/components/sections/ManifestoSection'
import { ScrollReveal }     from '@/components/ui/ScrollReveal'
import { getEvents }        from '@/lib/api'

export default async function HomePage() {
  const events = await getEvents().catch(() => [])

  return (
    <>
      <IntroSection />
      <SalaSelector />
      <CarreleraPreview events={events} />
      <ManifestoSection />
      <ScrollReveal />
    </>
  )
}
