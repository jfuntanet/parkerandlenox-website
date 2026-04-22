# Eventos + Podcast Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/eventos` and `/podcast` pages to notabot.mx (Fase 1), plus update the Navbar.

**Architecture:** Pure frontend — no backend changes. `/eventos` reuses `getEvents()` grouped by venue via a static map in `src/lib/series.ts`. `/podcast` fetches episode metadata from Spotify API using client credentials flow and renders a Spotify iframe embed + episode list. Both pages are `force-dynamic` server components using the existing visual system (Cormorant 700 italic, gold `#c8a030`, canvas `#0d0905`).

**Tech Stack:** Next.js 15 App Router, Tailwind v4, Cormorant Garamond + Inter, Spotify Web API client credentials, existing `CinematicEventCard` + `CarreleraPreview` scroll pattern.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/lib/series.ts` | Create | Venue→series name map + DEFAULT_SERIES constant |
| `src/lib/podcast.ts` | Create | SHOW_ID constant + `getEpisodes()` Spotify fetch |
| `src/app/eventos/page.tsx` | Create | Server page: fetch events, group by series, render sections |
| `src/app/podcast/page.tsx` | Create | Server page: fetch episodes, render iframe + list |
| `src/components/layout/Navbar.tsx` | Modify | Add Eventos and Podcast links to `links` array |

---

## Task 1: Navbar — add Eventos and Podcast links

**Files:**
- Modify: `src/components/layout/Navbar.tsx:6-11`

- [ ] **Step 1: Update the links array**

Replace the existing `links` array (lines 6–11) with:

```ts
const links = [
  { href: '/cartelera', label: 'Cartelera' },
  { href: '/eventos', label: 'Eventos' },
  { href: '/discos', label: 'Discos' },
  { href: '/podcast', label: 'Podcast' },
  { href: '/merch', label: 'Merch' },
  { href: '/proyectos', label: 'Proyectos' },
]
```

No other changes needed — both desktop (`ul.hidden.md:flex`) and mobile (`ul.absolute`) menus iterate `links` and will pick up the new entries automatically.

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd /opt/notabot-site && npx tsc --noEmit 2>&1 | head -30
```

Expected: no output (or only pre-existing unrelated warnings).

- [ ] **Step 3: Commit**

```bash
cd /opt/notabot-site
git add src/components/layout/Navbar.tsx
git commit -m "feat: add Eventos and Podcast links to Navbar"
```

---

## Task 2: Create `src/lib/series.ts` — venue-to-series map

**Files:**
- Create: `src/lib/series.ts`

- [ ] **Step 1: Create the file**

```ts
export const VENUE_TO_SERIES: Record<string, string> = {
  'Chapultepec Escuadrón 201': 'Jazz en Chapultepec',
  'Museo del Estanquillo':      'Jazz en las Rocas',
}

export const DEFAULT_SERIES = 'Otros eventos'
```

This map is the single place to extend when a new venue is added (e.g. "Jazz is Dead").

- [ ] **Step 2: Verify TypeScript**

```bash
cd /opt/notabot-site && npx tsc --noEmit 2>&1 | head -20
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd /opt/notabot-site
git add src/lib/series.ts
git commit -m "feat: add venue-to-series map"
```

---

## Task 3: Create `/eventos` page

