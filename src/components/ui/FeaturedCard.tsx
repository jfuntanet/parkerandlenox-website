import { PRESS_BLURBS, type PressMention, type Tier } from '@/data/press-data'

const TIER_ACCENT: Record<Tier, string> = {
  'Tier 1':   'var(--color-parker-bronze)',
  'Tier 2':   '#C9A66B',
  'Tier 3':   'var(--color-parker-concrete)',
  'Industry': 'var(--color-lenox-red)',
}

// Si el título del artículo es genérico (sólo "Parker & Lenox" o variantes),
// no vale la pena mostrarlo — el blurb ya cuenta todo.
function isGenericTitle(title: string): boolean {
  const t = title.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
  return t === 'parker lenox' || t === 'parker  lenox' || t === 'parker y lenox' || t === 'parker and lenox' || t === 'review of parker y lenox' || t === 'review of parker lenox'
}

// Normaliza el string `country` a un chip corto: MX / USA / Global.
function countryChip(country: string, countries?: string[]): string | null {
  const src = (countries && countries[0]) || country || ''
  const s = src.toLowerCase()
  if (s.includes('méxico') || s.includes('mexico') || s === 'mx') return 'MX'
  if (s.includes('usa') || s.includes('united states')) return 'USA'
  if (s.includes('global') || s.includes('syndicated') || s.includes('international')) return 'Global'
  if (s) return src.split('/')[0].trim().slice(0, 6).toUpperCase()
  return null
}

export function FeaturedCard({ mention }: { mention: PressMention }) {
  const accent = TIER_ACCENT[mention.tier]
  const when   = mention.year ? String(mention.year) : (mention.date || '')
  const blurb  = PRESS_BLURBS[mention.id]
  const showTitle = !isGenericTitle(mention.title)
  const chip   = countryChip(mention.country, mention.countries)

  return (
    <a
      href={mention.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col p-5 md:p-6 border transition-colors duration-300 hoverable h-full min-h-[220px] hover:border-white/25"
      style={{
        borderColor: 'rgba(255,255,255,0.10)',
        background: 'linear-gradient(160deg, rgba(255,255,255,0.02), rgba(255,255,255,0) 60%)',
      }}
    >
      {/* Nombre del medio — protagonista */}
      <h3 className="font-serif font-light text-cream leading-[1.05] whitespace-nowrap overflow-hidden text-ellipsis mb-4"
        style={{ fontSize: 'clamp(1.1rem, 1.6vw, 1.55rem)', letterSpacing: '-0.01em' }}>
        {mention.outletGroup}
      </h3>

      {/* Título (sólo si no es genérico) + blurb curado */}
      <div className="flex-1 flex flex-col gap-2">
        {showTitle && (
          <p className="font-serif italic font-light leading-snug"
            style={{ fontSize: 'clamp(0.9rem, 1vw, 1rem)', color: 'rgba(237,232,220,0.72)' }}>
            “{mention.title}”
          </p>
        )}
        {blurb && (
          <p className="font-body font-light leading-relaxed"
            style={{ fontSize: 'clamp(0.82rem, 0.9vw, 0.9rem)', color: 'rgba(237,232,220,0.55)' }}>
            {blurb}
          </p>
        )}
      </div>

      {/* Meta: año + chip país + Leer artículo */}
      <div className="mt-5 pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[0.5rem] tracking-[0.25em] uppercase text-white/40">
            {when}
          </span>
          {chip && (
            <span className="font-mono text-[0.45rem] tracking-[0.15em] uppercase border border-white/15 rounded-full px-1.5 py-0.5 leading-none text-white/50">
              {chip}
            </span>
          )}
        </div>
        <span className="font-mono text-[0.5rem] tracking-[0.25em] uppercase opacity-60 group-hover:opacity-100 transition-opacity"
          style={{ color: accent }}>
          Leer →
        </span>
      </div>
    </a>
  )
}
