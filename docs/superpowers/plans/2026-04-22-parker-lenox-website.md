# Parker & Lenox Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el sitio público de Parker & Lenox con cartelera y compra de boletos, basado en notabot-site pero con diseño visual completamente distinto (paleta dual Parker/Lenox, Playfair Display + Space Mono, cursor custom, grain overlay).

**Architecture:** Clon de notabot-site en `/opt/parker-lenox-site/`. Todos los datos vienen de `core.notabot.mx` con `brand=parker_lenox`. El checkout usa Server Actions de Next.js que hacen proxy a `POST /v1/tickets/checkout` en la API. Sin webhook handler en el site — Stripe webhooks van directo a `core.notabot.mx`.

**Tech Stack:** Next.js 16 (App Router, TypeScript), Tailwind CSS v4, Server Actions, Docker standalone, Traefik

---

## File Map

```
/opt/parker-lenox-site/
  package.json                     ← actualizar name
  next.config.mjs                  ← actualizar image domain
  docker-compose.yml               ← reescribir para parker-lenox-site + staging.parkerandlenox.com
  .env.example                     ← CORE_API_URL, CORE_API_KEY, NEXT_PUBLIC_APP_URL

  src/
    app/
      globals.css                  ← REESCRIBIR: paleta dual Parker/Lenox, fuentes, animaciones CSS
      layout.tsx                   ← REESCRIBIR: Playfair Display + Cormorant + Space Mono
      page.tsx                     ← REESCRIBIR: landing (Intro → SalaSelector → CarreleraPreview → Manifesto)
      cartelera/
        page.tsx                   ← REESCRIBIR: grid con SalaFilter (toggle Parker/Lenox/Todos)
        [slug]/
          page.tsx                 ← REESCRIBIR: detalle evento + botón comprar
      checkout/
        [slug]/
          page.tsx                 ← REESCRIBIR: form con Server Action
          error.tsx                ← REESCRIBIR: error state elegante
        success/
          page.tsx                 ← REESCRIBIR: confirmación post-pago
      discos/                      ← ELIMINAR (no en scope)
      merch/                       ← ELIMINAR (no en scope)
      proyectos/                   ← ELIMINAR (no en scope)

    components/
      layout/
        Navbar.tsx                 ← REESCRIBIR
        Footer.tsx                 ← REESCRIBIR
        CustomCursor.tsx           ← CREAR: cursor dot + ring, mix-blend-mode difference
        GrainOverlay.tsx           ← REESCRIBIR: fixed overlay fractalNoise 4%
      sections/
        IntroSection.tsx           ← CREAR: hero animado, línea vertical, título gigante
        SalaSelector.tsx           ← CREAR: split 50/50 Parker/Lenox
        CarreleraPreview.tsx       ← REESCRIBIR: 4 eventos próximos con ConcertCard
        ManifestoSection.tsx       ← CREAR: cita central con colores duales
        HeroSection.tsx            ← ELIMINAR (reemplazado por IntroSection + SalaSelector)
        DiscosPreview.tsx          ← ELIMINAR
        MerchPreview.tsx           ← ELIMINAR
        ProyectosStrip.tsx         ← ELIMINAR
      ui/
        ConcertCard.tsx            ← REESCRIBIR: diseño Parker/Lenox con color accent por sala
        SalaFilter.tsx             ← CREAR: client component, toggle Parker/Lenox/Todos
        EventCard.tsx              ← ELIMINAR (reemplazado por ConcertCard)
        CinematicEventCard.tsx     ← ELIMINAR
        ProductCard.tsx            ← ELIMINAR
        ProjectCard.tsx            ← ELIMINAR
        ReleaseCard.tsx            ← ELIMINAR

    lib/
      api.ts                       ← MODIFICAR: brand=parker_lenox, eliminar getReleases/getProducts/getProjects
      actions.ts                   ← MODIFICAR: APP_URL y successUrl/cancelUrl para P&L
      format.ts                    ← MANTENER sin cambios

    types/
      api.ts                       ← MANTENER sin cambios (TicketEvent, EventDetail, TicketType)
```

---

## Task 1: Cleanup — eliminar archivos fuera de scope

**Files:**
- Delete: `src/app/discos/`
- Delete: `src/app/merch/`
- Delete: `src/app/proyectos/`
- Delete: `src/components/sections/HeroSection.tsx`
- Delete: `src/components/sections/DiscosPreview.tsx`
- Delete: `src/components/sections/MerchPreview.tsx`
- Delete: `src/components/sections/ProyectosStrip.tsx`
- Delete: `src/components/ui/EventCard.tsx`
- Delete: `src/components/ui/CinematicEventCard.tsx`
- Delete: `src/components/ui/ProductCard.tsx`
- Delete: `src/components/ui/ProjectCard.tsx`
- Delete: `src/components/ui/ReleaseCard.tsx`
- Modify: `package.json`
- Modify: `next.config.mjs`
- Modify: `docker-compose.yml`

- [ ] **Step 1: Eliminar directorios y archivos fuera de scope**

```bash
cd /opt/parker-lenox-site
rm -rf src/app/discos src/app/merch src/app/proyectos
rm -f src/components/sections/HeroSection.tsx
rm -f src/components/sections/DiscosPreview.tsx
rm -f src/components/sections/MerchPreview.tsx
rm -f src/components/sections/ProyectosStrip.tsx
rm -f src/components/ui/EventCard.tsx
rm -f src/components/ui/CinematicEventCard.tsx
rm -f src/components/ui/ProductCard.tsx
rm -f src/components/ui/ProjectCard.tsx
rm -f src/components/ui/ReleaseCard.tsx
rm -f AGENTS.md
```

- [ ] **Step 2: Actualizar package.json**

Editar `/opt/parker-lenox-site/package.json`, cambiar `"name"`:

```json
{
  "name": "parker-lenox-site",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "16.2.4",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.4",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

- [ ] **Step 3: Actualizar next.config.mjs**

```js
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'core.notabot.mx' },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 4: Crear docker-compose.yml**

```yaml
# docker-compose.yml
services:
  parker-lenox-site:
    build:
      context: .
      dockerfile: Dockerfile
    image: parker-lenox-site:latest
    container_name: parker-lenox-site
    restart: unless-stopped
    env_file: .env
    networks:
      - n8n_default
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.plx-site.rule=Host(`staging.parkerandlenox.com`)"
      - "traefik.http.routers.plx-site.entrypoints=websecure"
      - "traefik.http.routers.plx-site.tls=true"
      - "traefik.http.routers.plx-site.tls.certresolver=mytlschallenge"
      - "traefik.http.services.plx-site.loadbalancer.server.port=3000"

networks:
  n8n_default:
    external: true
```

