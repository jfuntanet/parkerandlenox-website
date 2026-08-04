export const dynamic = 'force-dynamic'
export const metadata = { title: 'Boletos confirmados — Parker & Lenox' }

import { SuccessView } from '@/components/booking/SuccessView'

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
