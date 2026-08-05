import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { getEventDetail }                     from '@/lib/api'
import { CheckoutForm }                       from '@/components/booking/CheckoutForm'
import { ViewItemEvent }                      from '@/components/analytics/ViewItemEvent'
import { formatDateShort, formatTime }        from '@/lib/format'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ slug: string; locale: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug, locale } = await params
  const detail = await getEventDetail(slug).catch(() => null)
  const t = await getTranslations({ locale, namespace: 'event' })

  const eventLabel = locale === 'es' ? 'Evento' : 'Event'
  const title = detail ? `${detail.event.title} — Parker & Lenox` : `${eventLabel} — Parker & Lenox`
  const description = detail
    ? `${detail.event.title} ${t('metaEventVenuePreposition')} ${detail.event.venue}. ${formatDateShort(detail.event.date)}${detail.event.time && detail.ticketTypes.length <= 1 ? ` · ${formatTime(detail.event.time)}` : ''} · Parker & Lenox, ${locale === 'es' ? 'CDMX' : 'Mexico City'}.`
    : t('metaDescriptionFallback')
  const canonicalPath = locale === 'es' ? `/cartelera/${slug}` : `/${locale}/cartelera/${slug}`
  const image = detail?.event.imageUrl || '/og-plx.jpg'

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: 'article',
      url: canonicalPath,
      title,
      description,
      images: [image],
      siteName: 'Parker & Lenox',
      locale: locale === 'en' ? 'en_US' : 'es_MX',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

function venueAccent(venueName: string): string {
  if (venueName.toLowerCase().includes('lenox')) return 'var(--color-lenox-red)'
  return 'var(--color-parker-bronze)'
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params
  let detail
  try {
    detail = await getEventDetail(slug)
  } catch {
    notFound()
  }
  return <EventDetailInner slug={slug} detail={detail} />
}

