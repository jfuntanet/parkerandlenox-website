'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface Props {
  slug: string
  accent?: string
}

// Formulario para eventos sold-out: captura email + opt-in newsletter.
// Diseño en línea con NewsletterSection (inputs rounded-full, botón bronze).
export function WaitlistForm({ slug, accent = 'var(--color-parker-bronze)' }: Props) {
  const t = useTranslations('waitlist')
  const [email, setEmail]     = useState('')
  const [name, setName]       = useState('')
  const [optIn, setOptIn]     = useState(true)
  const [status, setStatus]   = useState<'idle' | 'loading' | 'ok' | 'already' | 'err'>('idle')
  const [errMsg, setErrMsg]   = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading'); setErrMsg('')
    try {
      const res = await fetch('/api/event-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          email: email.trim(),
          name: name.trim() || undefined,
          subscribeNewsletter: optIn,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setStatus('err'); setErrMsg(data.error || t('error')); return }
      setStatus(data.alreadyInList ? 'already' : 'ok')
    } catch {
      setStatus('err'); setErrMsg(t('error'))
    }
  }

  const isDone = status === 'ok' || status === 'already'

  return (
    <div className="rounded-2xl border border-white/[0.10] p-6 md:p-8" style={{ background: 'rgba(20,20,20,0.6)' }}>
      <p className="font-mono text-[0.55rem] tracking-[0.4em] uppercase mb-2" style={{ color: 'var(--color-lenox-red)' }}>
        {t('badge')}
      </p>
      <h3 className="font-serif font-light leading-tight mb-2 whitespace-nowrap" style={{ fontSize: 'clamp(1.1rem, 1.7vw, 1.55rem)' }}>
        {t('title')}
      </h3>
      <p className="font-body font-light leading-relaxed mb-5" style={{ color: 'rgba(237,232,220,0.6)', fontSize: '0.95rem' }}>
        {t('subtitle')}
      </p>

      {isDone ? (
        <div className="flex flex-col gap-1 py-2">
          <p className="font-serif text-xl md:text-2xl" style={{ color: accent }}>
            {status === 'already' ? t('alreadyInList') : t('successTitle')}
          </p>
          <p className="font-mono text-[0.55rem] tracking-[0.3em] uppercase text-white/50">
            {t('successHint')}
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder={t('namePlaceholder')}
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={status === 'loading'}
            className="w-full rounded-full border border-white/20 bg-black/40 px-5 py-3 font-body text-base text-cream placeholder:text-white/40 focus:border-white/60 focus:outline-none disabled:opacity-50"
          />
          <input
            type="email"
            required
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={status === 'loading'}
            className="w-full rounded-full border border-white/20 bg-black/40 px-5 py-3 font-body text-base text-cream placeholder:text-white/40 focus:border-white/60 focus:outline-none disabled:opacity-50"
          />
          <label className="flex items-start gap-3 px-2 mt-1 cursor-pointer group">
            <input
              type="checkbox"
              checked={optIn}
              onChange={e => setOptIn(e.target.checked)}
              disabled={status === 'loading'}
              className="mt-1 accent-current"
              style={{ accentColor: accent as string }}
            />
            <span className="font-body text-sm leading-snug" style={{ color: 'rgba(237,232,220,0.7)' }}>
              {t('newsletterOptin')}
            </span>
          </label>
          <button
            type="submit"
            disabled={status === 'loading' || !email.trim()}
            className="w-full sm:w-auto sm:self-start mt-2 px-8 py-3 rounded-full font-mono text-[0.7rem] tracking-[0.3em] uppercase transition-colors hoverable disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: 'transparent',
              color: accent,
              border: `2px solid ${accent}`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = accent as string
              e.currentTarget.style.color = 'var(--color-black)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = accent as string
            }}
          >
            {status === 'loading' ? t('submitting') : t('cta')}
          </button>
          {status === 'err' && (
            <p className="font-mono text-[0.6rem] tracking-widest px-2" style={{ color: 'var(--color-lenox-red)' }}>
              {errMsg}
            </p>
          )}
        </form>
      )}
    </div>
  )
}