- [ ] **Step 5: Crear .env.example**

```bash
CORE_API_URL=https://core.notabot.mx
CORE_API_KEY=
NEXT_PUBLIC_APP_URL=https://staging.parkerandlenox.com
```

- [ ] **Step 6: Verificar que el proyecto compila sin los archivos eliminados**

```bash
cd /opt/parker-lenox-site
npm install
npx tsc --noEmit 2>&1 | head -30
```

Ignorar errores de componentes inexistentes que se crearán en tareas siguientes. Solo verificar que los imports de los archivos eliminados no aparezcan en archivos que no tocaremos.

- [ ] **Step 7: Commit**

```bash
cd /opt/parker-lenox-site
git add -A
git commit -m "chore: cleanup notabot-specific files, setup docker config"
```

---

## Task 2: Design system — globals.css

**Files:**
- Rewrite: `src/app/globals.css`

- [ ] **Step 1: Reescribir globals.css**

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  --color-black:            #080808;
  --color-black-lenox:      #06060A;
  --color-parker-bronze:    #A0784A;
  --color-parker-red:       #5C1A1A;
  --color-parker-green:     #1E3328;
  --color-parker-concrete:  #8A8880;
  --color-lenox-red:        #C0202A;
  --color-lenox-wood:       #6B3D22;
  --color-cream:            #EDE8DC;
  --color-cream-muted:      rgba(237,232,220,0.5);
  --color-cream-dim:        rgba(237,232,220,0.25);

  --font-serif:  var(--font-playfair), 'Playfair Display', Georgia, serif;
  --font-body:   var(--font-cormorant), 'Cormorant Garamond', Georgia, serif;
  --font-mono:   var(--font-space-mono), 'Space Mono', monospace;
}

@layer base {
  html {
    background-color: #080808;
    color: #EDE8DC;
    scroll-behavior: smooth;
    cursor: none;
  }

  body {
    background-color: #080808;
    min-height: 100vh;
    font-family: var(--font-body);
    overflow-x: hidden;
  }

  h1, h2, h3, h4 {
    font-family: var(--font-serif);
  }

  a, button { cursor: none; }

  ::selection {
    background-color: #5C1A1A;
    color: #EDE8DC;
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #080808; }
  ::-webkit-scrollbar-thumb { background: #2a1a10; border-radius: 3px; }
}

/* ── Grain overlay ── */
.grain-overlay {
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
  opacity: 0.04;
  pointer-events: none;
  z-index: 1000;
}

/* ── Custom cursor ── */
.cursor-dot {
  position: fixed;
  width: 8px;
  height: 8px;
  background: var(--color-cream);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  mix-blend-mode: difference;
  transition: width 0.3s, height 0.3s, background 0.3s;
}

.cursor-dot.expand {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.15);
}

.cursor-ring {
  position: fixed;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9998;
  transform: translate(-50%, -50%);
  transition: all 0.15s ease;
}

/* ── Scroll reveal ── */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.9s ease, transform 0.9s ease;
}

.reveal.visible {
  opacity: 1;
  transform: none;
}

.reveal-delay-1 { transition-delay: 0.1s; }
.reveal-delay-2 { transition-delay: 0.2s; }
.reveal-delay-3 { transition-delay: 0.35s; }

/* ── Animations ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes growLine {
  from { height: 0; }
  to   { height: 100%; }
}

@keyframes pulse-opacity {
  0%, 100% { opacity: 0.3; }
  50%       { opacity: 1; }
}

/* 'both' = apply first keyframe immediately (opacity:0 during delay) + hold last keyframe after */
.animate-fade-up { animation: fadeUp 1s ease both; }
.animate-grow-line { animation: growLine 2s ease both; }
.animate-pulse-opacity { animation: pulse-opacity 2s ease-in-out infinite; }

/* ── Utilities ── */
.font-serif  { font-family: var(--font-serif); }
.font-body   { font-family: var(--font-body); }
.font-mono   { font-family: var(--font-mono); }
```

- [ ] **Step 2: Commit**

```bash
cd /opt/parker-lenox-site
git add src/app/globals.css
git commit -m "style: design system — paleta dual Parker/Lenox, animaciones CSS"
```

---

## Task 3: Layout — fuentes, Navbar, Footer, GrainOverlay, CustomCursor

**Files:**
- Rewrite: `src/app/layout.tsx`
- Rewrite: `src/components/layout/Navbar.tsx`
- Rewrite: `src/components/layout/Footer.tsx`
- Create: `src/components/layout/CustomCursor.tsx`
- Rewrite: `src/components/ui/GrainOverlay.tsx`

- [ ] **Step 1: Reescribir layout.tsx**

```tsx
// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Cormorant_Garamond, Space_Mono } from 'next/font/google'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CustomCursor } from '@/components/layout/CustomCursor'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Parker & Lenox',
  description: 'Dos salas. Una misma noche. Jazz en vivo y vinyl bar en la Ciudad de México.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${playfair.variable} ${cormorant.variable} ${spaceMono.variable}`}>
      <body className="bg-black text-cream min-h-screen">
        <div className="grain-overlay" />
        <CustomCursor />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Crear CustomCursor.tsx (client component)**

```tsx
// src/components/layout/CustomCursor.tsx
'use client'

import { useEffect, useRef } from 'react'

export function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0
    let raf: number

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      if (dotRef.current) {
        dotRef.current.style.left = `${mx}px`
        dotRef.current.style.top  = `${my}px`
      }
    }

    const animate = () => {
      rx += (mx - rx) * 0.12
      ry += (my - ry) * 0.12
      if (ringRef.current) {
        ringRef.current.style.left = `${rx}px`
        ringRef.current.style.top  = `${ry}px`
      }
      raf = requestAnimationFrame(animate)
    }

    const expand   = () => dotRef.current?.classList.add('expand')
    const collapse = () => dotRef.current?.classList.remove('expand')

    document.addEventListener('mousemove', onMove)
    document.querySelectorAll('a, button, .hoverable').forEach(el => {
      el.addEventListener('mouseenter', expand)
      el.addEventListener('mouseleave', collapse)
    })

    raf = requestAnimationFrame(animate)
    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div ref={dotRef}  className="cursor-dot"  aria-hidden />
      <div ref={ringRef} className="cursor-ring" aria-hidden />
    </>
  )
}
```

- [ ] **Step 3: Reescribir GrainOverlay.tsx**

