import { getTranslations, setRequestLocale } from 'next-intl/server'
import { useTranslations } from 'next-intl'

const DESCRIPTIONS = {
  es: 'Horarios, cómo llegar, boletos, reservaciones y qué esperar de cada sala. Todo lo que preguntan antes de venir a Parker & Lenox, en la colonia Juárez.',
  en: 'Hours, how to get here, tickets, reservations and what to expect from each room. Everything people ask before visiting Parker & Lenox in Mexico City.',
} as const

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'faqs' })
  const path = locale === 'es' ? '/faqs' : `/${locale}/faqs`
  return {
    title: `${t('title').replace(/\.$/, '')} — Parker & Lenox`,
    description: DESCRIPTIONS[locale as 'es' | 'en'] ?? DESCRIPTIONS.es,
    alternates: {
      canonical: path,
      languages: { es: '/faqs', en: '/en/faqs', 'x-default': '/faqs' },
    },
  }
}

interface Faq { q: string; a: string }
interface Section { id: string; title: string; faqs: Faq[] }

function HeroFaqCard({ faq }: { faq: Faq }) {
  return (
    <details className="group h-full">
      <summary className="cursor-pointer list-none flex flex-col gap-3 h-full p-6 md:p-7 border border-white/[0.10] rounded-xl hover:border-white/[0.28] transition-colors hoverable"
        style={{ background: 'linear-gradient(160deg, rgba(160,120,74,0.05), rgba(255,255,255,0) 60%)' }}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-serif font-light text-cream leading-snug flex-1"
            style={{ fontSize: 'clamp(1.15rem, 1.5vw, 1.4rem)' }}>
            {faq.q}
          </h2>
          <span className="font-serif text-2xl leading-none transition-transform duration-300 group-open:rotate-45 shrink-0"
            style={{ color: 'var(--color-parker-bronze)' }}>+</span>
        </div>
        <p className="font-body text-sm md:text-base leading-relaxed opacity-0 max-h-0 group-open:opacity-100 group-open:max-h-96 transition-all duration-500 overflow-hidden"
          style={{ color: 'rgba(237,232,220,0.72)' }}>
          {faq.a}
        </p>
      </summary>
    </details>
  )
}

export default function FaqsPage({ params }: { params: Promise<{ locale: string }> }) {
  return <FaqsInner paramsPromise={params} />
}

