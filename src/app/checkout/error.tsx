'use client'

import Link from 'next/link'

export default function CheckoutError() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="font-sans text-xs uppercase tracking-widest text-gold mb-4">Error</p>
        <h1 className="font-serif text-3xl font-light text-cream mb-6">
          No pudimos procesar tu compra
        </h1>
        <p className="font-sans text-sm text-cream-muted mb-8 leading-relaxed">
          Ocurrió un error al conectar con el servidor de pagos. Por favor intenta de nuevo o contáctanos.
        </p>
        <Link
          href="/cartelera"
          className="inline-block border border-gold/40 px-8 py-3 font-sans text-xs uppercase tracking-widest text-gold hover:bg-gold/10 transition-colors duration-500"
        >
          Volver a la cartelera
        </Link>
      </div>
    </div>
  )
}
