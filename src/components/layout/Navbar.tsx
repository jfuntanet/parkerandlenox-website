import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between">
      <Link href="/" className="font-serif text-xl text-cream hoverable">
        Parker <span className="italic" style={{ color: 'var(--color-parker-bronze)' }}>&</span> Lenox
      </Link>
      <Link
        href="/cartelera"
        className="font-mono text-[0.6rem] tracking-[0.4em] uppercase text-cream-muted hover:text-cream transition-colors duration-300 hoverable"
      >
        Cartelera
      </Link>
    </nav>
  )
}
