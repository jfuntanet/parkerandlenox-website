// Banner promocional Negroni Week × Campari en Lenox (15–30 sep 2026).
// Se muestra en /lenox antes del listado de sesiones; enlaza al registro
// del pase, que vive fuera del menú (URL directa por email/QR).
export function NegroniWeekBanner() {
  return (
    <section className="max-w-5xl mx-auto mt-24 mb-4">
      <div
        className="relative overflow-hidden rounded-lg"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(192,32,42,0.28) 0%, transparent 65%), #0e0a0a',
          border: '1px solid rgba(192,32,42,0.35)',
        }}
      >
        <div className="flex flex-col items-center px-6 py-10 sm:px-10 sm:py-14 gap-8 text-center">
          <img
            src="/negroni/negroni-week-white.png"
            alt="Negroni Week × imbibe and Campari"
            className="w-full max-w-[440px] h-auto"
            style={{ display: 'block' }}
          />

          <p
            className="font-body font-light leading-relaxed max-w-md"
            style={{
              fontSize: 'clamp(1rem, 1.25vw, 1.15rem)',
              color: 'rgba(237,232,220,0.85)',
            }}
          >
            Regístrate y recibe un pase para acceder a nuestro menú de negronis a
            <strong style={{ color: 'var(--color-cream)' }}> $120</strong>.
          </p>

          <a
            href="/lenox-negroniweek"
            className="inline-block font-mono uppercase tracking-[0.2em] transition-transform hoverable"
            style={{
              background: 'var(--color-lenox-red)',
              color: '#f5efe3',
              padding: '14px 28px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Recibir mi pase
          </a>
        </div>
      </div>
    </section>
  )
}
