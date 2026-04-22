# notabot.mx — Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the new public website for notabot.mx — landing, cartelera con venta de boletos, discos publicados, merch y proyectos del grupo — con estética de romanticismo/chiaroscuro.

**Architecture:** Next.js 15 SSR en `/opt/notabot-site/`. Toda la data viene de `core.notabot.mx` (Fastify API). Endpoints de tickets ya existen y son públicos con API key. Se agregan 3 endpoints nuevos en `concerts-api` (projects/public, releases, products/public). El checkout llama al servidor de Next.js que habla con `core.notabot.mx` — las llaves de Stripe nunca tocan el browser.

**Tech Stack:** Next.js 15 · TypeScript · Tailwind CSS · App Router · Docker · Traefik

---

## Tipos TypeScript compartidos

Estos tipos son usados en múltiples tasks. Definirlos en `src/types/api.ts`:

```typescript
export interface TicketEvent {
  slug: string
  title: string
  description: string | null
  imageUrl: string | null
  date: string        // "YYYY-MM-DD"
  time: string        // "HH:MM"
  venue: string
  brand: string
  price: number
  available: number
  totalCapacity: number
  soldOut: boolean
}

export interface TicketType {
  id: string
  name: string
  price: number
  available: number
}

export interface EventDetail {
  event: {
    title: string
    description: string | null
    imageUrl: string | null
    date: string
    time: string
    venue: string
    brand: string
  }
  ticketTypes: TicketType[]
  salesActive: boolean
}

export interface Project {
  id: string
  name: string
  artisticName: string | null
  description: string | null
  genre: string | null
  photoUrl: string | null
}

export interface Release {
  id: string
  title: string
  artist: string
  year: number
  coverImage: string | null
  description: string | null
  spotifyUrl: string | null
  bandcampUrl: string | null
  appleMusicUrl: string | null
  brand: string
  publishedAt: string
}

export interface Product {
  id: string
  title: string
  artist: string | null
  price: number
  imageUrl: string | null
  category: string
  brand: string
  stock: number
}
```

---

## File Map

### concerts-api (modifications)
- Modify: `/opt/concerts-api/prisma/schema.prisma` — add `Release` model
- Create: `/opt/concerts-api/src/routes/public.ts` — public endpoints: projects/public, releases, products/public
- Modify: `/opt/concerts-api/src/index.ts` (or equivalent entry) — register publicRoutes
- Migration SQL applied via `npx prisma migrate dev`

### notabot-site (new project at /opt/notabot-site/)
```
src/
  types/
    api.ts                    # Shared TypeScript interfaces
  lib/
    api.ts                    # Fetch helpers for core.notabot.mx
    actions.ts                # Server Actions (checkout)
    format.ts                 # Date/price formatting utilities
  app/
    globals.css               # Tailwind base + custom CSS (grain texture, fonts)
    layout.tsx                # Root layout (fonts, metadata)
    page.tsx                  # Landing page
    cartelera/
      page.tsx                # Cartelera (event list)
      [slug]/
        page.tsx              # Event detail + buy button
    checkout/
      [slug]/
        page.tsx              # Checkout form (nombre, email, cantidad)
      success/
        page.tsx              # Confirmación post-pago
    discos/
      page.tsx                # Releases list
      [id]/
        page.tsx              # Release detail
    merch/
      page.tsx                # Merch catalog
    proyectos/
      page.tsx                # Projects page
  components/
    layout/
      Navbar.tsx              # Navigation
      Footer.tsx              # Footer
    ui/
      GrainOverlay.tsx        # SVG/CSS grain texture component
      ChiaroscuroSection.tsx  # Section wrapper with chiaroscuro bg
      EventCard.tsx           # Card de evento (cartelera)
      ReleaseCard.tsx         # Card de disco
      ProductCard.tsx         # Card de merch
      ProjectCard.tsx         # Card de proyecto
    sections/
      HeroSection.tsx         # Landing hero
      ProyectosPreview.tsx    # Landing — proyectos block
      CarreleraPreview.tsx    # Landing — próximos eventos block
      DiscosPreview.tsx       # Landing — últimos discos block
      MerchPreview.tsx        # Landing — merch preview block
next.config.mjs
tailwind.config.ts
tsconfig.json
Dockerfile
docker-compose.yml
.env
.env.example
package.json
```

---

## Task 1: Agregar endpoint público de proyectos en concerts-api

**Files:**
- Modify: `/opt/concerts-api/src/routes/projects.ts` (o el equivalente en dist si no hay src)
- Si solo existe dist: Create `/opt/concerts-api/src/routes/public.ts` y compilar

> **Nota:** concerts-api compila TypeScript a `/opt/concerts-api/dist/`. Editar en `src/` y recompilar, o editar directamente en `dist/` si no hay `src/routes/`. Verifica con `ls /opt/concerts-api/src/routes/ 2>/dev/null || echo "no src"`.

