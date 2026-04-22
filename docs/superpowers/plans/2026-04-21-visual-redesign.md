# Not a Bot — Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el estilo romántico-elegante actual de la landing page por una estética de cartel de teatro oscuro — tipografía serif en pesos máximos, hero split con imagen de la mujer del logo, franja de logos de proyectos, y cartelera en scroll horizontal cinemático.

**Architecture:** Cambios únicamente en la landing page y el design system global (tokens CSS). Las páginas internas (`/cartelera`, `/discos`, etc.) heredan los nuevos tokens de color automáticamente sin cambios estructurales. Se crean dos nuevos componentes (`ProyectosStrip`, `CinematicEventCard`) y se reescriben tres secciones existentes (`HeroSection`, `ProyectosPreview` → `ProyectosStrip`, `CarreleraPreview`).

**Tech Stack:** Next.js 15 · TypeScript · Tailwind v4 (CSS-first, `@theme` en globals.css) · Cormorant Garamond weight 700 italic (máximo disponible en Google Fonts) · Inter

---

## File Map

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `src/app/globals.css` | Modificar | Actualizar `--color-gold`, agregar `--color-section-alt`, agregar `.no-scrollbar` |
| `src/components/sections/HeroSection.tsx` | Reescribir | Split 60/40, placeholder imagen, titular "Música de humanos para humanos" |
| `src/components/sections/ProyectosPreview.tsx` | Eliminar | Reemplazado por ProyectosStrip |
| `src/components/sections/ProyectosStrip.tsx` | Crear | Franja oscura con logos en grayscale → color on hover |
| `src/components/ui/CinematicEventCard.tsx` | Crear | Tarjeta 400×560px tipo poster, para el scroll horizontal |
| `src/components/sections/CarreleraPreview.tsx` | Reescribir | Título enorme + scroll horizontal de CinematicEventCards |
| `src/app/page.tsx` | Modificar | Cambiar import ProyectosPreview → ProyectosStrip |

---

## Task 1: Actualizar design tokens en globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Actualizar globals.css**

Reemplazar el contenido completo de `/opt/notabot-site/src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-canvas: #0d0905;
  --color-section-alt: #110e0a;
  --color-burgundy: #6b1a2a;
  --color-burgundy-dark: #4a1020;
  --color-burgundy-light: #8b2a3a;
  --color-gold: #c8a030;
  --color-gold-light: #e0b840;
  --color-gold-muted: #8a6a1a;
  --color-cream: #f0e6c8;
  --color-cream-muted: #a89880;
  --color-cream-dim: #6a5a48;

  --font-serif: var(--font-cormorant), Georgia, serif;
  --font-sans: var(--font-inter), system-ui, sans-serif;
}

@layer base {
  html {
    background-color: #0d0905;
    color: #f0e6c8;
    scroll-behavior: smooth;
  }

  body {
    background-color: #0d0905;
    min-height: 100vh;
  }

  h1, h2, h3, h4 {
    font-family: var(--font-cormorant), Georgia, serif;
    letter-spacing: 0.01em;
  }

  ::selection {
    background-color: #6b1a2a;
    color: #f0e6c8;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #0d0905; }
  ::-webkit-scrollbar-thumb { background: #3a1a10; border-radius: 3px; }
}

@layer utilities {
  .image-painted {
    filter: contrast(1.15) saturate(0.75) sepia(0.12);
  }

  .text-shadow-warm {
    text-shadow: 0 2px 24px rgba(200, 160, 48, 0.35);
  }

  .divider-ornament {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #c8a030;
  }

  .divider-ornament::before,
  .divider-ornament::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(200, 160, 48, 0.3), transparent);
  }

  /* Para el scroll horizontal del carrusel */
  .no-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd /opt/notabot-site && npx tsc --noEmit 2>&1 | head -20
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
cd /opt/notabot-site && git add src/app/globals.css && git commit -m "feat: update design tokens — gold #c8a030, section-alt, no-scrollbar utility"
```

---

## Task 2: Reescribir HeroSection — split layout 60/40

**Files:**
- Modify: `src/components/sections/HeroSection.tsx`

