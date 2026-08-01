export const dynamic = 'force-dynamic'
export const metadata = { title: 'Coctelería — Parker & Lenox' }

import { MenuPageView } from '@/components/booking/MenuPageView'

export default function CoctelesPage() {
  return (
    <MenuPageView
      menuKeyword="barra"
      title="Coctelería"
      eyebrow="Barra de autor"
      emptyMsg="Cargando menú… si no aparece pronto, refresca la página."
      hidePrices
    />
  )
}
