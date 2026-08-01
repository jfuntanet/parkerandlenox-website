'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'

export function SalaSelector() {
  const [split, setSplit] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)

  const updateSplit = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = clientX - rect.left
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSplit(pct)
  }, [])

  useEffect(() => {
    const move = (e: MouseEvent | TouchEvent) => {
      if (!draggingRef.current) return
      if ('touches' in e && e.cancelable) e.preventDefault()
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
      updateSplit(clientX)
    }
    const up = () => { draggingRef.current = false; document.body.style.userSelect = '' }
    window.addEventListener('mousemove', move)
    window.addEventListener('touchmove', move, { passive: false })
    window.addEventListener('mouseup', up)
    window.addEventListener('touchend', up)
    window.addEventListener('touchcancel', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('touchmove', move)
      window.removeEventListener('mouseup', up)
      window.removeEventListener('touchend', up)
      window.removeEventListener('touchcancel', up)
    }
  }, [updateSplit])

  const startDrag = (clientX: number) => {
    draggingRef.current = true
    document.body.style.userSelect = 'none'
    updateSplit(clientX)
  }

  // Interpolación gradual desde el centro (50%). Con `range=20`, a 10% off
  // center (split=60 o 40) el color ya va a la mitad; a 20% off (70/30) es tope.
  const CREAM  = [237, 232, 220] as const
  const BRONZE = [160, 120,  74] as const
  const RED    = [192,  32,  42] as const
  const range  = 15
  const lerpColor = (t: number, from: readonly [number,number,number], to: readonly [number,number,number]) => {
    const c = from.map((f, i) => Math.round(f + (to[i] - f) * t))
    return `rgb(${c[0]}, ${c[1]}, ${c[2]})`
  }
  const parkerT = Math.max(0, Math.min(1, (split - 50) / range))
  const lenoxT  = Math.max(0, Math.min(1, (50 - split) / range))
  const parkerColor = lerpColor(parkerT, CREAM, BRONZE)
  const lenoxColor  = lerpColor(lenoxT,  CREAM, RED)

  return (
    <section
      ref={containerRef}
      className="relative min-h-[70vh] overflow-hidden select-none mt-16"
      style={{
        background: 'var(--color-black)',
        touchAction: 'pan-y',
        overscrollBehaviorX: 'contain',
      }}
      aria-label="Arrastra el logo & para descubrir Parker o Lenox"
    >
      {/* PARKER — layer base */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 30% 50%, rgba(30,51,40,0.35), transparent 70%), var(--color-black)' }}
      >
        <h2
          className="absolute top-[38%] -translate-y-1/2 font-serif font-bold leading-none text-right"
          style={{
            fontSize: 'clamp(3rem,8.5vw,6rem)',
            color: parkerColor,
            right: 'calc(50% + 40px)',
          }}
        >
          Parker
        </h2>

        <div
          className="absolute top-[38%] -translate-y-1/2 max-w-[28ch] md:max-w-[36ch] text-left"
          style={{ left: '50%', paddingLeft: '5px' }}
        >
          <p className="font-mono text-[0.6rem] md:text-[0.7rem] tracking-[0.5em] uppercase mb-4" style={{ color: 'var(--color-parker-bronze)' }}>
            Live Music
          </p>
          <p className="font-body font-light leading-relaxed mb-8" style={{ fontSize: 'clamp(1.05rem, 1.5vw, 1.55rem)', color: 'rgba(237,232,220,0.75)' }}>
            Speakeasy con música en vivo todas las noches. Jazz, blues, soul, funk.
          </p>
          <p className="font-body italic" style={{ color: 'rgba(237,232,220,0.65)', fontSize: 'clamp(1rem, 1.35vw, 1.4rem)', fontWeight: 300, letterSpacing: '0.02em' }}>
            La buena música es para quien la sabe encontrar.
          </p>
        </div>
      </div>

      {/* LENOX — layer superior con clip-path */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 70% 50%, rgba(192,32,42,0.2), transparent 70%), radial-gradient(ellipse 60% 50% at 30% 80%, rgba(107,61,34,0.25), transparent 60%), var(--color-black-lenox, #05050a)',
          clipPath: `inset(0 0 0 ${split}%)`,
        }}
      >
        <div
          className="absolute top-[38%] -translate-y-1/2 max-w-[28ch] md:max-w-[36ch] text-right"
          style={{ right: '50%', paddingRight: '5px' }}
        >
          <p className="font-mono text-[0.6rem] md:text-[0.7rem] tracking-[0.5em] uppercase mb-4" style={{ color: 'var(--color-lenox-red)' }}>
            Hi-Fi
          </p>
          <p className="font-body font-light leading-relaxed mb-8" style={{ fontSize: 'clamp(1.05rem, 1.5vw, 1.55rem)', color: 'rgba(237,232,220,0.75)' }}>
            Selectores de vinilos y coctelería especializada.
          </p>
          <p className="font-body italic" style={{ color: 'rgba(237,232,220,0.65)', fontSize: 'clamp(1rem, 1.35vw, 1.4rem)', fontWeight: 300, letterSpacing: '0.02em' }}>
            Ven por un cocktail, quédate por la música.
          </p>
        </div>

        <h2
          className="absolute top-[38%] -translate-y-1/2 font-serif italic font-bold leading-none text-left"
          style={{
            fontSize: 'clamp(3rem,8.5vw,6rem)',
            color: lenoxColor,
            left: 'calc(50% + 40px)',
          }}
        >
          Lenox
        </h2>
      </div>

      {/* Handle: logo & como divisor draggable */}
      <div
        role="slider"
        aria-label="Arrastra para descubrir Parker o Lenox"
        aria-valuenow={Math.round(split)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX) }}
        onTouchStart={(e) => { e.preventDefault(); startDrag(e.touches[0].clientX) }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setSplit(s => Math.max(0, s - 5))
          if (e.key === 'ArrowRight') setSplit(s => Math.min(100, s + 5))
        }}
        className="absolute top-0 bottom-0 z-20 flex flex-col items-center justify-center cursor-ew-resize hoverable focus:outline-none"
        style={{
          left: `${split}%`,
          transform: 'translateX(-50%)',
          width: '48px',
          touchAction: 'none',
        }}
      >
        <div
          className="absolute top-0 bottom-0 w-px"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(160,120,74,0.4) 15%, rgba(160,120,74,0.4) 85%, transparent)' }}
        />
        <div
          className="absolute top-[38%] md:top-[39%] -translate-y-1/2 z-10 flex items-center justify-center rounded-full transition-transform duration-300 w-12 h-12 md:w-16 md:h-16"
          style={{
            background: 'var(--color-black)',
            boxShadow: '0 0 40px rgba(160,120,74,0.15)',
          }}
        >
          <img src="/parker-lenox-ring.webp" alt="Parker & Lenox" className="w-full h-full pointer-events-none" draggable={false} />
        </div>
        <p
          className="absolute font-mono text-[0.55rem] tracking-[0.3em] uppercase whitespace-nowrap opacity-40 top-[calc(38%+40px)] md:top-[calc(39%+55px)]"
          style={{ color: 'var(--color-parker-bronze)' }}
        >
          ← arrastra →
        </p>
      </div>

{/* Frase inferior — mantra */}
      <div className="absolute bottom-[10%] left-0 right-0 z-30 pointer-events-none text-center px-6">
        <p className="font-mono uppercase text-white/60" style={{ fontSize: 'clamp(0.55rem, 1vw, 0.7rem)', letterSpacing: '0.4em' }}>
          Un lugar. Dos experiencias.
        </p>
      </div>
    </section>
  )
}