- [ ] **Step 1: Reescribir HeroSection.tsx**

Reemplazar el contenido completo de `/opt/notabot-site/src/components/sections/HeroSection.tsx`:

```tsx
import Link from 'next/link'
import { GrainOverlay } from '@/components/ui/GrainOverlay'

export function HeroSection() {
  return (
    <section className="relative flex flex-col md:flex-row overflow-hidden" style={{ minHeight: '100svh' }}>

      {/* ── Columna izquierda — imagen (placeholder) ── */}
      <div className="relative w-full md:w-[60%] h-[50vh] md:h-auto flex-shrink-0">
        {/* Placeholder: fondo oscuro cálido hasta que llegue la imagen real */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 40% 30%, #2a1a0a 0%, #0d0905 100%)' }}
        />
        {/* Fundido lateral derecho para conectar con la columna de texto en desktop */}
        <div
          className="absolute inset-y-0 right-0 w-24 hidden md:block"
          style={{ background: 'linear-gradient(to right, transparent, #0d0905)' }}
        />
        {/* Fundido inferior para conectar con la columna de texto en móvil */}
        <div
          className="absolute inset-x-0 bottom-0 h-20 md:hidden"
          style={{ background: 'linear-gradient(to bottom, transparent, #0d0905)' }}
        />
        {/* Texto placeholder — quitar cuando llegue la imagen */}
        <div className="absolute inset-0 flex items-end p-8 md:p-12">
          <p
            className="font-serif italic text-cream-dim"
            style={{ fontSize: '12px', letterSpacing: '0.15em' }}
          >
            [imagen]
          </p>
        </div>
      </div>

      {/* ── Columna derecha — texto ── */}
      <div className="relative w-full md:w-[40%] flex items-center bg-canvas px-10 md:px-14 py-16 md:py-0">
        <GrainOverlay opacity={0.06} />

        <div className="relative z-10 w-full">
          {/* Eyebrow */}
          <p
            className="font-sans text-gold"
            style={{ fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '18px' }}
          >
            Not a Bot
          </p>

          {/* Línea dorada superior */}
          <div style={{ height: '1px', background: 'rgba(200,160,48,0.35)', marginBottom: '28px' }} />

          {/* Titular principal */}
          <h1
            className="font-serif italic text-cream"
            style={{
              fontSize: 'clamp(46px, 5.5vw, 84px)',
              fontWeight: 700,
              lineHeight: 0.92,
              marginBottom: '28px',
            }}
          >
            Música de<br />
            humanos<br />
            para<br />
            humanos
          </h1>

          {/* Línea dorada inferior */}
          <div style={{ height: '1px', background: 'rgba(200,160,48,0.35)', marginBottom: '22px' }} />

          {/* Tagline */}
          <p
            className="font-sans text-cream-muted"
            style={{ fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '36px' }}
          >
            Jazz · Vinilo · CDMX
          </p>

          {/* CTA */}
          <Link
            href="/cartelera"
            className="inline-block font-sans text-gold hover:bg-gold/10 transition-colors duration-500"
            style={{
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              border: '1px solid rgba(200,160,48,0.45)',
              padding: '13px 30px',
            }}
          >
            Ver cartelera →
          </Link>
        </div>
      </div>

    </section>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd /opt/notabot-site && npx tsc --noEmit 2>&1 | head -20
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
cd /opt/notabot-site && git add src/components/sections/HeroSection.tsx && git commit -m "feat: hero split layout 60/40 — imagen + Música de humanos para humanos"
```

---

## Task 3: Crear ProyectosStrip — franja de logos

**Files:**
- Create: `src/components/sections/ProyectosStrip.tsx`
- Delete: `src/components/sections/ProyectosPreview.tsx`

- [ ] **Step 1: Crear ProyectosStrip.tsx**

Crear `/opt/notabot-site/src/components/sections/ProyectosStrip.tsx`:

