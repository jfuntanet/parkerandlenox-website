import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

// Prosa real en la home. Google la eligió para todo el clúster "jazz cdmx"
// (pos 6-8) pero sólo tenía ~60 palabras rastreables: la mayoría del texto
// eran las tarjetas de la cartelera. Esto le da contenido que rankear y, de
// paso, responde lo que la gente pregunta antes de venir.
export async function AboutSection() {
  const t = await getTranslations('about')

  const BLOCKS = [
    { key: 'salas',  href: '/lenox',     cta: t('salas.cta') },
    { key: 'programa', href: '/cartelera', cta: t('programa.cta') },
    { key: 'llegar', href: '/faqs',      cta: t('llegar.cta') },
  ] as const

  return (
    <section className="px-6 sm:px-12 md:px-20 py-24 border-t border-white/[0.08]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="font-mono text-[0.6rem] tracking-[0.5em] uppercase mb-5"
            style={{ color: 'var(--color-parker-bronze)' }}>
            {t('eyebrow')}
          </p>
          <h2 className="font-serif font-light text-cream leading-[1.1] max-w-2xl mx-auto"
            style={{ fontSize: 'clamp(1.7rem, 3.2vw, 2.6rem)' }}>
            {t('title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {BLOCKS.map(b => (
            <div key={b.key}>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-6 h-px" style={{ background: 'var(--color-parker-bronze)' }} />
                <h3 className="font-mono uppercase tracking-[0.35em]"
                  style={{ color: 'var(--color-parker-bronze)', fontSize: 'clamp(0.65rem, 0.75vw, 0.75rem)' }}>
                  {t(`${b.key}.title`)}
                </h3>
              </div>
              <p className="font-body font-light leading-relaxed"
                style={{ fontSize: 'clamp(0.92rem, 1vw, 1rem)', color: 'rgba(237,232,220,0.68)' }}>
                {t(`${b.key}.body`)}
              </p>
              <Link href={b.href}
                className="inline-block mt-4 font-mono text-[0.62rem] tracking-[0.3em] uppercase border-b pb-1 transition-colors hoverable"
                style={{ color: 'var(--color-parker-bronze)', borderColor: 'rgba(160,120,74,0.4)' }}>
                {b.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
