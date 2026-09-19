'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'

const API_URL = 'https://core.notabot.mx'
const PASSCODE_KEY = 'nw-staff-passcode'
const STAFF_KEY = 'nw-staff-name'

type ScanState =
  | { kind: 'idle' }
  | { kind: 'sending'; code: string }
  | { kind: 'ok'; fullName: string; email: string; redemptionCount: number; code: string; previousRedeemedAt: string | null }
  | { kind: 'notYet'; fullName?: string }
  | { kind: 'expired'; fullName?: string }
  | { kind: 'notFound' }
  | { kind: 'authError' }
  | { kind: 'error'; message: string }

type BarcodeDetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>
}

export function NegroniScannerClient() {
  const [passcode, setPasscode] = useState('')
  const [staff, setStaff] = useState('')
  const [authed, setAuthed] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [scanState, setScanState] = useState<ScanState>({ kind: 'idle' })
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [supportsDetector, setSupportsDetector] = useState(true)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<BarcodeDetectorLike | null>(null)
  const scanningRef = useRef(false)
  const lastSeenRef = useRef<{ code: string; at: number } | null>(null)

  // Restaurar passcode + staff guardados
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PASSCODE_KEY)
      const savedStaff = localStorage.getItem(STAFF_KEY) || ''
      if (saved) {
        setPasscode(saved)
        setStaff(savedStaff)
        setAuthed(true)
      }
    } catch {}
  }, [])

  // Detectar soporte de BarcodeDetector
  useEffect(() => {
    if (typeof window === 'undefined') return
    // @ts-expect-error BarcodeDetector is not in the standard TS DOM lib yet
    if (typeof window.BarcodeDetector === 'undefined') {
      setSupportsDetector(false)
    }
  }, [])

  // Arrancar cámara cuando auth OK y estado idle
  useEffect(() => {
    if (!authed) return
    if (!supportsDetector) return
    if (scanState.kind !== 'idle') return
    let cancelled = false
    ;(async () => {
      try {
        // @ts-expect-error BarcodeDetector not in TS DOM lib
        detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] })
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        scanningRef.current = true
        scheduleScan()
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setCameraError('No pude abrir la cámara: ' + msg)
      }
    })()
    return () => {
      cancelled = true
      scanningRef.current = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    }
  }, [authed, supportsDetector, scanState.kind])

  function scheduleScan() {
    if (!scanningRef.current) return
    requestAnimationFrame(async () => {
      if (!scanningRef.current) return
      const v = videoRef.current
      const d = detectorRef.current
      if (v && d && v.readyState >= 2) {
        try {
          const results = await d.detect(v)
          if (results.length > 0) {
            const raw = results[0].rawValue
            // Debounce: no dupliques la misma lectura en <2.5s
            const now = Date.now()
            if (!lastSeenRef.current || lastSeenRef.current.code !== raw || now - lastSeenRef.current.at > 2500) {
              lastSeenRef.current = { code: raw, at: now }
              await handleCode(raw)
            }
          }
        } catch {
          // ignora, seguirá intentando
        }
      }
      if (scanningRef.current) setTimeout(scheduleScan, 200)
    })
  }

  async function handleCode(rawCode: string) {
    if (scanState.kind === 'sending') return
    const cleaned = rawCode.trim()
    if (!cleaned) return
    setScanState({ kind: 'sending', code: cleaned })
    try {
      const r = await fetch(`${API_URL}/v1/promo/negroni-week/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-promo-key': passcode,
        },
        body: JSON.stringify({ code: cleaned, staff: staff || null }),
      })
      const data = await r.json().catch(() => ({}))
      if (r.status === 401) {
        setScanState({ kind: 'authError' })
        setAuthed(false)
        try { localStorage.removeItem(PASSCODE_KEY) } catch {}
        return
      }
      if (r.status === 404) {
        setScanState({ kind: 'notFound' })
        return
      }
      if (!r.ok) {
        if (data?.notYet) return setScanState({ kind: 'notYet', fullName: data.fullName })
        if (data?.expired) return setScanState({ kind: 'expired', fullName: data.fullName })
        return setScanState({ kind: 'error', message: data?.error || 'Error al validar' })
      }
      setScanState({
        kind: 'ok',
        fullName: data.fullName,
        email: data.email,
        redemptionCount: data.redemptionCount || 1,
        code: data.code,
        previousRedeemedAt: data.previousRedeemedAt || null,
      })
    } catch {
      setScanState({ kind: 'error', message: 'No se pudo conectar' })
    }
  }

  function onManualSubmit(e: FormEvent) {
    e.preventDefault()
    if (!manualCode.trim()) return
    handleCode(manualCode.trim())
    setManualCode('')
  }

  function reset() {
    setScanState({ kind: 'idle' })
    lastSeenRef.current = null
  }

  function onAuthSubmit(e: FormEvent) {
    e.preventDefault()
    if (!passcode.trim()) return
    try {
      localStorage.setItem(PASSCODE_KEY, passcode.trim())
      if (staff.trim()) localStorage.setItem(STAFF_KEY, staff.trim())
    } catch {}
    setAuthed(true)
  }

  function logout() {
    try { localStorage.removeItem(PASSCODE_KEY) } catch {}
    setAuthed(false)
    setPasscode('')
    setScanState({ kind: 'idle' })
  }

  // ─── AUTH ──────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <main style={pageStyle}>
        <div style={{ maxWidth: 380, margin: '0 auto', padding: '110px 20px 60px' }}>
          <h1 style={{ ...headingStyle, textAlign: 'center' }}>Scanner · Negroni Week</h1>
          <form
            onSubmit={onAuthSubmit}
            style={{
              background: 'rgba(255,250,245,0.05)',
              border: '1px solid rgba(255,240,220,0.15)',
              borderRadius: 10, padding: '24px 22px', marginTop: 24,
            }}
          >
            <label style={labelStyle}>
              Passcode
              <input
                type="password" required value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus autoComplete="current-password"
                style={inputStyle}
              />
            </label>
            <label style={{ ...labelStyle, marginTop: 14 }}>
              Tu nombre (opcional)
              <input
                type="text" value={staff}
                onChange={(e) => setStaff(e.target.value)}
                placeholder="Ej. Alan"
                style={inputStyle}
              />
            </label>
            <button type="submit" style={{ ...primaryButton, marginTop: 22 }}>Entrar</button>
          </form>
        </div>
      </main>
    )
  }

  // ─── SCANNER ───────────────────────────────────────────────────────────
  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '100px 16px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <h1 style={{ ...headingStyle, fontSize: '1.4rem', margin: 0 }}>Negroni Week · Scanner</h1>
          <button onClick={logout} style={linkButton}>salir</button>
        </div>
        <div style={{ fontSize: 12, opacity: 0.6, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>
          {staff ? `${staff} · en barra` : 'en barra'}
        </div>

        {/* Cámara / resultado */}
        {scanState.kind === 'idle' || scanState.kind === 'sending' ? (
          <div>
            {supportsDetector ? (
              <div style={{ position: 'relative', aspectRatio: '3/4', background: '#000', borderRadius: 10, overflow: 'hidden' }}>
                <video
                  ref={videoRef}
                  playsInline muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', inset: '15%',
                  border: '2px solid rgba(200,16,46,0.9)',
                  borderRadius: 12,
                  boxShadow: '0 0 0 999px rgba(0,0,0,0.35)',
                }} />
                {scanState.kind === 'sending' && (
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, letterSpacing: '0.2em', textTransform: 'uppercase',
                  }}>Validando…</div>
                )}
              </div>
            ) : (
              <div style={{
                padding: '20px', background: 'rgba(255,240,220,0.06)',
                borderRadius: 10, fontSize: 14, textAlign: 'center', lineHeight: 1.5,
              }}>
                Tu navegador no soporta escaneo con cámara. Escribe el código a mano:
              </div>
            )}
            {cameraError && (
              <div style={errorBox}>{cameraError}</div>
            )}
            <form onSubmit={onManualSubmit} style={{ marginTop: 16 }}>
              <label style={labelStyle}>O escribe el código</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text" value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="nw……"
                  style={{ ...inputStyle, textTransform: 'lowercase' }}
                  autoCapitalize="none" autoCorrect="off" autoComplete="off"
                  spellCheck={false}
                />
                <button type="submit" style={{ ...primaryButton, width: 'auto', padding: '12px 18px', margin: 0 }}>Ir</button>
              </div>
            </form>
          </div>
        ) : null}

        {scanState.kind === 'ok' && (
          <ResultCard
            tone="ok"
            title={`✓ ${scanState.fullName}`}
            body={
              <>
                <div style={{ fontSize: 26, fontFamily: "'Playfair Display', serif", margin: '4px 0 10px' }}>
                  Canje #{scanState.redemptionCount}
                </div>
                <div style={{ opacity: 0.75, fontSize: 13 }}>{scanState.email}</div>
                {scanState.previousRedeemedAt && (
                  <div style={{ opacity: 0.6, fontSize: 12, marginTop: 8 }}>
                    Anterior: {new Date(scanState.previousRedeemedAt).toLocaleString('es-MX', {
                      timeZone: 'America/Mexico_City',
                      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                )}
                <div style={{ opacity: 0.5, fontSize: 11, marginTop: 12, letterSpacing: '0.15em' }}>{scanState.code}</div>
              </>
            }
            onNext={reset}
          />
        )}

        {scanState.kind === 'notYet' && (
          <ResultCard tone="warn" title="Negroni Week arranca el 14 sep"
            body={scanState.fullName ? <div>Pase de {scanState.fullName} · aún no aplica</div> : null}
            onNext={reset}
          />
        )}
        {scanState.kind === 'expired' && (
          <ResultCard tone="warn" title="Negroni Week ya terminó"
            body={scanState.fullName ? <div>Pase de {scanState.fullName} · fuera de fechas</div> : null}
            onNext={reset}
          />
        )}
        {scanState.kind === 'notFound' && (
          <ResultCard tone="err" title="Pase no encontrado"
            body={<div>Verifica el código o pide al cliente que revise su correo.</div>}
            onNext={reset}
          />
        )}
        {scanState.kind === 'authError' && (
          <ResultCard tone="err" title="Passcode inválido"
            body={<div>Vuelve a ingresar el passcode.</div>}
            onNext={reset}
          />
        )}
        {scanState.kind === 'error' && (
          <ResultCard tone="err" title="Error" body={<div>{scanState.message}</div>} onNext={reset} />
        )}
      </div>
    </main>
  )
}

function ResultCard({
  tone, title, body, onNext,
}: {
  tone: 'ok' | 'warn' | 'err'
  title: string
  body: React.ReactNode
  onNext: () => void
}) {
  const bg = tone === 'ok' ? 'linear-gradient(180deg,#0a3d1e,#0f5528)' :
             tone === 'warn' ? 'linear-gradient(180deg,#4a3a08,#6b520a)' :
                               'linear-gradient(180deg,#4a0a10,#6b0d15)'
  return (
    <div style={{ background: bg, borderRadius: 12, padding: '24px 22px', marginTop: 6 }}>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>{title}</div>
      <div style={{ fontSize: 14, lineHeight: 1.55, opacity: 0.95 }}>{body}</div>
      <button onClick={onNext} style={{ ...primaryButton, marginTop: 22 }}>Escanear otro</button>
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #1a0507 0%, #2a0a0f 60%, #3b0d13 100%)',
  color: '#f5efe7',
  fontFamily: 'Georgia, serif',
}

const headingStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontWeight: 700, fontSize: '1.8rem', letterSpacing: '0.01em',
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
  boxSizing: 'border-box' as const,
}

const primaryButton: React.CSSProperties = {
  width: '100%', padding: '14px 16px',
  background: '#c8102e', color: '#fff', border: 0, borderRadius: 8,
  fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
  cursor: 'pointer',
}

const linkButton: React.CSSProperties = {
  background: 'transparent', border: 0, color: '#f0b5b5',
  fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase',
  cursor: 'pointer', padding: 4,
}

const errorBox: React.CSSProperties = {
  marginTop: 12, padding: '10px 12px',
  background: 'rgba(200, 16, 46, 0.15)',
  border: '1px solid rgba(200, 16, 46, 0.4)',
  borderRadius: 6, fontSize: 13,
}
