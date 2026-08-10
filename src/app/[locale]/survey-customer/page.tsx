import { Suspense } from 'react'
import { SurveyForm } from '@/components/booking/SurveyForm'

export const metadata = { title: 'Tu opinión — Parker & Lenox' }

export default function SurveyPage() {
  return (
    <Suspense fallback={null}>
      <SurveyForm />
    </Suspense>
  )
}