- [ ] **Step 1: Verificar si existe src/routes/**

```bash
ls /opt/concerts-api/src/routes/ 2>/dev/null || echo "no-src"
```

Si hay src, editar ahí y compilar. Si no, editar `dist/routes/` directamente.

- [ ] **Step 2: Agregar endpoint GET /v1/projects/public en projects route**

En `dist/routes/projects.js`, **antes** del `app.addHook('preHandler', auth_1.authenticate)`, agregar un bloque separado sin auth (o crear una función `publicProjectRoutes` que se registre antes del hook):

```javascript
// Al inicio del archivo, después de los imports, crear función separada
async function publicProjectRoutes(app) {
    // GET /v1/projects/public — no auth required
    app.get('/v1/projects/public', async (request, reply) => {
        const rows = await client_1.default.project.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                artisticName: true,
                description: true,
                genre: true,
                photoUrl: true,
            },
        });
        return reply.send(rows);
    });
}

exports.publicProjectRoutes = publicProjectRoutes;
```

- [ ] **Step 3: Registrar publicProjectRoutes en el entry point**

Buscar el archivo principal de concerts-api:

```bash
cat /opt/concerts-api/dist/index.js | grep -n "Routes\|register\|plugin" | head -20
```

Agregar registro de `publicProjectRoutes` **antes** de los routes autenticados:

```javascript
const { publicProjectRoutes } = require('./routes/public-projects');
// ...
await app.register(publicProjectRoutes);
```

- [ ] **Step 4: Verificar el endpoint responde**

```bash
curl -s https://core.notabot.mx/v1/projects/public | head -200
```

Expected: array JSON de proyectos con `id, name, artisticName, description, genre, photoUrl`.

- [ ] **Step 5: Reiniciar concerts-api**

```bash
docker compose -f /opt/concerts-api/docker-compose.yml restart
```

---

## Task 2: Agregar tabla releases y endpoints públicos en concerts-api

**Files:**
- Modify: `/opt/concerts-api/prisma/schema.prisma`
- Create migration SQL
- Create: `/opt/concerts-api/dist/routes/releases.js`
- Modify: `/opt/concerts-api/dist/index.js`

- [ ] **Step 1: Agregar modelo Release al schema Prisma**

En `/opt/concerts-api/prisma/schema.prisma`, al final del archivo:

```prisma
model Release {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title         String
  artist        String
  year          Int
  coverImage    String?   @map("cover_image")
  description   String?
  spotifyUrl    String?   @map("spotify_url")
  bandcampUrl   String?   @map("bandcamp_url")
  appleMusicUrl String?   @map("apple_music_url")
  brand         String    @default("notabot")
  publishedAt   DateTime  @default(now()) @map("published_at") @db.Timestamptz
  createdAt     DateTime  @default(now()) @map("created_at") @db.Timestamptz
  deletedAt     DateTime? @map("deleted_at") @db.Timestamptz

  @@map("releases")
}
```

- [ ] **Step 2: Crear la tabla en PostgreSQL**

```bash
sudo -u postgres psql -d notabot_core -c "
CREATE TABLE IF NOT EXISTS releases (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  artist        TEXT NOT NULL,
  year          INT NOT NULL,
  cover_image   TEXT,
  description   TEXT,
  spotify_url   TEXT,
  bandcamp_url  TEXT,
  apple_music_url TEXT,
  brand         TEXT NOT NULL DEFAULT 'notabot',
  published_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);
"
```

Expected: `CREATE TABLE`

- [ ] **Step 3: Regenerar Prisma client**

```bash
cd /opt/concerts-api && npx prisma generate
```

Expected: `Generated Prisma Client`

- [ ] **Step 4: Crear route de releases**

Crear `/opt/concerts-api/dist/routes/releases.js`:

```javascript
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.releaseRoutes = releaseRoutes;
const client_1 = require("../prisma/client");
const auth_1 = require("../middleware/auth");

const WRITE_ROLES = new Set(['director', 'diseno', 'digital']);

async function releaseRoutes(app) {
    // GET /v1/releases — public, no auth
    app.get('/v1/releases', async (request, reply) => {
        const rows = await client_1.default.release.findMany({
            where: { deletedAt: null },
            orderBy: { publishedAt: 'desc' },
            select: {
                id: true,
                title: true,
                artist: true,
                year: true,
                coverImage: true,
                description: true,
                spotifyUrl: true,
                bandcampUrl: true,
                appleMusicUrl: true,
                brand: true,
                publishedAt: true,
            },
        });
        return reply.send(rows);
    });

    // GET /v1/releases/:id — public, no auth
    app.get('/v1/releases/:id', async (request, reply) => {
        const row = await client_1.default.release.findFirst({
            where: { id: request.params.id, deletedAt: null },
        });
        if (!row) return reply.code(404).send({ error: 'Release not found' });
        return reply.send(row);
    });

    // POST /v1/releases — admin only
    app.post('/v1/releases', {
        preHandler: auth_1.authenticate,
    }, async (request, reply) => {
        const role = request.user?.role;
        if (!WRITE_ROLES.has(role)) return reply.code(403).send({ error: 'Forbidden' });
        const { title, artist, year, coverImage, description, spotifyUrl, bandcampUrl, appleMusicUrl, brand } = request.body;
        if (!title || !artist || !year) return reply.code(400).send({ error: 'title, artist, year required' });
        const row = await client_1.default.release.create({
            data: { title, artist, year, coverImage, description, spotifyUrl, bandcampUrl, appleMusicUrl, brand: brand || 'notabot' },
        });
        return reply.code(201).send(row);
    });

    // PATCH /v1/releases/:id — admin only
    app.patch('/v1/releases/:id', {
        preHandler: auth_1.authenticate,
    }, async (request, reply) => {
        const role = request.user?.role;
        if (!WRITE_ROLES.has(role)) return reply.code(403).send({ error: 'Forbidden' });
        const { title, artist, year, coverImage, description, spotifyUrl, bandcampUrl, appleMusicUrl, brand } = request.body;
        const row = await client_1.default.release.update({
            where: { id: request.params.id },
            data: { title, artist, year, coverImage, description, spotifyUrl, bandcampUrl, appleMusicUrl, brand },
        });
        return reply.send(row);
    });

    // DELETE /v1/releases/:id — soft delete, admin only
    app.delete('/v1/releases/:id', {
        preHandler: auth_1.authenticate,
    }, async (request, reply) => {
        const role = request.user?.role;
        if (!WRITE_ROLES.has(role)) return reply.code(403).send({ error: 'Forbidden' });
        await client_1.default.release.update({
            where: { id: request.params.id },
            data: { deletedAt: new Date() },
        });
        return reply.code(204).send();
    });
}
```

- [ ] **Step 5: Agregar endpoint público de merch**

En el mismo archivo, agregar al final (o crear `/opt/concerts-api/dist/routes/products-public.js`):

Buscar primero el schema de products en Prisma:

```bash
grep -A 20 "model Product\b\|@@map.*product" /opt/concerts-api/prisma/schema.prisma | head -30
```

Si el modelo existe como `Product`, agregar en `releases.js`:

```javascript
// GET /v1/products/public — public merch catalog
app.get('/v1/products/public', async (request, reply) => {
    const rows = await client_1.default.$queryRaw`
        SELECT id::text, title, artist, price::numeric AS price,
               image_url AS "imageUrl", category, brand, stock
        FROM products
        WHERE stock > 0 AND active = true
        ORDER BY brand, title
    `;
    return reply.send(rows);
});
```

> Si la tabla `products` tiene estructura diferente (verificar con `\d products` en psql), ajustar las columnas.

- [ ] **Step 6: Registrar las nuevas routes en index.js**

```bash
grep -n "register\|Routes" /opt/concerts-api/dist/index.js | head -20
```

Agregar junto a los otros routes:

```javascript
const { releaseRoutes } = require('./routes/releases');
// en la sección de registro:
await app.register(releaseRoutes);
```

- [ ] **Step 7: Reiniciar y verificar**

```bash
docker compose -f /opt/concerts-api/docker-compose.yml restart
sleep 5
curl -s https://core.notabot.mx/v1/releases | head -100
curl -s https://core.notabot.mx/v1/projects/public | head -100
```

Expected: arrays JSON válidos (vacíos está bien por ahora).

---

## Task 3: Scaffold del proyecto Next.js

**Files:**
- Create: `/opt/notabot-site/` (nuevo proyecto)

- [ ] **Step 1: Inicializar el proyecto**

```bash
cd /opt && npx create-next-app@latest notabot-site \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --no-git
```

Cuando pregunte por opciones interactivas, aceptar los defaults. Si el directorio ya existe y tiene archivos, borrar primero:

```bash
rm -rf /opt/notabot-site && cd /opt && npx create-next-app@latest notabot-site --typescript --tailwind --app --no-src-dir --import-alias "@/*" --no-git
```

- [ ] **Step 2: Mover a estructura con src/**

```bash
cd /opt/notabot-site
mkdir -p src
mv app src/app
mv components src/components 2>/dev/null || true
mv lib src/lib 2>/dev/null || true
```

Actualizar `tsconfig.json` paths:

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Crear next.config.mjs**

```javascript
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

- [ ] **Step 4: Crear .env**

```bash
cat > /opt/notabot-site/.env << 'EOF'
CORE_API_URL=https://core.notabot.mx
CORE_API_KEY=khspAhp6zIZ3R_1vbrVTIRFmJy-MJwS1izWe3GVRNKI
NEXT_PUBLIC_APP_URL=https://staging.notabot.mx
EOF
```

- [ ] **Step 5: Crear .env.example**

```bash
cat > /opt/notabot-site/.env.example << 'EOF'
CORE_API_URL=https://core.notabot.mx
CORE_API_KEY=<api-key-de-concerts-api>
NEXT_PUBLIC_APP_URL=https://notabot.mx
EOF
```

- [ ] **Step 6: Crear src/types/api.ts**

```typescript
export interface TicketEvent {
  slug: string
  title: string
  description: string | null
  imageUrl: string | null
  date: string
  time: string
  venue: string
  brand: string
  price: number
  available: number
  totalCapacity: number
  soldOut: boolean
}

export interface TicketType {
  id: string
  name: string
  price: number
  available: number
}

export interface EventDetail {
  event: {
    title: string
    description: string | null
    imageUrl: string | null
    date: string
    time: string
    venue: string
    brand: string
  }
  ticketTypes: TicketType[]
  salesActive: boolean
}

export interface Project {
  id: string
  name: string
  artisticName: string | null
  description: string | null
  genre: string | null
  photoUrl: string | null
}

export interface Release {
  id: string
  title: string
  artist: string
  year: number
  coverImage: string | null
  description: string | null
  spotifyUrl: string | null
  bandcampUrl: string | null
  appleMusicUrl: string | null
  brand: string
  publishedAt: string
}

export interface Product {
  id: string
  title: string
  artist: string | null
  price: number
  imageUrl: string | null
  category: string
  brand: string
  stock: number
}
```

- [ ] **Step 7: Verificar que compila**

```bash
cd /opt/notabot-site && npm run build 2>&1 | tail -20
```

Expected: Build exitoso.

---

## Task 4: Librería de API y utilidades

**Files:**
- Create: `src/lib/api.ts`
- Create: `src/lib/format.ts`
- Create: `src/lib/actions.ts`

- [ ] **Step 1: Crear src/lib/api.ts**

```typescript
import type { TicketEvent, EventDetail, Project, Release, Product } from '@/types/api'

const BASE = process.env.CORE_API_URL!
const API_KEY = process.env.CORE_API_KEY!

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      ...options?.headers,
    },
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`API error ${res.status} on ${path}`)
  return res.json()
}

export async function getEvents(): Promise<TicketEvent[]> {
  return apiFetch('/v1/tickets/public/events?brand=notabot')
}

export async function getEventDetail(slug: string): Promise<EventDetail> {
  return apiFetch(`/v1/tickets/events/${slug}/availability`)
}

export async function getProjects(): Promise<Project[]> {
  return apiFetch('/v1/projects/public')
}

export async function getReleases(): Promise<Release[]> {
  return apiFetch('/v1/releases')
}

export async function getRelease(id: string): Promise<Release> {
  return apiFetch(`/v1/releases/${id}`)
}

export async function getProducts(): Promise<Product[]> {
  return apiFetch('/v1/products/public')
}
```

- [ ] **Step 2: Crear src/lib/format.ts**

```typescript
export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return ''
  const [hours, minutes] = timeStr.split(':').map(Number)
  const suffix = hours >= 12 ? 'pm' : 'am'
  const h = hours % 12 || 12
  return `${h}:${String(minutes).padStart(2, '0')}${suffix}`
}
```

- [ ] **Step 3: Crear src/lib/actions.ts (Server Action de checkout)**

```typescript
'use server'

import { redirect } from 'next/navigation'

const BASE = process.env.CORE_API_URL!
const API_KEY = process.env.CORE_API_KEY!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export async function initiateCheckout(formData: FormData) {
  const slug = formData.get('slug') as string
  const ticketTypeId = formData.get('ticketTypeId') as string
  const quantity = Number(formData.get('quantity'))
  const customerName = formData.get('customerName') as string
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
      cancelUrl: `${APP_URL}/cartelera/${slug}`,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Error al procesar la compra')
  }

  const { checkoutUrl } = await res.json()
  redirect(checkoutUrl)
}
```

- [ ] **Step 4: Verificar TypeScript**

```bash
cd /opt/notabot-site && npx tsc --noEmit 2>&1 | head -20
```

Expected: sin errores.

---

## Task 5: Design system — Tailwind, fuentes, estilos globales

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Configurar Tailwind con paleta y fuentes**

Reemplazar `/opt/notabot-site/tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#0d0905',
        burgundy: {
          DEFAULT: '#6b1a2a',
          dark: '#4a1020',
          light: '#8b2a3a',
        },
        gold: {
          DEFAULT: '#b8922a',
          light: '#d4a840',
          muted: '#8a6a1a',
        },
        cream: {
          DEFAULT: '#f0e6c8',
          muted: '#a89880',
          dim: '#6a5a48',
        },
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'chiaroscuro-radial': 'radial-gradient(ellipse at 30% 20%, #3d1a0a 0%, #0d0905 60%)',
        'chiaroscuro-corner': 'radial-gradient(ellipse at 80% 80%, #2a0a12 0%, #0d0905 55%)',
      },
      animation: {
        'fade-in': 'fadeIn 1.2s ease-out',
        'fade-up': 'fadeUp 1s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Instalar fuentes de Google**

```bash
cd /opt/notabot-site && npm install @next/font 2>/dev/null || true
```

(Las fuentes de Google se importan via `next/font/google` — no requiere paquete extra en Next.js 15.)

- [ ] **Step 3: Actualizar src/app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --font-cormorant: 'Cormorant Garamond';
    --font-inter: 'Inter';
  }

  html {
    background-color: #0d0905;
    color: #f0e6c8;
    scroll-behavior: smooth;
  }

  body {
    font-family: var(--font-inter), system-ui, sans-serif;
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

  /* Scrollbar oscura */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #0d0905; }
  ::-webkit-scrollbar-thumb { background: #3a1a10; border-radius: 3px; }
}

