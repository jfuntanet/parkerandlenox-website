export const dynamic = 'force-dynamic'

import { CarreleraPreview } from '@/components/sections/CarreleraPreview'
import { getEvents } from '@/lib/api'

export default async function HomePage() {
  const events = await getEvents().catch(() => [])

  return (
    <>
      {/* HeroSection - to be implemented in Task 5 */}
      {/* ProyectosStrip - out of scope */}
      <CarreleraPreview events={events} />
      {/* DiscosPreview - out of scope */}
      {/* MerchPreview - out of scope */}
    </>
  )
}
