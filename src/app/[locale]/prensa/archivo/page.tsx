import Link from 'next/link'
import { PressExplorer } from '@/components/sections/PressExplorer'
import { mentions, HIDDEN_IDS } from '@/data/press-data'

export const metadata = {
  title: 'Archivo de prensa — Parker & Lenox',
  description: 'Catálogo completo de menciones de Parker & Lenox en medios: prensa internacional, mexicana e industria. Buscable y filtrable.',
}

export default function PrensaArchivoPage() {
  const hidden = new Set(HIDDEN_IDS)
  const visible = mentions.filter(m => !hidden.has(m.id))
  const outletCount = new Set(visible.map(m => m.outletGroup)).size

  return (
    <div className="relative min-h-screen pt-32 pb-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 80% 5%, rgba(160,120,74,0.12) 0%, transparent 55%)' }}
      />

      <div className="relative z-10 px-8 md:px-16 max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="mb-16">
          <Link href="/prensa"
            className="inline-flex items-center gap-2 font-mono text-[0.6rem] tracking-widest uppercase text-white/40 hover:text-cream transition-colors hoverable mb-6">
            ← Prensa
          </Link>
          <p className="font-mono text-[0.6rem] tracking-[0.5em] uppercase mb-3"
            style={{ color: 'var(--color-parker-bronze)' }}>
            Archivo completo
          </p>
          <h1 className="font-serif text-5xl md:text-7xl font-light text-cream">Todas las menciones</h1>
          <div className="mt-4 h-px w-24"
            style={{ background: 'linear-gradient(to right, rgba(160,120,74,0.4), transparent)' }} />
          <p className="mt-8 font-body text-lg md:text-xl leading-relaxed text-cream-muted max-w-2xl">
            {visible.length} menciones verificadas en {outletCount} medios — prensa internacional,
            medios mexicanos y plataformas de la industria. Buscable y filtrable por tier.
          </p>
        </div>

        {/* Catálogo por medio (con destacados) */}
        <PressExplorer />
      </div>
    </div>
  )
}
