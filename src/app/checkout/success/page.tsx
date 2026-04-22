import Link from 'next/link'

export const metadata = { title: 'Boletos confirmados — Parker & Lenox' }

export default function SuccessPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-8 text-center">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 40% 50% at 50% 40%, rgba(30,51,40,0.25), transparent 60%)' }}
      />

      <div className="relative z-10">
        <span className="font-serif text-5xl block mb-6" style={{ color: 'var(--color-parker-bronze)' }}>
          ◆
        </span>
        <p className="font-mono text-[0.6rem] tracking-[0.5em] uppercase mb-4"
          style={{ color: 'var(--color-parker-bronze)' }}>
          Confirmado
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-light text-cream mb-4">
          Tus boletos están en camino.
        </h1>
        <p className="font-body text-base mb-10" style={{ color: 'rgba(237,232,220,0.5)', fontWeight: 300 }}>
          Revisa tu correo — recibirás un PDF por boleto.
        </p>
        <Link
          href="/cartelera"
          className="inline-flex items-center gap-4 font-mono text-[0.65rem] tracking-[0.3em] uppercase text-cream hoverable"
        >
          <span className="w-8 h-px block" style={{ background: 'var(--color-parker-bronze)' }} />
          Ver más eventos
        </Link>
      </div>
    </div>
  )
}
