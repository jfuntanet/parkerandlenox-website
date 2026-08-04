'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

interface Banner {
  src: string
  key: 'ohjazz' | 'sesiones' | 'merch' | 'plx'
  href?: string
  external?: boolean
}

const BANNERS: Banner[] = [
  { src: '/banner-jazz.png',  key: 'ohjazz',   href: 'https://www.ohjazz.tv/home-esp', external: true },
  { src: '/banner-finas.png', key: 'sesiones', href: '/#cartelera' },
  { src: '/banner-merch.png', key: 'merch',    href: 'https://lenoxrecords.com', external: true },
  { src: '/banner-plx.jpg',   key: 'plx',      href: '/#cartelera' },
]

export function BannersSection() {
  const t = useTranslations('banners')
  return (
    <section className="relative px-4 md:px-16 py-16 md:py-20 border-t border-white/[0.08]">
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {BANNERS.map(b => {
          const alt = t(b.key)
          const inner = (
            <div className="relative aspect-[21/10] overflow-hidden rounded-xl border border-white/[0.08] group-hover:border-white/25 transition-colors bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.src}
                alt={alt}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
          )
          if (!b.href) {
            return <div key={b.src} className="group block">{inner}</div>
          }
          return b.external ? (
            <a key={b.src} href={b.href} target="_blank" rel="noopener noreferrer" className="group block hoverable" aria-label={alt}>
              {inner}
            </a>
          ) : (
            <Link key={b.src} href={b.href} className="group block hoverable" aria-label={alt}>
              {inner}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
