import { getTranslations } from 'next-intl/server'
import { MenuPageView } from '@/components/booking/MenuPageView'

export const dynamic = 'force-dynamic'

const DESCRIPTIONS = {
  es: 'Coctelería de autor, destilados, vinos y cerveza en Parker & Lenox. La barra del speakeasy de la colonia Juárez, CDMX.',
  en: 'Signature cocktails, spirits, wine and beer at Parker & Lenox — the bar of the Colonia Juárez speakeasy in Mexico City.',
} as const

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'menu.cocteles' })
  const path = locale === 'es' ? '/cocteles' : `/${locale}/cocteles`
  return {
    title: `${t('title')} — Parker & Lenox`,
    description: DESCRIPTIONS[locale as 'es' | 'en'] ?? DESCRIPTIONS.es,
    alternates: {
      canonical: path,
      languages: { es: '/cocteles', en: '/en/cocteles', 'x-default': '/cocteles' },
    },
  }
}

export default async function CoctelesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'menu' })
  return (
    <MenuPageView
      menuKeyword="barra"
      title={t('cocteles.title')}
      eyebrow={t('cocteles.eyebrow')}
      emptyMsg={t('loading')}
      hidePrices
    />
  )
}
