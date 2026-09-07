import { Fragment } from 'react'
import { Link } from '@/i18n/navigation'
import type { TicketPackage } from '@/types/api'
import { formatPrice } from '@/lib/format'

interface Props {
  pkg: TicketPackage
}

// Card compacta de un "Ciclo": los N pósters chicos lado a lado con un "+" entre
// ellos (object-contain, sin recorte) y abajo la explicación del paquete.
export function CicloCard({ pkg }: Props) {
  const bronze = 'var(--color-parker-bronze)'

  return (
    <Link
      href={`/ciclo/${pkg.slug}`}
      className="group block max-w-xl md:max-w-3xl lg:max-w-6xl mx-auto rounded-2xl border p-4 sm:p-6 md:p-8 lg:p-10 hoverable transition-all duration-300 hover:-translate-y-0.5"
      style={{ background: '#141414', borderColor: 'rgba(160,120,74,0.35)' }}
    >
      {/* Los N pósters con un + de por medio */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-5 lg:gap-6">
        {pkg.nights.map((n, i) => (
          <Fragment key={n.slug}>
            <div className="relative w-[30%] max-w-[128px] md:w-[224px] md:max-w-none md:min-w-0 lg:w-[272px] aspect-[4/5] rounded-lg overflow-hidden bg-black/40">
              {n.imageUrl && (
                <img
                  src={n.imageUrl}
                  alt={n.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              )}
              {pkg.soldOut && <div className="absolute inset-0 bg-black/55" />}
            </div>
            {i < pkg.nights.length - 1 && (
              <span className="font-serif text-2xl sm:text-3xl md:text-5xl lg:text-6xl leading-none select-none" style={{ color: bronze }}>+</span>
            )}
          </Fragment>
        ))}
      </div>

      {/* Explicación del paquete */}
      <div className="text-center mt-5 md:mt-7">
        <h3 className="font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal leading-tight mb-2 md:mb-3">
          {pkg.name}
        </h3>

        {pkg.soldOut ? (
          <p className="font-body text-sm md:text-base lg:text-lg text-white/50 mb-4 md:mb-5">Agotado</p>
        ) : (
          <p className="font-body text-sm md:text-base lg:text-lg text-white/70 mb-4 md:mb-5">
            Entra a los {pkg.nights.length} conciertos por{' '}
            <span style={{ color: bronze }}>{formatPrice(pkg.price)}</span>
            {pkg.savings > 0 && (
              <>
                {' · '}
                <span className="text-white/40 line-through">{formatPrice(pkg.individualPrice)}</span>{' '}
                <span style={{ color: bronze }}>ahorra {formatPrice(pkg.savings)}</span>
              </>
            )}
          </p>
        )}

        <span className="inline-block px-6 py-2 md:px-8 md:py-3 rounded-full font-mono text-[0.6rem] md:text-[0.7rem] tracking-[0.25em] uppercase transition-opacity group-hover:opacity-80"
          style={{ border: `1.5px solid ${bronze}`, color: bronze }}>
          {pkg.soldOut ? 'Agotado' : 'Comprar el ciclo'}
        </span>
      </div>
    </Link>
  )
}
