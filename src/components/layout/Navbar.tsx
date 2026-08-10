'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const t = useTranslations('nav')

  const LINKS = [
    { href: '/cartelera',  label: t('cartelera') },
    { href: '/lenox',      label: t('lenox') },
    { href: '/cocina',     label: t('cocina') },
    { href: '/cocteles',   label: t('cocteles') },
    { href: '/faqs',       label: t('faqs') },
    { href: '/prensa',     label: t('prensa') },
    { href: '/musicos',    label: t('musicos') },
  ]

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const overlayCls = 'fixed inset-0 z-40 bg-black transition-opacity duration-500 ' +
    (open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-2 md:px-8 py-5 flex items-center justify-between bg-black border-b border-white/[0.08]">
        <Link href="/" className="hoverable relative z-50 flex items-center" onClick={() => setOpen(false)}>
          <img src="/parker-lenox-logo.webp" alt="Parker & Lenox" className="h-8 md:h-12 w-auto" />
        </Link>

        <div className="relative z-50 flex items-center gap-4">
          <LanguageSwitcher />
          <button
            type="button"
            aria-label={open ? t('menuClose') : t('menuOpen')}
            aria-expanded={open}
            onClick={() => setOpen(o => !o)}
            className="w-10 h-10 flex flex-col items-center justify-center gap-[6px] hoverable"
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
        </div>
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
