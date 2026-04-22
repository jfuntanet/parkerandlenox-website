export function IntroSection() {
  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Radial background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 40% 60% at 20% 60%, rgba(92,26,26,0.18), transparent 65%),
            radial-gradient(ellipse 40% 60% at 80% 60%, rgba(192,32,42,0.10), transparent 65%)
          `,
        }}
      />

      {/* Línea vertical animada */}
      <div
        className="absolute top-0 left-1/2 w-px animate-grow-line"
        style={{
          background: 'linear-gradient(to bottom, transparent, var(--color-parker-bronze), transparent)',
          animationDelay: '0.5s',
          height: 0,
        }}
      />

      {/* Eyebrow */}
      <p
        className="font-mono text-[0.65rem] tracking-[0.4em] uppercase mb-8 animate-fade-up"
        style={{
          color: 'var(--color-parker-bronze)',
          animationDelay: '1.2s',
        }}
      >
        Jazz · Blues · Soul — CDMX
      </p>

      {/* Título principal */}
      <h1
        className="font-serif text-center leading-[0.9] animate-fade-up"
        style={{
          fontSize: 'clamp(5rem, 15vw, 12rem)',
          fontWeight: 400,
          animationDelay: '1.5s',
        }}
      >
        Parker
        <br />
        <span
          className="italic"
          style={{
            color: 'var(--color-parker-bronze)',
            fontSize: '0.8em',
          }}
        >
          &amp;
        </span>
        <br />
        Lenox
      </h1>

      {/* Subtítulo */}
      <p
        className="mt-10 font-body text-base tracking-[0.15em] animate-fade-up"
        style={{
          color: 'rgba(237,232,220,0.5)',
          fontWeight: 300,
          animationDelay: '2s',
        }}
      >
        Dos salas. Una misma noche.
      </p>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-fade-up"
        style={{ animationDelay: '2.5s' }}
      >
        <span className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-white/30">
          Elige tu noche
        </span>
        <div
          className="w-px h-12 animate-pulse-opacity"
          style={{ background: 'linear-gradient(to bottom, var(--color-parker-bronze), transparent)' }}
        />
      </div>
    </section>
  )
}