```tsx
import Image from 'next/image'
import Link from 'next/link'
import type { Project } from '@/types/api'

export function ProyectosStrip({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null

  return (
    <section
      style={{
        background: '#110e0a',
        borderTop: '1px solid rgba(200,160,48,0.2)',
        borderBottom: '1px solid rgba(200,160,48,0.2)',
      }}
    >
      <div className="px-6 md:px-12 py-10">
        {/* Label */}
        <p
          className="font-sans text-gold text-center"
          style={{
            fontSize: '9px',
            letterSpacing: '0.5em',
            textTransform: 'uppercase',
            marginBottom: '28px',
          }}
        >
          Nuestros proyectos
        </p>

        {/* Fila de logos */}
        <div
          className="flex items-center justify-center gap-10 md:gap-16 overflow-x-auto no-scrollbar pb-1"
        >
          {projects.map((p) => (
            <Link
              key={p.id}
              href="/proyectos"
              className="flex-shrink-0 group"
              style={{
                filter: 'grayscale(1) brightness(0.65)',
                transition: 'filter 400ms ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.filter = 'grayscale(0) brightness(1)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.filter = 'grayscale(1) brightness(0.65)'
              }}
            >
              {p.photoUrl ? (
                <div className="relative w-20 h-20">
                  <Image
                    src={p.photoUrl}
                    alt={p.artisticName || p.name}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <span
                  className="font-serif italic text-cream-muted group-hover:text-cream"
                  style={{
                    fontSize: '16px',
                    whiteSpace: 'nowrap',
                    display: 'block',
                    padding: '8px 0',
                  }}
                >
                  {p.artisticName || p.name}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
```

> **Nota:** Los `onMouseEnter`/`onMouseLeave` con inline style son necesarios porque Tailwind v4 no genera `group-hover:grayscale-0` ni `group-hover:brightness-100` como clases aplicadas al padre que afecten al propio elemento. Si el proyecto migra a CSS puro en el futuro, usar `:hover` en CSS es más limpio.

- [ ] **Step 2: Eliminar ProyectosPreview.tsx**

```bash
rm /opt/notabot-site/src/components/sections/ProyectosPreview.tsx
```

- [ ] **Step 3: Verificar TypeScript**

```bash
cd /opt/notabot-site && npx tsc --noEmit 2>&1 | head -20
```

Expected: errores de "cannot find module ProyectosPreview" — se resolverán en Task 6.

- [ ] **Step 4: Commit**

```bash
cd /opt/notabot-site && git add src/components/sections/ProyectosStrip.tsx && git rm src/components/sections/ProyectosPreview.tsx && git commit -m "feat: ProyectosStrip — franja de logos grayscale con hover a color"
```

---

## Task 4: Crear CinematicEventCard — tarjeta tipo poster 400×560

**Files:**
- Create: `src/components/ui/CinematicEventCard.tsx`

- [ ] **Step 1: Crear CinematicEventCard.tsx**

Crear `/opt/notabot-site/src/components/ui/CinematicEventCard.tsx`:

```tsx
import Image from 'next/image'
import Link from 'next/link'
import type { TicketEvent } from '@/types/api'
import { formatDate, formatTime } from '@/lib/format'

export function CinematicEventCard({ event }: { event: TicketEvent }) {
  return (
    <Link
      href={`/cartelera/${event.slug}`}
      className="group relative flex-shrink-0 overflow-hidden block"
      style={{
        width: '400px',
        height: '560px',
        scrollSnapAlign: 'start',
      }}
    >
      {/* Imagen de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            style={{ filter: 'contrast(1.1) saturate(0.8) sepia(0.15)' }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 30% 30%, #3d1202 0%, #0d0905 80%)' }}
          />
        )}
      </div>

      {/* Gradiente inferior */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(13,9,5,0.97) 0%, rgba(13,9,5,0.45) 45%, transparent 72%)',
        }}
      />

      {/* Badge agotado */}
      {event.soldOut && (
        <div
          className="absolute top-4 right-4 font-sans text-gold"
          style={{
            fontSize: '8px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            border: '1px solid rgba(200,160,48,0.45)',
            padding: '5px 9px',
          }}
        >
          Agotado
        </div>
      )}

      {/* Info inferior — sube 4px en hover */}
      <div
        className="absolute bottom-0 left-0 right-0 p-6 transition-transform duration-[400ms] group-hover:-translate-y-1"
      >
        <p
          className="font-sans text-gold"
          style={{
            fontSize: '9px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          {formatDate(event.date)} · {formatTime(event.time)}
        </p>
        <h3
          className="font-serif italic text-cream"
          style={{
            fontSize: '26px',
            fontWeight: 600,
            lineHeight: 1.1,
            marginBottom: '6px',
          }}
        >
          {event.title}
        </h3>
        <p
          className="font-sans text-cream-muted"
          style={{ fontSize: '11px', letterSpacing: '0.08em' }}
        >
          {event.venue}
        </p>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd /opt/notabot-site && npx tsc --noEmit 2>&1 | head -20
```

