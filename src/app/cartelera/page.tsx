export const dynamic = 'force-dynamic'

import { GrainOverlay } from '@/components/ui/GrainOverlay'
import { getEvents } from '@/lib/api'

export const metadata = { title: 'Cartelera — Not a Bot' }

export default async function CarreleraPage() {
  const events = await getEvents().catch(() => [])

  return (
    <div className="relative min-h-screen pt-32 pb-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 20% 10%, #2a0a05 0%, transparent 50%)' }}
      />
      <GrainOverlay />

      <div className="relative z-10 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="mb-16">
          <p className="font-sans text-xs uppercase tracking-widest text-gold mb-3">En escena</p>
          <h1 className="font-serif text-5xl md:text-7xl font-light text-cream">Cartelera</h1>
          <div className="mt-4 h-px w-24 bg-gradient-to-r from-gold/40 to-transparent" />
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {events.map((e) => (
              <div key={e.slug} className="bg-gradient-to-br from-gold/10 to-transparent rounded-lg p-6 border border-gold/20">
                {/* EventCard placeholder - will be implemented in Task 7 */}
                <h3 className="font-serif text-lg text-cream">{e.title}</h3>
                <p className="text-cream-muted text-sm mt-2">{e.venue}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl text-cream-muted font-light">No hay conciertos próximos.</p>
            <p className="font-sans text-sm text-cream-dim mt-2">Vuelve pronto.</p>
          </div>
        )}
      </div>
    </div>
  )
}
