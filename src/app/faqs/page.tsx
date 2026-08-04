export const metadata = { title: 'Preguntas frecuentes — Parker & Lenox' }

interface Faq { q: string; a: string }
interface Section { id: string; title: string; faqs: Faq[] }

// Las 3 preguntas fundamentales — van en el hero grande.
const HERO_FAQS: Faq[] = [
  { q: '¿Qué es Parker & Lenox?', a: 'Un club de jazz y listening bar en el corazón de la CDMX. Buena música, coctelería de autor, comida extraordinaria y una experiencia sonora envolvente.' },
  { q: '¿A qué hora abren y cierran?', a: 'Lenox abre de martes a sábado desde las 6:00 p.m., Parker abre a las 9:00 p.m. Ambos cierran tarde dependiendo del evento. Domingos y lunes cerramos.' },
  { q: '¿Necesito reservación para entrar?', a: 'En Lenox no necesitas boleto ni reservación: entras por orden de llegada, sujeto a disponibilidad. Para Parker (los conciertos) sí requieres comprar boleto en línea. Solo los miembros del Cool Cat Club tienen acceso a reservas anticipadas.' },
]

// Las 12 preguntas restantes en 3 columnas temáticas.
const SECTIONS: Section[] = [
  {
    id: 'sobre-el-lugar',
    title: 'Sobre el lugar',
    faqs: [
      { q: '¿Cuál es la diferencia entre Parker y Lenox?', a: 'Lenox es el listening bar de entrada, relajado y abierto al público. Parker es el club interior donde suceden los conciertos en vivo y las experiencias especiales.' },
      { q: '¿Hay música en vivo todos los días?', a: 'Sí, de martes a sábado. Puedes consultar la cartelera actualizada para ver qué artistas se presentan cada noche.' },
      { q: '¿Dónde están ubicados?', a: 'General Prim 100, esquina con Milán 14, Colonia Juárez, CDMX. A una cuadra de Reforma.' },
      { q: '¿Cuentan con estacionamiento o valet parking?', a: 'No contamos con estacionamiento propio, pero hay parquímetros y pensiones a menos de dos cuadras.' },
    ],
  },
  {
    id: 'boletos-y-entradas',
    title: 'Boletos y entradas',
    faqs: [
      { q: '¿Cómo consigo boletos?', a: 'En línea desde este sitio, o en la taquilla del club sujeto a disponibilidad.' },
      { q: '¿Aceptan grupos grandes?', a: 'Sí. Recomendamos comprar boletos con anticipación y avisarnos para apartar una mesa. Para experiencias privadas, contáctanos directamente.' },
      { q: '¿Qué pasa si llego sin boletos y está lleno?', a: 'En Lenox te anotamos en lista de espera. En Parker, puedes checar si aún hay boletos disponibles en línea.' },
      { q: '¿Hay costo de entrada para los conciertos?', a: 'Depende del evento. Algunos tienen costo, otros como las Jams de los martes son entrada libre. Consulta la cartelera.' },
    ],
  },
  {
    id: 'la-noche-del-evento',
    title: 'La noche del evento',
    faqs: [
      { q: '¿Y en Lenox?', a: 'No hay reservaciones ni pago de entrada. Se acomoda por orden de llegada, conforme haya disponibilidad.' },
      { q: '¿Cómo funciona la doble cartelera de los sábados?', a: 'Algunos sábados hay dos conciertos del mismo artista (19:30 y 22:30). El primero dura 60 min, el segundo 90. Entradas al primer set: ingreso desde 19:00, desaloje 30 min tras el show. Al segundo set: ingreso 22:00, permanencia hasta cierre.' },
      { q: '¿Qué incluye el costo de entrada?', a: 'Acceso al club y al concierto en vivo. El consumo dentro del club se paga por separado.' },
      { q: '¿Puedo quedarme después del show?', a: 'Claro. Parker sigue abierto y la noche continúa con buena música y ambiente.' },
    ],
  },
]

function HeroFaqCard({ faq }: { faq: Faq }) {
  return (
    <details className="group h-full">
      <summary className="cursor-pointer list-none flex flex-col gap-3 h-full p-6 md:p-7 border border-white/[0.10] rounded-xl hover:border-white/[0.28] transition-colors hoverable"
        style={{ background: 'linear-gradient(160deg, rgba(160,120,74,0.05), rgba(255,255,255,0) 60%)' }}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-serif font-light text-cream leading-snug flex-1"
            style={{ fontSize: 'clamp(1.15rem, 1.5vw, 1.4rem)' }}>
            {faq.q}
          </h2>
          <span className="font-serif text-2xl leading-none transition-transform duration-300 group-open:rotate-45 shrink-0"
            style={{ color: 'var(--color-parker-bronze)' }}>+</span>
        </div>
        <p className="font-body text-sm md:text-base leading-relaxed opacity-0 max-h-0 group-open:opacity-100 group-open:max-h-96 transition-all duration-500 overflow-hidden"
          style={{ color: 'rgba(237,232,220,0.72)' }}>
          {faq.a}
        </p>
      </summary>
    </details>
  )
}

