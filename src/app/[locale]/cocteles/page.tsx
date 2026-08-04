import { getTranslations } from 'next-intl/server'
import { MenuPageView } from '@/components/booking/MenuPageView'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'menu.cocteles' })
  return { title: `${t('title')} — Parker & Lenox` }
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
