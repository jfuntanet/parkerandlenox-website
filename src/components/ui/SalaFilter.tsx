'use client'

import { useState } from 'react'
import { ConcertCard } from '@/components/ui/ConcertCard'
import type { TicketEvent } from '@/types/api'

type Filter = 'todos' | 'parker' | 'lenox'

interface Props {
  events: TicketEvent[]
}

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'todos',  label: 'Todos' },
  { value: 'parker', label: 'Parker' },
  { value: 'lenox',  label: 'Lenox' },
]

export function SalaFilter({ events }: Props) {
  const [active, setActive] = useState<Filter>('todos')

  const filtered = events.filter(e => {
    if (active === 'todos') return true
    return e.venue.toLowerCase().includes(active)
  })

  return (
    <>
      <div className="flex items-center gap-1 mb-10">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setActive(f.value)}
            className="font-mono text-[0.6rem] tracking-[0.3em] uppercase px-5 py-2 border transition-all duration-300 hoverable"
            style={{
              borderColor: active === f.value
                ? (f.value === 'lenox' ? 'var(--color-lenox-red)' : 'var(--color-parker-bronze)')
                : 'rgba(255,255,255,0.1)',
              color: active === f.value
                ? (f.value === 'lenox' ? 'var(--color-lenox-red)' : 'var(--color-parker-bronze)')
                : 'rgba(255,255,255,0.4)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map(e => (
            <ConcertCard key={e.slug} event={e} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="font-serif text-2xl font-light" style={{ color: 'rgba(237,232,220,0.5)' }}>
            No hay conciertos en {active === 'parker' ? 'Parker' : 'Lenox'} próximamente.
          </p>
          <button
            onClick={() => setActive('todos')}
            className="mt-6 font-mono text-[0.6rem] tracking-widest uppercase text-white/30 hover:text-cream transition-colors hoverable"
          >
            Ver todos →
          </button>
        </div>
      )}
    </>
  )
}
