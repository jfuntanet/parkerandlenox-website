'use client'

import { useEffect } from 'react'
import { pushEvent } from '@/lib/analytics'

interface Props {
  slug: string
  title: string
  venue: string
  price: number
}

export function ViewItemEvent({ slug, title, venue, price }: Props) {
  useEffect(() => {
    pushEvent('view_item', {
      ecommerce: {
        currency: 'MXN',
        value: price,
        items: [
          { item_id: slug, item_name: title, item_category: venue, price, quantity: 1 },
        ],
      },
    })
  }, [slug, title, venue, price])
  return null
}