```tsx
// src/components/ui/GrainOverlay.tsx
export function GrainOverlay() {
  return <div className="grain-overlay" aria-hidden />
}
```

- [ ] **Step 4: Reescribir Navbar.tsx**

```tsx
// src/components/layout/Navbar.tsx
import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between">
      <Link href="/" className="font-serif text-xl text-cream hoverable">
        Parker <span className="italic" style={{ color: 'var(--color-parker-bronze)' }}>&</span> Lenox
      </Link>
      <Link
        href="/cartelera"
        className="font-mono text-[0.6rem] tracking-[0.4em] uppercase text-cream-muted hover:text-cream transition-colors duration-300 hoverable"
      >
        Cartelera
      </Link>
    </nav>
  )
}
```

- [ ] **Step 5: Reescribir Footer.tsx**

```tsx
// src/components/layout/Footer.tsx
export function Footer() {
  return (
    <footer className="px-8 md:px-16 py-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-t border-white/[0.06]">
      <div className="font-serif text-xl text-cream">
        Parker <span className="italic" style={{ color: 'var(--color-parker-bronze)' }}>&</span> Lenox
      </div>
      <div className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-white/25 text-center leading-loose">
        Ciudad de México<br />
        Miércoles a Domingo · 8PM — 2AM<br />
        reservas@parkerandlenox.com
      </div>
      <div className="flex flex-col items-start md:items-end gap-2">
        <a href="/cartelera" className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-white/30 hover:text-parker-bronze transition-colors duration-300 hoverable">
          Cartelera
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-white/30 hover:text-parker-bronze transition-colors duration-300 hoverable">
          Instagram
        </a>
      </div>
    </footer>
  )
}
```

- [ ] **Step 6: Verificar tipos**

```bash
cd /opt/parker-lenox-site
npx tsc --noEmit 2>&1 | head -20
```

Expected: errores solo de archivos aún no creados (page.tsx, sections, etc.), no en los archivos de esta tarea.

- [ ] **Step 7: Commit**

```bash
cd /opt/parker-lenox-site
git add src/app/layout.tsx src/components/layout/ src/components/ui/GrainOverlay.tsx
git commit -m "feat: layout base — fuentes, Navbar, Footer, CustomCursor, GrainOverlay"
```

---

## Task 4: API layer y Server Action

**Files:**
- Modify: `src/lib/api.ts`
- Modify: `src/lib/actions.ts`
- Keep:   `src/lib/format.ts` (sin cambios)
- Keep:   `src/types/api.ts` (sin cambios)

- [ ] **Step 1: Reescribir lib/api.ts**

```ts
// src/lib/api.ts
import type { TicketEvent, EventDetail } from '@/types/api'

const BASE = process.env.CORE_API_URL!
const KEY  = process.env.CORE_API_KEY!

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': KEY,
    },
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`API error ${res.status} on ${path}`)
  return res.json()
}

export async function getEvents(): Promise<TicketEvent[]> {
  return apiFetch('/v1/tickets/public/events?brand=parker_lenox')
}

export async function getEventDetail(slug: string): Promise<EventDetail> {
  return apiFetch(`/v1/tickets/events/${slug}/availability`)
}
```

- [ ] **Step 2: Reescribir lib/actions.ts**

```ts
// src/lib/actions.ts
'use server'

import { redirect } from 'next/navigation'

const BASE    = process.env.CORE_API_URL!
const API_KEY = process.env.CORE_API_KEY!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export async function initiateCheckout(formData: FormData) {
  const slug          = formData.get('slug')          as string
  const ticketTypeId  = formData.get('ticketTypeId')  as string
  const quantity      = Number(formData.get('quantity'))
  const customerName  = formData.get('customerName')  as string
  const customerEmail = formData.get('customerEmail') as string

  if (!slug || !ticketTypeId || !quantity || !customerName || !customerEmail) {
    throw new Error('Todos los campos son requeridos')
  }

  const res = await fetch(`${BASE}/v1/tickets/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({
      slug,
      ticketTypeId,
      quantity,
      customerName,
      customerEmail,
      successUrl: `${APP_URL}/checkout/success`,
      cancelUrl:  `${APP_URL}/cartelera/${slug}`,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || 'Error al procesar la compra')
  }

  const { checkoutUrl } = await res.json() as { checkoutUrl: string }
  redirect(checkoutUrl)
}
```

- [ ] **Step 3: Verificar tipos**

```bash
cd /opt/parker-lenox-site
npx tsc --noEmit 2>&1 | grep "api.ts\|actions.ts\|format.ts" | head -10
```

Expected: ningún error en estos archivos.

- [ ] **Step 4: Commit**

```bash
cd /opt/parker-lenox-site
git add src/lib/api.ts src/lib/actions.ts
git commit -m "feat: API layer con brand=parker_lenox, Server Action checkout"
```

---

## Task 5: Landing — IntroSection y SalaSelector

**Files:**
- Create: `src/components/sections/IntroSection.tsx`
- Create: `src/components/sections/SalaSelector.tsx`

- [ ] **Step 1: Crear IntroSection.tsx**

```tsx
// src/components/sections/IntroSection.tsx
export function IntroSection() {
  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Radial background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 40% 60% at 20% 60%, rgba(92,26,26,0.18), transparent 65%),
            radial-gradient(ellipse 40% 60% at 80% 60%, rgba(192,32,42,0.10), transparent 65%)
          `,
        }}
      />

      {/* Línea vertical animada */}
      <div
        className="absolute top-0 left-1/2 w-px animate-grow-line"
        style={{
          background: 'linear-gradient(to bottom, transparent, var(--color-parker-bronze), transparent)',
          animationDelay: '0.5s',
          height: 0,
        }}
      />

      {/* Eyebrow */}
      <p
        className="font-mono text-[0.65rem] tracking-[0.4em] uppercase mb-8 opacity-0 animate-fade-up"
        style={{
          color: 'var(--color-parker-bronze)',
          animationDelay: '1.2s',
          animationFillMode: 'forwards',
        }}
      >
        Jazz · Blues · Soul — CDMX
      </p>

      {/* Título principal */}
      <h1
        className="font-serif text-center leading-[0.9] opacity-0 animate-fade-up"
        style={{
          fontSize: 'clamp(5rem, 15vw, 12rem)',
          fontWeight: 400,
          animationDelay: '1.5s',
          animationFillMode: 'forwards',
        }}
      >
        Parker
        <br />
        <span
          className="italic"
          style={{
            color: 'var(--color-parker-bronze)',
            fontSize: '0.8em',
          }}
        >
          &amp;
        </span>
        <br />
        Lenox
      </h1>

      {/* Subtítulo */}
      <p
        className="mt-10 font-body text-base tracking-[0.15em] opacity-0 animate-fade-up"
        style={{
          color: 'rgba(237,232,220,0.5)',
          fontWeight: 300,
          animationDelay: '2s',
          animationFillMode: 'forwards',
        }}
      >
        Dos salas. Una misma noche.
      </p>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-0 animate-fade-up"
        style={{ animationDelay: '2.5s', animationFillMode: 'forwards' }}
      >
        <span className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-white/30">
          Elige tu noche
        </span>
        <div
          className="w-px h-12 animate-pulse-opacity"
          style={{ background: 'linear-gradient(to bottom, var(--color-parker-bronze), transparent)' }}
        />
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Crear SalaSelector.tsx**

```tsx
// src/components/sections/SalaSelector.tsx
import Link from 'next/link'

