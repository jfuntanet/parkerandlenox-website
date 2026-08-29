import { Link } from '@/i18n/navigation'
import type { TicketPackage } from '@/types/api'
import { formatPrice, formatDateShort } from '@/lib/format'

interface Props {
  pkg: TicketPackage
}

// Card destacada de un "Ciclo" (paquete de N conciertos). Formato ancho, distinto
// a las cards individuales, para que resalte arriba de la cartelera.
export function CicloCard({ pkg }: Props) {
  const bronze = 'var(--color-parker-bronze)'

  return (
    <Link
      href={`/ciclo/${pkg.slug}`}
      className="group grid grid-cols-1 sm:grid-cols-[minmax(0,40%)_1fr] gap-0 max-w-[1100px] mx-auto rounded-2xl overflow-hidden border hoverable transition-all duration-300 hover:-translate-y-0.5"
      style={{ background: '#161616', borderColor: 'rgba(160,120,74,0.45)' }}
    >
      {pkg.imageUrl && (
        <div className="relative aspect-[16/10] sm:aspect-auto sm:min-h-[220px] overflow-hidden bg-black/40">
          <img
            src={pkg.imageUrl}
            alt={pkg.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {pkg.soldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/65">
              <span className="font-serif italic text-2xl" style={{ color: 'var(--color-lenox-red)' }}>Agotado</span>
            </div>
          )}
        </div>
      )}

      <div className="p-5 sm:p-8 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-6 h-px block" style={{ background: bronze }} />
          <span className="font-mono text-[0.55rem] tracking-[0.35em] uppercase" style={{ color: bronze }}>
            Ciclo · {pkg.nights.length} conciertos
          </span>
        </div>

        <h3 className="font-serif text-2xl sm:text-3xl font-normal leading-tight mb-4">
          {pkg.name}
        </h3>

        <ul className="flex flex-col gap-1.5 mb-5">
          {pkg.nights.map(n => (
            <li key={n.slug} className="flex items-baseline gap-2 font-body text-sm text-white/70">
              <span className="font-mono text-[0.6rem] tracking-widest uppercase whitespace-nowrap" style={{ color: bronze }}>
                {formatDateShort(n.date)}
              </span>
              <span className="truncate">{n.title.replace(/^Coltrane 100 presenta:\s*/i, '')}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3 mb-5">
          {!pkg.soldOut && (
            <>
              <span className="font-serif text-2xl" style={{ color: bronze }}>{formatPrice(pkg.price)}</span>
              {pkg.savings > 0 && (
                <>
                  <span className="font-body text-sm text-white/40 line-through">{formatPrice(pkg.individualPrice)}</span>
                  <span className="font-mono text-[0.55rem] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full"
                    style={{ border: `1px solid ${bronze}`, color: bronze }}>
                    Ahorra {formatPrice(pkg.savings)}
                  </span>
                </>
              )}
            </>
          )}
        </div>

        <span className="w-fit text-center px-6 py-2.5 rounded-full font-mono text-[0.6rem] tracking-[0.25em] uppercase transition-opacity group-hover:opacity-80"
          style={{ border: `1.5px solid ${bronze}`, color: bronze }}>
          {pkg.soldOut ? 'Agotado' : 'Comprar el ciclo'}
        </span>
      </div>
    </Link>
  )
}
