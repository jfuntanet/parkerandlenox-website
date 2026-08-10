import { getTranslations } from 'next-intl/server'
import { MenuPageView } from '@/components/booking/MenuPageView'

export const dynamic = 'force-dynamic'

const DESCRIPTIONS = {
  es: 'La carta de cocina de Parker & Lenox: para cenar antes del concierto o picar durante la noche, en la colonia Juárez, CDMX.',
  en: 'The kitchen menu at Parker & Lenox: dinner before the show or something to share during the night, in Colonia Juárez, Mexico City.',
} as const

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'menu.cocina' })
  const path = locale === 'es' ? '/cocina' : `/${locale}/cocina`
  return {
    title: `${t('title')} — Parker & Lenox`,
    description: DESCRIPTIONS[locale as 'es' | 'en'] ?? DESCRIPTIONS.es,
    alternates: {
      canonical: path,
      languages: { es: '/cocina', en: '/en/cocina', 'x-default': '/cocina' },
    },
  }
}

export default async function ComidaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'menu' })
  return (
    <MenuPageView
      menuKeyword="cocina"
      title={t('cocina.title')}
      eyebrow={t('cocina.eyebrow')}
      emptyMsg={t('loading')}
      hidePrices
    />
  )
}