export function SalaSelector() {
  return (
    <section className="relative min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Divider */}
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 z-10"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(160,120,74,0.3) 20%, rgba(160,120,74,0.3) 80%, transparent)' }}
      >
        <span
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-xs px-2 py-4"
          style={{ color: 'var(--color-parker-bronze)', background: 'var(--color-black)' }}
        >
          ◆
        </span>
      </div>

      {/* Parker */}
      <div className="relative flex flex-col justify-center px-12 md:px-20 py-24 overflow-hidden group hoverable">
        {/* Hover tint */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 70% 50% at 20% 40%, rgba(30,51,40,0.5), transparent 60%),
              radial-gradient(ellipse 50% 60% at 60% 80%, rgba(92,26,26,0.3), transparent 60%)
            `,
          }}
        />
        {/* Background text decorativo */}
        <span
          className="absolute bottom-0 right-0 font-serif font-bold pointer-events-none select-none"
          style={{ fontSize: 'clamp(6rem,16vw,14rem)', opacity: 0.025, lineHeight: 1 }}
        >
          Parker
        </span>

        <div className="relative z-10">
          <p className="font-mono text-[0.6rem] tracking-[0.5em] uppercase mb-4"
            style={{ color: 'var(--color-parker-bronze)' }}>
            Sala A — 01 · Música en vivo
          </p>
          <h2 className="font-serif font-bold leading-none mb-6"
            style={{ fontSize: 'clamp(3.5rem,7vw,6rem)' }}>
            Parker
          </h2>
          <p className="font-body font-light leading-relaxed mb-8 max-w-[32ch]"
            style={{ fontSize: '1.1rem', color: 'rgba(237,232,220,0.65)' }}>
            Un speakeasy donde el músico está a tres metros de tu cara. Crudo, íntimo, sudoroso. El jazz que se siente antes de escucharse.
          </p>
          <div className="flex flex-wrap gap-2 mb-10">
            {['Live Jazz', 'Blues', 'Soul', 'Speakeasy'].map(tag => (
              <span key={tag} className="font-mono text-[0.55rem] tracking-[0.2em] uppercase px-4 py-1.5 border"
                style={{ borderColor: 'rgba(160,120,74,0.35)', color: 'var(--color-parker-bronze)' }}>
                {tag}
              </span>
            ))}
          </div>
          <Link href="/cartelera" className="inline-flex items-center gap-4 font-mono text-[0.65rem] tracking-[0.3em] uppercase text-cream hover:gap-6 transition-all duration-300 hoverable">
            <span className="w-12 h-px block transition-all duration-300 hover:w-16"
              style={{ background: 'var(--color-parker-bronze)' }} />
            Ver cartelera
          </Link>
        </div>
      </div>

      {/* Lenox */}
      <div className="relative flex flex-col justify-center px-12 md:px-20 py-24 overflow-hidden group hoverable"
        style={{ background: 'var(--color-black-lenox)' }}>
        {/* Hover tint */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 60% 40% at 80% 30%, rgba(192,32,42,0.15), transparent 60%),
              radial-gradient(ellipse 40% 50% at 30% 80%, rgba(107,61,34,0.2), transparent 60%)
            `,
          }}
        />
        <span
          className="absolute bottom-0 left-0 font-serif italic pointer-events-none select-none"
          style={{ fontSize: 'clamp(6rem,16vw,14rem)', opacity: 0.025, lineHeight: 1 }}
        >
          Lenox
        </span>

        <div className="relative z-10">
          <p className="font-mono text-[0.6rem] tracking-[0.5em] uppercase mb-4"
            style={{ color: 'var(--color-lenox-red)' }}>
            Sala B — 02 · Vinilos &amp; Cócteles
          </p>
          <h2 className="font-serif italic font-light leading-none mb-6"
            style={{ fontSize: 'clamp(3.5rem,7vw,6rem)' }}>
            Lenox
          </h2>
          <p className="font-body font-light leading-relaxed mb-8 max-w-[32ch]"
            style={{ fontSize: '1.1rem', color: 'rgba(237,232,220,0.65)' }}>
            Un cocktail bar donde el ritual importa tanto como la bebida. El crujido del vinilo, el cóctel perfecto, la conversación en voz baja.
          </p>
          <div className="flex flex-wrap gap-2 mb-10">
            {['Vinyl Bar', 'Cocktails', 'Analógico'].map(tag => (
              <span key={tag} className="font-mono text-[0.55rem] tracking-[0.2em] uppercase px-4 py-1.5 border"
                style={{ borderColor: 'rgba(192,32,42,0.4)', color: 'var(--color-lenox-red)' }}>
                {tag}
              </span>
            ))}
          </div>
          <Link href="/cartelera" className="inline-flex items-center gap-4 font-mono text-[0.65rem] tracking-[0.3em] uppercase text-cream hover:gap-6 transition-all duration-300 hoverable">
            <span className="w-12 h-px block"
              style={{ background: 'var(--color-lenox-red)' }} />
            Ver selección
          </Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verificar tipos**

```bash
cd /opt/parker-lenox-site
npx tsc --noEmit 2>&1 | grep "IntroSection\|SalaSelector" | head -10
```

Expected: sin errores en estos archivos.

- [ ] **Step 4: Commit**

```bash
cd /opt/parker-lenox-site
git add src/components/sections/IntroSection.tsx src/components/sections/SalaSelector.tsx
git commit -m "feat: IntroSection y SalaSelector — hero animado, split Parker/Lenox"
```

---

## Task 6: Landing — CarreleraPreview, ManifestoSection y page.tsx

