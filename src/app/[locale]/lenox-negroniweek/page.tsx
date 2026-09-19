import { NegroniWeekLandingClient } from './NegroniWeekLandingClient'

export const metadata = {
  title: 'Negroni Week — Lenox × Campari',
  robots: { index: false, follow: false },
}

export default function NegroniWeekPage() {
  return <NegroniWeekLandingClient />
}
