import { ArticlesGrid } from '@/components/ui/ArticlesGrid'
import { HeroQuoteCarousel } from '@/components/ui/HeroQuoteCarousel'
import { PrintReviewCard } from '@/components/ui/PrintReviewCard'
import { mentions, FEATURED_IDS, HIDDEN_IDS, printReviews, type PressMention } from '@/data/press-data'

export const metadata = {
  title: 'Prensa — Parker & Lenox',
  description: 'Reseñas de la prensa y reconocimientos que ha recibido Parker & Lenox.',
  alternates: { canonical: '/prensa' },
  openGraph: {
    title: 'Reseñas y Reconocimientos — Parker & Lenox',
    description: 'Reseñas de la prensa y reconocimientos que ha recibido Parker & Lenox.',
    url: '/prensa',
    type: 'article',
  },
}

function SubsectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <span className="font-mono uppercase tracking-[0.4em]"
        style={{ color: 'var(--color-parker-bronze)', fontSize: 'clamp(0.7rem, 0.9vw, 0.85rem)' }}>
        {label}
      </span>
      <span className="flex-1 h-px"
        style={{ background: 'linear-gradient(to right, rgba(160,120,74,0.35), transparent)' }} />
    </div>
  )
}

export default function PrensaPage() {
  const hidden   = new Set(HIDDEN_IDS)
  const featured: PressMention[] = FEATURED_IDS
    .map(id => mentions.find(m => m.id === id))
    .filter((m): m is PressMention => Boolean(m) && !hidden.has(m!.id))
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))

  return (
    <div className="relative">
      {/* Fondo global sutil */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at 80% 10%, rgba(160,120,74,0.08) 0%, transparent 55%)' }} />

      <div className="relative z-10 pt-24 pb-16 px-6 sm:px-12 md:px-20 lg:px-24 xl:px-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 xl:gap-28">

          {/* ── COLUMNA IZQUIERDA (sticky, centrada vertical): hero + carrusel ── */}
          <aside className="lg:col-span-5 lg:sticky lg:top-20 self-start lg:h-[calc(100vh-6rem)] lg:flex lg:flex-col lg:justify-center gap-10">
            <div>
              <p className="font-mono text-[0.65rem] tracking-[0.5em] uppercase mb-5"
                style={{ color: 'var(--color-parker-bronze)' }}>
                Reseñas y Reconocimientos
              </p>
              <h1 className="font-serif font-light text-cream leading-[1.02]"
                style={{ fontSize: 'clamp(2rem, 3.4vw, 3.1rem)' }}>
                Agradecemos a los medios que han escrito sobre nosotros.
              </h1>
              <div className="mt-6 h-px w-16" style={{ background: 'var(--color-parker-bronze)', opacity: 0.4 }} />
              <p className="mt-6 font-body font-light leading-relaxed"
                style={{ fontSize: 'clamp(0.95rem, 1.1vw, 1.1rem)', color: 'rgba(237,232,220,0.6)' }}>
                Speakeasy en la Juárez. Doce años de música en vivo y una barra que se ha ganado
                su lugar en las guías de viaje y en la escena local.
              </p>
            </div>

            <div>
              <HeroQuoteCarousel />
            </div>
          </aside>

          {/* ── COLUMNA DERECHA: publicaciones arriba, artículos abajo — todo en un solo alto de pantalla ── */}
          <div className="lg:col-span-7 lg:h-[calc(100vh-5rem)] flex flex-col gap-5">

            {printReviews.length > 0 && (
              <section className="shrink-0">
                <SubsectionHeader label="Impresos y reconocimientos" />
                {/* Una sola fila horizontal — scroll a la derecha si crece */}
                <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory items-stretch">
                  {printReviews.map((r, i) => (
                    <div key={`${r.outlet}-${i}`} className="snap-start shrink-0 w-72 flex">
                      <PrintReviewCard review={r} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="flex-1 min-h-0 flex flex-col">
              <ArticlesGrid featured={featured} />
            </section>

            {/* Link al archivo completo — oculto por ahora
            <div className="shrink-0 text-center pt-2">
              <Link
                href="/prensa/archivo"
                className="inline-flex items-center gap-4 font-mono text-[0.65rem] tracking-[0.3em] uppercase text-white/50 hover:text-cream transition-colors hoverable"
              >
                Ver archivo completo · {totalAll} menciones
                <span className="w-12 h-px block" style={{ background: 'var(--color-parker-bronze)' }} />
              </Link>
            </div>
            */}
          </div>

        </div>
      </div>
    </div>
  )
}