function EventDetailInner({ slug, detail }: { slug: string; detail: NonNullable<Awaited<ReturnType<typeof getEventDetail>>> }) {
  const t = useTranslations('event')
  const { event, ticketTypes, salesActive } = detail
  const accent = venueAccent(event.venue)

  const startDate = event.time ? `${event.date}T${event.time}:00-06:00` : event.date
  const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicEvent',
    name: event.title,
    ...(event.description ? { description: event.description } : {}),
    startDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    ...(event.imageUrl ? { image: event.imageUrl } : {}),
    location: {
      '@type': 'MusicVenue',
      name: `Parker & Lenox — ${event.venue}`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Calle Gral. Prim 100',
        addressLocality: 'Juárez, Cuauhtémoc',
        postalCode: '06600',
        addressRegion: 'CDMX',
        addressCountry: 'MX',
      },
    },
    performer: {
      '@type': 'PerformingGroup',
      name: event.title,
    },
    organizer: {
      '@type': 'Organization',
      name: 'Parker & Lenox',
      url: 'https://parkerandlenox.com',
    },
    ...(salesActive && ticketTypes.length > 0
      ? {
          offers: ticketTypes.map(tk => ({
            '@type': 'Offer',
            name: tk.name,
            price: String(tk.price),
            priceCurrency: 'MXN',
            availability: tk.available > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/SoldOut',
            url: `https://parkerandlenox.com/cartelera/${slug}`,
          })),
        }
      : {
          offers: {
            '@type': 'Offer',
            name: t('freeEntry'),
            price: '0',
            priceCurrency: 'MXN',
            availability: 'https://schema.org/InStock',
            url: `https://parkerandlenox.com/cartelera/${slug}`,
          },
        }),
  }

  const minPrice = salesActive && ticketTypes.length > 0
    ? Math.min(...ticketTypes.map(tk => tk.price))
    : 0

  const todayCdmx = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })
  const isPast = event.date < todayCdmx

  return (
    <div className="relative min-h-screen pt-24 pb-16">
      {!isPast && <ViewItemEvent slug={slug} title={event.title} venue={event.venue} price={minPrice} />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <div className="max-w-[900px] mx-auto px-4 md:px-6">

        <div className="rounded-xl overflow-hidden border border-white/[0.10]" style={{ background: '#1a1a1a', boxShadow: '0 16px 48px rgba(0,0,0,0.55)' }}>

          <div className="grid md:grid-cols-2">
            <div className="relative h-[38vh] md:h-auto md:aspect-[4/5] bg-black overflow-hidden">
              {event.imageUrl ? (
                <>
                  <div className="absolute inset-0 opacity-40">
                    <Image src={event.imageUrl} alt="" fill className="object-cover blur-2xl scale-110" priority />
                  </div>
                  <Image src={event.imageUrl} alt={event.title} fill className="object-contain relative" priority />
                </>
              ) : (
                <div className="absolute inset-0"
                  style={{ background: 'radial-gradient(ellipse at 30% 40%, var(--color-parker-red) 0%, var(--color-black) 70%)' }} />
              )}
            </div>

            <div className="p-6 md:p-8 flex flex-col">
              <div className="mb-2 md:mb-6">
                <div className="flex items-center gap-3 mb-1.5 md:mb-2">
                  <span className="w-5 h-px block" style={{ background: accent }} />
                  <p className="font-mono text-[0.5rem] md:text-[0.55rem] tracking-[0.4em] uppercase" style={{ color: accent }}>
                    {event.venue}
                  </p>
                </div>
                <h1 className="font-serif text-xl md:text-4xl font-light text-cream leading-tight mb-2 md:mb-3">
                  {event.title}
                </h1>
                <p className="font-mono text-[0.6rem] md:text-[0.65rem] tracking-[0.25em] uppercase text-white/60">
                  {isPast && (
                    <span className="mr-2 px-2 py-0.5 rounded-sm border border-white/20 text-white/50">
                      {t('pastBadge')}
                    </span>
                  )}
                  {formatDateShort(event.date)}{event.time && ticketTypes.length <= 1 ? ` · ${formatTime(event.time)}` : ''}
                </p>
              </div>

              {isPast ? (
                <div className="py-8 flex flex-col items-start gap-4">
                  <p className="font-serif text-2xl md:text-3xl font-light leading-tight" style={{ color: accent }}>
                    {t('pastTitle')}
                  </p>
                  <p className="font-body text-sm text-white/60 leading-relaxed">
                    {t('pastMessage')}
                  </p>
                  <Link href="/#cartelera"
                    className="mt-2 px-5 py-2.5 rounded-full font-mono text-[0.7rem] tracking-[0.3em] uppercase transition-all duration-300 hoverable inline-flex items-center gap-2"
                    style={{ background: 'transparent', color: accent, border: `2px solid ${accent}` }}>
                    {t('viewUpcoming')}
                  </Link>
                </div>
              ) : salesActive ? (
                <CheckoutForm slug={slug} event={event} ticketTypes={ticketTypes} accent={accent} initialQty={1} mode="form-only" />
              ) : (
                <div className="py-8 flex flex-col items-start gap-2">
                  <p className="font-serif text-3xl md:text-4xl font-light" style={{ color: accent }}>
                    {t('freeEntry')}
                  </p>
                  <p className="font-mono text-[0.55rem] tracking-[0.3em] uppercase text-white/50">
                    {t('freeEntryHint')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {(event.description || (event.social && (event.social.instagram || event.social.spotify || event.social.tiktok || event.social.youtube))) && (
            <div className="px-12 sm:px-16 md:px-20 py-6 md:py-8 border-t border-white/[0.08]" style={{ background: 'linear-gradient(180deg, #161616 0%, #121212 100%)' }}>
              {event.description && (
                <>
                  <p className="font-mono text-[0.55rem] tracking-[0.4em] uppercase mb-4" style={{ color: accent }}>
                    {t('aboutEvent')}
                  </p>
                  <p className="font-body text-base leading-relaxed whitespace-pre-line" style={{ color: 'rgba(237,232,220,0.75)' }}>
                    {event.description}
                  </p>
                </>
              )}

              {event.social && (event.social.instagram || event.social.spotify || event.social.tiktok || event.social.youtube) && (
                <div className="mt-8 pt-6 border-t border-white/[0.06]">
                  <p className="font-mono text-[0.55rem] tracking-[0.4em] uppercase mb-4 text-center" style={{ color: accent }}>
                    {t('aboutArtist')}
                  </p>
                  <div className="flex flex-wrap justify-center gap-6">
                    {event.social.instagram && (
                      <a href={event.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                         className="flex items-center justify-center hover:opacity-100 opacity-70 transition-opacity hoverable"
                         style={{ color: 'rgba(237,232,220,0.7)' }}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                      </a>
                    )}
                    {event.social.spotify && (
                      <a href={event.social.spotify} target="_blank" rel="noopener noreferrer" aria-label="Spotify"
                         className="flex items-center justify-center hover:opacity-100 opacity-70 transition-opacity hoverable"
                         style={{ color: 'rgba(237,232,220,0.7)' }}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12A12 12 0 0012 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.302.42-1.02.599-1.56.3z"/></svg>
                      </a>
                    )}
                    {event.social.tiktok && (
                      <a href={event.social.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok"
                         className="flex items-center justify-center hover:opacity-100 opacity-70 transition-opacity hoverable"
                         style={{ color: 'rgba(237,232,220,0.7)' }}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.8 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.84-.1z"/></svg>
                      </a>
                    )}
                    {event.social.youtube && (
                      <a href={event.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                         className="flex items-center justify-center hover:opacity-100 opacity-70 transition-opacity hoverable"
                         style={{ color: 'rgba(237,232,220,0.7)' }}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8">
          <Link href="/cartelera" className="font-mono text-[0.6rem] tracking-widest uppercase text-white/30 hover:text-cream transition-colors hoverable">
            {t('backToLineup')}
          </Link>
        </div>
      </div>
    </div>
  )
}