Expected: sin errores nuevos (puede seguir el error de ProyectosPreview hasta Task 6).

- [ ] **Step 3: Commit**

```bash
cd /opt/notabot-site && git add src/components/ui/CinematicEventCard.tsx && git commit -m "feat: CinematicEventCard — poster 400x560 con scroll-snap y hover"
```

---

## Task 5: Reescribir CarreleraPreview — título enorme + scroll horizontal

**Files:**
- Modify: `src/components/sections/CarreleraPreview.tsx`

- [ ] **Step 1: Reescribir CarreleraPreview.tsx**

Reemplazar el contenido completo de `/opt/notabot-site/src/components/sections/CarreleraPreview.tsx`:

```tsx
import Link from 'next/link'
import { CinematicEventCard } from '@/components/ui/CinematicEventCard'
import type { TicketEvent } from '@/types/api'

export function CarreleraPreview({ events }: { events: TicketEvent[] }) {
  return (
    <section className="py-20 overflow-hidden">

      {/* Título enorme + link desktop */}
      <div
        className="flex items-baseline justify-between mb-8"
        style={{ paddingLeft: 'clamp(24px, 4vw, 48px)', paddingRight: 'clamp(24px, 4vw, 48px)' }}
      >
        <h2
          className="font-serif italic text-cream"
          style={{
            fontSize: 'clamp(72px, 10vw, 140px)',
            fontWeight: 700,
            lineHeight: 0.9,
          }}
        >
          Cartelera
        </h2>
        <Link
          href="/cartelera"
          className="hidden md:block font-sans text-cream-muted hover:text-cream transition-colors flex-shrink-0 ml-8"
          style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase' }}
        >
          Ver todo →
        </Link>
      </div>

      {/* Scroll horizontal cinemático */}
      {events.length > 0 ? (
        <div
          className="flex gap-4 no-scrollbar"
          style={{
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
            paddingLeft: 'clamp(24px, 4vw, 48px)',
            paddingRight: '80px',
            paddingBottom: '8px',
          }}
        >
          {events.map((e) => (
            <CinematicEventCard key={e.slug} event={e} />
          ))}
        </div>
      ) : (
        <p
          className="font-sans text-cream-muted"
          style={{
            paddingLeft: 'clamp(24px, 4vw, 48px)',
            fontSize: '14px',
          }}
        >
          No hay conciertos próximos. Vuelve pronto.
        </p>
      )}

      {/* Link móvil */}
      <div className="mt-6 md:hidden" style={{ paddingLeft: 'clamp(24px, 4vw, 48px)' }}>
        <Link
          href="/cartelera"
          className="font-sans text-gold"
          style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase' }}
        >
          Ver cartelera completa →
        </Link>
      </div>

    </section>
  )
}
```

> **Nota:** `WebkitOverflowScrolling` está tipado como string arbitrario en algunas versiones de React. Si TypeScript se queja de `WebkitOverflowScrolling`, usar el cast `as React.CSSProperties['WebkitOverflowScrolling']` o simplemente omitirlo (el scroll suave en iOS sigue funcionando en versiones modernas sin esa propiedad).

- [ ] **Step 2: Verificar TypeScript**

```bash
cd /opt/notabot-site && npx tsc --noEmit 2>&1 | head -20
```

Expected: puede persistir el error de ProyectosPreview — se resuelve en Task 6.

- [ ] **Step 3: Commit**

