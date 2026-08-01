'use client'

import { useState, useRef } from 'react'

const CORE_URL = process.env.NEXT_PUBLIC_CORE_API_URL || 'https://core.notabot.mx'
const ACCENT = 'var(--color-parker-bronze)'

const inputCls = 'w-full rounded-full border border-white/20 bg-black/40 px-4 py-2.5 font-body text-sm md:text-base text-cream placeholder:text-white/40 focus:border-white/60 focus:outline-none'
const textareaCls = 'w-full rounded-2xl border border-white/20 bg-black/40 px-5 py-3 font-body text-base text-cream placeholder:text-white/40 focus:border-white/60 focus:outline-none resize-none'

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

function FileDropzone({ onFile, currentName }: { onFile: (f: File | null) => void; currentName: string | null }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault(); setDragging(false)
        const f = e.dataTransfer.files[0]
        if (f) onFile(f)
      }}
      className="border-2 border-dashed rounded-xl px-6 py-8 text-center cursor-pointer transition-colors hoverable"
      style={{
        borderColor: currentName
          ? 'rgba(160,120,74,0.6)'
          : dragging ? 'rgba(160,120,74,0.5)' : 'rgba(255,255,255,0.15)',
        background: currentName
          ? 'rgba(160,120,74,0.06)'
          : dragging ? 'rgba(160,120,74,0.04)' : 'transparent',
      }}
    >
      {currentName ? (
        <>
          <div className="font-serif text-xl mb-1" style={{ color: ACCENT }}>✓</div>
          <p className="font-body text-sm text-cream truncate">{currentName}</p>
          <p className="font-mono text-[0.6rem] tracking-widest uppercase text-white/40 mt-1">Click para cambiar</p>
        </>
      ) : (
        <>
          <div className="text-white/30 text-2xl mb-1">↑</div>
          <p className="font-body text-sm text-white/60">Arrastra tu EPK aquí o click para elegir</p>
          <p className="font-mono text-[0.55rem] tracking-widest uppercase text-white/40 mt-1">PDF, JPG, PNG o WEBP · máx 15 MB</p>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
    </div>
  )
}

export function MusicoForm() {
  const [epkFile, setEpkFile] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null); setLoading(true)
    const form = e.currentTarget
    const formData = new FormData(form)
    // Reemplaza el file input con el file en state (soporta drag & drop)
    if (epkFile) formData.set('epk', epkFile)
    else formData.delete('epk')

    const name = (formData.get('name') as string)?.trim()
    if (!name) { setError('El nombre del proyecto es requerido.'); setLoading(false); return }
    const contactName = (formData.get('contact_name') as string)?.trim()
    if (!contactName) { setError('El nombre del responsable es requerido.'); setLoading(false); return }
    if (epkFile) {
      const ok = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(epkFile.type)
      if (!ok) { setError('El EPK debe ser PDF, JPG, PNG o WEBP.'); setLoading(false); return }
      if (epkFile.size > 15 * 1024 * 1024) { setError('El EPK no puede superar 15 MB.'); setLoading(false); return }
    }

    try {
      const res = await fetch(`${CORE_URL}/v1/musician-applications`, { method: 'POST', body: formData })
      if (!res.ok) { setError('No se pudo enviar. Intenta de nuevo.'); return }
      setSubmitted(true)
    } catch {
      setError('Error de conexión. Verifica tu internet e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-white/[0.10] p-8 md:p-10 text-center"
        style={{ background: '#1a1a1a' }}>
        <div className="font-serif italic text-4xl mb-4" style={{ color: ACCENT }}>✓</div>
        <p className="font-serif text-2xl md:text-3xl font-light text-cream leading-tight mb-3">
          ¡Postulación recibida!
        </p>
        <p className="font-body text-sm md:text-base leading-relaxed max-w-md mx-auto"
          style={{ color: 'rgba(237,232,220,0.65)' }}>
          Gracias por compartirnos tu proyecto. Nuestro equipo de booking lo revisará y, si encaja
          con el espacio, te contactamos.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-white/[0.10] p-6 md:p-8 flex flex-col gap-8"
      style={{ background: '#1a1a1a' }}>

      {/* Proyecto */}
      <section>
        <SectionLabel>Tu proyecto</SectionLabel>
        <div className="flex flex-col gap-3">
          <input name="name" type="text" required placeholder="Nombre del proyecto o artista *" className={inputCls} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input name="genre" type="text" placeholder="Género / estilo (Jazz, funk, bossa…)" className={inputCls} />
            <input name="city" type="text" placeholder="Ciudad (CDMX, GDL…)" className={inputCls} />
          </div>
          <textarea name="description" rows={3} placeholder="Descripción — formación, propuesta, referencias…" className={textareaCls} />
        </div>
      </section>

      {/* Contacto */}
      <section>
        <SectionLabel>Contacto</SectionLabel>
        <div className="flex flex-col gap-3">
          <input name="contact_name" type="text" required placeholder="Nombre del responsable *" className={inputCls} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input name="email" type="email" required placeholder="Email *" className={inputCls} />
            <input name="phone" type="tel" placeholder="Teléfono / WhatsApp" className={inputCls} />
          </div>
        </div>
      </section>

      {/* Música y redes */}
      <section>
        <SectionLabel>Música y redes</SectionLabel>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input name="link" type="url" placeholder="Spotify, YouTube, SoundCloud…" className={inputCls} />
            <input name="instagram" type="text" placeholder="@tuproyecto" className={inputCls} />
          </div>
          <div>
            <p className="font-body text-sm text-white/55 mb-2 px-1">EPK / press kit (opcional)</p>
            <FileDropzone onFile={setEpkFile} currentName={epkFile?.name || null} />
          </div>
        </div>
      </section>

      {error && (
        <p className="font-body text-sm px-4 py-3 border rounded-xl"
          style={{ borderColor: 'rgba(192,32,42,0.3)', color: 'var(--color-lenox-red)', background: 'rgba(192,32,42,0.05)' }}>
          {error}
        </p>
      )}

      <button type="submit" disabled={loading}
        className="w-full sm:w-2/3 mx-auto px-6 py-3.5 rounded-full font-mono text-sm tracking-[0.25em] uppercase transition-colors hoverable disabled:cursor-not-allowed"
        style={{
          background: loading ? 'transparent' : ACCENT,
          color:      loading ? 'rgba(160,120,74,0.4)' : 'var(--color-black)',
          border:     `2px solid ${loading ? 'rgba(160,120,74,0.3)' : ACCENT}`,
        }}>
        {loading ? 'Enviando…' : 'Enviar postulación'}
      </button>
    </form>
  )
}
