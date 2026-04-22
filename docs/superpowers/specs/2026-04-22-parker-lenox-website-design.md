# parker-lenox-website — Diseño

**Fecha:** 2026-04-22
**Estado:** Aprobado por usuario
**Repo:** `jfuntanet/parkerandlenox-website`
**Deploy staging:** `staging.parkerandlenox.com`
**Directorio VPS:** `/opt/parker-lenox-site/`

---

## Contexto

Sitio público de Parker & Lenox — dos salas (Parker: jazz en vivo / speakeasy; Lenox: vinyl bar / cócteles) en un mismo venue. Reemplaza o complementa la presencia web actual. Permite ver la cartelera y comprar boletos online.

Ecosistema al que se integra:
- `core.notabot.mx` — Fastify API (conciertos, boletos, pagos Stripe). Filtro de brand: `brand=parker_lenox`
- Mismo VPS Hostinger, red Docker `n8n_default`, Traefik como reverse proxy

---

## Decisión de arquitectura: clonar notabot-site

**Base:** `/opt/notabot-site/` → `/opt/parker-lenox-site/`

La plomería (Docker, Traefik, API layer, tipos TypeScript) es idéntica a `notabot-site`. Solo cambia el parámetro `brand` y toda la capa visual. Esto elimina configuración repetida.

**Heredado sin cambios:**
- Patrón Docker standalone + Traefik labels
- Estructura de fetch (`apiFetch`, tipos `TicketEvent`, `EventDetail`)
- `Dockerfile`, configuración Next.js

**Reescrito completamente:**
- Sistema de diseño (colores, fuentes, componentes)
- Todas las páginas y secciones

---

## Stack

- **Framework:** Next.js 16 (App Router, TypeScript) — misma versión que notabot-site
- **Estilos:** Tailwind CSS v4
- **Animaciones:** CSS puro (scroll reveal con IntersectionObserver, keyframes) — sin Framer Motion
- **Runtime:** Node.js SSR (Docker standalone)
- **Deploy:** Docker en VPS, Traefik, `staging.parkerandlenox.com`

---

## Páginas en scope (v1)

| Ruta | Descripción |
|---|---|
| `/` | Landing completa |
| `/cartelera` | Todos los conciertos, filtro por sala |
| `/cartelera/[slug]` | Detalle de evento + compra de boletos |
| `/api/checkout` | Route handler: crea sesión Stripe vía core.notabot.mx |
| `/api/webhook` | Route handler: confirma pago Stripe |
| `/gracias` | Confirmación post-pago |

Merch (`/merch`) queda fuera del scope v1. Se evaluará una vez que la maqueta funcional esté lista.

---

## Sistema de diseño

### Referencia visual
HTML de referencia aprobado por el usuario. Estética: speakeasy / jazz club nocturno. Dramático, íntimo, analógico.

### Fuentes (Google Fonts)
- `Playfair Display` — títulos grandes, nombre Parker & Lenox
- `Cormorant Garamond` — cuerpo de texto, descripciones
- `Space Mono` — labels, fechas, precios, eyebrows, botones UI

### Paleta

```css
--black:           #080808;   /* fondo principal */
--parker-bronze:   #A0784A;   /* acento Parker */
--parker-red:      #5C1A1A;   /* fondo/tint Parker */
--parker-green:    #1E3328;   /* tint hover Parker */
--parker-concrete: #8A8880;   /* texto secundario Parker */
--lenox-red:       #C0202A;   /* acento Lenox */
--lenox-wood:      #6B3D22;   /* fondo/tint Lenox */
--cream:           #EDE8DC;   /* texto principal */
```

### Elementos visuales

| Elemento | Implementación |
|---|---|
| Grain overlay | SVG fractalNoise fijo, opacidad 4%, pointer-events none |
| Cursor custom | Punto 8px + anillo lag 0.12, mix-blend-mode: difference — solo desktop |
| Scroll reveal | IntersectionObserver, fadeUp 30px, 0.9s ease |
| Línea hero | Animación CSS `growLine` 2s, altura 0→100vh |
| Divider Parker/Lenox | Línea vertical + `◆` al centro |

---

## Estructura de carpetas

