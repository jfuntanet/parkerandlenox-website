'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

const CORE_URL = process.env.NEXT_PUBLIC_CORE_API_URL || 'https://core.notabot.mx'
const ACCENT = 'var(--color-parker-bronze)'

const textareaCls =
  'w-full rounded-2xl border border-white/20 bg-black/40 px-5 py-3 font-body text-base text-cream placeholder:text-white/40 focus:border-white/60 focus:outline-none resize-none'

// Ejes de calificación — el orden y las keys coinciden con survey_responses en el core.
const METRICS: { key: string; label: string }[] = [
  { key: 'servicio_personal',  label: 'Servicio y atención' },
  { key: 'variedad_productos', label: 'Comida y bebida' },
  { key: 'instalaciones',      label: 'Ambiente e instalaciones' },
  { key: 'precios',            label: 'Precios' },
]

interface TokenInfo {
  valid: boolean
  status: string
  customerName: string | null
  customerEmail: string | null
  eventName: string | null
  levelAtVisit: number | null
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <span className="font-mono text-sm tracking-[0.3em] uppercase" style={{ color: ACCENT }}>
        {children}
      </span>
      <span className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(160,120,74,0.35), transparent)' }} />
    </div>
  )
}

function StarRow({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  const active = hover || value
  return (
    <div className="flex gap-1.5" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} de 5`}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          className="text-2xl md:text-3xl leading-none transition-colors hoverable"
          style={{ color: n <= active ? ACCENT : 'rgba(237,232,220,0.22)' }}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">{children}</div>
    </div>
  )
}

export function SurveyForm() {
  const params = useSearchParams()
  const token = (params.get('token') || params.get('t') || '').trim()

  const [info, setInfo] = useState<TokenInfo | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'invalid' | 'used' | 'notoken'>('loading')

  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [comentario, setComentario] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) { setLoadState('notoken'); return }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${CORE_URL}/v1/surveys/token/${encodeURIComponent(token)}`, { cache: 'no-store' })
        const data = await res.json().catch(() => ({}))
        if (cancelled) return
        if (res.status === 404 || !data) { setLoadState('invalid'); return }
        if (data.status && data.status !== 'active') { setInfo(data); setLoadState('used'); return }
        setInfo(data)
        setLoadState('ready')
      } catch {
        if (!cancelled) setLoadState('invalid')
      }
    })()
    return () => { cancelled = true }
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (Object.keys(ratings).length === 0) {
      setError('Danos al menos una calificación antes de enviar.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`${CORE_URL}/v1/surveys/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          responses: {
            servicio_personal:  ratings.servicio_personal  ?? null,
            variedad_productos: ratings.variedad_productos ?? null,
            instalaciones:      ratings.instalaciones      ?? null,
            precios:            ratings.precios            ?? null,
            comentario:         comentario.trim() || null,
          },
          clientData: {
            nombre: info?.customerName || null,
            email:  info?.customerEmail || null,
          },
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 410) { setLoadState('used'); return }
      if (!res.ok || !data.ok) {
        setError('No se pudo enviar tu reseña. Intenta de nuevo en un momento.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Error de conexión. Verifica tu internet e intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Estados no-formulario ───
  if (loadState === 'loading') {
    return (
      <Shell>
        <p className="text-center font-mono text-[0.6rem] tracking-[0.4em] uppercase text-white/40 mt-20">
          Cargando…
        </p>
      </Shell>
    )
  }

  if (loadState === 'notoken' || loadState === 'invalid') {
    return (
      <Shell>
        <div className="rounded-xl border border-white/[0.10] p-8 md:p-10 text-center" style={{ background: '#1a1a1a' }}>
          <p className="font-serif text-2xl md:text-3xl font-light text-cream leading-tight mb-3">
            Enlace no válido
          </p>
          <p className="font-body text-sm md:text-base leading-relaxed max-w-md mx-auto" style={{ color: 'rgba(237,232,220,0.65)' }}>
            Este enlace de reseña no es válido o ya expiró. Si crees que es un error, escríbenos a{' '}
            <a href="mailto:hola@parkerandlenox.com" style={{ color: ACCENT }}>hola@parkerandlenox.com</a>.
          </p>
        </div>
      </Shell>
    )
  }

  if (loadState === 'used' || submitted) {
    return (
      <Shell>
        <div className="rounded-xl border border-white/[0.10] p-8 md:p-10 text-center" style={{ background: '#1a1a1a' }}>
          <div className="font-serif italic text-4xl mb-4" style={{ color: ACCENT }}>✓</div>
          <p className="font-serif text-2xl md:text-3xl font-light text-cream leading-tight mb-3">
            {submitted ? '¡Gracias por tu reseña!' : 'Ya registramos tu reseña'}
          </p>
          <p className="font-body text-sm md:text-base leading-relaxed max-w-md mx-auto" style={{ color: 'rgba(237,232,220,0.65)' }}>
            {submitted
              ? 'Tu opinión nos ayuda a hacer de Parker & Lenox un mejor lugar. Nos vemos pronto.'
              : 'Ya habíamos recibido tu opinión para esta visita. ¡Gracias por tomarte el tiempo!'}
          </p>
        </div>
      </Shell>
    )
  }

  // ─── Formulario ───
  const firstName = info?.customerName?.trim().split(/\s+/)[0] || null

  return (
    <Shell>
      {/* Hero */}
      <div className="text-center mb-10">
        <p className="font-mono text-[0.6rem] tracking-[0.5em] uppercase mb-4" style={{ color: ACCENT }}>
          Tu opinión
        </p>
        <h1 className="font-serif font-light text-cream leading-[1.05]" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
          {firstName ? `${firstName}, ¿cómo estuvo tu visita?` : '¿Cómo estuvo tu visita?'}
        </h1>
        <div className="mt-6 mx-auto h-px w-16" style={{ background: ACCENT, opacity: 0.4 }} />
        <p className="mt-6 mx-auto max-w-lg font-body font-light leading-relaxed" style={{ fontSize: 'clamp(0.95rem, 1.1vw, 1.1rem)', color: 'rgba(237,232,220,0.65)' }}>
          {info?.eventName
            ? <>Gracias por acompañarnos en <span style={{ color: 'var(--color-cream)' }}>{info.eventName}</span>. Cuéntanos cómo la pasaste — nos toma menos de un minuto.</>
            : <>Gracias por visitarnos. Cuéntanos cómo la pasaste — nos toma menos de un minuto.</>}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-white/[0.10] p-6 md:p-8 flex flex-col gap-8" style={{ background: '#1a1a1a' }}>
        {/* Calificaciones */}
        <section>
          <SectionLabel>Califica tu experiencia</SectionLabel>
          <div className="flex flex-col gap-4">
            {METRICS.map((m) => (
              <div key={m.key} className="flex items-center justify-between gap-4">
                <span className="font-body text-sm md:text-base text-cream">{m.label}</span>
                <StarRow
                  value={ratings[m.key] || 0}
                  onChange={(v) => setRatings((r) => ({ ...r, [m.key]: v }))}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Comentario */}
        <section>
          <SectionLabel>Cuéntanos más</SectionLabel>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value.slice(0, 500))}
            rows={4}
            maxLength={500}
            placeholder="¿Qué te encantó? ¿Qué podríamos mejorar? (opcional)"
            className={textareaCls}
          />
          <p className="font-mono text-[0.55rem] tracking-widest uppercase text-white/30 mt-2 text-right">
            {comentario.length}/500
          </p>
        </section>

        {error && (
          <p className="font-body text-sm px-4 py-3 border rounded-xl" style={{ borderColor: 'rgba(192,32,42,0.3)', color: 'var(--color-lenox-red)', background: 'rgba(192,32,42,0.05)' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-2/3 mx-auto px-6 py-3.5 rounded-full font-mono text-sm tracking-[0.25em] uppercase transition-colors hoverable disabled:cursor-not-allowed"
          style={{
            background: submitting ? 'transparent' : ACCENT,
            color:      submitting ? 'rgba(160,120,74,0.4)' : 'var(--color-black)',
            border:     `2px solid ${submitting ? 'rgba(160,120,74,0.3)' : ACCENT}`,
          }}
        >
          {submitting ? 'Enviando…' : 'Enviar reseña'}
        </button>
      </form>
    </Shell>
  )
}
