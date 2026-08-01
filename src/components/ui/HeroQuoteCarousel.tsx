'use client'

import { useEffect, useState } from 'react'

interface Quote {
  title: string        // frase entre comillas (título real del artículo)
  framing: string      // frase secundaria de contexto
  outlet: string
  year: number
}

const QUOTES: Quote[] = [
  {
    title: '36 Hours in Mexico City',
    framing: 'incluye a Parker & Lenox en su recomendación de jazz en vivo.',
    outlet: 'The New York Times',
    year: 2022,
  },
  {
    title: 'The Best Craft Cocktail Bars in Mexico City',
    framing: 'Entre los mejores bares de coctelería artesanal de la CDMX.',
    outlet: 'Tasting Table',
    year: 2017,
  },
  {
    title: 'The speakeasy with live music and craft cocktails',
    framing: 'Perfil dedicado al venue oculto en la Juárez.',
    outlet: 'Travesías',
    year: 2019,
  },
  {
    title: 'The ultimate romantic weekend in Mexico City',
    framing: 'Parada recomendada por su música en vivo en el cuarto trasero.',
    outlet: 'Lonely Planet',
    year: 2025,
  },
]

const ROTATE_MS = 6500

export function HeroQuoteCarousel() {
  const [i, setI]   = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setI(x => (x + 1) % QUOTES.length), ROTATE_MS)
    return () => clearInterval(t)
  }, [paused])

  return (
    <div
      className="mb-24 md:mb-28 max-w-3xl mx-auto text-center px-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Contenedor con altura mínima para evitar reflow al cambiar de cita */}
      <div className="relative min-h-[220px] md:min-h-[240px] flex items-center justify-center">
        {QUOTES.map((q, idx) => (
          <blockquote
            key={idx}
            className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700 ease-out"
            style={{ opacity: idx === i ? 1 : 0, pointerEvents: idx === i ? 'auto' : 'none' }}
            aria-hidden={idx !== i}
          >
            <p className="font-serif italic font-light text-cream leading-[1.15]"
              style={{ fontSize: 'clamp(1.7rem, 3.2vw, 2.6rem)' }}>
              <span className="opacity-40 mr-1" style={{ color: 'var(--color-parker-bronze)' }}>“</span>
              {q.title}
              <span className="opacity-40 ml-1" style={{ color: 'var(--color-parker-bronze)' }}>”</span>
            </p>
            <p className="mt-4 font-body font-light"
              style={{ fontSize: 'clamp(0.95rem, 1.1vw, 1.05rem)', color: 'rgba(237,232,220,0.55)' }}>
              {q.framing}
            </p>
            <footer className="mt-6 flex items-center justify-center gap-3">
              <span className="w-8 h-px" style={{ background: 'var(--color-parker-bronze)', opacity: 0.5 }} />
              <cite className="font-mono text-[0.6rem] tracking-[0.4em] uppercase not-italic" style={{ color: 'var(--color-parker-bronze)' }}>
                {q.outlet} · {q.year}
              </cite>
              <span className="w-8 h-px" style={{ background: 'var(--color-parker-bronze)', opacity: 0.5 }} />
            </footer>
          </blockquote>
        ))}
      </div>

      {/* Dots navegables */}
      <div className="mt-6 flex items-center justify-center gap-2" role="tablist" aria-label="Menciones destacadas">
        {QUOTES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            role="tab"
            aria-selected={idx === i}
            aria-label={`Ver mención ${idx + 1} de ${QUOTES.length}`}
            onClick={() => setI(idx)}
            className="w-6 h-6 flex items-center justify-center hoverable"
          >
            <span
              className="block h-px transition-all duration-300"
              style={{
                width:  idx === i ? '20px' : '10px',
                background: idx === i ? 'var(--color-parker-bronze)' : 'rgba(255,255,255,0.2)',
              }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
