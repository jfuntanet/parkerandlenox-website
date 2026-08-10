export const metadata = {
  title: 'Para músicos — Parker & Lenox',
  description: 'Postula tu proyecto para tocar en Parker & Lenox. Programamos jazz, blues, soul, funk y latin jazz de martes a sábado en la CDMX.',
  alternates: {
    canonical: '/musicos',
    languages: { es: '/musicos', en: '/en/musicos', 'x-default': '/musicos' },
  },
}

import { MusicoForm } from '@/components/booking/MusicoForm'

export default function MusicosPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-10">
          <p className="font-mono text-[0.6rem] tracking-[0.5em] uppercase mb-4"
            style={{ color: 'var(--color-parker-bronze)' }}>
            Para músicos
          </p>
          <h1 className="font-serif font-light text-cream leading-[1.05]"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
            Postula tu proyecto.
          </h1>
          <div className="mt-6 mx-auto h-px w-16"
            style={{ background: 'var(--color-parker-bronze)', opacity: 0.4 }} />
          <p className="mt-6 mx-auto max-w-lg font-body font-light leading-relaxed"
            style={{ fontSize: 'clamp(0.95rem, 1.1vw, 1.1rem)', color: 'rgba(237,232,220,0.65)' }}>
            Parker &amp; Lenox es el espacio para proyectos originales nacionales e internacionales.
            Nos apasiona la buena música — la música hecha por y para humanos, la que nos conecta y
            nos hace sentir vivos. Puedes ser parte de nuestra misión: cuéntanos de tu proyecto y
            lo revisaremos.
          </p>
        </div>

        <MusicoForm />

        <p className="mt-10 text-center font-mono text-[0.55rem] tracking-[0.4em] uppercase text-white/40">
          Programación musical por Oscar Adad
        </p>
      </div>
    </div>
  )
}