@layer utilities {
  .grain {
    position: relative;
  }
  .grain::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 1;
  }

  .text-shadow-warm {
    text-shadow: 0 2px 20px rgba(184, 146, 42, 0.3);
  }

  .image-painted {
    filter: contrast(1.1) saturate(0.8) sepia(0.15);
  }

  .divider-ornament {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #b8922a;
  }
  .divider-ornament::before,
  .divider-ornament::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, transparent, #b8922a44, transparent);
  }
}
```

- [ ] **Step 4: Actualizar src/app/layout.tsx con fuentes**

```typescript
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Not a Bot — Jazz en las Rocas',
  description: 'Conciertos de jazz, vinilos y experiencias en vivo.',
  icons: { icon: '/favicon.ico' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="bg-canvas text-cream min-h-screen">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 5: Verificar build**

```bash
cd /opt/notabot-site && npm run build 2>&1 | tail -20
```

Expected: Build exitoso sin errores de TypeScript.

---

## Task 6: Componentes UI base

**Files:**
- Create: `src/components/ui/GrainOverlay.tsx`
- Create: `src/components/ui/EventCard.tsx`
- Create: `src/components/ui/ReleaseCard.tsx`
- Create: `src/components/ui/ProductCard.tsx`
- Create: `src/components/ui/ProjectCard.tsx`
- Create: `src/components/layout/Navbar.tsx`
- Create: `src/components/layout/Footer.tsx`

- [ ] **Step 1: Crear GrainOverlay.tsx**

```typescript
// src/components/ui/GrainOverlay.tsx
export function GrainOverlay({ opacity = 0.04 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='${opacity}'/%3E%3C/svg%3E")`,
      }}
    />
  )
}
```

- [ ] **Step 2: Crear EventCard.tsx**

```typescript
// src/components/ui/EventCard.tsx
import Image from 'next/image'
import Link from 'next/link'
import type { TicketEvent } from '@/types/api'
import { formatDate, formatPrice, formatTime } from '@/lib/format'

