'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export default function CheckoutError({ error }: { error: Error }) {
  const t = useTranslations('checkoutError')
  return (
    <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center px-8 text-center">
      <p className="font-mono text-[0.6rem] tracking-widest uppercase mb-4"
        style={{ color: 'var(--color-lenox-red)' }}>
        {t('eyebrow')}
      </p>
      <p className="font-serif text-2xl font-light text-cream mb-8">
        {error.message || t('fallback')}
      </p>
      <Link
        href="/cartelera"
        className="font-mono text-[0.6rem] tracking-widest uppercase text-white/40 hover:text-cream transition-colors hoverable"
      >
        {t('backLink')}
      </Link>
    </div>
  )
}