**Files:**
- Create: `src/app/eventos/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
export const dynamic = 'force-dynamic'

import { getEvents } from '@/lib/api'
import { VENUE_TO_SERIES, DEFAULT_SERIES } from '@/lib/series'
import CinematicEventCard from '@/components/ui/CinematicEventCard'
import { GrainOverlay } from '@/components/ui/GrainOverlay'
import type { TicketEvent } from '@/types/api'

export const metadata = { title: 'Eventos — Not a Bot' }

export default async function EventosPage() {
  const events = await getEvents().catch(() => [] as TicketEvent[])

  // Group events by series name, preserving insertion order
  const grouped = new Map<string, TicketEvent[]>()
  for (const event of events) {
    const series = VENUE_TO_SERIES[event.venue] ?? DEFAULT_SERIES
    if (!grouped.has(series)) grouped.set(series, [])
    grouped.get(series)!.push(event)
  }

  return (
    <div className="relative min-h-screen pt-32 pb-24">
      <GrainOverlay opacity={0.03} />

      <div className="relative z-10">
        {/* Page header */}
        <div
          className="mb-16"
          style={{ paddingLeft: 'clamp(24px, 4vw, 48px)', paddingRight: 'clamp(24px, 4vw, 48px)' }}
        >
          <p
            className="font-sans text-gold mb-3"
            style={{ fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase' }}
          >
            Temporadas
          </p>
          <h1
            className="font-serif italic text-cream"
            style={{ fontSize: 'clamp(56px, 7vw, 110px)', fontWeight: 700, lineHeight: 0.9 }}
          >
            Eventos
          </h1>
          <div className="mt-6 h-px" style={{ background: 'rgba(200,160,48,0.35)' }} />
        </div>

        {/* Sections per series */}
        {grouped.size === 0 ? (
          <div
            className="py-24 text-center"
            style={{ paddingLeft: 'clamp(24px, 4vw, 48px)' }}
          >
            <p className="font-serif text-2xl text-cream-muted" style={{ fontStyle: 'italic' }}>
              No hay eventos próximos.
            </p>
            <p className="font-sans text-sm text-cream-muted mt-2">Vuelve pronto.</p>
          </div>
        ) : (
          Array.from(grouped.entries()).map(([seriesName, seriesEvents]) => (
            <section key={seriesName} className="mb-20">
              {/* Series title + gold rule */}
              <div
                className="mb-8"
                style={{ paddingLeft: 'clamp(24px, 4vw, 48px)', paddingRight: 'clamp(24px, 4vw, 48px)' }}
              >
                <h2
                  className="font-serif italic text-cream"
                  style={{ fontSize: 'clamp(56px, 7vw, 110px)', fontWeight: 700, lineHeight: 0.9 }}
                >
                  {seriesName}
                </h2>
                <div className="mt-4 h-px" style={{ background: 'rgba(200,160,48,0.35)' }} />
              </div>

              {/* Horizontal scroll of CinematicEventCards */}
              <div
                className="flex gap-4 no-scrollbar"
                style={{
                  overflowX: 'auto',
                  scrollSnapType: 'x mandatory',
                  paddingLeft: 'clamp(24px, 4vw, 48px)',
                  paddingRight: '80px',
                  paddingBottom: '8px',
                }}
              >
                {seriesEvents.map((e) => (
                  <CinematicEventCard key={e.slug} event={e} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /opt/notabot-site && npx tsc --noEmit 2>&1 | head -30
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd /opt/notabot-site
git add src/app/eventos/page.tsx
git commit -m "feat: add /eventos page with series grouping"
```

---

## Task 4: Create `src/lib/podcast.ts` — Spotify fetch

**Files:**
- Create: `src/lib/podcast.ts`

- [ ] **Step 1: Create the file**

```ts
export const SPOTIFY_SHOW_ID = '4fiZjUQJgkvSPg2XEQiFQk'

export interface SpotifyEpisode {
  id: string
  name: string
  description: string
  duration_ms: number
  release_date: string
  external_urls: { spotify: string }
}

async function getSpotifyToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error('Spotify credentials not configured')

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Spotify token error ${res.status}`)
  const data = await res.json()
  return data.access_token as string
}

export async function getEpisodes(): Promise<SpotifyEpisode[]> {
  const token = await getSpotifyToken()
  const res = await fetch(
    `https://api.spotify.com/v1/shows/${SPOTIFY_SHOW_ID}/episodes?limit=20&market=MX`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }
  )
  if (!res.ok) throw new Error(`Spotify episodes error ${res.status}`)
  const data = await res.json()
  return data.items as SpotifyEpisode[]
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /opt/notabot-site && npx tsc --noEmit 2>&1 | head -30
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd /opt/notabot-site
git add src/lib/podcast.ts
git commit -m "feat: add Spotify podcast helper"
```

---

## Task 5: Create `/podcast` page

**Files:**
- Create: `src/app/podcast/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
export const dynamic = 'force-dynamic'

import { getEpisodes, SPOTIFY_SHOW_ID } from '@/lib/podcast'
import type { SpotifyEpisode } from '@/lib/podcast'
import { GrainOverlay } from '@/components/ui/GrainOverlay'

export const metadata = { title: 'Podcast — Not a Bot' }

