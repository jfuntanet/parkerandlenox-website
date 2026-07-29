'use client'

import { useState, useMemo } from 'react'
import { ConcertCard } from '@/components/ui/ConcertCard'
import { ConcertCardHorizontal } from '@/components/ui/ConcertCardHorizontal'
import type { TicketEvent } from '@/types/api'

interface Props { events: TicketEvent[] }

type Filter = 'todos' | 'parker' | 'lenox'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'todos',  label: 'Todos'  },
  { value: 'parker', label: 'Parker' },
  { value: 'lenox',  label: 'Lenox'  },
]

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const MIN_CONCERTS_VISIBLE = 11

function monthKey(dateStr: string) { return dateStr.slice(0, 7) }
function monthLabel(key: string) {
  const [y, m] = key.split('-')
  const now = new Date()
  const nowYear = now.getFullYear()
  const label = MONTHS_ES[Number(m) - 1]
  return Number(y) === nowYear ? label : `${label} ${y}`
}

export function CarreleraPreview({ events }: Props) {
  const [active, setActive] = useState<Filter>('todos')
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())
  const toggleMonth = (k: string) => setExpandedMonths(prev => {
    const next = new Set(prev)
    if (next.has(k)) next.delete(k)
    else next.add(k)
    return next
  })

  // Agrupar eventos filtrados por mes, en orden cronológico
  const byMonth = useMemo(() => {
    const filtered = events.filter(e => active === 'todos' ? true : e.venue.toLowerCase().includes(active))
    const groups = new Map<string, TicketEvent[]>()
    for (const e of filtered) {
      const k = monthKey(e.date)
      if (!groups.has(k)) groups.set(k, [])
      groups.get(k)!.push(e)
    }
    return Array.from(groups.entries()).sort(([a],[b]) => a.localeCompare(b))
  }, [events, active])

  const visible = byMonth
  const totalVisible = visible.reduce((s, [, evs]) => s + evs.length, 0)

  // Meses abiertos por default: sumamos desde el primero hasta llegar a MIN_CONCERTS_VISIBLE
  const autoOpenKeys = useMemo(() => {
    const keys = new Set<string>()
    let count = 0
    for (const [k, evs] of byMonth) {
      keys.add(k)
      count += evs.length
      if (count >= MIN_CONCERTS_VISIBLE) break
    }
    return keys
  }, [byMonth])

  return (
    <section id="cartelera" className="px-3 md:px-16 py-20 border-t border-white/[0.08] scroll-mt-24">
      <div className="flex items-center gap-6 mb-8">
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(160,120,74,0.35), transparent)' }} />
        <span className="font-mono text-[0.6rem] tracking-[0.5em] uppercase" style={{ color: 'var(--color-parker-concrete)' }}>
          Cartelera
        </span>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, rgba(192,32,42,0.35), transparent)' }} />
      </div>

      {/* Selector sticky */}
      <div className="sticky top-[72px] z-30 -mx-3 md:-mx-16 px-3 md:px-16 py-2 mb-10 bg-black border-b border-white/[0.08]">
        <div className="flex items-center justify-center gap-1 max-w-6xl mx-auto">
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
      </div>

      {totalVisible > 0 ? (
        <div className="flex flex-col gap-6">
          {visible.map(([key, evs]) => {
            const isAuto = autoOpenKeys.has(key)
            const isOpen = isAuto || expandedMonths.has(key)
            return (
              <div key={key}>
                <button type="button" onClick={() => !isAuto && toggleMonth(key)}
                  disabled={isAuto}
                  className={`w-full flex items-center gap-4 sm:gap-6 mt-8 mb-8 hoverable ${isAuto ? 'cursor-default' : 'cursor-pointer'}`}>
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(160,120,74,0.35), transparent)' }} />
                  <span className="flex items-baseline gap-3" style={{ color: 'var(--color-parker-bronze)' }}>
                    <span className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-none">
                      {monthLabel(key)}
                    </span>
                    <span className="font-mono text-[0.6rem] sm:text-[0.65rem] tracking-widest opacity-60">({evs.length})</span>
                    {!isAuto && (
                      <span className="font-serif text-2xl sm:text-3xl leading-none transition-transform duration-300 inline-block ml-1"
                        style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
                    )}
                  </span>
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, rgba(192,32,42,0.35), transparent)' }} />
                </button>
                {isOpen && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-fr max-w-[1100px] mx-auto">
                    {evs.map(event => (
                      <div key={event.slug} className="bg-black h-full">
                        <div className="sm:hidden">
                          <ConcertCardHorizontal event={event} />
                        </div>
                        <div className="hidden sm:block h-full">
                          <ConcertCard event={event} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="font-body text-center py-12" style={{ color: 'rgba(237,232,220,0.5)' }}>
          No hay conciertos en {active === 'parker' ? 'Parker' : active === 'lenox' ? 'Lenox' : 'esta selección'} próximamente.
        </p>
      )}


    </section>
  )
}