export function EventCard({ event }: { event: TicketEvent }) {
  return (
    <Link
      href={`/cartelera/${event.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-sm border border-cream/10 bg-canvas hover:border-gold/30 transition-colors duration-500"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover image-painted group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 bg-chiaroscuro-radial" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/20 to-transparent" />
        {event.soldOut && (
          <div className="absolute top-3 right-3 bg-burgundy px-2 py-1 text-xs font-sans uppercase tracking-widest text-cream/80">
            Agotado
          </div>
        )}
      </div>

      <div className="relative z-10 flex flex-col gap-1 p-4">
        <p className="font-sans text-xs uppercase tracking-widest text-gold">{formatDate(event.date)}</p>
        <h3 className="font-serif text-xl font-light text-cream leading-tight">{event.title}</h3>
        <p className="font-sans text-sm text-cream-muted">{event.venue} · {formatTime(event.time)}</p>
        {!event.soldOut && (
          <p className="mt-2 font-sans text-sm text-gold">{formatPrice(event.price)}</p>
        )}
      </div>
    </Link>
  )
}
```

- [ ] **Step 3: Crear ReleaseCard.tsx**

```typescript
// src/components/ui/ReleaseCard.tsx
import Image from 'next/image'
import Link from 'next/link'
import type { Release } from '@/types/api'

export function ReleaseCard({ release }: { release: Release }) {
  return (
    <Link
      href={`/discos/${release.id}`}
      className="group flex flex-col gap-3"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-sm">
        {release.coverImage ? (
          <Image
            src={release.coverImage}
            alt={`${release.title} — ${release.artist}`}
            fill
            className="object-cover image-painted group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 bg-chiaroscuro-radial flex items-center justify-center">
            <span className="font-serif text-4xl text-gold/30">♪</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-canvas/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <div>
        <h3 className="font-serif text-lg font-light text-cream">{release.title}</h3>
        <p className="font-sans text-sm text-cream-muted">{release.artist} · {release.year}</p>
      </div>
    </Link>
  )
}
```

- [ ] **Step 4: Crear ProductCard.tsx**

```typescript
// src/components/ui/ProductCard.tsx
import Image from 'next/image'
import type { Product } from '@/types/api'
import { formatPrice } from '@/lib/format'

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-sm border border-cream/5">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 bg-chiaroscuro-corner" />
        )}
      </div>
      <div>
        <h3 className="font-serif text-base font-light text-cream">{product.title}</h3>
        {product.artist && (
          <p className="font-sans text-xs text-cream-muted">{product.artist}</p>
        )}
        <p className="mt-1 font-sans text-sm text-gold">{formatPrice(product.price)}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Crear ProjectCard.tsx**

```typescript
// src/components/ui/ProjectCard.tsx
import Image from 'next/image'
import type { Project } from '@/types/api'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="group flex flex-col gap-4">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm">
        {project.photoUrl ? (
          <Image
            src={project.photoUrl}
            alt={project.artisticName || project.name}
            fill
            className="object-cover image-painted group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 bg-chiaroscuro-radial" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-canvas/80 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="font-serif text-xl font-light text-cream">
            {project.artisticName || project.name}
          </h3>
          {project.genre && (
            <p className="font-sans text-xs uppercase tracking-widest text-gold mt-1">{project.genre}</p>
          )}
        </div>
      </div>
      {project.description && (
        <p className="font-sans text-sm text-cream-muted leading-relaxed line-clamp-3">
          {project.description}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Crear Navbar.tsx**

```typescript
// src/components/layout/Navbar.tsx
import Link from 'next/link'

const links = [
  { href: '/cartelera', label: 'Cartelera' },
  { href: '/discos', label: 'Discos' },
  { href: '/merch', label: 'Merch' },
  { href: '/proyectos', label: 'Proyectos' },
]

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12">
      <div className="absolute inset-0 bg-gradient-to-b from-canvas/90 to-transparent pointer-events-none" />
      <Link
        href="/"
        className="relative font-serif text-xl font-light text-cream hover:text-gold transition-colors duration-300"
      >
        Not a Bot
      </Link>
      <ul className="relative hidden md:flex items-center gap-8">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="font-sans text-sm uppercase tracking-widest text-cream-muted hover:text-cream transition-colors duration-300"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
      {/* Mobile menu — botón simple */}
      <div className="relative md:hidden">
        <details className="group">
          <summary className="cursor-pointer list-none font-sans text-xs uppercase tracking-widest text-cream-muted">
            Menú
          </summary>
          <ul className="absolute right-0 top-8 bg-canvas border border-cream/10 p-4 flex flex-col gap-4 min-w-[140px]">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="font-sans text-sm text-cream hover:text-gold transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </nav>
  )
}
```

- [ ] **Step 7: Crear Footer.tsx**

```typescript
// src/components/layout/Footer.tsx
export function Footer() {
  return (
    <footer className="border-t border-cream/10 px-6 py-12 md:px-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <p className="font-serif text-xl font-light text-cream">Not a Bot</p>
          <p className="font-sans text-xs text-cream-muted mt-1">Jazz en las Rocas · Ciudad de México</p>
        </div>
        <nav className="flex flex-wrap gap-6">
          {[
            { href: '/cartelera', label: 'Cartelera' },
            { href: '/discos', label: 'Discos' },
            { href: '/merch', label: 'Merch' },
            { href: '/proyectos', label: 'Proyectos' },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="font-sans text-xs uppercase tracking-widest text-cream-muted hover:text-cream transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-cream/5">
        <p className="font-sans text-xs text-cream-dim">
          © {new Date().getFullYear()} Not a Bot. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 8: Verificar TypeScript**

```bash
cd /opt/notabot-site && npx tsc --noEmit 2>&1 | head -20
```

Expected: sin errores.

---

## Task 7: Landing page

**Files:**
- Modify: `src/app/layout.tsx` — wrap with Navbar + Footer
- Create: `src/app/page.tsx`
- Create: `src/components/sections/HeroSection.tsx`
- Create: `src/components/sections/ProyectosPreview.tsx`
- Create: `src/components/sections/CarreleraPreview.tsx`
- Create: `src/components/sections/DiscosPreview.tsx`
- Create: `src/components/sections/MerchPreview.tsx`

- [ ] **Step 1: Actualizar layout.tsx para incluir Navbar y Footer**

```typescript
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Not a Bot — Jazz en las Rocas',
  description: 'Conciertos de jazz, vinilos y experiencias en vivo.',
  icons: { icon: '/favicon.ico' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="bg-canvas text-cream min-h-screen">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Crear HeroSection.tsx**

```typescript
// src/components/sections/HeroSection.tsx
import Link from 'next/link'
import { GrainOverlay } from '@/components/ui/GrainOverlay'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Chiaroscuro background */}
      <div className="absolute inset-0 bg-canvas" />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 25% 30%, #3d1202 0%, transparent 55%), radial-gradient(ellipse at 75% 70%, #1a0a15 0%, transparent 50%)',
        }}
      />
      <GrainOverlay opacity={0.05} />

      {/* Línea ornamental horizontal */}
      <div className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 animate-fade-up">
        <p className="font-sans text-xs uppercase tracking-[0.3em] text-gold mb-6">
          Jazz · Vinilo · Ciudad de México
        </p>
        <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-light text-cream text-shadow-warm leading-none">
          Not a Bot
        </h1>
        <div className="mt-4 divider-ornament w-40 mx-auto">
          <span className="font-sans text-xs uppercase tracking-widest text-gold/60">Jazz en las Rocas</span>
        </div>
        <p className="mt-8 font-sans text-sm text-cream-muted max-w-md leading-relaxed">
          Conciertos íntimos, vinilos en vivo y experiencias irrepetibles en el corazón de la ciudad.
        </p>
        <Link
          href="/cartelera"
          className="mt-10 inline-block border border-gold/40 px-8 py-3 font-sans text-xs uppercase tracking-widest text-gold hover:bg-gold/10 transition-colors duration-500"
        >
          Ver cartelera
        </Link>
      </div>

      {/* Fade to content */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-canvas to-transparent" />
    </section>
  )
}
```

- [ ] **Step 3: Crear ProyectosPreview.tsx**

```typescript
// src/components/sections/ProyectosPreview.tsx
import Link from 'next/link'
import { ProjectCard } from '@/components/ui/ProjectCard'
import type { Project } from '@/types/api'

export function ProyectosPreview({ projects }: { projects: Project[] }) {
  const preview = projects.slice(0, 4)
  return (
    <section className="px-6 py-24 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2">El grupo</p>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-cream">Proyectos</h2>
          </div>
          <Link
            href="/proyectos"
            className="hidden md:block font-sans text-xs uppercase tracking-widest text-cream-muted hover:text-cream transition-colors"
          >
            Ver todos →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {preview.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
        <div className="mt-8 md:hidden">
          <Link href="/proyectos" className="font-sans text-xs uppercase tracking-widest text-gold">
            Ver todos →
          </Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Crear CarreleraPreview.tsx**

```typescript
// src/components/sections/CarreleraPreview.tsx
import Link from 'next/link'
import { EventCard } from '@/components/ui/EventCard'
import type { TicketEvent } from '@/types/api'

export function CarreleraPreview({ events }: { events: TicketEvent[] }) {
  const upcoming = events.slice(0, 3)
  return (
    <section className="px-6 py-24 md:px-12 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 70% 50%, #1a0510 0%, transparent 60%)' }}
      />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2">En escena</p>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-cream">Próximos conciertos</h2>
          </div>
          <Link
            href="/cartelera"
            className="hidden md:block font-sans text-xs uppercase tracking-widest text-cream-muted hover:text-cream transition-colors"
          >
            Cartelera completa →
          </Link>
        </div>
        {upcoming.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcoming.map((e) => <EventCard key={e.slug} event={e} />)}
          </div>
        ) : (
          <p className="font-sans text-sm text-cream-muted">No hay conciertos próximos. Vuelve pronto.</p>
        )}
        <div className="mt-8 md:hidden">
          <Link href="/cartelera" className="font-sans text-xs uppercase tracking-widest text-gold">
            Cartelera completa →
          </Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Crear DiscosPreview.tsx**

```typescript
// src/components/sections/DiscosPreview.tsx
import Link from 'next/link'
import { ReleaseCard } from '@/components/ui/ReleaseCard'
import type { Release } from '@/types/api'

export function DiscosPreview({ releases }: { releases: Release[] }) {
  const latest = releases.slice(0, 4)
  return (
    <section className="px-6 py-24 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2">Sonido propio</p>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-cream">Discos</h2>
          </div>
          <Link
            href="/discos"
            className="hidden md:block font-sans text-xs uppercase tracking-widest text-cream-muted hover:text-cream transition-colors"
          >
            Discografía completa →
          </Link>
        </div>
        {latest.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {latest.map((r) => <ReleaseCard key={r.id} release={r} />)}
          </div>
        ) : (
          <p className="font-sans text-sm text-cream-muted">Próximamente.</p>
        )}
        <div className="mt-8 md:hidden">
          <Link href="/discos" className="font-sans text-xs uppercase tracking-widest text-gold">
            Discografía completa →
          </Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Crear MerchPreview.tsx**

```typescript
// src/components/sections/MerchPreview.tsx
import Link from 'next/link'
import { ProductCard } from '@/components/ui/ProductCard'
import type { Product } from '@/types/api'

export function MerchPreview({ products }: { products: Product[] }) {
  const preview = products.slice(0, 4)
  return (
    <section className="px-6 py-24 md:px-12 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 30% 50%, #0a1a10 0%, transparent 60%)' }}
      />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2">La tienda</p>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-cream">Merch</h2>
          </div>
          <Link
            href="/merch"
            className="hidden md:block font-sans text-xs uppercase tracking-widest text-cream-muted hover:text-cream transition-colors"
          >
            Ver catálogo →
          </Link>
        </div>
        {preview.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {preview.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <p className="font-sans text-sm text-cream-muted">Próximamente.</p>
        )}
        <div className="mt-8 md:hidden">
          <Link href="/merch" className="font-sans text-xs uppercase tracking-widest text-gold">
            Ver catálogo →
          </Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 7: Crear src/app/page.tsx**

```typescript
import { HeroSection } from '@/components/sections/HeroSection'
import { ProyectosPreview } from '@/components/sections/ProyectosPreview'
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
      <ProyectosPreview projects={projects} />
      <CarreleraPreview events={events} />
      <DiscosPreview releases={releases} />
      <MerchPreview products={products} />
    </>
  )
}
```

- [ ] **Step 8: Verificar build**

```bash
cd /opt/notabot-site && npm run build 2>&1 | tail -30
```

Expected: Build exitoso.

---

## Task 8: Página de Cartelera y detalle de evento

**Files:**
- Create: `src/app/cartelera/page.tsx`
- Create: `src/app/cartelera/[slug]/page.tsx`

- [ ] **Step 1: Crear src/app/cartelera/page.tsx**

```typescript
import { EventCard } from '@/components/ui/EventCard'
import { GrainOverlay } from '@/components/ui/GrainOverlay'
import { getEvents } from '@/lib/api'

export const metadata = { title: 'Cartelera — Not a Bot' }

export default async function CarreleraPage() {
  const events = await getEvents().catch(() => [])

  return (
    <div className="relative min-h-screen pt-32 pb-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 20% 10%, #2a0a05 0%, transparent 50%)' }}
      />
      <GrainOverlay opacity={0.03} />

      <div className="relative z-10 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="mb-16">
          <p className="font-sans text-xs uppercase tracking-widest text-gold mb-3">En escena</p>
          <h1 className="font-serif text-5xl md:text-7xl font-light text-cream">Cartelera</h1>
          <div className="mt-4 h-px w-24 bg-gradient-to-r from-gold/40 to-transparent" />
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {events.map((e) => <EventCard key={e.slug} event={e} />)}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl text-cream-muted font-light">No hay conciertos próximos.</p>
            <p className="font-sans text-sm text-cream-dim mt-2">Vuelve pronto.</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Crear src/app/cartelera/[slug]/page.tsx**

```typescript
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { GrainOverlay } from '@/components/ui/GrainOverlay'
import { getEventDetail } from '@/lib/api'
import { formatDate, formatPrice, formatTime } from '@/lib/format'

export const dynamic = 'force-dynamic'

interface Props { params: { slug: string } }

export default async function EventDetailPage({ params }: Props) {
  let detail
  try {
    detail = await getEventDetail(params.slug)
  } catch {
    notFound()
  }

  const { event, ticketTypes, salesActive } = detail
  const firstType = ticketTypes[0]

  return (
    <div className="relative min-h-screen pt-24">
      <GrainOverlay opacity={0.04} />

      {/* Hero con imagen */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover image-painted"
            priority
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 30% 40%, #3d1202 0%, #0d0905 70%)' }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-12 max-w-6xl mx-auto">
          <p className="font-sans text-xs uppercase tracking-widest text-gold mb-3">
            {formatDate(event.date)} · {formatTime(event.time)}
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-light text-cream text-shadow-warm">
            {event.title}
          </h1>
          <p className="font-sans text-sm text-cream-muted mt-2">{event.venue}</p>
        </div>
      </div>

      {/* Contenido */}
      <div className="relative z-10 px-6 md:px-12 py-16 max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          {event.description && (
            <>
              <h2 className="font-serif text-2xl font-light text-cream mb-4">Sobre el evento</h2>
              <p className="font-sans text-sm text-cream-muted leading-relaxed">{event.description}</p>
            </>
          )}
        </div>

        {/* Panel de compra */}
        <div className="border border-cream/10 p-6 self-start">
          {salesActive && firstType ? (
            <>
              <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2">Boletos</p>
              <p className="font-serif text-3xl font-light text-cream mb-1">
                {formatPrice(firstType.price)}
              </p>
              <p className="font-sans text-xs text-cream-muted mb-6">
                {firstType.available} disponibles
              </p>
              <Link
                href={`/checkout/${params.slug}`}
                className="block w-full text-center border border-gold/40 px-6 py-3 font-sans text-xs uppercase tracking-widest text-gold hover:bg-gold/10 transition-colors duration-500"
              >
                Comprar boletos
              </Link>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="font-sans text-sm text-cream-muted">
                {salesActive ? 'Agotado' : 'Venta no disponible'}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 md:px-12 pb-12 max-w-6xl mx-auto">
        <Link href="/cartelera" className="font-sans text-xs uppercase tracking-widest text-cream-muted hover:text-cream transition-colors">
          ← Cartelera
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verificar build**

```bash
cd /opt/notabot-site && npm run build 2>&1 | tail -20
```

Expected: Build exitoso.

---

## Task 9: Flujo de checkout

**Files:**
- Create: `src/app/checkout/[slug]/page.tsx`
- Create: `src/app/checkout/success/page.tsx`

- [ ] **Step 1: Crear src/app/checkout/[slug]/page.tsx**

```typescript
import { notFound } from 'next/navigation'
import { GrainOverlay } from '@/components/ui/GrainOverlay'
import { getEventDetail } from '@/lib/api'
import { formatDate, formatPrice, formatTime } from '@/lib/format'
import { initiateCheckout } from '@/lib/actions'

export const dynamic = 'force-dynamic'

interface Props { params: { slug: string } }

export default async function CheckoutPage({ params }: Props) {
  let detail
  try {
    detail = await getEventDetail(params.slug)
  } catch {
    notFound()
  }

  const { event, ticketTypes, salesActive } = detail
  if (!salesActive) notFound()

  return (
    <div className="relative min-h-screen pt-32 pb-24">
      <GrainOverlay opacity={0.03} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 60% 20%, #1a0a15 0%, transparent 50%)' }}
      />

      <div className="relative z-10 px-6 md:px-12 max-w-2xl mx-auto">
        <div className="mb-10">
          <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2">{event.venue}</p>
          <h1 className="font-serif text-3xl md:text-4xl font-light text-cream">{event.title}</h1>
          <p className="font-sans text-sm text-cream-muted mt-1">
            {formatDate(event.date)} · {formatTime(event.time)}
          </p>
        </div>

        <form action={initiateCheckout} className="flex flex-col gap-6">
          <input type="hidden" name="slug" value={params.slug} />

          {/* Ticket type */}
          <div>
            <label className="block font-sans text-xs uppercase tracking-widest text-cream-muted mb-3">
              Tipo de boleto
            </label>
            {ticketTypes.map((tt) => (
              <label
                key={tt.id}
                className="flex items-center justify-between border border-cream/10 px-4 py-3 mb-2 cursor-pointer hover:border-gold/30 transition-colors has-[:checked]:border-gold/60"
              >
                <div className="flex items-center gap-3">
                  <input type="radio" name="ticketTypeId" value={tt.id} defaultChecked className="accent-gold" />
                  <span className="font-sans text-sm text-cream">{tt.name}</span>
                </div>
                <span className="font-sans text-sm text-gold">{formatPrice(tt.price)}</span>
              </label>
            ))}
          </div>

          {/* Cantidad */}
          <div>
            <label className="block font-sans text-xs uppercase tracking-widest text-cream-muted mb-3">
              Cantidad
            </label>
            <select
              name="quantity"
              className="w-full bg-canvas border border-cream/20 px-4 py-3 font-sans text-sm text-cream focus:border-gold/40 focus:outline-none"
            >
              {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                <option key={n} value={n}>{n} boleto{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          {/* Datos del comprador */}
          <div>
            <label className="block font-sans text-xs uppercase tracking-widest text-cream-muted mb-3">
              Tu nombre
            </label>
            <input
              type="text"
              name="customerName"
              required
              placeholder="Nombre completo"
              className="w-full bg-canvas border border-cream/20 px-4 py-3 font-sans text-sm text-cream placeholder:text-cream-dim focus:border-gold/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-sans text-xs uppercase tracking-widest text-cream-muted mb-3">
              Tu email
            </label>
            <input
              type="email"
              name="customerEmail"
              required
              placeholder="correo@ejemplo.com"
              className="w-full bg-canvas border border-cream/20 px-4 py-3 font-sans text-sm text-cream placeholder:text-cream-dim focus:border-gold/40 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full border border-gold/40 px-8 py-4 font-sans text-xs uppercase tracking-widest text-gold hover:bg-gold/10 transition-colors duration-500"
          >
            Continuar al pago →
          </button>

          <p className="font-sans text-xs text-cream-dim text-center">
            Serás redirigido a Stripe para completar el pago de forma segura.
          </p>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Crear src/app/checkout/success/page.tsx**

```typescript
import Link from 'next/link'
import { GrainOverlay } from '@/components/ui/GrainOverlay'

export const metadata = { title: 'Compra confirmada — Not a Bot' }

export default function CheckoutSuccessPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <GrainOverlay opacity={0.04} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, #0a1a0a 0%, transparent 60%)' }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md animate-fade-up">
        <div className="w-12 h-px bg-gold mb-8 mx-auto" />
        <p className="font-sans text-xs uppercase tracking-widest text-gold mb-4">Pago confirmado</p>
        <h1 className="font-serif text-4xl md:text-5xl font-light text-cream">¡Hasta pronto!</h1>
        <p className="mt-6 font-sans text-sm text-cream-muted leading-relaxed">
          Tu compra fue procesada exitosamente. Recibirás tus boletos por correo electrónico.
        </p>
        <Link
          href="/cartelera"
          className="mt-10 inline-block border border-gold/40 px-8 py-3 font-sans text-xs uppercase tracking-widest text-gold hover:bg-gold/10 transition-colors duration-500"
        >
          Ver más conciertos
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verificar build**

```bash
cd /opt/notabot-site && npm run build 2>&1 | tail -20
```

Expected: Build exitoso.

---

## Task 10: Páginas de Discos, Merch y Proyectos

**Files:**
- Create: `src/app/discos/page.tsx`
- Create: `src/app/discos/[id]/page.tsx`
- Create: `src/app/merch/page.tsx`
- Create: `src/app/proyectos/page.tsx`

- [ ] **Step 1: Crear src/app/discos/page.tsx**

```typescript
import { getReleases } from '@/lib/api'
import { ReleaseCard } from '@/components/ui/ReleaseCard'
import { GrainOverlay } from '@/components/ui/GrainOverlay'

export const metadata = { title: 'Discos — Not a Bot' }

export default async function DiscosPage() {
  const releases = await getReleases().catch(() => [])

  return (
    <div className="relative min-h-screen pt-32 pb-24">
      <GrainOverlay opacity={0.03} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 80% 15%, #1a0a05 0%, transparent 50%)' }}
      />
      <div className="relative z-10 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="mb-16">
          <p className="font-sans text-xs uppercase tracking-widest text-gold mb-3">Sonido propio</p>
          <h1 className="font-serif text-5xl md:text-7xl font-light text-cream">Discos</h1>
          <div className="mt-4 h-px w-24 bg-gradient-to-r from-gold/40 to-transparent" />
        </div>
        {releases.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {releases.map((r) => <ReleaseCard key={r.id} release={r} />)}
          </div>
        ) : (
          <p className="font-sans text-sm text-cream-muted">Próximamente.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Crear src/app/discos/[id]/page.tsx**

```typescript
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { GrainOverlay } from '@/components/ui/GrainOverlay'
import { getRelease } from '@/lib/api'

interface Props { params: { id: string } }

export default async function ReleaseDetailPage({ params }: Props) {
  let release
  try {
    release = await getRelease(params.id)
  } catch {
    notFound()
  }

  return (
    <div className="relative min-h-screen pt-32 pb-24">
      <GrainOverlay opacity={0.04} />
      <div className="relative z-10 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="relative aspect-square w-full overflow-hidden rounded-sm">
            {release.coverImage ? (
              <Image
                src={release.coverImage}
                alt={`${release.title} — ${release.artist}`}
                fill
                className="object-cover image-painted"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-chiaroscuro-radial flex items-center justify-center">
                <span className="font-serif text-6xl text-gold/30">♪</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2">{release.year}</p>
              <h1 className="font-serif text-4xl md:text-5xl font-light text-cream">{release.title}</h1>
              <p className="font-sans text-lg text-cream-muted mt-1">{release.artist}</p>
            </div>

            {release.description && (
              <p className="font-sans text-sm text-cream-muted leading-relaxed">{release.description}</p>
            )}

            <div className="flex flex-col gap-3">
              {release.spotifyUrl && (
                <a
                  href={release.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block border border-cream/20 px-6 py-3 font-sans text-xs uppercase tracking-widest text-cream-muted hover:border-gold/40 hover:text-gold transition-colors duration-300"
                >
                  Escuchar en Spotify →
                </a>
              )}
              {release.bandcampUrl && (
                <a
                  href={release.bandcampUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block border border-cream/20 px-6 py-3 font-sans text-xs uppercase tracking-widest text-cream-muted hover:border-gold/40 hover:text-gold transition-colors duration-300"
                >
                  Escuchar en Bandcamp →
                </a>
              )}
              {release.appleMusicUrl && (
                <a
                  href={release.appleMusicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block border border-cream/20 px-6 py-3 font-sans text-xs uppercase tracking-widest text-cream-muted hover:border-gold/40 hover:text-gold transition-colors duration-300"
                >
                  Escuchar en Apple Music →
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12">
          <Link href="/discos" className="font-sans text-xs uppercase tracking-widest text-cream-muted hover:text-cream transition-colors">
            ← Discos
          </Link>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Crear src/app/merch/page.tsx**

```typescript
import { getProducts } from '@/lib/api'
import { ProductCard } from '@/components/ui/ProductCard'
import { GrainOverlay } from '@/components/ui/GrainOverlay'

export const metadata = { title: 'Merch — Not a Bot' }

export default async function MerchPage() {
  const products = await getProducts().catch(() => [])

  return (
    <div className="relative min-h-screen pt-32 pb-24">
      <GrainOverlay opacity={0.03} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 80%, #0a1005 0%, transparent 60%)' }}
      />
      <div className="relative z-10 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="mb-16">
          <p className="font-sans text-xs uppercase tracking-widest text-gold mb-3">La tienda</p>
          <h1 className="font-serif text-5xl md:text-7xl font-light text-cream">Merch</h1>
          <div className="mt-4 h-px w-24 bg-gradient-to-r from-gold/40 to-transparent" />
        </div>
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <p className="font-sans text-sm text-cream-muted">Próximamente.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Crear src/app/proyectos/page.tsx**

```typescript
import { getProjects } from '@/lib/api'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { GrainOverlay } from '@/components/ui/GrainOverlay'

export const metadata = { title: 'Proyectos — Not a Bot' }

export default async function ProyectosPage() {
  const projects = await getProjects().catch(() => [])

  return (
    <div className="relative min-h-screen pt-32 pb-24">
      <GrainOverlay opacity={0.03} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 40% 20%, #1a0505 0%, transparent 55%)' }}
      />
      <div className="relative z-10 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="mb-16">
          <p className="font-sans text-xs uppercase tracking-widest text-gold mb-3">El grupo</p>
          <h1 className="font-serif text-5xl md:text-7xl font-light text-cream">Proyectos</h1>
          <div className="mt-4 h-px w-24 bg-gradient-to-r from-gold/40 to-transparent" />
        </div>
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        ) : (
          <p className="font-sans text-sm text-cream-muted">Próximamente.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Verificar build completo**

```bash
cd /opt/notabot-site && npm run build 2>&1 | tail -30
```

Expected: Build exitoso, todas las rutas compiladas.

---

## Task 11: Docker, Traefik y deploy en staging

**Files:**
- Create: `/opt/notabot-site/Dockerfile`
- Create: `/opt/notabot-site/docker-compose.yml`
- Modify: `/opt/staging/docker-compose.yml` — quitar `staging.notabot.mx` del router de wp-notabot

- [ ] **Step 1: Crear Dockerfile**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

- [ ] **Step 2: Crear docker-compose.yml**

```yaml
services:
  notabot-site:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: notabot-site
    restart: unless-stopped
    env_file: .env
    networks:
      - n8n_default
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.notabot-site.rule=Host(`staging.notabot.mx`)"
      - "traefik.http.routers.notabot-site.entrypoints=websecure"
      - "traefik.http.routers.notabot-site.tls=true"
      - "traefik.http.routers.notabot-site.tls.certresolver=mytlschallenge"
      - "traefik.http.services.notabot-site.loadbalancer.server.port=3000"

networks:
  n8n_default:
    external: true
```

- [ ] **Step 3: Quitar staging.notabot.mx del WordPress staging**

En `/opt/staging/docker-compose.yml`, en el servicio `wp-notabot`, cambiar la regla de Traefik para que no use `staging.notabot.mx`:

```yaml
# Cambiar esta línea:
- traefik.http.routers.wp-notabot.rule=Host(`staging.notabot.mx`)
# Por:
- traefik.http.routers.wp-notabot.rule=Host(`wp-notabot.staging.internal`)
```

O simplemente deshabilitar Traefik para ese servicio:

```yaml
- traefik.enable=false
```

- [ ] **Step 4: Aplicar cambio en staging WordPress**

```bash
docker compose -f /opt/staging/docker-compose.yml up -d
```

Expected: staging-wp-notabot-1 recreado sin conflicto en staging.notabot.mx.

- [ ] **Step 5: Hacer build y levantar notabot-site**

```bash
cd /opt/notabot-site && docker compose up -d --build
```

Expected: Imagen construida, contenedor `notabot-site` corriendo.

- [ ] **Step 6: Verificar que Traefik tomó la ruta**

```bash
docker logs notabot-site 2>&1 | tail -10
curl -s -o /dev/null -w "%{http_code}" https://staging.notabot.mx
```

Expected: logs sin error, HTTP 200.

- [ ] **Step 7: Verificar páginas principales**

```bash
curl -s https://staging.notabot.mx | grep -o "<title>[^<]*</title>"
curl -s -o /dev/null -w "%{http_code}" https://staging.notabot.mx/cartelera
curl -s -o /dev/null -w "%{http_code}" https://staging.notabot.mx/proyectos
curl -s -o /dev/null -w "%{http_code}" https://staging.notabot.mx/discos
curl -s -o /dev/null -w "%{http_code}" https://staging.notabot.mx/merch
```

Expected: title con "Not a Bot", todas las rutas devuelven 200.

- [ ] **Step 8: Commit inicial**

```bash
cd /opt/notabot-site && git init && git add -A && git commit -m "feat: initial notabot.mx public website

Landing, cartelera, checkout, discos, merch, proyectos.
Romanticismo/chiaroscuro design system.
Connects to core.notabot.mx API.
Staging at staging.notabot.mx"
```

---

## Checklist final de spec coverage

- [x] Landing con hero + secciones en orden (hero → proyectos → cartelera → discos → merch)
- [x] Cartelera con listado y filtro por brand=notabot
- [x] Detalle de evento con imagen chiaroscuro
- [x] Checkout SSR: Server Action → core API → Stripe → success page
- [x] Discos publicados (tabla nueva, endpoints GET públicos en core)
- [x] Merch catálogo (endpoint público en core)
- [x] Proyectos del grupo (endpoint público en core)
- [x] Design system: paleta romanticista, Cormorant Garamond, grain texture, chiaroscuro
- [x] Docker + Traefik en staging.notabot.mx
- [x] staging-wp-notabot-1 liberado del subdominio
- [x] Llaves de Stripe nunca expuestas al browser
- [x] Mobile-first responsive
