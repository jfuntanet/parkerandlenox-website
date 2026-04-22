import Link from 'next/link'

export function SalaSelector() {
  return (
    <section className="relative min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Divider */}
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 z-10"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(160,120,74,0.3) 20%, rgba(160,120,74,0.3) 80%, transparent)' }}
      >
        <span
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-xs px-2 py-4"
          style={{ color: 'var(--color-parker-bronze)', background: 'var(--color-black)' }}
        >
          ◆
        </span>
      </div>

      {/* Parker */}
      <div className="relative flex flex-col justify-center px-12 md:px-20 py-24 overflow-hidden group hoverable">
        {/* Hover tint */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 70% 50% at 20% 40%, rgba(30,51,40,0.5), transparent 60%),
              radial-gradient(ellipse 50% 60% at 60% 80%, rgba(92,26,26,0.3), transparent 60%)
            `,
          }}
        />
        {/* Background text decorativo */}
        <span
          className="absolute bottom-0 right-0 font-serif font-bold pointer-events-none select-none"
          style={{ fontSize: 'clamp(6rem,16vw,14rem)', opacity: 0.025, lineHeight: 1 }}
        >
          Parker
        </span>

        <div className="relative z-10">
          <p className="font-mono text-[0.6rem] tracking-[0.5em] uppercase mb-4"
            style={{ color: 'var(--color-parker-bronze)' }}>
            Sala A — 01 · Música en vivo
          </p>
          <h2 className="font-serif font-bold leading-none mb-6"
            style={{ fontSize: 'clamp(3.5rem,7vw,6rem)' }}>
            Parker
          </h2>
          <p className="font-body font-light leading-relaxed mb-8 max-w-[32ch]"
            style={{ fontSize: '1.1rem', color: 'rgba(237,232,220,0.65)' }}>
            Un speakeasy donde el músico está a tres metros de tu cara. Crudo, íntimo, sudoroso. El jazz que se siente antes de escucharse.
          </p>
          <div className="flex flex-wrap gap-2 mb-10">
            {['Live Jazz', 'Blues', 'Soul', 'Speakeasy'].map(tag => (
              <span key={tag} className="font-mono text-[0.55rem] tracking-[0.2em] uppercase px-4 py-1.5 border"
                style={{ borderColor: 'rgba(160,120,74,0.35)', color: 'var(--color-parker-bronze)' }}>
                {tag}
              </span>
            ))}
          </div>
          <Link href="/cartelera" className="inline-flex items-center gap-4 font-mono text-[0.65rem] tracking-[0.3em] uppercase text-cream hover:gap-6 transition-all duration-300 hoverable">
            <span className="w-12 h-px block" style={{ background: 'var(--color-parker-bronze)' }} />
            Ver cartelera
          </Link>
        </div>
      </div>

      {/* Lenox */}
      <div className="relative flex flex-col justify-center px-12 md:px-20 py-24 overflow-hidden group hoverable"
        style={{ background: 'var(--color-black-lenox)' }}>
        {/* Hover tint */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 60% 40% at 80% 30%, rgba(192,32,42,0.15), transparent 60%),
              radial-gradient(ellipse 40% 50% at 30% 80%, rgba(107,61,34,0.2), transparent 60%)
            `,
          }}
        />
        <span
          className="absolute bottom-0 left-0 font-serif italic pointer-events-none select-none"
          style={{ fontSize: 'clamp(6rem,16vw,14rem)', opacity: 0.025, lineHeight: 1 }}
        >
          Lenox
        </span>

        <div className="relative z-10">
          <p className="font-mono text-[0.6rem] tracking-[0.5em] uppercase mb-4"
            style={{ color: 'var(--color-lenox-red)' }}>
            Sala B — 02 · Vinilos &amp; Cócteles
          </p>
          <h2 className="font-serif italic font-light leading-none mb-6"
            style={{ fontSize: 'clamp(3.5rem,7vw,6rem)' }}>
            Lenox
          </h2>
          <p className="font-body font-light leading-relaxed mb-8 max-w-[32ch]"
            style={{ fontSize: '1.1rem', color: 'rgba(237,232,220,0.65)' }}>
            Un cocktail bar donde el ritual importa tanto como la bebida. El crujido del vinilo, el cóctel perfecto, la conversación en voz baja.
          </p>
          <div className="flex flex-wrap gap-2 mb-10">
            {['Vinyl Bar', 'Cocktails', 'Analógico'].map(tag => (
              <span key={tag} className="font-mono text-[0.55rem] tracking-[0.2em] uppercase px-4 py-1.5 border"
                style={{ borderColor: 'rgba(192,32,42,0.4)', color: 'var(--color-lenox-red)' }}>
                {tag}
              </span>
            ))}
          </div>
          <Link href="/cartelera" className="inline-flex items-center gap-4 font-mono text-[0.65rem] tracking-[0.3em] uppercase text-cream hover:gap-6 transition-all duration-300 hoverable">
            <span className="w-12 h-px block" style={{ background: 'var(--color-lenox-red)' }} />
            Ver selección
          </Link>
        </div>
      </div>
    </section>
  )
}
