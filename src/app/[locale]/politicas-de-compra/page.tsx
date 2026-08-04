export const metadata = {
  title: 'Políticas de compra — Parker & Lenox',
  description: 'Políticas de compra de entradas: acceso, horarios, reagendaciones y contacto.',
}

export default function PoliticasPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <p className="font-mono text-[0.6rem] tracking-[0.5em] uppercase mb-4"
            style={{ color: 'var(--color-parker-bronze)' }}>
            Antes de comprar
          </p>
          <h1 className="font-serif font-light text-cream leading-[1.05]"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
            Políticas de compra
          </h1>
          <div className="mt-6 mx-auto h-px w-16"
            style={{ background: 'var(--color-parker-bronze)', opacity: 0.4 }} />
        </div>

        <article className="font-body leading-relaxed"
          style={{ color: 'rgba(237,232,220,0.78)', fontSize: 'clamp(0.95rem, 1.05vw, 1.05rem)' }}>

          <h2 className="font-serif text-cream mb-5" style={{ fontSize: 'clamp(1.3rem, 2vw, 1.7rem)' }}>
            Compra de entradas
          </h2>

          <ul className="flex flex-col gap-4 pl-1">
            <Item>
              Con la compra de entradas aseguras <strong className="text-cream font-normal">acceso y lugar</strong>.
              Las mesas se asignan conforme el orden de llegada y número de personas. El acceso a
              nuestra zona de escenario es a las <strong className="text-cream font-normal">9:00 PM</strong>,
              a excepción de sábados (7:00 pm y 10:00 pm dependiendo el set).
            </Item>
            <Item>
              La hora de llegada para clientes con boleto pagado es de{' '}
              <strong className="text-cream font-normal">6:00 PM a 9:30 PM</strong>. Los lugares de
              las personas que no lleguen antes de las 9:30 PM podrán ser asignados a clientes
              que se encuentren en el lugar.
            </Item>
            <Item>
              En caso de no poder asistir al evento se podrá <strong className="text-cream font-normal">reagendar</strong>{' '}
              para acudir en los 30 días próximos, siempre y cuando se notifique la cancelación
              antes de las 10:00 PM del día del evento al WhatsApp{' '}
              <a href="https://wa.me/525521835107" target="_blank" rel="noopener noreferrer" className="underline hover:text-cream transition-colors"
                style={{ color: 'var(--color-parker-bronze)' }}>
                +52 55 2183 5107
              </a>{' '}
              o por email a{' '}
              <a href="mailto:rsvp@parkerandlenox.com" className="underline hover:text-cream transition-colors"
                style={{ color: 'var(--color-parker-bronze)' }}>
                rsvp@parkerandlenox.com
              </a>.
            </Item>
            <Item>
              Te recordamos que los sábados se presentan <strong className="text-cream font-normal">dos sets</strong>.
              En caso de adquirir entradas para el primer set, podrás ingresar desde las 19:00
              a Parker, desalojando hasta 30 minutos después de terminado el show. Si adquieres
              entradas para el segundo set, tu ingreso será a las 22:00 hrs y podrás permanecer
              en Parker hasta el cierre del lugar.
            </Item>
            <Item>
              Si eres miembro <strong className="text-cream font-normal">Cool Cat Club</strong>,
              aplica tu cupón antes de realizar el pago de tus boletos o productos.
            </Item>
            <Item>
              Si tienes algún requerimiento especial escríbenos por WhatsApp al{' '}
              <a href="https://wa.me/525521835107" target="_blank" rel="noopener noreferrer" className="underline hover:text-cream transition-colors"
                style={{ color: 'var(--color-parker-bronze)' }}>
                +52 55 2183 5107
              </a>.
            </Item>
          </ul>

          {/* Contacto */}
          <section className="mt-12 pt-8 border-t border-white/[0.08]">
            <h2 className="font-serif text-cream mb-5" style={{ fontSize: 'clamp(1.3rem, 2vw, 1.7rem)' }}>
              Contacto
            </h2>
            <p className="mb-2">
              <span className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--color-parker-bronze)' }}>Dirección</span>
              <br />
              Calle Gral. Prim 100, Juárez, Cuauhtémoc, 06600 Ciudad de México
            </p>
            <p className="mt-4">
              <span className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--color-parker-bronze)' }}>WhatsApp</span>
              <br />
              <a href="https://wa.me/525521835107" target="_blank" rel="noopener noreferrer" className="underline hover:text-cream transition-colors"
                style={{ color: 'var(--color-parker-bronze)' }}>
                +52 55 2183 5107
              </a>
            </p>
            <p className="mt-4">
              <span className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--color-parker-bronze)' }}>Correo</span>
              <br />
              <a href="mailto:hello@parkerandlenox.com" className="underline hover:text-cream transition-colors"
                style={{ color: 'var(--color-parker-bronze)' }}>
                hello@parkerandlenox.com
              </a>
            </p>
          </section>
        </article>
      </div>
    </div>
  )
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-2 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--color-parker-bronze)' }} />
      <span>{children}</span>
    </li>
  )
}
