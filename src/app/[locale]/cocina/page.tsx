export const dynamic = 'force-dynamic'
export const metadata = { title: 'Cocina — Parker & Lenox' }

import { MenuPageView } from '@/components/booking/MenuPageView'

export default function ComidaPage() {
  return (
    <MenuPageView
      menuKeyword="cocina"
      title="Cocina"
      eyebrow="De la cocina"
      emptyMsg="Cargando menú… si no aparece pronto, refresca la página."
      hidePrices
    />
  )
}
