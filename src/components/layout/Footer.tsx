import Link from 'next/link'

const links = [
  { href: '/cartelera', label: 'Cartelera' },
  { href: '/discos', label: 'Discos' },
  { href: '/merch', label: 'Merch' },
  { href: '/proyectos', label: 'Proyectos' },
]

export function Footer() {
  return (
    <footer className="border-t border-cream/10 px-6 py-12 md:px-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <p className="font-serif text-xl font-light text-cream">Not a Bot</p>
          <p className="font-sans text-xs text-cream-muted mt-1">Jazz en las Rocas · Ciudad de México</p>
        </div>
        <nav className="flex flex-wrap gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="font-sans text-xs uppercase tracking-widest text-cream-muted hover:text-cream transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-cream/5">
        <p className="font-sans text-xs text-cream-dim">
          © {new Date().getFullYear()} Not a Bot. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