**Files:**
- Rewrite: `src/components/sections/CarreleraPreview.tsx`
- Create:  `src/components/sections/ManifestoSection.tsx`
- Rewrite: `src/app/page.tsx`

- [ ] **Step 1: Crear ConcertCard.tsx (necesario para CarreleraPreview)**

```tsx
// src/components/ui/ConcertCard.tsx
import Link from 'next/link'
import type { TicketEvent } from '@/types/api'
import { formatDate, formatPrice } from '@/lib/format'

interface Props {
  event: TicketEvent
  showVenue?: boolean
}

const VENUE_COLORS: Record<string, string> = {
  parker: 'var(--color-parker-bronze)',
  lenox:  'var(--color-lenox-red)',
}

function venueAccent(venueName: string): string {
  const lower = venueName.toLowerCase()
  if (lower.includes('parker')) return VENUE_COLORS.parker
  if (lower.includes('lenox'))  return VENUE_COLORS.lenox
  return VENUE_COLORS.parker
}

export function ConcertCard({ event, showVenue = true }: Props) {
  const accent = venueAccent(event.venue)

  return (
    <Link
      href={`/cartelera/${event.slug}`}
      className="group block border border-white/[0.08] p-6 hover:border-white/20 transition-all duration-500 hoverable"
      style={{ background: 'rgba(255,255,255,0.01)' }}
    >
      {showVenue && (
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-px block" style={{ background: accent }} />
          <span className="font-mono text-[0.55rem] tracking-[0.3em] uppercase" style={{ color: accent }}>
            {event.venue}
          </span>
        </div>
      )}

      <p className="font-mono text-[0.6rem] tracking-[0.2em] text-white/30 mb-2">
        {formatDate(event.date)}
      </p>

      <h3 className="font-serif text-2xl font-normal leading-tight mb-3 group-hover:text-cream transition-colors">
        {event.title}
      </h3>

      <div className="flex items-center justify-between mt-4">
        <span className="font-mono text-sm" style={{ color: accent }}>
          {event.soldOut ? 'Agotado' : formatPrice(event.price)}
        </span>
        <span className="font-mono text-[0.6rem] tracking-widest uppercase text-white/30 group-hover:text-cream transition-colors">
          {event.soldOut ? '—' : 'Boletos →'}
        </span>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Reescribir CarreleraPreview.tsx**

```tsx
// src/components/sections/CarreleraPreview.tsx
import Link from 'next/link'
import { ConcertCard } from '@/components/ui/ConcertCard'
import type { TicketEvent } from '@/types/api'

interface Props {
  events: TicketEvent[]
}

export function CarreleraPreview({ events }: Props) {
  const preview = events.slice(0, 4)

  return (
    <section className="px-8 md:px-16 py-20 border-t border-white/[0.08]">
      {/* Header */}
      <div className="flex items-center gap-6 mb-12 reveal">
        <div className="flex-1 h-px"
          style={{ background: 'linear-gradient(to right, rgba(160,120,74,0.35), transparent)' }} />
        <span className="font-mono text-[0.6rem] tracking-[0.5em] uppercase"
          style={{ color: 'var(--color-parker-concrete)' }}>
          Programa — Esta semana
        </span>
        <div className="flex-1 h-px"
          style={{ background: 'linear-gradient(to left, rgba(192,32,42,0.35), transparent)' }} />
      </div>

      {preview.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.06]">
          {preview.map((event, i) => (
            <div key={event.slug} className={`bg-black reveal reveal-delay-${Math.min(i + 1, 3)}`}>
              <ConcertCard event={event} />
            </div>
          ))}
        </div>
      ) : (
        <p className="font-body text-center text-cream-muted py-12">
          No hay conciertos programados esta semana.
        </p>
      )}

      <div className="text-center mt-10 reveal reveal-delay-2">
        <Link
          href="/cartelera"
          className="inline-flex items-center gap-4 font-mono text-[0.65rem] tracking-[0.3em] uppercase text-cream-muted hover:text-cream transition-colors hoverable"
        >
          <span className="w-8 h-px block" style={{ background: 'var(--color-parker-bronze)' }} />
          Cartelera completa
          <span className="w-8 h-px block" style={{ background: 'var(--color-parker-bronze)' }} />
        </Link>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Crear ManifestoSection.tsx**

```tsx
// src/components/sections/ManifestoSection.tsx
export function ManifestoSection() {
  return (
    <section className="relative px-8 md:px-16 py-32 flex flex-col items-center text-center border-t border-white/[0.08] overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 35% 50% at 25% 50%, rgba(30,51,40,0.2), transparent 60%),
            radial-gradient(ellipse 35% 50% at 75% 50%, rgba(192,32,42,0.1), transparent 60%)
          `,
        }}
      />

      <p
        className="font-serif font-normal leading-snug max-w-[22ch] relative z-10 reveal"
        style={{ fontSize: 'clamp(1.8rem, 4vw, 3.2rem)' }}
      >
        Dos maneras de vivir la misma música.{' '}
        <em style={{ color: 'var(--color-parker-bronze)' }}>Parker</em> te la mete en el pecho.{' '}
        <em style={{ color: 'var(--color-lenox-red)' }}>Lenox</em> te la sirve en el vaso.
      </p>

      <p className="mt-8 font-body text-base tracking-[0.1em] relative z-10 reveal reveal-delay-2"
        style={{ color: 'rgba(237,232,220,0.4)', fontWeight: 300 }}>
        Una sola puerta. Una sola noche.
      </p>
    </section>
  )
}
```

- [ ] **Step 4: Reescribir app/page.tsx**

```tsx
// src/app/page.tsx
export const dynamic = 'force-dynamic'

import { IntroSection }      from '@/components/sections/IntroSection'
import { SalaSelector }      from '@/components/sections/SalaSelector'
import { CarreleraPreview }  from '@/components/sections/CarreleraPreview'
import { ManifestoSection }  from '@/components/sections/ManifestoSection'
import { ScrollReveal }      from '@/components/ui/ScrollReveal'
import { getEvents }         from '@/lib/api'

export default async function HomePage() {
  const events = await getEvents().catch(() => [])

  return (
    <>
      <IntroSection />
      <SalaSelector />
      <CarreleraPreview events={events} />
      <ManifestoSection />
      <ScrollReveal />
    </>
  )
}
```

- [ ] **Step 5: Crear ScrollReveal.tsx (client component para IntersectionObserver)**

```tsx
// src/components/ui/ScrollReveal.tsx
'use client'

import { useEffect } from 'react'

