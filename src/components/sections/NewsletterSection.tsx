'use client'

import { useState } from 'react'

export function NewsletterSection() {
  const [email, setEmail]     = useState('')
  const [name, setName]       = useState('')
  const [status, setStatus]   = useState<'idle' | 'loading' | 'ok' | 'err'>('idle')
  const [errMsg, setErrMsg]   = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading'); setErrMsg('')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setStatus('err'); setErrMsg(data.error || 'No pudimos suscribirte'); return }
      setStatus('ok')
    } catch {
      setStatus('err'); setErrMsg('Error de conexión')
    }
  }

  return (
    <section
      id="newsletter"
      className="relative px-8 md:px-16 py-24 md:py-32 border-t border-white/[0.08] overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 40% 60% at 30% 50%, rgba(160,120,74,0.12), transparent 65%),' +
            'radial-gradient(ellipse 40% 60% at 70% 50%, rgba(192,32,42,0.08), transparent 65%)',
        }}
      />

      <div className="relative z-10 max-w-[720px] mx-auto text-center flex flex-col items-center gap-6">
        <p className="font-mono text-[0.6rem] tracking-[0.5em] uppercase" style={{ color: 'var(--color-parker-bronze)' }}>
          Newsletter
        </p>
        <h2 className="font-serif font-light leading-[1.1]" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)' }}>
          <span className="whitespace-nowrap">Suscríbete y entérate primero</span>{' '}
          <span className="whitespace-nowrap">de nuestros eventos.</span>
        </h2>
        <p className="font-body font-light leading-relaxed max-w-[42ch]" style={{ fontSize: 'clamp(1rem, 1.3vw, 1.15rem)', color: 'rgba(237,232,220,0.6)' }}>
          Una vez por semana, los conciertos que vienen. Sin spam.
        </p>

        {status === 'ok' ? (
          <div className="mt-4 flex flex-col items-center gap-2">
            <p className="font-serif text-2xl md:text-3xl" style={{ color: 'var(--color-parker-bronze)' }}>
              ¡Listo! Revisa tu correo.
            </p>
            <p className="font-mono text-[0.55rem] tracking-[0.3em] uppercase text-white/50">
              Te enviamos un email para confirmar la suscripción
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="w-full mt-4 flex flex-col gap-3">
            <input
              type="text"
              placeholder="Tu nombre (opcional)"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={status === 'loading'}
              className="w-full rounded-full border border-white/20 bg-black/40 px-5 py-3 font-body text-base text-cream placeholder:text-white/40 focus:border-white/60 focus:outline-none disabled:opacity-50"
            />
            <input
              type="email"
              required
              placeholder="Tu email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={status === 'loading'}
              className="w-full rounded-full border border-white/20 bg-black/40 px-5 py-3 font-body text-base text-cream placeholder:text-white/40 focus:border-white/60 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'loading' || !email.trim()}
              className="w-full sm:w-auto sm:self-center mt-2 px-8 py-3 rounded-full font-mono text-[0.7rem] tracking-[0.3em] uppercase transition-colors hoverable disabled:cursor-not-allowed"
              style={{
                background: 'transparent',
                color: 'var(--color-parker-bronze)',
                border: '2px solid var(--color-parker-bronze)',
              }}
            >
              {status === 'loading' ? 'Enviando…' : 'Suscribirme'}
            </button>
            {status === 'err' && (
              <p className="font-mono text-[0.6rem] tracking-widest px-2 mt-1" style={{ color: 'var(--color-lenox-red)' }}>
                {errMsg}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  )
}
