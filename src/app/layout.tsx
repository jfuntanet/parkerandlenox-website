import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Cormorant_Garamond, Space_Mono } from 'next/font/google'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { TrackingScripts, TrackingNoscript } from '@/components/analytics/TrackingScripts'
import { PageviewTracker } from '@/components/analytics/PageviewTracker'
import './globals.css'

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
const OG_IMAGE = '/banner-plx.jpg'
const DEFAULT_DESCRIPTION = 'Dos salas. Una misma noche. Jazz en vivo y vinyl bar en la Ciudad de México.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Parker & Lenox',
    template: '%s',
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: 'Parker & Lenox',
  keywords: ['jazz', 'vinyl bar', 'speakeasy', 'Ciudad de México', 'CDMX', 'Juárez', 'Condesa', 'música en vivo', 'live music', 'coctelería', 'cocktail bar', 'HiFi'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: SITE_URL,
    siteName: 'Parker & Lenox',
    title: 'Parker & Lenox',
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: 2048,
        height: 972,
        alt: 'Parker & Lenox — Speakeasy en la Juárez, CDMX',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Parker & Lenox',
    description: DEFAULT_DESCRIPTION,
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${playfair.variable} ${cormorant.variable} ${spaceMono.variable}`}>
      <body className="bg-black text-cream min-h-screen">
        <TrackingNoscript />
        <div className="grain-overlay" />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <TrackingScripts />
        <PageviewTracker />
      </body>
    </html>
  )
}
