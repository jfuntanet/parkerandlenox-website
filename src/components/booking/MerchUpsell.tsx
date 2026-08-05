'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { formatPrice } from '@/lib/format'

export interface MerchProductVariant {
  id: string
  size: string | null
  color: string | null
  stock: number
  priceOverride: number | null
}

export interface MerchProduct {
  id: string
  slug: string
  title: string
  description: string | null
  price: number
  imageUrl: string | null
  stock: number
  brand: string
  category: string
  variants: MerchProductVariant[]
}

// Stock disponible = suma de variantes si tiene, si no el stock del producto.
// El endpoint /v1/store/public/products devuelve stock=0 a nivel producto cuando
// existen variantes (el inventario real vive en product_variants.stock).
function availableStock(p: MerchProduct): number {
  if (p.variants && p.variants.length > 0) {
    return p.variants.reduce((s, v) => s + Math.max(0, Number(v.stock || 0)), 0)
  }
  return Math.max(0, Number(p.stock || 0))
}

export type CartMap = Map<string, number>

interface Props {
  cart: CartMap
  onChange: (next: CartMap) => void
  accent: string
}

export function MerchUpsell({ cart, onChange, accent }: Props) {
  const tFlow = useTranslations('checkoutFlow.step3')
  const tMerch = useTranslations('merch')
  const [products, setProducts] = useState<MerchProduct[] | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    fetch('/api/merch')
      .then(r => r.json())
      .then(d => {
        if (!alive) return
        if (Array.isArray(d)) setProducts(d)
        else setErr(d?.error || tFlow('merchLoadError'))
      })
      .catch(() => alive && setErr(tFlow('merchLoadError')))
    return () => { alive = false }
  }, [tFlow])

  function setQty(pid: string, qty: number) {
    const next = new Map(cart)
    if (qty <= 0) next.delete(pid)
    else next.set(pid, qty)
    onChange(next)
  }

  if (err) {
    return (
      <p className="font-body text-sm text-center py-8" style={{ color: 'rgba(237,232,220,0.5)' }}>
        {err}
      </p>
    )
  }
  if (!products) {
    return (
      <p className="font-mono text-[0.6rem] tracking-widest uppercase text-center py-8 text-white/40">
        {tFlow('merchLoading')}
      </p>
    )
  }
  if (products.length === 0) {
    return (
      <p className="font-body text-sm text-center py-8" style={{ color: 'rgba(237,232,220,0.5)' }}>
        {tFlow('merchNone')}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
      {products.map(p => {
        const qty = cart.get(p.id) ?? 0
        const stockAvail = availableStock(p)
        const soldOut = stockAvail <= 0
        const maxQty = Math.min(10, stockAvail)
        return (
          <div key={p.id}
            className="rounded-xl border border-white/[0.10] overflow-hidden flex flex-col"
            style={{ background: '#1a1a1a' }}>
            <MerchImage product={p} soldOut={soldOut} />
            <div className="p-4 flex flex-col flex-1 gap-2">
              <h3 className="font-serif text-xl md:text-lg leading-tight text-cream">{p.title}</h3>
              <p className="font-serif text-lg md:text-base" style={{ color: accent }}>
                {formatPrice(p.price)} <span className="font-mono text-xs md:text-[0.55rem] tracking-widest text-white/50">MXN</span>
              </p>

              <div className="mt-auto">
                {qty === 0 ? (
                  <button type="button" disabled={soldOut} onClick={() => setQty(p.id, 1)}
                    className="w-full py-2.5 md:py-2 rounded-full font-mono text-sm md:text-[0.6rem] tracking-[0.25em] uppercase border transition-colors hoverable disabled:opacity-30"
                    style={{ borderColor: soldOut ? 'rgba(160,120,74,0.25)' : accent, color: soldOut ? 'rgba(160,120,74,0.4)' : accent }}>
                    {tMerch('add')}
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <button type="button" aria-label={tMerch('decrease')} onClick={() => setQty(p.id, qty - 1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center font-serif text-lg leading-none hover:opacity-80 transition-opacity hoverable"
                      style={{ background: 'var(--color-parker-bronze)', color: 'var(--color-black)' }}>−</button>
                    <span className="font-serif text-xl text-cream min-w-[2ch] text-center leading-none">{qty}</span>
                    <button type="button" aria-label={tMerch('increase')} disabled={qty >= maxQty} onClick={() => setQty(p.id, qty + 1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center font-serif text-lg leading-none hover:opacity-80 disabled:opacity-30 transition-opacity hoverable"
                      style={{ background: 'var(--color-parker-bronze)', color: 'var(--color-black)' }}>+</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// helper para calcular subtotal desde el cart + list de productos conocida
export function cartSubtotal(cart: CartMap, products: MerchProduct[] | null): number {
  if (!products || cart.size === 0) return 0
  let s = 0
  for (const p of products) {
    const q = cart.get(p.id) ?? 0
    if (q > 0) s += Number(p.price) * q
  }
  return s
}

// Imagen del producto con fallback al título si la URL está muerta o no existe.
// Necesario mientras 3 productos apuntan a URLs viejas de wp-content que dan 404.
function MerchImage({ product, soldOut }: { product: MerchProduct; soldOut: boolean }) {
  const tMerch = useTranslations('merch')
  const [failed, setFailed] = useState(false)
  const showImg = product.imageUrl && !failed
  return (
    <div className="relative aspect-square overflow-hidden flex items-center justify-center"
      style={{ background: '#1a1a1a' }}>
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.imageUrl!} alt={product.title} loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 w-full h-full object-contain" />
      ) : (
        <span className="font-serif italic text-cream/40 text-base md:text-lg px-4 text-center leading-tight">
          {product.title}
        </span>
      )}
      {soldOut && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <span className="font-mono text-[0.65rem] tracking-widest uppercase text-white/70">{tMerch('soldOut')}</span>
        </div>
      )}
    </div>
  )
}