```bash
cd /opt/notabot-site && git add src/components/sections/CarreleraPreview.tsx && git commit -m "feat: CarreleraPreview — título enorme y scroll horizontal cinemático"
```

---

## Task 6: Actualizar page.tsx + build + deploy staging

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Actualizar imports en page.tsx**

Reemplazar el contenido completo de `/opt/notabot-site/src/app/page.tsx`:

```tsx
export const dynamic = 'force-dynamic'

import { HeroSection } from '@/components/sections/HeroSection'
import { ProyectosStrip } from '@/components/sections/ProyectosStrip'
import { CarreleraPreview } from '@/components/sections/CarreleraPreview'
import { DiscosPreview } from '@/components/sections/DiscosPreview'
import { MerchPreview } from '@/components/sections/MerchPreview'
import { getEvents, getProjects, getReleases, getProducts } from '@/lib/api'

export default async function HomePage() {
  const [events, projects, releases, products] = await Promise.all([
    getEvents().catch(() => []),
    getProjects().catch(() => []),
    getReleases().catch(() => []),
    getProducts().catch(() => []),
  ])

  return (
    <>
      <HeroSection />
      <ProyectosStrip projects={projects} />
      <CarreleraPreview events={events} />
      <DiscosPreview releases={releases} />
      <MerchPreview products={products} />
    </>
  )
}
```

- [ ] **Step 2: Verificar TypeScript limpio**

```bash
cd /opt/notabot-site && npx tsc --noEmit 2>&1 | head -30
```

Expected: sin errores.

- [ ] **Step 3: Build completo**

```bash
cd /opt/notabot-site && npm run build 2>&1 | tail -20
```

Expected: build exitoso, todas las rutas generadas.

- [ ] **Step 4: Fix de TypeScript si CarreleraPreview tiene error con WebkitOverflowScrolling**

Si `npx tsc --noEmit` reporta error en `CarreleraPreview.tsx` sobre `WebkitOverflowScrolling`, reemplazar la línea problemática en ese archivo:

```tsx
// Reemplazar:
WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
// Por (simplemente omitir esa línea — no es necesaria en iOS moderno):
```

El scroll inercioso en iOS funciona sin esa propiedad desde iOS 13+.

- [ ] **Step 5: Rebuild y deploy en staging**

```bash
cd /opt/notabot-site && docker compose up -d --build 2>&1 | tail -10
```

Expected: imagen construida, contenedor reiniciado.

- [ ] **Step 6: Verificar staging**

```bash
curl -s -o /dev/null -w "%{http_code}" https://staging.notabot.mx
```

Expected: 200.

- [ ] **Step 7: Commit final**

```bash
cd /opt/notabot-site && git add src/app/page.tsx && git commit -m "feat: visual redesign landing — hero split, ProyectosStrip, cartelera cinemática"
```

---

## Checklist de cobertura del spec

- [x] Token `--color-gold` actualizado a `#c8a030`
- [x] Token `--color-section-alt: #110e0a` agregado
- [x] Utilidad `.no-scrollbar` para ocultar scrollbar del carrusel
- [x] Hero split 60/40 — placeholder imagen izquierda, texto derecha
- [x] Titular "Música de humanos para humanos" en Cormorant 700 italic
- [x] Líneas doradas finas arriba y abajo del titular
- [x] Eyebrow "Not a Bot" y tagline "Jazz · Vinilo · CDMX"
- [x] CTA "Ver cartelera →" con borde dorado
- [x] ProyectosStrip con fondo `#110e0a`, bordes dorados, logos en grayscale → color
- [x] Placeholder de nombre cuando no hay `photoUrl`
- [x] Título "Cartelera" enorme (`clamp(72px, 10vw, 140px)`)
- [x] Scroll horizontal con `scroll-snap-type: x mandatory`
- [x] Tarjetas 400×560px con imagen, gradiente, fecha dorada, título serif
- [x] Badge "Agotado" con borde dorado
- [x] Hover: escala imagen + título sube 4px
- [x] Tarjetas se reducen a 280×400px en móvil — **FALTA**: agregar media query o responsive sizing en CinematicEventCard si se requiere (actualmente es 400×560 fijo)
