import type { PressMention, Tier } from '@/data/press-data'

const TIER_ACCENT: Record<Tier, string> = {
  'Tier 1':   'var(--color-parker-bronze)',
  'Tier 2':   '#C9A66B',
  'Tier 3':   'var(--color-parker-concrete)',
  'Industry': 'var(--color-lenox-red)',
}
const TIER_LABEL: Record<Tier, string> = {
  'Tier 1': 'Tier 1', 'Tier 2': 'Tier 2', 'Tier 3': 'Tier 3', 'Industry': 'Industria',
}
const TIER_RANK: Record<Tier, number> = { 'Tier 1': 0, 'Industry': 1, 'Tier 2': 2, 'Tier 3': 3 }

export function OutletGroupCard({ name, mentions }: { name: string; mentions: PressMention[] }) {
  // tier insignia = mejor tier alcanzado por el medio
  const bestTier = mentions.reduce<Tier>(
    (best, m) => (TIER_RANK[m.tier] < TIER_RANK[best] ? m.tier : best),
    'Tier 3',
  )
  const accent = TIER_ACCENT[bestTier]
  const country = mentions[0]?.country ?? ''

  return (
    <article
      className="flex flex-col border border-white/[0.08] hover:border-white/20 transition-all duration-500"
      style={{ background: 'rgba(255,255,255,0.01)' }}
    >
      {/* Cabecera del medio */}
      <header className="flex items-start justify-between gap-4 p-6 pb-4">
        <div className="min-w-0">
          <h3 className="font-serif text-2xl font-normal leading-tight text-cream truncate">
            {name}
          </h3>
          <p className="mt-1 font-mono text-[0.55rem] tracking-[0.25em] uppercase text-white/30">
            {country}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="flex items-center gap-2">
            <span className="w-5 h-px block" style={{ background: accent }} />
            <span className="font-mono text-[0.55rem] tracking-[0.3em] uppercase" style={{ color: accent }}>
              {TIER_LABEL[bestTier]}
            </span>
          </span>
          <span className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-white/30">
            {mentions.length} {mentions.length === 1 ? 'mención' : 'menciones'}
          </span>
        </div>
      </header>

      {/* Menciones del medio */}
      <ul className="px-6 pb-2">
        {mentions.map(m => (
          <li key={m.id} className="border-t border-white/[0.06]">
            <a
              href={m.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block py-4 hoverable"
            >
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="font-mono text-[0.6rem] tracking-[0.2em] text-white/30">
                  {m.year ?? m.date ?? 'Sin fecha'}
                </span>
                <span className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-white/25 group-hover:text-cream transition-colors shrink-0">
                  Ver fuente →
                </span>
              </div>
              <p className="font-serif text-base leading-snug text-cream/90 group-hover:text-white transition-colors">
                {m.title}
              </p>
              {m.summary && (
                <p className="mt-1.5 font-body text-sm leading-relaxed text-cream-muted line-clamp-2">
                  {m.summary}
                </p>
              )}
              {m.outlet !== name && (
                <p className="mt-1.5 font-mono text-[0.5rem] tracking-[0.2em] uppercase text-white/20">
                  vía {m.outlet}
                </p>
              )}
            </a>
          </li>
        ))}
      </ul>
    </article>
  )
}