function FaqsInner({ paramsPromise }: { paramsPromise: Promise<{ locale: string }> }) {
  const t = useTranslations('faqs')

  const HERO_FAQS: Faq[] = [
    { q: t('hero.whatQ'), a: t('hero.whatA') },
    { q: t('hero.hoursQ'), a: t('hero.hoursA') },
    { q: t('hero.reservationQ'), a: t('hero.reservationA') },
  ]

  const SECTIONS: Section[] = [
    {
      id: 'sobre-el-lugar',
      title: t('venue.title'),
      faqs: [
        { q: t('venue.diffQ'), a: t('venue.diffA') },
        { q: t('venue.liveQ'), a: t('venue.liveA') },
        { q: t('venue.whereQ'), a: t('venue.whereA') },
        { q: t('venue.parkingQ'), a: t('venue.parkingA') },
      ],
    },
    {
      id: 'boletos-y-entradas',
      title: t('tickets.title'),
      faqs: [
        { q: t('tickets.howQ'), a: t('tickets.howA') },
        { q: t('tickets.groupsQ'), a: t('tickets.groupsA') },
        { q: t('tickets.soldoutQ'), a: t('tickets.soldoutA') },
        { q: t('tickets.coverQ'), a: t('tickets.coverA') },
      ],
    },
    {
      id: 'la-noche-del-evento',
      title: t('night.title'),
      faqs: [
        { q: t('night.lenoxQ'), a: t('night.lenoxA') },
        { q: t('night.saturdayQ'), a: t('night.saturdayA') },
        { q: t('night.includesQ'), a: t('night.includesA') },
        { q: t('night.afterQ'), a: t('night.afterA') },
      ],
    },
  ]

  // FAQPage: las respuestas ya están en el DOM, esto sólo las declara para
  // que Google pueda mostrarlas como rich result.
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [...HERO_FAQS, ...SECTIONS.flatMap(s => s.faqs)].map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <div className="relative min-h-screen pt-28 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at 25% 10%, rgba(160,120,74,0.10) 0%, transparent 55%)' }} />

      <div className="relative z-10 px-6 sm:px-12 md:px-20 lg:px-24 xl:px-32">

        <section className="mb-16 md:mb-20 max-w-4xl mx-auto text-center">
          <p className="font-mono text-[0.6rem] tracking-[0.5em] uppercase mb-5"
            style={{ color: 'var(--color-parker-bronze)' }}>
            {t('eyebrow')}
          </p>
          <h1 className="font-serif font-light text-cream leading-[1.02]"
            style={{ fontSize: 'clamp(2.2rem, 4.5vw, 4rem)' }}>
            {t('title')}
          </h1>
          <div className="mt-6 mx-auto h-px w-16" style={{ background: 'var(--color-parker-bronze)', opacity: 0.4 }} />
        </section>

        <section className="mb-20 md:mb-28 max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <span className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(160,120,74,0.35))' }} />
            <span className="font-mono uppercase tracking-[0.4em]"
              style={{ color: 'var(--color-parker-bronze)', fontSize: 'clamp(0.7rem, 0.9vw, 0.85rem)' }}>
              {t('heroSectionLabel')}
            </span>
            <span className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(160,120,74,0.35))' }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {HERO_FAQS.map(f => <HeroFaqCard key={f.q} faq={f} />)}
          </div>
        </section>

        <section className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-12">
            {SECTIONS.map(sec => (
              <div key={sec.id}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-6 h-px" style={{ background: 'var(--color-parker-bronze)' }} />
                  <span className="font-mono uppercase tracking-[0.35em]"
                    style={{ color: 'var(--color-parker-bronze)', fontSize: 'clamp(0.65rem, 0.75vw, 0.75rem)' }}>
                    {sec.title}
                  </span>
                </div>

                <div className="flex flex-col divide-y divide-white/[0.06]">
                  {sec.faqs.map(f => (
                    <details key={f.q} className="group py-4">
                      <summary className="cursor-pointer list-none flex items-start justify-between gap-3 hoverable">
                        <span className="font-serif text-base md:text-lg text-cream group-hover:text-white transition-colors leading-snug">
                          {f.q}
                        </span>
                        <span className="font-serif text-lg leading-none transition-transform duration-300 group-open:rotate-45 flex-shrink-0 mt-0.5"
                          style={{ color: 'var(--color-parker-bronze)' }}>+</span>
                      </summary>
                      <p className="font-body text-sm leading-relaxed mt-3"
                        style={{ color: 'rgba(237,232,220,0.7)' }}>
                        {f.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24 max-w-2xl mx-auto text-center">
          <div className="h-px w-24 mx-auto mb-8" style={{ background: 'linear-gradient(to right, transparent, rgba(160,120,74,0.4), transparent)' }} />
          <p className="font-serif font-light text-cream mb-2"
            style={{ fontSize: 'clamp(1.2rem, 1.8vw, 1.6rem)' }}>
            {t('cta.title')}
          </p>
          <p className="font-body font-light text-sm mb-6" style={{ color: 'rgba(237,232,220,0.55)' }}>
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="https://wa.me/525521835107" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.3em] uppercase px-5 py-2.5 border transition-colors hoverable"
              style={{ borderColor: 'var(--color-parker-bronze)', color: 'var(--color-parker-bronze)' }}>
              {t('cta.whatsapp')}
            </a>
            <a href="mailto:hello@parkerandlenox.com"
              className="inline-flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.3em] uppercase px-5 py-2.5 border border-white/15 text-white/60 hover:text-cream hover:border-white/40 transition-colors hoverable">
              {t('cta.email')}
            </a>
          </div>
        </section>

      </div>
    </div>
  )
}
