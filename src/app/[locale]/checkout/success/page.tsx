import { getTranslations } from 'next-intl/server'
import { SuccessView } from '@/components/booking/SuccessView'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'success' })
  return { title: t('metaTitle') }
}

interface Props {
  searchParams: Promise<{ payment_intent?: string; redirect_status?: string; order_id?: string; free?: string }>
}

export default async function SuccessPage({ searchParams }: Props) {
  const sp = await searchParams
  const pi = sp.payment_intent || ''
  const status = sp.redirect_status || ''
  const orderId = sp.order_id || ''
  const isFree = sp.free === '1'
  return <SuccessView paymentIntent={pi} redirectStatus={status} orderId={orderId} isFree={isFree} />
}
