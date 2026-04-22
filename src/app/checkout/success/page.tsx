import Link from 'next/link'
import { GrainOverlay } from '@/components/ui/GrainOverlay'

export const metadata = { title: 'Compra confirmada — Not a Bot' }

export default function CheckoutSuccessPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <GrainOverlay opacity={0.04} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, #0a1a0a 0%, transparent 60%)' }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md">
        <div className="w-12 h-px bg-gold mb-8 mx-auto" />
        <p className="font-sans text-xs uppercase tracking-widest text-gold mb-4">Pago confirmado</p>
        <h1 className="font-serif text-4xl md:text-5xl font-light text-cream">¡Hasta pronto!</h1>
        <p className="mt-6 font-sans text-sm text-cream-muted leading-relaxed">
          Tu compra fue procesada exitosamente. Recibirás tus boletos por correo electrónico.
        </p>
        <Link
          href="/cartelera"
          className="mt-10 inline-block border border-gold/40 px-8 py-3 font-sans text-xs uppercase tracking-widest text-gold hover:bg-gold/10 transition-colors duration-500"
        >
          Ver más conciertos
        </Link>
      </div>
    </div>
  )
}