```
/opt/parker-lenox-site/
  app/
    globals.css              ← paleta dual, @theme Tailwind
    layout.tsx               ← fuentes, Navbar, Footer, CustomCursor
    page.tsx                 ← landing: Intro → SalaSelector → CarreleraPreview → Manifesto
    cartelera/
      page.tsx               ← grid completa + filtro Parker/Lenox
      [slug]/
        page.tsx             ← detalle evento + BuyTicketButton
    gracias/
      page.tsx               ← confirmación post-pago
    api/
      checkout/route.ts      ← proxy a core.notabot.mx, devuelve checkoutUrl
      webhook/route.ts       ← recibe evento Stripe, confirma a core.notabot.mx
  components/
    layout/
      Navbar.tsx
      Footer.tsx
      CustomCursor.tsx
      GrainOverlay.tsx
    sections/
      IntroSection.tsx       ← hero animado con línea vertical
      SalaSelector.tsx       ← split 50/50 Parker/Lenox
      CarreleraPreview.tsx   ← 4 eventos próximos
      ManifestoSection.tsx   ← cita central con colores duales
    ui/
      ConcertCard.tsx        ← artista, sala (color), fecha, precio, botón
      BuyTicketButton.tsx    ← POST /api/checkout → redirect Stripe
      SalaFilter.tsx         ← toggle Parker / Lenox / Todos en /cartelera
  lib/
    api.ts                   ← getEvents(brand), getEventDetail(slug)
  types/
    api.ts                   ← TicketEvent, EventDetail, TicketType
  Dockerfile
  docker-compose.yml
  .env                       ← CORE_API_URL, CORE_API_KEY
```

---

## API layer

```ts
// lib/api.ts
const BASE  = process.env.CORE_API_URL!
const KEY   = process.env.CORE_API_KEY!

getEvents()           → GET /v1/tickets/public/events?brand=parker_lenox
getEventDetail(slug)  → GET /v1/tickets/events/{slug}/availability
```

- Fetch server-side con `next: { revalidate: 60 }`
- Header: `x-api-key`
- `force-dynamic` en páginas con datos frescos

---

## Flujo de compra

```
/cartelera/[slug]
  → muestra tipos de boleto + disponibilidad
  → click "Comprar" → POST /api/checkout { slug, ticketTypeId, qty, name, email }
  → route handler llama a core.notabot.mx → recibe { checkoutUrl }
  → redirect a Stripe Checkout (hosted by Stripe)
  → Stripe → POST /api/webhook
  → usuario → redirect a /gracias
```

**Stripe:** El `STRIPE_SECRET_KEY` vive en `core.notabot.mx`. El site solo hace proxy de la creación de sesión — nunca toca Stripe directamente.

**Variables de entorno `.env`:**
```
CORE_API_URL=https://core.notabot.mx
CORE_API_KEY=<api_key>
```

---

## Error states

| Caso | UI |
|---|---|
| Evento agotado | Botón "Agotado" deshabilitado, sin precio |
| API caída en landing | Sección vacía con estado elegante (sin eventos esta semana) |
| API caída en detalle | Skeleton que mantiene estética, mensaje de error sutil |
| Pago cancelado | Redirect a `/cartelera/[slug]` con query `?cancelled=1` |

---

## Deploy en VPS

**docker-compose.yml:**
```yaml
services:
  parker-lenox-site:
    container_name: parker-lenox-site
    image: parker-lenox-site:latest
    restart: unless-stopped
    env_file: .env
    networks:
      - n8n_default
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.plx-site.rule=Host(`staging.parkerandlenox.com`)"
      - "traefik.http.routers.plx-site.entrypoints=websecure"
      - "traefik.http.routers.plx-site.tls.certresolver=mytlschallenge"
      - "traefik.http.services.plx-site.loadbalancer.server.port=3000"

networks:
  n8n_default:
    external: true
```

**GitHub Actions** (opcional, post v1): push a `main` → build image en VPS → restart contenedor.

---

## Fuera de scope (v1)

- Merch (`/merch`, `/merch/[slug]`)
- Autenticación / área de miembros
- Integración con Monday.com
- Analytics / tracking
- Versión producción (`parkerandlenox.com`) — primero se valida staging