function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60000)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function formatReleaseDate(dateStr: string): string {
  // dateStr is YYYY-MM-DD
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default async function PodcastPage() {
  const episodes = await getEpisodes().catch(() => [] as SpotifyEpisode[])

  const embedUrl = `https://open.spotify.com/embed/show/${SPOTIFY_SHOW_ID}?utm_source=generator`

  return (
    <div className="relative min-h-screen pt-32 pb-24">
      <GrainOverlay opacity={0.03} />

      <div
        className="relative z-10"
        style={{ paddingLeft: 'clamp(24px, 4vw, 48px)', paddingRight: 'clamp(24px, 4vw, 48px)', maxWidth: '900px' }}
      >
        {/* Page header */}
        <div className="mb-12">
          <p
            className="font-sans text-gold mb-3"
            style={{ fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase' }}
          >
            Audio
          </p>
          <h1
            className="font-serif italic text-cream"
            style={{ fontSize: 'clamp(56px, 7vw, 110px)', fontWeight: 700, lineHeight: 0.9 }}
          >
            Podcast
          </h1>
          <div className="mt-6 h-px" style={{ background: 'rgba(200,160,48,0.35)' }} />
        </div>

        {/* Spotify iframe embed */}
        <div className="mb-16">
          <iframe
            src={embedUrl}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>

        {/* Episode list */}
        {episodes.length > 0 && (
          <>
            <h2
              className="font-serif italic text-cream mb-8"
              style={{ fontSize: 'clamp(36px, 5vw, 72px)', fontWeight: 700, lineHeight: 0.95 }}
            >
              Episodios
            </h2>
            <div className="h-px mb-8" style={{ background: 'rgba(200,160,48,0.35)' }} />

            <ol className="flex flex-col">
              {episodes.map((ep, index) => (
                <li key={ep.id}>
                  <a
                    href={ep.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex gap-6 py-6 transition-opacity hover:opacity-80"
                    style={{ borderBottom: '1px solid rgba(200,160,48,0.15)' }}
                  >
                    {/* Episode number */}
                    <span
                      className="font-sans flex-shrink-0 w-8 text-right"
                      style={{ color: 'var(--color-gold)', fontSize: '11px', fontWeight: 600, paddingTop: '3px' }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    {/* Title + description */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-serif italic text-cream"
                        style={{ fontSize: '20px', fontWeight: 600, lineHeight: 1.2, marginBottom: '4px' }}
                      >
                        {ep.name}
                      </p>
                      <p
                        className="font-sans text-cream-muted"
                        style={{
                          fontSize: '13px',
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {ep.description}
                      </p>
                    </div>

                    {/* Duration + date */}
                    <div
                      className="font-sans text-cream-muted flex-shrink-0 text-right"
                      style={{ fontSize: '10px', letterSpacing: '0.04em', paddingTop: '3px' }}
                    >
                      <span>{formatDuration(ep.duration_ms)}</span>
                      <span className="block mt-1">{formatReleaseDate(ep.release_date)}</span>
                    </div>
                  </a>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /opt/notabot-site && npx tsc --noEmit 2>&1 | head -30
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
cd /opt/notabot-site
git add src/app/podcast/page.tsx
git commit -m "feat: add /podcast page with Spotify embed and episode list"
```

---

## Task 6: Build verification + staging deploy

**Files:** None created. Build and deploy only.

- [ ] **Step 1: Run production build**

```bash
cd /opt/notabot-site && npm run build 2>&1 | tail -40
```

Expected: `✓ Compiled successfully`. The `/eventos` and `/podcast` routes should appear as dynamic routes in the output.

If build fails due to TypeScript/ESLint errors, fix them before proceeding.

- [ ] **Step 2: Check staging .env for Spotify variables**

```bash
grep -E 'SPOTIFY' /opt/notabot-site/.env* 2>/dev/null || echo "No Spotify vars found"
```

If missing, add placeholders to `.env.local` (the page gracefully shows only the iframe when credentials are absent):

```bash
echo 'SPOTIFY_CLIENT_ID=' >> /opt/notabot-site/.env.local
echo 'SPOTIFY_CLIENT_SECRET=' >> /opt/notabot-site/.env.local
```

- [ ] **Step 3: Restart staging container**

```bash
docker compose -f /opt/staging/docker-compose.yml restart wp-notabot-1 2>/dev/null || \
  cd /opt/notabot-site && npm run start &
```

If the site runs directly (not via staging Docker), restart the Next.js process instead:

```bash
pkill -f "next start" 2>/dev/null; cd /opt/notabot-site && npm run start &
sleep 3
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/eventos
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/podcast
```

Expected: both return `200`.

- [ ] **Step 4: Commit (build artifacts excluded — only if any config changes were needed)**

```bash
cd /opt/notabot-site
git status
# Only commit if actual source files were changed during this task
```

---

## Spec Review

| Requirement | Covered by |
|---|---|
| `src/lib/series.ts` with `VENUE_TO_SERIES` + `DEFAULT_SERIES` | Task 2 |
| `/eventos` page with `force-dynamic`, grouped by series | Task 3 |
| CinematicEventCard + horizontal scroll pattern (same as CarreleraPreview) | Task 3 |
| Empty state when no events | Task 3 |
| `src/lib/podcast.ts` with `SPOTIFY_SHOW_ID` + `getEpisodes()` | Task 4 |
| Client credentials Spotify auth (`grant_type=client_credentials`) | Task 4 |
| `/podcast` page with iframe embed (height 152, full allow attrs) | Task 5 |
| Episode list: number (gold) + title (Cormorant 600 italic) + description (2-line clamp) + duration·date | Task 5 |
| Click opens `external_urls.spotify` in new tab | Task 5 |
| Graceful empty state when Spotify credentials absent | Task 4 + 5 (`.catch(() => [])`) |
| Navbar: Cartelera \| Eventos \| Discos \| Podcast \| Merch \| Proyectos | Task 1 |
| `force-dynamic` on both pages | Task 3, Task 5 |
| Visual system: Cormorant 700 italic, `#c8a030`, `#0d0905` | Task 3, Task 5 |
