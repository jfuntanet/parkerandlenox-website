'use server'

import { redirect } from 'next/navigation'

const BASE = process.env.CORE_API_URL!
const API_KEY = process.env.CORE_API_KEY!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export async function initiateCheckout(formData: FormData) {
  const slug          = formData.get('slug')          as string
  const ticketTypeId  = formData.get('ticketTypeId')  as string
  const quantity      = Number(formData.get('quantity'))
  const customerName  = formData.get('customerName')  as string
  const customerEmail = formData.get('customerEmail') as string

  if (!slug || !ticketTypeId || !quantity || !customerName || !customerEmail) {
    throw new Error('Todos los campos son requeridos')
  }

  const res = await fetch(`${BASE}/v1/tickets/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({
      slug,
      ticketTypeId,
      quantity,
      customerName,
      customerEmail,
      successUrl: `${APP_URL}/checkout/success`,
      cancelUrl:  `${APP_URL}/cartelera/${slug}`,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || 'Error al procesar la compra')
  }

  const { checkoutUrl } = await res.json() as { checkoutUrl: string }
  redirect(checkoutUrl)
}
