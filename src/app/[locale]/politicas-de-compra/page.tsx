import { getTranslations } from 'next-intl/server'
import { useTranslations } from 'next-intl'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'policies' })
  return {
    title: `${t('title')} — Parker & Lenox`,
    description: t('title'),
  }
}

export default function PoliticasPage() {
  const t = useTranslations('policies')
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

        <article className="font-body leading-relaxed"
          style={{ color: 'rgba(237,232,220,0.78)', fontSize: 'clamp(0.95rem, 1.05vw, 1.05rem)' }}>

          <h2 className="font-serif text-cream mb-5" style={{ fontSize: 'clamp(1.3rem, 2vw, 1.7rem)' }}>
            {t('ticketsTitle')}
          </h2>

          <ul className="flex flex-col gap-4 pl-1">
            <Item><span dangerouslySetInnerHTML={{ __html: t('item1') }} /></Item>
            <Item><span dangerouslySetInnerHTML={{ __html: t('item2') }} /></Item>
            <Item>
              <span dangerouslySetInnerHTML={{ __html: t('item3prefix') }} />{' '}
              <a href="https://wa.me/525521835107" target="_blank" rel="noopener noreferrer" className="underline hover:text-cream transition-colors"
                style={{ color: 'var(--color-parker-bronze)' }}>
                +52 55 2183 5107
              </a>{' '}
              {t('item3middle')}{' '}
              <a href="mailto:rsvp@parkerandlenox.com" className="underline hover:text-cream transition-colors"
                style={{ color: 'var(--color-parker-bronze)' }}>
                rsvp@parkerandlenox.com
              </a>{t('item3suffix')}
            </Item>
            <Item><span dangerouslySetInnerHTML={{ __html: t('item4') }} /></Item>
            <Item><span dangerouslySetInnerHTML={{ __html: t('item5') }} /></Item>
            <Item>
              {t('item6prefix')}{' '}
              <a href="https://wa.me/525521835107" target="_blank" rel="noopener noreferrer" className="underline hover:text-cream transition-colors"
                style={{ color: 'var(--color-parker-bronze)' }}>
                +52 55 2183 5107
              </a>{t('item6suffix')}
            </Item>
          </ul>

          <section className="mt-12 pt-8 border-t border-white/[0.08]">
            <h2 className="font-serif text-cream mb-5" style={{ fontSize: 'clamp(1.3rem, 2vw, 1.7rem)' }}>
              {t('contactTitle')}
            </h2>
            <p className="mb-2">
              <span className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--color-parker-bronze)' }}>{t('contactAddress')}</span>
              <br />
              {t('addressValue')}
            </p>
            <p className="mt-4">
              <span className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--color-parker-bronze)' }}>{t('contactWhatsapp')}</span>
              <br />
              <a href="https://wa.me/525521835107" target="_blank" rel="noopener noreferrer" className="underline hover:text-cream transition-colors"
                style={{ color: 'var(--color-parker-bronze)' }}>
                +52 55 2183 5107
              </a>
            </p>
            <p className="mt-4">
              <span className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--color-parker-bronze)' }}>{t('contactEmail')}</span>
              <br />
              <a href="mailto:hello@parkerandlenox.com" className="underline hover:text-cream transition-colors"
                style={{ color: 'var(--color-parker-bronze)' }}>
                hello@parkerandlenox.com
              </a>
            </p>
          </section>
        </article>
      </div>
    </div>
  )
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-2 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--color-parker-bronze)' }} />
      <span>{children}</span>
    </li>
  )
}
