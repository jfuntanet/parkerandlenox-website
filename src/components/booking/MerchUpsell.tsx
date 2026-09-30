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

// Llave del carrito: "productId" o "productId:variantId" para productos con talla.
export type CartMap = Map<string, number>

export function cartKey(productId: string, variantId?: string | null): string {
  return variantId ? `${productId}:${variantId}` : productId
}

export function parseCartKey(key: string): { productId: string; variantId: string | null } {
  const [productId, variantId] = key.split(':')
  return { productId, variantId: variantId || null }
}

// Etiqueta corta de talla: "Extra Large (XL)" → "XL". El color solo se muestra si
// el producto tiene tallas en más de un color (si todas son iguales, sobra).
function variantLabel(v: MerchProductVariant, all?: MerchProductVariant[]): string {
  const abbr = v.size?.match(/\(([^)]+)\)/)?.[1]?.trim() || v.size || ''
  const colors = new Set((all ?? [v]).map(x => x.color).filter(Boolean))
  const showColor = colors.size > 1 && v.color
  return [abbr, showColor ? v.color : null].filter(Boolean).join(' · ')
}

// Datos de una línea del carrito: título con talla, precio y stock de ESA talla.
export function cartLine(key: string, products: MerchProduct[] | null) {
  const { productId, variantId } = parseCartKey(key)
  const p = products?.find(x => x.id === productId)
  if (!p) return null
  const v = variantId ? p.variants?.find(x => x.id === variantId) : undefined
  if (variantId && !v) return null
  return {
    product: p,
    productId,
    variantId,
    title: v ? `${p.title} · ${variantLabel(v, p.variants)}` : p.title,
    unit: v?.priceOverride != null ? Number(v.priceOverride) : Number(p.price),
    stock: v ? Math.max(0, Number(v.stock || 0)) : Math.max(0, Number(p.stock || 0)),
  }
}

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
  // Talla elegida por producto (solo productos con variantes).
  const [sizeByProduct, setSizeByProduct] = useState<Record<string, string>>({})

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

  function setQty(key: string, qty: number) {
    const next = new Map(cart)
    if (qty <= 0) next.delete(key)
    else next.set(key, qty)
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
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
      {products.map(p => {
        const hasSizes = (p.variants?.length ?? 0) > 0
        const size = hasSizes ? p.variants.find(v => v.id === sizeByProduct[p.id]) : undefined
        const key = cartKey(p.id, size?.id)
        const qty = hasSizes && !size ? 0 : (cart.get(key) ?? 0)
        const stockAvail = availableStock(p)
        const soldOut = stockAvail <= 0
        const maxQty = Math.min(10, size ? Math.max(0, Number(size.stock || 0)) : stockAvail)
        const needsSize = hasSizes && !size
        return (
          <div key={p.id}
            className="rounded-xl border border-white/[0.10] overflow-hidden flex flex-row sm:flex-col"
            style={{ background: '#1a1a1a' }}>
            <MerchImage product={p} soldOut={soldOut} />
            <div className="p-3 sm:p-4 flex flex-col flex-1 min-w-0 gap-2">
              <h3 className="font-serif text-lg sm:text-xl md:text-lg leading-tight text-cream line-clamp-2">{p.title}</h3>
              <p className="font-serif text-base sm:text-lg md:text-base" style={{ color: accent }}>
                {formatPrice(p.price)} <span className="font-mono text-xs md:text-[0.55rem] tracking-widest text-white/50">MXN</span>
              </p>

              {hasSizes && !soldOut && (
                <div className="flex flex-wrap gap-1.5" role="group" aria-label={tMerch('size')}>
                  {p.variants.map(v => {
                    const out = Number(v.stock || 0) <= 0
                    const active = v.id === size?.id
                    return (
                      <button key={v.id} type="button" disabled={out}
                        onClick={() => setSizeByProduct(s => ({ ...s, [p.id]: v.id }))}
                        className="min-w-[2.25rem] px-2 py-1.5 sm:py-1 rounded-full font-mono text-xs border transition-colors hoverable disabled:opacity-25 disabled:line-through disabled:cursor-not-allowed"
                        style={{
                          borderColor: active ? accent : 'rgba(255,255,255,0.2)',
                          background: active ? accent : 'transparent',
                          color: active ? 'var(--color-black)' : 'rgba(237,232,220,0.8)',
                        }}>
                        {variantLabel(v, p.variants)}
                      </button>
                    )
                  })}
                </div>
              )}

              <div className="mt-auto">
                {qty === 0 ? (
                  <button type="button" disabled={soldOut || needsSize || maxQty <= 0} onClick={() => setQty(key, 1)}
                    className="w-full py-2 rounded-full font-mono text-xs md:text-[0.6rem] tracking-[0.15em] sm:tracking-[0.25em] uppercase whitespace-nowrap border transition-all duration-300 hoverable disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      borderColor: soldOut ? 'rgba(160,120,74,0.25)' : accent,
                      color:       soldOut ? 'rgba(160,120,74,0.4)'  : accent,
                    }}
                    onMouseEnter={e => { if (!soldOut) { e.currentTarget.style.background = accent; e.currentTarget.style.color = 'var(--color-black)' } }}
                    onMouseLeave={e => { if (!soldOut) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = accent } }}>
                    {needsSize && !soldOut ? tMerch('pickSize') : tMerch('add')}
                  </button>
                ) : (
                  <div className="flex items-center justify-start sm:justify-center gap-3">
                    <button type="button" aria-label={tMerch('decrease')} onClick={() => setQty(key, qty - 1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center font-serif text-lg leading-none hover:opacity-80 transition-opacity hoverable"
                      style={{ background: 'var(--color-parker-bronze)', color: 'var(--color-black)' }}>−</button>
                    <span className="font-serif text-xl text-cream min-w-[2ch] text-center leading-none">{qty}</span>
                    <button type="button" aria-label={tMerch('increase')} disabled={qty >= maxQty} onClick={() => setQty(key, qty + 1)}
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
  for (const [key, q] of cart.entries()) {
    const line = cartLine(key, products)
    if (line && q > 0) s += line.unit * q
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
    <div className="relative aspect-square w-28 sm:w-auto shrink-0 self-start sm:self-auto overflow-hidden flex items-center justify-center"
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
