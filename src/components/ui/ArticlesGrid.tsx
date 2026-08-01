'use client'

import { useRef, useState, useEffect } from 'react'
import { FeaturedCard } from './FeaturedCard'
import type { PressMention } from '@/data/press-data'

export function ArticlesGrid({ featured }: { featured: PressMention[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft]   = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => {
      const atStart = el.scrollLeft <= 4
      const atEnd   = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
      setCanScrollLeft(!atStart)
      setCanScrollRight(!atEnd)
    }
    check()
    el.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      el.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [])

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' })
  }

  const arrowStyle = (enabled: boolean) => ({
    background: 'rgba(0,0,0,0.35)',
    borderColor: enabled ? 'rgba(160,120,74,0.5)' : 'rgba(160,120,74,0.12)',
    color:       enabled ? 'var(--color-parker-bronze)' : 'rgba(160,120,74,0.22)',
  })

  return (
    <>
      {/* Header con las flechas al extremo derecho para no descuadrar el inicio de las cards */}
      <div className="flex items-center gap-4 mb-4">
        <span className="font-mono uppercase tracking-[0.4em] shrink-0"
          style={{ color: 'var(--color-parker-bronze)', fontSize: 'clamp(0.7rem, 0.9vw, 0.85rem)' }}>
          Artículos y reseñas
        </span>
        <span className="flex-1 h-px"
          style={{ background: 'linear-gradient(to right, rgba(160,120,74,0.35), transparent)' }} />
        <div className="hidden lg:flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            disabled={!canScrollLeft}
            aria-label="Ver artículos anteriores"
            className="flex items-center justify-center w-9 h-9 rounded-full border transition-colors duration-300 hoverable disabled:cursor-not-allowed"
            style={arrowStyle(canScrollLeft)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            disabled={!canScrollRight}
            aria-label="Ver siguientes artículos"
            className="flex items-center justify-center w-9 h-9 rounded-full border transition-colors duration-300 hoverable disabled:cursor-not-allowed"
            style={arrowStyle(canScrollRight)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Grid de cards — mobile vertical, desktop 2×N horizontal con scroll snap */}
      <div
        ref={ref}
        className="grid gap-4 grid-cols-1 sm:grid-cols-2
                   lg:flex-1 lg:min-h-0 lg:min-w-0 lg:grid-cols-none lg:grid-rows-2 lg:grid-flow-col lg:auto-rows-fr lg:gap-3 lg:overflow-x-auto lg:pb-2 lg:snap-x lg:snap-mandatory
                   lg:[grid-auto-columns:calc((100%-1.5rem)/3)]
                   lg:[scrollbar-width:none] lg:[-ms-overflow-style:none] lg:[&::-webkit-scrollbar]:hidden"
      >
        {featured.map(m => (
          <div key={m.id} className="lg:snap-start lg:h-[95%] lg:min-h-0">
            <FeaturedCard mention={m} />
          </div>
        ))}
      </div>
    </>
  )
}
