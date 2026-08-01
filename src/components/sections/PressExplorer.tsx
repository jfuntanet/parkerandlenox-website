'use client'

import { useMemo, useState } from 'react'
import { OutletGroupCard } from '@/components/ui/OutletGroupCard'
import { FeaturedCard } from '@/components/ui/FeaturedCard'
import { mentions, FEATURED_IDS, HIDDEN_IDS, type Tier, type PressMention } from '@/data/press-data'

const TIERS: { value: Tier | 'todos'; label: string; accent: string }[] = [
  { value: 'todos',    label: 'Todos',     accent: 'var(--color-parker-bronze)' },
  { value: 'Tier 1',   label: 'Tier 1',    accent: 'var(--color-parker-bronze)' },
  { value: 'Tier 2',   label: 'Tier 2',    accent: '#C9A66B' },
  { value: 'Tier 3',   label: 'Tier 3',    accent: 'var(--color-parker-concrete)' },
  { value: 'Industry', label: 'Industria', accent: 'var(--color-lenox-red)' },
]

const TIER_RANK: Record<Tier, number> = { 'Tier 1': 0, 'Industry': 1, 'Tier 2': 2, 'Tier 3': 3 }

type SortMode = 'nombre' | 'cobertura'

const HIDDEN = new Set(HIDDEN_IDS)
const FEATURED = new Set(FEATURED_IDS)
// Visibles = todo menos ocultos
const VISIBLE = mentions.filter(m => !HIDDEN.has(m.id))
// Destacados en el ORDEN de FEATURED_IDS
const FEATURED_MENTIONS = FEATURED_IDS
  .map(id => VISIBLE.find(m => m.id === id))
  .filter((m): m is PressMention => Boolean(m))
// Catálogo = visibles que no son destacados
const CATALOG = VISIBLE.filter(m => !FEATURED.has(m.id))

function bestRank(ms: PressMention[]) {
  return ms.reduce((r, m) => Math.min(r, TIER_RANK[m.tier]), 9)
}
function byYearDesc(a: PressMention, b: PressMention) {
  return (b.year ?? 0) - (a.year ?? 0) || a.id - b.id
}

export function PressExplorer() {
  const [tier, setTier] = useState<Tier | 'todos'>('todos')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortMode>('nombre')

  const matches = (m: PressMention) => {
    const q = query.trim().toLowerCase()
    if (tier !== 'todos' && m.tier !== tier) return false
    if (q && !m.outletGroup.toLowerCase().includes(q)
          && !m.outlet.toLowerCase().includes(q)
          && !m.title.toLowerCase().includes(q)) return false
    return true
  }

  const featured = useMemo(() => FEATURED_MENTIONS.filter(matches), [tier, query])

  const groups = useMemo(() => {
    const filtered = CATALOG.filter(matches)
    const map = new Map<string, PressMention[]>()
    for (const m of filtered) {
      const arr = map.get(m.outletGroup)
      if (arr) arr.push(m); else map.set(m.outletGroup, [m])
    }
    const list = Array.from(map.entries()).map(([name, ms]) => ({
      name, mentions: [...ms].sort(byYearDesc),
    }))
    list.sort((a, b) => {
      if (sort === 'cobertura') {
        return b.mentions.length - a.mentions.length
          || bestRank(a.mentions) - bestRank(b.mentions)
          || a.name.localeCompare(b.name, 'es')
      }
      return a.name.localeCompare(b.name, 'es')
    })
    return list
  }, [tier, query, sort])

  const totalShown = featured.length + groups.reduce((n, g) => n + g.mentions.length, 0)
  const reset = () => { setTier('todos'); setQuery('') }

  return (
    <>
      {/* Buscador */}
      <div className="mb-12 max-w-md">
        <label className="font-mono text-[0.55rem] tracking-[0.4em] uppercase text-cream/40 block mb-3">
          Buscar
        </label>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Medio o título…"
          className="w-full bg-transparent border-b border-white/15 focus:border-parker-bronze outline-none py-2 font-body text-lg text-cream placeholder:text-white/25 transition-colors hoverable"
        />
      </div>

      {/* Filtro Tier */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <span className="font-mono text-[0.55rem] tracking-[0.4em] uppercase text-cream/40 sm:w-16 shrink-0">Tier</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {TIERS.map(t => (
            <button key={t.value} onClick={() => setTier(t.value)}
              className="font-mono text-[0.6rem] tracking-[0.2em] uppercase px-4 py-1.5 border transition-all duration-300 hoverable"
              style={{
                borderColor: tier === t.value ? t.accent : 'rgba(255,255,255,0.1)',
                color:       tier === t.value ? t.accent : 'rgba(255,255,255,0.4)',
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orden */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-12">
        <span className="font-mono text-[0.55rem] tracking-[0.4em] uppercase text-cream/40 sm:w-16 shrink-0">Orden</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {([['nombre', 'A — Z'], ['cobertura', 'Más menciones']] as const).map(([val, lbl]) => (
            <button key={val} onClick={() => setSort(val)}
              className="font-mono text-[0.6rem] tracking-[0.2em] uppercase px-4 py-1.5 border transition-all duration-300 hoverable"
              style={{
                borderColor: sort === val ? 'var(--color-parker-bronze)' : 'rgba(255,255,255,0.1)',
                color:       sort === val ? 'var(--color-parker-bronze)' : 'rgba(255,255,255,0.4)',
              }}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {totalShown === 0 ? (
        <div className="py-24 text-center">
          <p className="font-serif text-2xl font-light" style={{ color: 'rgba(237,232,220,0.5)' }}>
            Sin resultados para estos filtros.
          </p>
          <button onClick={reset}
            className="mt-6 font-mono text-[0.6rem] tracking-widest uppercase text-white/30 hover:text-cream transition-colors hoverable">
            Limpiar filtros →
          </button>
        </div>
      ) : (
        <>
          {/* Destacados */}
          {featured.length > 0 && (
            <section className="mb-20">
              <div className="flex items-center gap-4 mb-8">
                <span className="font-mono text-[0.6rem] tracking-[0.4em] uppercase"
                  style={{ color: 'var(--color-parker-bronze)' }}>
                  Destacados
                </span>
                <span className="flex-1 h-px"
                  style={{ background: 'linear-gradient(to right, rgba(160,120,74,0.3), transparent)' }} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featured.map(m => <FeaturedCard key={m.id} mention={m} />)}
              </div>
            </section>
          )}

          {/* Catálogo por medio */}
          {groups.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-8">
                <span className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-cream/40">
                  {groups.length} {groups.length === 1 ? 'medio' : 'medios'} · {totalShown} {totalShown === 1 ? 'mención' : 'menciones'}
                </span>
                <span className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                {groups.map(g => <OutletGroupCard key={g.name} name={g.name} mentions={g.mentions} />)}
              </div>
            </section>
          )}
        </>
      )}
    </>
  )
}
