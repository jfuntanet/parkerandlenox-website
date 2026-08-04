import { getTranslations } from 'next-intl/server'
import { useTranslations, useLocale } from 'next-intl'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'privacy' })
  return {
    title: `${t('title')} — Parker & Lenox`,
    description: t('title'),
  }
}

export default function AvisoPage() {
  const t = useTranslations('privacy')
  const locale = useLocale()

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-mono text-[0.6rem] tracking-[0.5em] uppercase mb-4"
            style={{ color: 'var(--color-parker-bronze)' }}>
            {t('eyebrow')}
          </p>
          <h1 className="font-serif font-light text-cream leading-[1.05]"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
            {t('title')}
          </h1>
          <div className="mt-6 mx-auto h-px w-16"
            style={{ background: 'var(--color-parker-bronze)', opacity: 0.4 }} />
        </div>

        {locale === 'en' && (
          <div className="mb-8 p-4 border border-white/10 rounded-lg text-xs font-mono uppercase tracking-wider"
            style={{ color: 'rgba(237,232,220,0.5)' }}>
            {t('legalDisclaimer')}
          </div>
        )}

        <article className="flex flex-col gap-8 font-body leading-relaxed"
          style={{ color: 'rgba(237,232,220,0.78)', fontSize: 'clamp(0.95rem, 1.05vw, 1.05rem)' }}>

          <Section title={t('section1Title')}>
            <p>{t('section1Body')}</p>
          </Section>

          <Section title={t('section2Title')}>
            <p>{t('section2Intro')}</p>
            <List items={[t('section2Item1'), t('section2Item2'), t('section2Item3'), t('section2Item4')]} />
            <p>{t('section2Outro')}</p>
          </Section>

          <Section title={t('section3Title')}>
            <List items={[t('section3Item1'), t('section3Item2'), t('section3Item3'), t('section3Item4'), t('section3Item5')]} />
          </Section>

          <Section title={t('section4Title')}>
            <p>{t('section4Intro')}</p>
            <List items={[t('section4Item1'), t('section4Item2'), t('section4Item3'), t('section4Item4')]} />
            <p>
              {t('section4OutroPrefix')}{' '}
              <a href="mailto:hello@parkerandlenox.com" className="underline hover:text-cream transition-colors"
                style={{ color: 'var(--color-parker-bronze)' }}>
                hello@parkerandlenox.com
              </a>{t('section4OutroSuffix')}
            </p>
          </Section>

          <Section title={t('section5Title')}>
            <p>{t('section5Intro')}</p>
            <List items={[t('section5Item1'), t('section5Item2')]} />
            <p>{t('section5Outro')}</p>
          </Section>

          <Section title={t('section6Title')}>
            <p>{t('section6Body')}</p>
          </Section>

          <Section title={t('section7Title')}>
            <p>{t('section7Body1')}</p>
            <p>
              {t('section7Body2Prefix')}{' '}
              <a href="mailto:hello@parkerandlenox.com" className="underline hover:text-cream transition-colors"
                style={{ color: 'var(--color-parker-bronze)' }}>
                hello@parkerandlenox.com
              </a>{t('section7Body2Suffix')}
            </p>
          </Section>

          <Section title={t('section8Title')}>
            <p>{t('section8Body')}</p>
          </Section>

          <Section title={t('section9Title')}>
            <p>{t('section9Body')}</p>
          </Section>

          <p className="pt-6 mt-4 border-t border-white/[0.06] font-mono text-xs tracking-widest uppercase text-white/40 text-center">
            {t('updated')}
          </p>
        </article>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-cream mb-3" style={{ fontSize: 'clamp(1.2rem, 1.8vw, 1.5rem)', lineHeight: 1.2 }}>
        {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2 pl-1">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-2 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--color-parker-bronze)' }} />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  )
}