export default function FaqsPage() {
  return (
    <div className="relative min-h-screen pt-28 pb-16">
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at 25% 10%, rgba(160,120,74,0.10) 0%, transparent 55%)' }} />

      <div className="relative z-10 px-6 sm:px-12 md:px-20 lg:px-24 xl:px-32">

        {/* ── HERO ── */}
        <section className="mb-16 md:mb-20 max-w-4xl mx-auto text-center">
          <p className="font-mono text-[0.6rem] tracking-[0.5em] uppercase mb-5"
            style={{ color: 'var(--color-parker-bronze)' }}>
            Lo que suelen preguntarnos
          </p>
          <h1 className="font-serif font-light text-cream leading-[1.02]"
            style={{ fontSize: 'clamp(2.2rem, 4.5vw, 4rem)' }}>
            Preguntas frecuentes.
          </h1>
          <div className="mt-6 mx-auto h-px w-16" style={{ background: 'var(--color-parker-bronze)', opacity: 0.4 }} />
        </section>

        {/* ── 3 preguntas destacadas — cards grandes en grid ── */}
        <section className="mb-20 md:mb-28 max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <span className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(160,120,74,0.35))' }} />
            <span className="font-mono uppercase tracking-[0.4em]"
              style={{ color: 'var(--color-parker-bronze)', fontSize: 'clamp(0.7rem, 0.9vw, 0.85rem)' }}>
              Las más comunes
            </span>
            <span className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(160,120,74,0.35))' }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {HERO_FAQS.map(f => <HeroFaqCard key={f.q} faq={f} />)}
          </div>
        </section>

        {/* ── 3 columnas por categoría ── */}
        <section className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-12">
            {SECTIONS.map(sec => (
              <div key={sec.id}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-6 h-px" style={{ background: 'var(--color-parker-bronze)' }} />
                  <span className="font-mono uppercase tracking-[0.35em]"
                    style={{ color: 'var(--color-parker-bronze)', fontSize: 'clamp(0.65rem, 0.75vw, 0.75rem)' }}>
                    {sec.title}
                  </span>
                </div>

                <div className="flex flex-col divide-y divide-white/[0.06]">
                  {sec.faqs.map(f => (
                    <details key={f.q} className="group py-4">
                      <summary className="cursor-pointer list-none flex items-start justify-between gap-3 hoverable">
                        <span className="font-serif text-base md:text-lg text-cream group-hover:text-white transition-colors leading-snug">
                          {f.q}
                        </span>
                        <span className="font-serif text-lg leading-none transition-transform duration-300 group-open:rotate-45 flex-shrink-0 mt-0.5"
                          style={{ color: 'var(--color-parker-bronze)' }}>+</span>
                      </summary>
                      <p className="font-body text-sm leading-relaxed mt-3"
                        style={{ color: 'rgba(237,232,220,0.7)' }}>
                        {f.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA contacto al fondo ── */}
        <section className="mt-24 max-w-2xl mx-auto text-center">
          <div className="h-px w-24 mx-auto mb-8" style={{ background: 'linear-gradient(to right, transparent, rgba(160,120,74,0.4), transparent)' }} />
          <p className="font-serif font-light text-cream mb-2"
            style={{ fontSize: 'clamp(1.2rem, 1.8vw, 1.6rem)' }}>
            ¿No encuentras tu respuesta?
          </p>
          <p className="font-body font-light text-sm mb-6" style={{ color: 'rgba(237,232,220,0.55)' }}>
            Estamos a un mensaje de distancia.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="https://wa.me/525521835107" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.3em] uppercase px-5 py-2.5 border transition-colors hoverable"
              style={{ borderColor: 'var(--color-parker-bronze)', color: 'var(--color-parker-bronze)' }}>
              WhatsApp
            </a>
            <a href="mailto:hello@parkerandlenox.com"
              className="inline-flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.3em] uppercase px-5 py-2.5 border border-white/15 text-white/60 hover:text-cream hover:border-white/40 transition-colors hoverable">
              hello@parkerandlenox.com
            </a>
          </div>
        </section>

      </div>
    </div>
  )
}
