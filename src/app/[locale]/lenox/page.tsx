import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { ConcertCard } from '@/components/ui/ConcertCard'
import { CocktailCarousel } from '@/components/ui/CocktailCarousel'
import { ConcertCardHorizontal } from '@/components/ui/ConcertCardHorizontal'
import { getEvents, getMenus, findMenuByKeyword, type MenuItem } from '@/lib/api'
import type { TicketEvent } from '@/types/api'

export const dynamic = 'force-dynamic'

const SITE_URL = 'https://parkerandlenox.com'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'lenox' })
  const path = locale === 'es' ? '/lenox' : `/${locale}/lenox`
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: path,
      languages: { es: '/lenox', en: '/en/lenox', 'x-default': '/lenox' },
    },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}${path}`,
      title: t('metaTitle'),
      description: t('metaDescription'),
    },
  }
}

// Lenox como entidad propia dentro del venue: es una sala distinta, con horario
// y reglas de acceso distintas a las de Parker.
function lenoxJsonLd(desc: string, events: TicketEvent[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BarOrPub',
    name: 'Lenox',
    alternateName: 'Lenox — listening bar de Parker & Lenox',
    description: desc,
    url: `${SITE_URL}/lenox`,
    telephone: '+525521835107',
    priceRange: '$$-$$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Calle Gral. Prim 100',
      addressLocality: 'Juárez, Cuauhtémoc',
      postalCode: '06600',
      addressRegion: 'CDMX',
      addressCountry: 'MX',
    },
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '18:00',
      closes: '02:00',
    }],
    isAccessibleForFree: true,
    acceptsReservations: 'False',
    containedInPlace: {
      '@type': 'MusicVenue',
      name: 'Parker & Lenox',
      url: SITE_URL,
    },
    ...(events.length > 0 ? {
      event: events.map(e => ({
        '@type': 'MusicEvent',
        name: e.title,
        startDate: e.time ? `${e.date}T${e.time}:00-06:00` : e.date,
        url: `${SITE_URL}/cartelera/${e.slug}`,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        ...(e.imageUrl ? { image: e.imageUrl } : {}),
        location: { '@type': 'BarOrPub', name: 'Lenox' },
      })),
    } : {}),
  }
}

export default async function LenoxPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'lenox' })

  // Programación propia de Lenox. Comparte el mismo origen que la cartelera;
  // el core marca la sala en `venue`, igual que filtra CarreleraPreview.
  const events: TicketEvent[] = (await getEvents().catch(() => []))
    .filter(e => e.venue.toLowerCase().includes('lenox'))

  // Cócteles de autor con foto, de la misma carta que sirve /cocteles.
  // Las fotos ya existían en el core y no se usaban en ninguna página.
  // Orden determinista (sort_order de sección e item) para no cambiar en cada carga.
  const menus = await getMenus().catch(() => [])
  const barra = findMenuByKeyword(menus, 'barra')
  const cocteles: MenuItem[] = [...(barra?.sections ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .flatMap(s => [...s.items].sort((a, b) => a.sort_order - b.sort_order))
    .filter(i => i.image_url)

  const SECTIONS = ['entrar', 'barra'] as const

  return (
    <div className="relative min-h-screen pt-28 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(lenoxJsonLd(t('metaDescription'), events)) }}
      />
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at 75% 10%, rgba(192,32,42,0.12) 0%, transparent 55%)' }} />

      <div className="relative z-10 px-6 sm:px-12 md:px-20">
        <section className="max-w-3xl mx-auto text-center mb-20">
          {/* Mismo wordmark que el hero con el monograma deslizado hasta Lenox:
              serif itálica en rojo, con el eyebrow Hi-Fi al lado. */}
          <h1 className="flex flex-wrap items-baseline justify-center gap-x-6 gap-y-1">
            <span className="font-serif italic font-bold leading-none text-[clamp(3rem,8.5vw,6rem)] md:text-[clamp(4.5rem,12.75vw,9rem)]"
              style={{ color: 'var(--color-lenox-red)' }}>
              {t('h1')}
            </span>
            <span className="font-mono uppercase tracking-[0.5em] text-[0.6rem] md:text-[1.05rem]"
              style={{ color: 'var(--color-lenox-red)' }}>
              {t('hifi')}
            </span>
          </h1>
          <p className="mt-7 font-serif font-light text-cream leading-snug"
            style={{ fontSize: 'clamp(1.35rem, 2.2vw, 1.9rem)' }}>
            {t('subtitle')}
          </p>
          <div className="mt-6 mx-auto h-px w-16"
            style={{ background: 'var(--color-lenox-red)', opacity: 0.5 }} />
          <p className="mt-8 font-body font-light leading-relaxed"
            style={{ fontSize: 'clamp(1.08rem, 1.45vw, 1.32rem)', color: 'rgba(237,232,220,0.72)' }}>
            {t('intro')}
          </p>

          {/* Desvío para quien llegó buscando concierto: Lenox no lo es.
              Va aparte del intro, no enterrado en él. */}
          <p className="mt-10 mx-auto max-w-xl border-l-2 pl-5 text-left font-body font-light leading-relaxed"
            style={{ borderColor: 'var(--color-parker-bronze)', fontSize: 'clamp(0.98rem, 1.15vw, 1.1rem)', color: 'rgba(237,232,220,0.6)' }}>
            {t.rich('pointer', {
              link: chunks => (
                <Link href="/cartelera" className="border-b transition-colors hoverable"
                  style={{ color: 'var(--color-parker-bronze)', borderColor: 'rgba(160,120,74,0.5)' }}>
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </section>

        <section className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-16">
            {SECTIONS.map(k => (
              <div key={k}>
                <div className="h-px w-8 mb-5" style={{ background: 'var(--color-parker-bronze)', opacity: 0.6 }} />
                <h2 className="font-serif font-light text-cream leading-snug mb-4"
                  style={{ fontSize: 'clamp(1.4rem, 2.1vw, 1.85rem)' }}>
                  {t(`${k}.title`)}
                </h2>
                <p className="font-body font-light leading-relaxed"
                  style={{ fontSize: 'clamp(1rem, 1.15vw, 1.12rem)', color: 'rgba(237,232,220,0.68)' }}>
                  {t(`${k}.body`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Selectores: la programación de Lenox. Hoy suele venir vacía —
            el core sólo trae eventos de Parker— pero en cuanto se publique
            uno con venue Lenox aparece aquí con su cartel. */}
        <section className="mt-28 max-w-5xl mx-auto">
          <div className="flex items-center gap-5 mb-10">
            <span className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(192,32,42,0.35))' }} />
            <h2 className="font-serif font-light text-cream leading-snug text-center"
              style={{ fontSize: 'clamp(1.4rem, 2.1vw, 1.85rem)' }}>
              {t('sesiones.title')}
            </h2>
            <span className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(192,32,42,0.35))' }} />
          </div>

          {events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 auto-rows-fr">
              {events.map(event => (
                <div key={event.slug} className="bg-black h-full">
                  <div className="sm:hidden">
                    <ConcertCardHorizontal event={event} />
                  </div>
                  <div className="hidden sm:block h-full">
                    <ConcertCard event={event} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-body font-light text-center py-6 mx-auto max-w-lg leading-relaxed"
              style={{ fontSize: 'clamp(0.98rem, 1.15vw, 1.1rem)', color: 'rgba(237,232,220,0.5)' }}>
              {t('sesiones.empty')}
            </p>
          )}
        </section>

        {/* Coctelería con foto. Las imágenes viven en el core desde siempre
            (campo image_url de la carta) pero ninguna página las usaba. */}
        {cocteles.length > 0 && (
          <section className="mt-28 max-w-5xl mx-auto">
            <div className="flex items-center gap-5 mb-10">
              <span className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(160,120,74,0.35))' }} />
              <h2 className="font-serif font-light text-cream leading-snug text-center"
                style={{ fontSize: 'clamp(1.4rem, 2.1vw, 1.85rem)' }}>
                {t('barra_fotos.title')}
              </h2>
              <span className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(160,120,74,0.35))' }} />
            </div>

            <CocktailCarousel
              items={cocteles.map(c => ({
                id: c.id,
                name: locale === 'en' && c.name_en ? c.name_en : c.name,
                imageUrl: c.image_url!,
              }))}
              prevLabel={t('barra_fotos.prev')}
              nextLabel={t('barra_fotos.next')}
            />

            <div className="mt-10 text-center">
              <Link href="/cocteles"
                className="inline-flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.3em] uppercase px-5 py-2.5 border transition-colors hoverable"
                style={{ borderColor: 'var(--color-parker-bronze)', color: 'var(--color-parker-bronze)' }}>
                {t('barra_fotos.cta')}
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
