export const metadata = {
  title: 'Aviso de privacidad — Parker & Lenox',
  description: 'Aviso de privacidad de Parker & Lenox (Dos Con Todo, S.A. de C.V.): tratamiento de datos personales, finalidades y derechos ARCO.',
}

export default function AvisoPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <p className="font-mono text-[0.6rem] tracking-[0.5em] uppercase mb-4"
            style={{ color: 'var(--color-parker-bronze)' }}>
            Legal
          </p>
          <h1 className="font-serif font-light text-cream leading-[1.05]"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
            Aviso de privacidad
          </h1>
          <div className="mt-6 mx-auto h-px w-16"
            style={{ background: 'var(--color-parker-bronze)', opacity: 0.4 }} />
        </div>

        <article className="flex flex-col gap-8 font-body leading-relaxed"
          style={{ color: 'rgba(237,232,220,0.78)', fontSize: 'clamp(0.95rem, 1.05vw, 1.05rem)' }}>

          <Section title="1. Responsable del tratamiento de tus datos">
            <p>
              Dos Con Todo, S.A. de C.V., comercialmente conocida como Parker &amp; Lenox
              (en adelante, &ldquo;Parker &amp; Lenox&rdquo;), con domicilio en Milán 14,
              Colonia Juárez, C.P. 06600, Ciudad de México, es responsable del uso,
              tratamiento y protección de tus datos personales.
            </p>
          </Section>

          <Section title="2. Datos personales que recabamos">
            <p>Para las finalidades señaladas en este aviso, podemos recabar:</p>
            <List items={[
              'Datos de identificación y contacto: nombre, correo electrónico y, en su caso, teléfono.',
              'Datos de las personas acompañantes (nombre y, en su caso, correo) que tú nos proporciones al adquirir boletos.',
              'Información sobre tus compras, reservas y asistencia a eventos.',
              'Datos de navegación recabados de forma automática mediante cookies y tecnologías similares (ver sección 6).',
            ]} />
            <p>
              Los datos de tu tarjeta o medio de pago son procesados directamente por
              nuestro proveedor de pagos (Stripe) y no son almacenados por Parker &amp; Lenox.
            </p>
          </Section>

          <Section title="3. Finalidades primarias (necesarias para el servicio)">
            <List items={[
              'Procesar, confirmar y entregar la compra de boletos y reservas.',
              'Enviar boletos, confirmaciones y comunicaciones relacionadas con tu compra o evento.',
              'Gestionar el acceso y la asignación de lugares en el evento.',
              'Brindar atención a clientes, aclaraciones, devoluciones y facturación.',
              'Cumplir con obligaciones legales aplicables.',
            ]} />
          </Section>

          <Section title="4. Finalidades secundarias (requieren tu consentimiento)">
            <p>De manera adicional, si no manifiestas tu oposición, utilizaremos tus datos para:</p>
            <List items={[
              'Envío de promociones, boletines (newsletter), invitaciones a eventos y comunicaciones de mercadotecnia.',
              'Realización de encuestas, estadísticas y estudios de mercado.',
              'Elaboración de perfiles y segmentación con fines publicitarios.',
              'Creación de audiencias y campañas de publicidad y remarketing en plataformas de terceros, como Meta Platforms (Facebook e Instagram) y Google, incluyendo el cotejo cifrado (hash) de tu correo electrónico para dichas plataformas.',
            ]} />
            <p>
              Si no deseas que tus datos personales se utilicen para estas finalidades
              secundarias, puedes manifestarlo enviando un correo a{' '}
              <a href="mailto:hello@parkerandlenox.com" className="underline hover:text-cream transition-colors"
                style={{ color: 'var(--color-parker-bronze)' }}>
                hello@parkerandlenox.com
              </a>
              . Tu negativa no será motivo para negarte los servicios que solicitas.
            </p>
          </Section>

          <Section title="5. Transferencias de datos">
            <p>Tus datos personales pueden ser compartidos con:</p>
            <List items={[
              'Proveedores que nos prestan servicios necesarios para la operación: procesamiento de pagos (Stripe), envío de correos electrónicos y hospedaje tecnológico.',
              'Plataformas de publicidad (Meta Platforms, Inc. y Google) con fines de mercadotecnia, cuando hayas consentido las finalidades secundarias.',
            ]} />
            <p>
              Las transferencias necesarias para cumplir la relación jurídica contigo no
              requieren de tu consentimiento, conforme al artículo 37 de la LFPDPPP. Las
              transferencias con fines publicitarios se realizan únicamente con tu
              consentimiento.
            </p>
          </Section>

          <Section title="6. Uso de cookies, web beacons y tecnologías de rastreo">
            <p>
              Nuestro sitio web utiliza cookies, web beacons y píxeles (incluidos el píxel
              de Meta y herramientas de Google) que recaban datos sobre tu navegación
              —como páginas visitadas, interacciones y tipo de dispositivo— con fines de
              analítica y publicidad. Puedes deshabilitar las cookies desde la configuración
              de tu navegador, considerando que ello puede afectar la experiencia en el sitio.
            </p>
          </Section>

          <Section title="7. Derechos ARCO y revocación del consentimiento">
            <p>
              Tienes derecho a Acceder a tus datos personales, Rectificarlos cuando sean
              inexactos, Cancelarlos cuando consideres que no se requieren, u Oponerte a
              su tratamiento, así como a revocar tu consentimiento o limitar el uso o
              divulgación de tus datos.
            </p>
            <p>
              Para ejercer cualquiera de estos derechos, envía tu solicitud a{' '}
              <a href="mailto:hello@parkerandlenox.com" className="underline hover:text-cream transition-colors"
                style={{ color: 'var(--color-parker-bronze)' }}>
                hello@parkerandlenox.com
              </a>
              , indicando: (i) tu nombre completo, (ii) descripción clara de la solicitud,
              y (iii) un medio de contacto para responderte.
            </p>
          </Section>

          <Section title="8. Cambios al presente Aviso de Privacidad">
            <p>
              Nos reservamos el derecho de modificar o actualizar este Aviso de Privacidad
              en cualquier momento. Cualquier cambio será publicado en esta misma página.
            </p>
          </Section>

          <Section title="9. Consentimiento">
            <p>
              Al proporcionar tus datos personales y/o utilizar nuestros servicios y sitio
              web, manifiestas que has leído, entendido y aceptado los términos del presente
              Aviso de Privacidad, y otorgas tu consentimiento para el tratamiento de tus
              datos conforme a las finalidades aquí descritas.
            </p>
          </Section>

          <p className="pt-6 mt-4 border-t border-white/[0.06] font-mono text-xs tracking-widest uppercase text-white/40 text-center">
            Última actualización: 23 de junio de 2026
          </p>
        </article>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-cream mb-3" style={{ fontSize: 'clamp(1.2rem, 1.8vw, 1.5rem)', lineHeight: 1.2 }}>
        {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2 pl-1">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-2 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--color-parker-bronze)' }} />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  )
}
