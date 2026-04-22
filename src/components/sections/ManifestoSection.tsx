export function ManifestoSection() {
  return (
    <section className="relative px-8 md:px-16 py-32 flex flex-col items-center text-center border-t border-white/[0.08] overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 35% 50% at 25% 50%, rgba(30,51,40,0.2), transparent 60%),
            radial-gradient(ellipse 35% 50% at 75% 50%, rgba(192,32,42,0.1), transparent 60%)
          `,
        }}
      />

      <p
        className="font-serif font-normal leading-snug max-w-[22ch] relative z-10 reveal"
        style={{ fontSize: 'clamp(1.8rem, 4vw, 3.2rem)' }}
      >
        Dos maneras de vivir la misma música.{' '}
        <em style={{ color: 'var(--color-parker-bronze)' }}>Parker</em> te la mete en el pecho.{' '}
        <em style={{ color: 'var(--color-lenox-red)' }}>Lenox</em> te la sirve en el vaso.
      </p>

      <p className="mt-8 font-body text-base tracking-[0.1em] relative z-10 reveal reveal-delay-2"
        style={{ color: 'rgba(237,232,220,0.4)', fontWeight: 300 }}>
        Una sola puerta. Una sola noche.
      </p>
    </section>
  )
}
