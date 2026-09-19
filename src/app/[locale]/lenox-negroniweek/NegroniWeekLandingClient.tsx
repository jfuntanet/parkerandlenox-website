'use client'

import { useState, type FormEvent } from 'react'

const API_URL = 'https://core.notabot.mx'

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ok'; code: string; alreadyExisted: boolean }
  | { kind: 'error'; message: string }

// source del pase: de dónde llegó (utm de la pauta) para separar pauta vs orgánico
function readSource(): string {
  if (typeof window === 'undefined') return 'web'
  const q = new URLSearchParams(window.location.search)
  const parts = [q.get('utm_source'), q.get('utm_campaign'), q.get('utm_content')].filter(Boolean)
  return parts.length ? parts.join('|').slice(0, 120) : 'web'
}

// Lead en el pixel de P&L — sin esto Meta no puede optimizar a registro
function trackLead() {
  const fbq = (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq
  if (typeof fbq === 'function') {
    fbq('track', 'Lead', { content_name: 'negroni-week-2026', content_category: 'lenox' })
  }
}

export function NegroniWeekLandingClient() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [terms, setTerms] = useState(false)
  const [state, setState] = useState<State>({ kind: 'idle' })

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (state.kind === 'loading') return
    if (!terms) {
      setState({ kind: 'error', message: 'Acepta los términos para continuar' })
      return
    }
    setState({ kind: 'loading' })
    try {
      const r = await fetch(`${API_URL}/v1/promo/negroni-week/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ fullName: fullName.trim(), email: email.trim().toLowerCase(), source: readSource() }),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) {
        setState({ kind: 'error', message: data?.error || 'No se pudo generar el pase' })
        return
      }
      trackLead()
      setState({ kind: 'ok', code: data.code, alreadyExisted: !!data.alreadyExisted })
    } catch {
      setState({ kind: 'error', message: 'No se pudo conectar. Intenta de nuevo.' })
    }
  }

  return (
    <main
      className="min-h-screen"
      style={{
        background: 'linear-gradient(180deg, #1a0507 0%, #2a0a0f 60%, #3b0d13 100%)',
        color: '#f5efe7',
      }}
    >
      <div className="mx-auto max-w-xl px-5 pt-32 pb-14 sm:pt-36 sm:pb-20">
        <div className="text-center mb-10">
          <img
            src="/negroni/campari-white.png"
            alt="Campari"
            style={{ width: '160px', maxWidth: '45%', height: 'auto', display: 'inline-block', opacity: 0.95 }}
          />
          <div style={{ fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.7, marginTop: 20 }}>
            presenta
          </div>
          <h1
            className="mt-2"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '3.2rem',
              lineHeight: 1.02,
              fontWeight: 700,
              letterSpacing: '0.01em',
            }}
          >
            Negroni Week
          </h1>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            marginTop: 20,
          }}>
            <span style={{ fontSize: 15, letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.8 }}>en</span>
            <img
              src="/negroni/lenox.png"
              alt="Lenox"
              style={{ width: '130px', maxWidth: '38vw', height: 'auto', display: 'block' }}
            />
          </div>
          <div style={{ fontSize: 13, letterSpacing: '0.28em', textTransform: 'uppercase', opacity: 0.88, marginTop: 22 }}>
            15 – 27 septiembre 2026
          </div>
        </div>

        <div
          style={{
            background: 'rgba(255, 250, 245, 0.05)',
            border: '1px solid rgba(255, 240, 220, 0.15)',
            borderRadius: 12,
            padding: '28px 24px',
            backdropFilter: 'blur(6px)',
          }}
        >
          {state.kind === 'ok' ? (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: '#c8102e',
                  margin: '0 auto 18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32,
                }}
              >✓</div>
              <h2 style={{ fontSize: '1.6rem', margin: '0 0 8px', fontFamily: "'Playfair Display', serif" }}>
                {state.alreadyExisted ? 'Ya tenías tu pase' : '¡Listo!'}
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.55, opacity: 0.9, marginBottom: 20 }}>
                {state.alreadyExisted
                  ? 'Ya habíamos generado tu pase antes — te lo reenviamos por correo.'
                  : 'Revisa tu correo. Ahí llega tu pase con QR listo para presentar en barra.'}
              </p>
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 14, letterSpacing: '0.25em', textTransform: 'uppercase',
                  color: '#f0b5b5',
                  border: '1px dashed rgba(255,200,200,0.3)',
                  borderRadius: 6, padding: '10px 14px', display: 'inline-block',
                }}
              >{state.code}</div>
              <p style={{ fontSize: 12, opacity: 0.6, marginTop: 16 }}>
                Guarda tu código por si el correo no llega. Escríbenos a rsvp@parkerandlenox.com si no lo encuentras.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <p style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.9, marginBottom: 22 }}>
                Regístrate y recibe tu pase por correo. Preséntalo en barra para acceder a nuestro{' '}
                <strong>menú de negronis a $120</strong> del 15 al 27 de septiembre en Lenox.
              </p>

              <label style={labelStyle}>
                Nombre completo
                <input
                  type="text" required value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name" style={inputStyle}
                  disabled={state.kind === 'loading'}
                />
              </label>

              <label style={{ ...labelStyle, marginTop: 14 }}>
                Correo electrónico
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email" style={inputStyle}
                  disabled={state.kind === 'loading'}
                />
              </label>

              <label
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  fontSize: 12.5, opacity: 0.85, marginTop: 18,
                  lineHeight: 1.5, cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox" checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  style={{ marginTop: 3, accentColor: '#c8102e' }}
                />
                <span>
                  Acepto recibir información sobre esta promoción y confirmo ser mayor de edad. Válido solo en Lenox,
                  del 15 al 27 de septiembre 2026.
                </span>
              </label>

              {state.kind === 'error' && (
                <div
                  style={{
                    marginTop: 14, padding: '10px 12px',
                    background: 'rgba(200, 16, 46, 0.15)',
                    border: '1px solid rgba(200, 16, 46, 0.4)',
                    borderRadius: 6, fontSize: 13,
                  }}
                >{state.message}</div>
              )}

              <button
                type="submit" disabled={state.kind === 'loading'}
                style={{
                  width: '100%', marginTop: 22, padding: '14px 16px',
                  background: '#c8102e', color: '#fff', border: 0, borderRadius: 8,
                  fontSize: 15, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  cursor: state.kind === 'loading' ? 'wait' : 'pointer',
                  opacity: state.kind === 'loading' ? 0.7 : 1,
                }}
              >
                {state.kind === 'loading' ? 'Enviando…' : 'Recibir mi pase'}
              </button>
            </form>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 34 }}>
          <img
            src="/parker-lenox-logo.webp"
            alt="Parker & Lenox"
            style={{ height: '32px', width: 'auto', opacity: 0.7, display: 'inline-block' }}
          />
          <p style={{
            marginTop: 10, fontSize: 11, opacity: 0.55,
            letterSpacing: '0.15em', textTransform: 'uppercase',
          }}>
            Gral. Prim 100 · Juárez · CDMX
          </p>
        </div>
      </div>
    </main>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, letterSpacing: '0.15em',
  textTransform: 'uppercase', opacity: 0.8, marginBottom: 4,
}

const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', padding: '12px 14px', marginTop: 6,
  background: 'rgba(0,0,0,0.35)',
  border: '1px solid rgba(255,240,220,0.25)',
  borderRadius: 6, color: '#f5efe7',
  fontSize: 15, fontFamily: 'inherit', outline: 'none',
}
