import { getTranslations } from 'next-intl/server'
import { MenuPageView } from '@/components/booking/MenuPageView'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'menu.cocina' })
  return { title: `${t('title')} — Parker & Lenox` }
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
