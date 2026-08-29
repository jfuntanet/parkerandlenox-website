import { notFound } from 'next/navigation'
import { getPackage } from '@/lib/api'
import { PackageCheckout } from '@/components/booking/PackageCheckout'
import { formatPrice, formatDate, formatTime } from '@/lib/format'

export const dynamic = 'force-dynamic'

const SITE_URL = 'https://parkerandlenox.com'
const bronze = 'var(--color-parker-bronze)'

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = await params
  const pkg = await getPackage(slug).catch(() => undefined)
  if (!pkg) return { title: 'Ciclo — Parker & Lenox' }
  return {
    title: `${pkg.name} — Parker & Lenox`,
    description: `${pkg.nights.length} conciertos por ${formatPrice(pkg.price)} (ahorra ${formatPrice(pkg.savings)}).`,
    alternates: { canonical: `/ciclo/${slug}` },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}/ciclo/${slug}`,
      title: pkg.name,
      ...(pkg.imageUrl ? { images: [pkg.imageUrl] } : {}),
    },
  }
}

export default async function CicloPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = await params
  const pkg = await getPackage(slug).catch(() => undefined)
  if (!pkg) notFound()

  return (
    <section className="pt-28 pb-20 px-6 sm:px-12 md:px-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-px block" style={{ background: bronze }} />
          <span className="font-mono text-[0.6rem] tracking-[0.4em] uppercase" style={{ color: bronze }}>
            Ciclo · {pkg.nights.length} conciertos
          </span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl font-normal leading-tight mb-8">
          {pkg.name}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_minmax(0,360px)] gap-10">
          {/* Columna izquierda: imagen + noches */}
          <div>
            {pkg.imageUrl && (
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-black/40 mb-8">
                <img src={pkg.imageUrl} alt={pkg.name} className="absolute inset-0 w-full h-full object-cover" />
              </div>
            )}

            <p className="font-mono text-[0.6rem] tracking-[0.35em] uppercase text-white/50 mb-4">
              Incluye estas {pkg.nights.length} noches
            </p>
            <ol className="flex flex-col gap-4">
              {pkg.nights.map((n, i) => (
                <li key={n.slug} className="flex gap-4 items-baseline border-b border-white/[0.08] pb-4">
                  <span className="font-serif text-2xl leading-none" style={{ color: bronze }}>{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-serif text-lg leading-snug">
                      {n.title.replace(/^Coltrane 100 presenta:\s*/i, '')}
                    </p>
                    <p className="font-mono text-[0.6rem] tracking-widest uppercase text-white/60 mt-1">
                      {formatDate(n.date)}{n.time ? ` · ${formatTime(n.time)}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Columna derecha: precio + checkout (sticky en desktop) */}
          <aside className="md:sticky md:top-28 h-fit rounded-2xl border p-6"
            style={{ background: '#161616', borderColor: 'rgba(160,120,74,0.4)' }}>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="font-serif text-3xl" style={{ color: bronze }}>{formatPrice(pkg.price)}</span>
              {pkg.savings > 0 && (
                <span className="font-body text-base text-white/40 line-through">{formatPrice(pkg.individualPrice)}</span>
              )}
            </div>
            {pkg.savings > 0 && (
              <p className="font-mono text-[0.55rem] tracking-[0.2em] uppercase mb-6" style={{ color: bronze }}>
                Ahorras {formatPrice(pkg.savings)} vs. comprarlos por separado
              </p>
            )}

            <PackageCheckout pkg={pkg} />
          </aside>
        </div>
      </div>
    </section>
  )
}
