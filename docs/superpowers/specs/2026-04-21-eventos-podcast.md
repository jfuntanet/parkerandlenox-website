# Not a Bot — Eventos + Podcast (Fase 1)

**Fecha:** 2026-04-21
**Estado:** Aprobado por usuario

---

## Contexto

El sitio notabot.mx ya tiene `/cartelera` (próximos conciertos del sistema de boletos) y páginas de `/discos`, `/merch` y `/proyectos`. Esta fase agrega dos páginas nuevas sin cambios de backend:

- `/eventos` — misma data que `/cartelera` pero organizada por serie (venue)
- `/podcast` — episodios del podcast via Spotify Web API + player embed

Ambas páginas adoptan el sistema visual existente: Cormorant Garamond 700 italic, oro `#c8a030`, fondo `#0d0905`.

---

## Fase 1 — Scope

**In scope:**
- Página `/eventos` con secciones por serie
- Página `/podcast` con player embed + lista de episodios
- Actualización de Navbar (agregar dos links)

**Out of scope (Fase 2):**
- Discos colaborados (requiere nueva tabla + endpoint)
- Fanzine (requiere nueva tabla + endpoint)

---

## Página `/eventos`

### Fuente de datos

`getEvents()` — mismo endpoint que ya existe: `GET /v1/tickets/public/events?brand=notabot`. Devuelve `TicketEvent[]` con campo `venue: string` (nombre de la venue).

### Mapa de series

Archivo: `src/lib/series.ts`

```ts
export const VENUE_TO_SERIES: Record<string, string> = {
  'Chapultepec Escuadrón 201': 'Jazz en Chapultepec',
  'Museo del Estanquillo':      'Jazz en las Rocas',
}

export const DEFAULT_SERIES = 'Otros eventos'
```

Cuando se agregue un nuevo venue (ej. "Jazz is Dead"), solo hay que añadir la entrada al mapa.

### Layout

- `export const dynamic = 'force-dynamic'`
- `getEvents().catch(() => [])` para silenciar errores de API en build
- Agrupar `TicketEvent[]` por `VENUE_TO_SERIES[event.venue] ?? DEFAULT_SERIES`
- Renderizar una sección por cada grupo que tenga al menos un evento
- Si no hay eventos en absoluto: mensaje de estado vacío centrado

### Anatomía de cada sección

```
[Título de la serie]          Cormorant 700 italic, clamp(56px, 7vw, 110px), cream
────────────────────          regla dorada 1px, rgba(200,160,48,0.35)
[CinematicEventCard] [...]    scroll horizontal, igual que CarreleraPreview
```

Reutiliza `CinematicEventCard` y el patrón de scroll horizontal de `CarreleraPreview` (mismo `no-scrollbar`, `scrollSnapType: 'x mandatory'`, `gap-4`, padding lateral `clamp(24px, 4vw, 48px)`).

### Archivos

| Archivo | Acción |
|---|---|
| `src/lib/series.ts` | Crear — mapa venue → serie |
| `src/app/eventos/page.tsx` | Crear — page con secciones agrupadas |

---

## Página `/podcast`

### Datos del show

- **Show ID:** `4fiZjUQJgkvSPg2XEQiFQk`
- **Embed URL base:** `https://open.spotify.com/embed/show/4fiZjUQJgkvSPg2XEQiFQk`
- **API episodes:** `GET https://api.spotify.com/v1/shows/4fiZjUQJgkvSPg2XEQiFQk/episodes`

Constante en `src/lib/podcast.ts`:

```ts
export const SPOTIFY_SHOW_ID = '4fiZjUQJgkvSPg2XEQiFQk'
```

### Autenticación Spotify

Client Credentials flow — sin login de usuario. Requiere dos variables de entorno:

```
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
```

El server component obtiene un access token con:
```
POST https://accounts.spotify.com/api/token
body: grant_type=client_credentials
Authorization: Basic base64(CLIENT_ID:CLIENT_SECRET)
```

Token válido 3600s. Se obtiene en cada render (el page es `force-dynamic`). No se cachea en DB.

### Estructura de respuesta

`/v1/shows/{id}/episodes?limit=20&market=MX` devuelve episodios con:
- `id`, `name`, `description`, `duration_ms`, `release_date`, `external_urls.spotify`

### Layout de `/podcast`

**Player embed (arriba):**
```html
<iframe
  src="https://open.spotify.com/embed/show/4fiZjUQJgkvSPg2XEQiFQk?utm_source=generator"
  width="100%"
  height="152"
  frameBorder="0"
  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
/>
```

El iframe en modo "show" muestra el player con lista de episodios de Spotify. Esto es suficiente funcionalidad sin necesidad de un player custom.

**Lista de episodios (abajo del iframe):**

Título de sección: "Episodios" en Cormorant 700 italic grande.

Cada episodio como fila horizontal:
```
[número]  [Título del episodio]              [duración · fecha]
  oro      Cormorant 600 italic ~20px          Inter 10px cream-muted
           [descripción truncada 2 líneas]
           Inter 13px cream-muted
```

Al hacer clic en un episodio, abre `external_urls.spotify` en nueva pestaña (`target="_blank" rel="noopener noreferrer"`). No se intenta controlar el iframe programáticamente (CORS + limitaciones de la Spotify embed API).

Si `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` no están configurados, la lista de episodios muestra estado vacío silencioso; el iframe del player sigue funcionando.

### Archivos

| Archivo | Acción |
|---|---|
| `src/lib/podcast.ts` | Crear — SHOW_ID + función `getEpisodes()` |
| `src/app/podcast/page.tsx` | Crear — server component, fetch + render |

---

## Navbar

Agregar dos links a `src/components/layout/Navbar.tsx`:

```
Cartelera | Eventos | Discos | Podcast | Merch | Proyectos
```

Mismo estilo que los links existentes (Inter uppercase, tracking, cream-muted → cream en hover/active).

---

## Archivos a crear/modificar

| Archivo | Acción |
|---|---|
| `src/lib/series.ts` | Crear |
| `src/lib/podcast.ts` | Crear |
| `src/app/eventos/page.tsx` | Crear |
| `src/app/podcast/page.tsx` | Crear |
| `src/components/layout/Navbar.tsx` | Modificar — agregar 2 links |

---

## Variables de entorno requeridas

Agregar a `.env` y al Dockerfile/docker-compose:

```
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
```

Si no están presentes, la lista de episodios falla silenciosamente (el iframe funciona igual).