export function ScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible')
          observer.unobserve(e.target)
        }
      }),
      { threshold: 0.15 }
    )
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return null
}
```

- [ ] **Step 6: Verificar tipos**

```bash
cd /opt/parker-lenox-site
npx tsc --noEmit 2>&1 | grep -v "checkout\|cartelera\|checkout" | head -20
```

- [ ] **Step 7: Commit**

```bash
cd /opt/parker-lenox-site
git add src/components/sections/ src/components/ui/ConcertCard.tsx src/components/ui/ScrollReveal.tsx src/app/page.tsx
git commit -m "feat: landing page — CarreleraPreview, ManifestoSection, ConcertCard"
```

---

## Task 7: /cartelera — página completa con filtro Parker/Lenox

**Files:**
- Create: `src/components/ui/SalaFilter.tsx`
- Rewrite: `src/app/cartelera/page.tsx`

- [ ] **Step 1: Crear SalaFilter.tsx (client component)**

```tsx
// src/components/ui/SalaFilter.tsx
'use client'

import { useState } from 'react'
import { ConcertCard } from '@/components/ui/ConcertCard'
import type { TicketEvent } from '@/types/api'

type Filter = 'todos' | 'parker' | 'lenox'

interface Props {
  events: TicketEvent[]
}

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'todos',  label: 'Todos' },
  { value: 'parker', label: 'Parker' },
  { value: 'lenox',  label: 'Lenox' },
]

