'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'

export function LanguageSwitcher() {
  const locale = useLocale()
  const t = useTranslations('langSwitcher')
  const router = useRouter()
  const pathname = usePathname()

  const change = (target: 'es' | 'en') => {
    if (target === locale) return
    router.replace(pathname, { locale: target })
  }

  const cls = (active: boolean) =>
    `font-mono uppercase text-[0.7rem] tracking-[0.2em] hoverable transition-colors ${
      active ? 'text-cream' : 'text-white/40 hover:text-white/70'
    }`

  return (
    <div role="group" aria-label={t('aria')} className="flex items-center gap-1.5">
      <button type="button" onClick={() => change('es')} className={cls(locale === 'es')}>
        {t('es')}
      </button>
      <span className="text-white/20">|</span>
      <button type="button" onClick={() => change('en')} className={cls(locale === 'en')}>
        {t('en')}
      </button>
    </div>
  )
}
