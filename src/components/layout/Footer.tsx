export function Footer() {
  return (
    <footer className="px-8 md:px-16 py-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-t border-white/[0.06]">
      <div className="font-serif text-xl text-cream">
        Parker <span className="italic" style={{ color: 'var(--color-parker-bronze)' }}>&</span> Lenox
      </div>
      <div className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-white/25 text-center leading-loose">
        Ciudad de México<br />
        Miércoles a Domingo · 8PM — 2AM<br />
        reservas@parkerandlenox.com
      </div>
      <div className="flex flex-col items-start md:items-end gap-2">
        <a href="/cartelera" className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-white/30 hover:text-parker-bronze transition-colors duration-300 hoverable">
          Cartelera
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-white/30 hover:text-parker-bronze transition-colors duration-300 hoverable">
          Instagram
        </a>
      </div>
    </footer>
  )
}