export function SalaFilter({ events }: Props) {
  const [active, setActive] = useState<Filter>('todos')

  const filtered = events.filter(e => {
    if (active === 'todos') return true
    return e.venue.toLowerCase().includes(active)
  })

  return (
    <>
      {/* Toggle */}
      <div className="flex items-center gap-1 mb-10">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setActive(f.value)}
            className="font-mono text-[0.6rem] tracking-[0.3em] uppercase px-5 py-2 border transition-all duration-300 hoverable"
            style={{
              borderColor: active === f.value
                ? (f.value === 'lenox' ? 'var(--color-lenox-red)' : 'var(--color-parker-bronze)')
                : 'rgba(255,255,255,0.1)',
              color: active === f.value
                ? (f.value === 'lenox' ? 'var(--color-lenox-red)' : 'var(--color-parker-bronze)')
                : 'rgba(255,255,255,0.4)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map(e => (
            <ConcertCard key={e.slug} event={e} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="font-serif text-2xl font-light text-cream-muted">
            No hay conciertos en {active === 'parker' ? 'Parker' : 'Lenox'} próximamente.
          </p>
          <button
            onClick={() => setActive('todos')}
            className="mt-6 font-mono text-[0.6rem] tracking-widest uppercase text-white/30 hover:text-cream transition-colors hoverable"
          >
            Ver todos →
          </button>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 2: Reescribir app/cartelera/page.tsx**

```tsx
// src/app/cartelera/page.tsx
export const dynamic = 'force-dynamic'

import { SalaFilter } from '@/components/ui/SalaFilter'
import { getEvents }  from '@/lib/api'

export const metadata = { title: 'Cartelera — Parker & Lenox' }

export default async function CarreleraPage() {
  const events = await getEvents().catch(() => [])

  return (
    <div className="relative min-h-screen pt-32 pb-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 20% 10%, rgba(92,26,26,0.15) 0%, transparent 50%)' }}
      />

      <div className="relative z-10 px-8 md:px-16 max-w-6xl mx-auto">
        <div className="mb-16">
          <p className="font-mono text-[0.6rem] tracking-[0.5em] uppercase mb-3"
            style={{ color: 'var(--color-parker-bronze)' }}>
            En escena
          </p>
          <h1 className="font-serif text-5xl md:text-7xl font-light text-cream">Cartelera</h1>
          <div className="mt-4 h-px w-24"
            style={{ background: 'linear-gradient(to right, rgba(160,120,74,0.4), transparent)' }} />
        </div>

        <SalaFilter events={events} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verificar tipos**

```bash
cd /opt/parker-lenox-site
npx tsc --noEmit 2>&1 | grep "SalaFilter\|cartelera/page" | head -10
```

- [ ] **Step 4: Commit**

```bash
cd /opt/parker-lenox-site
git add src/components/ui/SalaFilter.tsx src/app/cartelera/page.tsx
git commit -m "feat: /cartelera con filtro Parker/Lenox"
```

---

## Task 8: /cartelera/[slug] — detalle de evento

**Files:**
- Rewrite: `src/app/cartelera/[slug]/page.tsx`

- [ ] **Step 1: Reescribir app/cartelera/[slug]/page.tsx**

```tsx
// src/app/cartelera/[slug]/page.tsx
export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link         from 'next/link'
import Image        from 'next/image'
import { getEventDetail }               from '@/lib/api'
import { formatDate, formatPrice, formatTime } from '@/lib/format'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const detail   = await getEventDetail(slug).catch(() => null)
  return {
    title: detail ? `${detail.event.title} — Parker & Lenox` : 'Evento — Parker & Lenox',
  }
}

function venueAccent(venueName: string): string {
  if (venueName.toLowerCase().includes('lenox')) return 'var(--color-lenox-red)'
  return 'var(--color-parker-bronze)'
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params

  let detail
  try {
    detail = await getEventDetail(slug)
  } catch {
    notFound()
  }

  const { event, ticketTypes, salesActive } = detail
  const firstType = ticketTypes[0]
  const accent    = venueAccent(event.venue)

  return (
    <div className="relative min-h-screen pt-24">
      {/* Hero imagen */}
      <div className="relative h-[65vh] w-full overflow-hidden">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
            style={{ filter: 'contrast(1.1) saturate(0.7) sepia(0.1)' }}
            priority
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 30% 40%, var(--color-parker-red) 0%, var(--color-black) 70%)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 px-8 md:px-16 pb-12 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-6 h-px block" style={{ background: accent }} />
            <p className="font-mono text-[0.6rem] tracking-[0.4em] uppercase" style={{ color: accent }}>
              {event.venue} · {formatDate(event.date)} · {formatTime(event.time)}
            </p>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-light text-cream leading-tight">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Contenido */}
      <div className="relative z-10 px-8 md:px-16 py-16 max-w-5xl mx-auto grid md:grid-cols-3 gap-12">
        {/* Descripción */}
        <div className="md:col-span-2">
          {event.description && (
            <>
              <h2 className="font-serif text-2xl font-light text-cream mb-4">Sobre el evento</h2>
              <p className="font-body text-base leading-relaxed" style={{ color: 'rgba(237,232,220,0.7)' }}>
                {event.description}
              </p>
            </>
          )}
        </div>

        {/* Compra */}
        <div className="border border-white/10 p-6 self-start">
          {salesActive && firstType ? (
            <>
              <p className="font-mono text-[0.6rem] tracking-widest uppercase mb-2" style={{ color: accent }}>
                Boletos
              </p>
              <p className="font-serif text-3xl font-light text-cream mb-1">
                {formatPrice(firstType.price)}
              </p>
              <p className="font-mono text-[0.6rem] text-white/30 mb-6">
                {firstType.available} disponibles
              </p>
              <Link
                href={`/checkout/${slug}`}
                className="block w-full text-center px-6 py-3 font-mono text-[0.6rem] tracking-widest uppercase text-cream border transition-colors duration-500 hover:bg-white/5 hoverable"
                style={{ borderColor: `${accent}60` }}
              >
                Comprar boletos
              </Link>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="font-body text-sm" style={{ color: 'rgba(237,232,220,0.5)' }}>
                {salesActive ? 'Agotado' : 'Venta no disponible'}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="px-8 md:px-16 pb-12 max-w-5xl mx-auto">
        <Link href="/cartelera" className="font-mono text-[0.6rem] tracking-widest uppercase text-white/30 hover:text-cream transition-colors hoverable">
          ← Cartelera
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar tipos**

```bash
cd /opt/parker-lenox-site
npx tsc --noEmit 2>&1 | grep "slug" | head -10
```

- [ ] **Step 3: Commit**

```bash
cd /opt/parker-lenox-site
git add src/app/cartelera/
git commit -m "feat: /cartelera/[slug] — detalle de evento con compra"
```

---

## Task 9: /checkout/[slug] y /checkout/success

**Files:**
- Rewrite: `src/app/checkout/[slug]/page.tsx`
- Rewrite: `src/app/checkout/[slug]/error.tsx`
- Rewrite: `src/app/checkout/success/page.tsx`

- [ ] **Step 1: Reescribir app/checkout/[slug]/page.tsx**

```tsx
// src/app/checkout/[slug]/page.tsx
export const dynamic = 'force-dynamic'

import { notFound }    from 'next/navigation'
import Link            from 'next/link'
import { getEventDetail } from '@/lib/api'
import { initiateCheckout } from '@/lib/actions'
import { formatDate, formatPrice, formatTime } from '@/lib/format'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const detail   = await getEventDetail(slug).catch(() => null)
  return {
    title: detail ? `${detail.event.title} — Boletos | Parker & Lenox` : 'Checkout | Parker & Lenox',
  }
}

export default async function CheckoutPage({ params, searchParams }: Props & { searchParams: Promise<{ cancelled?: string }> }) {
  const { slug } = await params
  const sp       = await searchParams

  const detail = await getEventDetail(slug).catch(() => notFound())
  const { event, ticketTypes, salesActive } = detail
  if (!salesActive) notFound()

  function venueAccent(v: string) {
    return v.toLowerCase().includes('lenox') ? 'var(--color-lenox-red)' : 'var(--color-parker-bronze)'
  }
  const accent = venueAccent(event.venue)

  return (
    <div className="relative min-h-screen pt-32 pb-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 60% 20%, rgba(92,26,26,0.12) 0%, transparent 50%)' }}
      />

      <div className="relative z-10 px-8 md:px-16 max-w-xl mx-auto">
        {/* Header evento */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-5 h-px block" style={{ background: accent }} />
            <p className="font-mono text-[0.6rem] tracking-widest uppercase" style={{ color: accent }}>
              {event.venue}
            </p>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-light text-cream">{event.title}</h1>
          <p className="font-mono text-[0.6rem] text-white/30 mt-2 tracking-widest">
            {formatDate(event.date)} · {formatTime(event.time)}
          </p>
        </div>

        {/* Aviso de cancelación */}
        {sp.cancelled && (
          <p className="mb-6 font-mono text-[0.65rem] tracking-widest uppercase px-4 py-3 border"
            style={{ borderColor: 'rgba(192,32,42,0.3)', color: 'var(--color-lenox-red)' }}>
            Pago cancelado. Puedes intentarlo de nuevo.
          </p>
        )}

        {/* Form */}
        <form action={initiateCheckout} className="flex flex-col gap-6">
          <input type="hidden" name="slug" value={slug} />

          {/* Tipo de boleto */}
          <fieldset className="border-0 p-0 m-0">
            <legend className="block font-mono text-[0.6rem] tracking-widest uppercase text-white/40 mb-3">
              Tipo de boleto
            </legend>
            {ticketTypes.map((tt, i) => (
              <label
                key={tt.id}
                className="flex items-center justify-between border border-white/10 px-4 py-3 mb-2 cursor-none hover:border-white/20 transition-colors hoverable"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="ticketTypeId"
                    value={tt.id}
                    defaultChecked={i === 0}
                    style={{ accentColor: accent }}
                  />
                  <span className="font-body text-base text-cream">{tt.name}</span>
                </div>
                <span className="font-mono text-sm" style={{ color: accent }}>
                  {formatPrice(tt.price)}
                </span>
              </label>
            ))}
          </fieldset>

          {/* Cantidad */}
          <div>
            <label htmlFor="quantity" className="block font-mono text-[0.6rem] tracking-widest uppercase text-white/40 mb-3">
              Cantidad
            </label>
            <select
              id="quantity"
              name="quantity"
              className="w-full border border-white/10 px-4 py-3 font-body text-base text-cream focus:border-white/30 focus:outline-none"
              style={{ background: 'var(--color-black)' }}
            >
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <option key={n} value={n}>{n} boleto{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          {/* Nombre */}
          <div>
            <label htmlFor="customerName" className="block font-mono text-[0.6rem] tracking-widest uppercase text-white/40 mb-3">
              Tu nombre
            </label>
            <input
              id="customerName"
              type="text"
              name="customerName"
              required
              placeholder="Nombre completo"
              className="w-full border border-white/10 px-4 py-3 font-body text-base text-cream placeholder:text-white/20 focus:border-white/30 focus:outline-none"
              style={{ background: 'var(--color-black)' }}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="customerEmail" className="block font-mono text-[0.6rem] tracking-widest uppercase text-white/40 mb-3">
              Email
            </label>
            <input
              id="customerEmail"
              type="email"
              name="customerEmail"
              required
              placeholder="tu@email.com"
              className="w-full border border-white/10 px-4 py-3 font-body text-base text-cream placeholder:text-white/20 focus:border-white/30 focus:outline-none"
              style={{ background: 'var(--color-black)' }}
            />
            <p className="mt-2 font-mono text-[0.55rem] tracking-widest text-white/25">
              Recibirás tus boletos en este correo.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full px-6 py-4 font-mono text-[0.65rem] tracking-[0.3em] uppercase text-cream border transition-colors duration-500 hoverable"
            style={{ borderColor: `${accent}60` }}
          >
            Ir a pagar →
          </button>
        </form>

        <div className="mt-8">
          <Link href={`/cartelera/${slug}`} className="font-mono text-[0.6rem] tracking-widest uppercase text-white/25 hover:text-cream transition-colors hoverable">
            ← Volver al evento
          </Link>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Reescribir app/checkout/[slug]/error.tsx**

```tsx
// src/app/checkout/[slug]/error.tsx
'use client'

import Link from 'next/link'

export default function CheckoutError({ error }: { error: Error }) {
  return (
    <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center px-8 text-center">
      <p className="font-mono text-[0.6rem] tracking-widest uppercase mb-4"
        style={{ color: 'var(--color-lenox-red)' }}>
        Error al procesar
      </p>
      <p className="font-serif text-2xl font-light text-cream mb-8">
        {error.message || 'Ocurrió un error inesperado.'}
      </p>
      <Link
        href="/cartelera"
        className="font-mono text-[0.6rem] tracking-widest uppercase text-white/40 hover:text-cream transition-colors hoverable"
      >
        ← Volver a la cartelera
      </Link>
    </div>
  )
}
```

- [ ] **Step 3: Reescribir app/checkout/success/page.tsx**

```tsx
// src/app/checkout/success/page.tsx
import Link from 'next/link'

export const metadata = { title: 'Boletos confirmados — Parker & Lenox' }

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 40% 50% at 50% 40%, rgba(30,51,40,0.25), transparent 60%)
          `,
        }}
      />

      <div className="relative z-10">
        <span className="font-serif text-5xl block mb-6" style={{ color: 'var(--color-parker-bronze)' }}>
          ◆
        </span>
        <p className="font-mono text-[0.6rem] tracking-[0.5em] uppercase mb-4"
          style={{ color: 'var(--color-parker-bronze)' }}>
          Confirmado
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-light text-cream mb-4">
          Tus boletos están en camino.
        </h1>
        <p className="font-body text-base mb-10" style={{ color: 'rgba(237,232,220,0.5)', fontWeight: 300 }}>
          Revisa tu correo — recibirás un PDF por boleto.
        </p>
        <Link
          href="/cartelera"
          className="inline-flex items-center gap-4 font-mono text-[0.65rem] tracking-[0.3em] uppercase text-cream hoverable"
        >
          <span className="w-8 h-px block" style={{ background: 'var(--color-parker-bronze)' }} />
          Ver más eventos
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verificar tipos**

```bash
cd /opt/parker-lenox-site
npx tsc --noEmit 2>&1 | head -20
```

Expected: 0 errores.

- [ ] **Step 5: Commit**

```bash
cd /opt/parker-lenox-site
git add src/app/checkout/
git commit -m "feat: checkout flow — form, error state, success page"
```

---

## Task 10: Build, Docker y push a GitHub

**Files:**
- Verify: `Dockerfile` (heredado de notabot-site, sin cambios)
- Verify: `.env` (crear en VPS con valores reales)

- [ ] **Step 1: Verificar Dockerfile heredado**

```bash
cat /opt/parker-lenox-site/Dockerfile
```

El Dockerfile de notabot-site ya usa `output: 'standalone'` y funciona correctamente. Si contiene referencias a `notabot-site`, actualizar el nombre de la app (solo strings cosméticos).

- [ ] **Step 2: Instalar dependencias y hacer build local**

```bash
cd /opt/parker-lenox-site
npm install
npm run build 2>&1 | tail -30
```

Expected: `✓ Compiled successfully` (o equivalente). Resolver cualquier error de compilación antes de continuar.

- [ ] **Step 3: Crear .env en el VPS con valores reales**

```bash
cat > /opt/parker-lenox-site/.env << 'EOF'
CORE_API_URL=https://core.notabot.mx
CORE_API_KEY=khspAhp6zIZ3R_1vbrVTIRFmJy-MJwS1izWe3GVRNKI
NEXT_PUBLIC_APP_URL=https://staging.parkerandlenox.com
EOF
```

Nota: El `CORE_API_KEY` es el `REPORT_API_KEY` de la tickets API que acepta llamadas con `x-api-key`. Verificar que funciona con:
```bash
curl -s "https://core.notabot.mx/v1/tickets/public/events?brand=parker_lenox" \
  -H "x-api-key: khspAhp6zIZ3R_1vbrVTIRFmJy-MJwS1izWe3GVRNKI" | head -200
```

- [ ] **Step 4: Build Docker y levantar contenedor**

```bash
cd /opt/parker-lenox-site
docker compose build
docker compose up -d
docker logs parker-lenox-site --tail 20
```

Expected: `Listening on port 3000`

- [ ] **Step 5: Verificar que el contenedor responde**

```bash
docker exec parker-lenox-site wget -qO- http://localhost:3000 | head -5
```

Expected: HTML con `<title>Parker &amp; Lenox</title>`

- [ ] **Step 6: Verificar que Traefik emite certificado y el sitio es accesible**

```bash
curl -sI https://staging.parkerandlenox.com | head -5
```

Expected: `HTTP/2 200` (puede tardar 1-2 min la primera vez para el cert Let's Encrypt)

- [ ] **Step 7: Push final a GitHub**

```bash
cd /opt/parker-lenox-site
git push origin main
```

- [ ] **Step 8: Verificar en browser**

Abrir `https://staging.parkerandlenox.com` y confirmar:
- Hero con título animado "Parker & Lenox"
- Split Parker/Lenox con hover tints
- Cartelera preview con eventos reales de la API
- Manifesto con colores duales
- Cursor custom visible
- `/cartelera` carga con filtros
- `/cartelera/[slug]` muestra detalle y botón de compra

---

## Notas de implementación

- El `CORE_API_KEY` (`REPORT_API_KEY`) ya existe en la tickets API y acepta llamadas públicas autenticadas. No se necesita una API key nueva.
- El webhook de Stripe va directo a `core.notabot.mx/v1/tickets/webhook` — el site Next.js no necesita endpoint propio.
- `cursor: none` en CSS afecta toda la página — el `CustomCursor` solo se monta en el cliente. En mobile, el cursor custom no interfiere.
- El `.env` con credenciales NO se commitea (ya está en `.gitignore` del proyecto clonado).
