import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { setRequestLocale, getMessages } from 'next-intl/server'
import { Playfair_Display, Cormorant_Garamond, Space_Mono } from 'next/font/google'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { TrackingScripts, TrackingNoscript } from '@/components/analytics/TrackingScripts'
import { PageviewTracker } from '@/components/analytics/PageviewTracker'
import Beacon from '@/components/analytics/Beacon'
import { routing } from '@/i18n/routing'
import '../globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
})

const SITE_URL = 'https://parkerandlenox.com'
const OG_IMAGE = '/og-plx.jpg'

const DESCRIPTIONS = {
  es: 'Dos salas. Una misma noche. Jazz en vivo y vinyl bar en la Ciudad de México.',
  en: 'Two rooms. One night. Live jazz and vinyl bar in Mexico City.',
} as const

const OG_IMAGE_ALT = {
  es: 'Parker & Lenox — Speakeasy en la Juárez, CDMX',
  en: 'Parker & Lenox — Speakeasy in Juárez, Mexico City',
} as const

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const desc = DESCRIPTIONS[locale as 'es' | 'en'] ?? DESCRIPTIONS.es
  const ogAlt = OG_IMAGE_ALT[locale as 'es' | 'en'] ?? OG_IMAGE_ALT.es
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: 'Parker & Lenox',
      template: '%s',
    },
    description: desc,
    applicationName: 'Parker & Lenox',
    keywords: ['jazz', 'vinyl bar', 'speakeasy', 'Ciudad de México', 'CDMX', 'Juárez', 'Condesa', 'música en vivo', 'live music', 'coctelería', 'cocktail bar', 'HiFi'],
    alternates: {
      canonical: locale === 'es' ? '/' : `/${locale}`,
      languages: {
        es: '/',
        en: '/en',
        'x-default': '/',
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'en' ? 'en_US' : 'es_MX',
      url: locale === 'es' ? SITE_URL : `${SITE_URL}/${locale}`,
      siteName: 'Parker & Lenox',
      title: 'Parker & Lenox',
      description: desc,
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: ogAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Parker & Lenox',
      description: desc,
      images: [OG_IMAGE],
    },
    icons: {
      icon: '/favicon.ico',
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180' },
        { url: '/apple-touch-icon-512.png', sizes: '512x512' },
      ],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${playfair.variable} ${cormorant.variable} ${spaceMono.variable}`}>
      <body className="bg-black text-cream min-h-screen">
        <NextIntlClientProvider messages={messages}>
          <TrackingNoscript />
          <div className="grain-overlay" />
          <Navbar />
          <main>{children}</main>
          <Footer />
          <TrackingScripts />
          <PageviewTracker />
          <Suspense fallback={null}><Beacon /></Suspense>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
