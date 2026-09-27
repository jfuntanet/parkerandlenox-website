'use client'

import { useState, type FormEvent } from 'react'

const API_URL = 'https://core.notabot.mx'

// Negroni Week cerró el 27-sep-2026. La landing ya no emite pases: da el aviso de
// cierre y ofrece el opt-in a la cartelera. Los leads caen en la lista de Listmonk
// "Negroni Week 2026" (id 21), que se incluye a mano como destinataria del semanal.
const NEGRONI_LIST_UUID = 'b1fc850d-57d4-4442-a3f9-af44e43f31a8'

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ok' }
  | { kind: 'error'; message: string }

// Lead en el pixel de P&L — sin esto Meta no puede optimizar a registro
function trackLead() {
  const fbq = (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq
  if (typeof fbq === 'function') {
    fbq('track', 'Lead', { content_name: 'cartelera-optin', content_category: 'negroni-week-outro' })
  }
}

export function NegroniWeekLandingClient() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>({ kind: 'idle' })

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (state.kind === 'loading') return
    setState({ kind: 'loading' })
    try {
      const r = await fetch(`${API_URL}/v1/store/public/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: fullName.trim(),
          listUuid: NEGRONI_LIST_UUID,
        }),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) {
        setState({ kind: 'error', message: data?.error || 'No pudimos guardar tu correo' })
        return
      }
      trackLead()
      setState({ kind: 'ok' })
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
            style={{ width: '160px', maxWidth: '45%', height: 'auto', display: 'inline-block', opacity: 0.8 }}
          />
          <div style={{ fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.6, marginTop: 20 }}>
            presentó
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
          <div style={{ fontSize: 13, letterSpacing: '0.28em', textTransform: 'uppercase', opacity: 0.6, marginTop: 22 }}>
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
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: '1.5rem', margin: '0 0 10px',
              fontFamily: "'Playfair Display', Georgia, serif",
            }}>
              Negroni Week terminó
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.85, margin: 0 }}>
              Gracias por acompañarnos del 15 al 27 de septiembre. Los negronis se quedan en la
              carta de Lenox.
            </p>
          </div>

          <hr style={{
            border: 0, borderTop: '1px solid rgba(255,240,220,0.15)',
            margin: '26px 0 24px',
          }} />

          {state.kind === 'ok' ? (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: '#c8102e',
                  margin: '0 auto 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28,
                }}
              >✓</div>
              <h3 style={{ fontSize: '1.3rem', margin: '0 0 8px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                Quedaste en la lista
              </h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.55, opacity: 0.85, margin: 0 }}>
                Te escribimos cuando abramos la siguiente cartelera.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <h3 style={{
                fontSize: '1.25rem', margin: '0 0 10px', textAlign: 'center',
                fontFamily: "'Playfair Display', Georgia, serif",
              }}>
                ¿Te avisamos qué sigue?
              </h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, opacity: 0.85, marginBottom: 22, textAlign: 'center' }}>
                Déjanos tu correo y te mandamos la cartelera de Parker&nbsp;&amp;&nbsp;Lenox antes de
                que los boletos salgan a la venta.
              </p>

              <label style={labelStyle}>
                Nombre
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
                {state.kind === 'loading' ? 'Enviando…' : 'Quiero saber'}
              </button>

              <p style={{ fontSize: 12, opacity: 0.55, marginTop: 14, textAlign: 'center', lineHeight: 1.5 }}>
                Un correo a la semana. Te puedes dar de baja cuando quieras.
              </p>
            </form>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 26 }}>
          <a
            href="/#cartelera"
            style={{
              fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: '#f5efe7', opacity: 0.7, textDecoration: 'underline',
              textUnderlineOffset: 4,
            }}
          >
            Ver la cartelera
          </a>
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
