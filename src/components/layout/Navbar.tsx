'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/#cartelera', label: 'Cartelera' },
  { href: '/cocina',    label: 'Cocina' },
  { href: '/cocteles',  label: 'Coctelería' },
  { href: '/faqs',      label: 'FAQs' },
  { href: '/prensa',    label: 'Reseñas y Reconocimientos' },
  { href: '/musicos',   label: 'Para Músicos' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const overlayCls = 'fixed inset-0 z-40 bg-black transition-opacity duration-500 ' +
    (open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-5 flex items-center justify-between bg-black border-b border-white/[0.08]">
        <Link href="/" className="font-serif text-xl text-cream hoverable relative z-50 flex items-center gap-1" onClick={() => setOpen(false)}>
          <span>Parker</span>
          <span className="relative inline-block h-6 w-5 overflow-hidden align-middle -ml-1" aria-hidden="true">
            <img src="/parker-lenox-logo.webp" alt=""
              className="absolute left-1/2 top-1/2 h-6 max-w-none"
              style={{ transform: 'translate(-50%, -50%)' }} />
          </span>
          <span>Lenox</span>
        </Link>

        <button
          type="button"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
          className="relative z-50 w-10 h-10 flex flex-col items-center justify-center gap-[6px] hoverable"
        >
          <span
            className="block w-6 h-px bg-cream transition-transform duration-300"
            style={open ? { transform: 'translateY(3.5px) rotate(45deg)' } : {}}
          />
          <span
            className="block w-6 h-px bg-cream transition-transform duration-300"
            style={open ? { transform: 'translateY(-3.5px) rotate(-45deg)' } : {}}
          />
        </button>
      </nav>

      <div className={overlayCls} aria-hidden={!open}>
        <div className="h-full flex flex-col items-center justify-center gap-10 pt-20">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href}
                  className="font-serif text-4xl md:text-6xl text-cream hover:opacity-70 transition-opacity hoverable"
                  onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div className="mt-8 h-px w-16" style={{ background: 'var(--color-parker-bronze)' }} />
          <p className="font-mono text-[0.6rem] tracking-[0.5em] uppercase text-white/40">
            Parker & Lenox · CDMX
          </p>
        </div>
      </div>
    </>
  )
}
