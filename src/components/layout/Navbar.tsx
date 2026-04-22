'use client'

import Link from 'next/link'
import { useState } from 'react'

const links = [
  { href: '/cartelera', label: 'Cartelera' },
  { href: '/discos', label: 'Discos' },
  { href: '/merch', label: 'Merch' },
  { href: '/proyectos', label: 'Proyectos' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12">
      <div className="absolute inset-0 bg-gradient-to-b from-canvas/90 to-transparent pointer-events-none" />
      <Link
        href="/"
        onClick={() => setOpen(false)}
        className="relative font-serif text-xl font-light text-cream hover:text-gold transition-colors duration-300"
      >
        Not a Bot
      </Link>
      <ul className="relative hidden md:flex items-center gap-8">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="font-sans text-sm uppercase tracking-widest text-cream-muted hover:text-cream transition-colors duration-300"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="relative md:hidden">
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Menú de navegación"
          className="font-sans text-xs uppercase tracking-widest text-cream-muted"
        >
          {open ? 'Cerrar' : 'Menú'}
        </button>
        {open && (
          <ul className="absolute right-0 top-8 bg-canvas border border-cream/10 p-4 flex flex-col gap-4 min-w-[140px]">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="font-sans text-sm text-cream hover:text-gold transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  )
}
