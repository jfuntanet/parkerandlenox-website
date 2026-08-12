'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

export interface CocktailSlide {
  id: string
  name: string
  imageUrl: string
}

interface Props {
  items: CocktailSlide[]
  prevLabel: string
  nextLabel: string
}

// Carrusel de scroll nativo: swipe en móvil, flechas en desktop.
// Sin librería — scroll-snap hace el trabajo y el contenido queda
// en el HTML (rastreable) en vez de montarse por JS.
export function CocktailCarousel({ items, prevLabel, nextLabel }: Props) {
  const trackRef = useRef<HTMLUListElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const sync = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 2)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2)
  }, [])

  useEffect(() => {
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [sync])

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    // Avanza ~una pantalla, alineado al snap
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  const arrowCls = 'hidden md:flex items-center justify-center w-11 h-11 border transition-all duration-300 hoverable disabled:opacity-20 disabled:cursor-default'

  return (
    <div className="relative">
      <ul
        ref={trackRef}
        onScroll={sync}
        className="no-scrollbar flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-2 -mx-6 px-6 sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: 'none' }}
      >
        {items.map(c => (
          <li key={c.id} className="snap-start shrink-0 w-[58vw] sm:w-[34vw] md:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)]">
            <figure>
              <div className="relative w-full aspect-[4/5] overflow-hidden bg-black/40 border border-white/[0.06]">
                <Image src={c.imageUrl} alt={c.name} fill
                  sizes="(max-width: 640px) 58vw, (max-width: 768px) 34vw, 24vw"
                  className="object-cover" />
              </div>
              <figcaption className="mt-3 font-serif font-light text-cream leading-snug"
                style={{ fontSize: 'clamp(0.95rem, 1.1vw, 1.08rem)' }}>
                {c.name}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <div className="hidden md:flex items-center justify-center gap-3 mt-8">
        <button type="button" onClick={() => scrollBy(-1)} disabled={atStart}
          aria-label={prevLabel} className={arrowCls}
          style={{ borderColor: 'rgba(160,120,74,0.45)', color: 'var(--color-parker-bronze)' }}>
          <span className="font-serif text-xl leading-none -mt-0.5">‹</span>
        </button>
        <button type="button" onClick={() => scrollBy(1)} disabled={atEnd}
          aria-label={nextLabel} className={arrowCls}
          style={{ borderColor: 'rgba(160,120,74,0.45)', color: 'var(--color-parker-bronze)' }}>
          <span className="font-serif text-xl leading-none -mt-0.5">›</span>
        </button>
      </div>
    </div>
  )
}
