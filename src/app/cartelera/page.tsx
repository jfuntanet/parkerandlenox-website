export const dynamic = 'force-dynamic'

import { SalaFilter } from '@/components/ui/SalaFilter'
import { getEvents }  from '@/lib/api'

export const metadata = { title: 'Cartelera — Parker & Lenox' }

export default async function CarreleraPage() {
  const events = await getEvents().catch(() => [])

  return (
    <div className="relative min-h-screen pt-32 pb-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 20% 10%, rgba(92,26,26,0.15) 0%, transparent 50%)' }}
      />

      <div className="relative z-10 px-8 md:px-16 max-w-6xl mx-auto">
        <div className="mb-16">
          <p className="font-mono text-[0.6rem] tracking-[0.5em] uppercase mb-3"
            style={{ color: 'var(--color-parker-bronze)' }}>
            En escena
          </p>
          <h1 className="font-serif text-5xl md:text-7xl font-light text-cream">Cartelera</h1>
          <div className="mt-4 h-px w-24"
            style={{ background: 'linear-gradient(to right, rgba(160,120,74,0.4), transparent)' }} />
        </div>

        <SalaFilter events={events} />
      </div>
    </div>
  )
}
