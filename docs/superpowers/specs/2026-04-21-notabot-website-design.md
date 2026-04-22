# notabot.mx — Nuevo Sitio Público

**Fecha:** 2026-04-21  
**Estado:** Aprobado por usuario

---

## Contexto

`notabot.mx` era un sitio WordPress/WooCommerce para venta de boletos. Se reemplaza completamente con un nuevo sitio público moderno que actúa como la cara pública de la marca Not a Bot y sus proyectos. WooCommerce queda eliminado.

El ecosistema actual al que se integra:
- `core.notabot.mx` — Fastify API (conciertos, boletos, pagos, proyectos, músicos)
- `humans.notabot.mx` — panel de control interno (staff) — Next.js en `/opt/humans-app`
- `app.notabot.mx` — portal de miembros/vinilo club — Next.js en `/opt/notabot-web`

El nuevo sitio **no** se conecta con `app.notabot.mx` directamente. Toda la data viene de `core.notabot.mx`.

---

## Stack técnico

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Estilos:** Tailwind CSS
- **Runtime:** Node.js (SSR — no static export)
- **Deploy staging:** Docker en VPS, `staging.notabot.mx`
- **Deploy producción:** Hostinger (Node.js), `notabot.mx`
- **Directorio:** `/opt/notabot-site/`
- **Patrón Docker:** idéntico a `humans-app` (contenedor con env_file, red `n8n_default`, Traefik labels)

El SSR es requerido porque el checkout de boletos maneja llaves de Stripe en el servidor — nunca expuestas al browser.

---

## Rutas

```
/                        Landing page
/cartelera               Todos los eventos con filtros
/cartelera/[slug]        Detalle de evento + compra de boletos
/discos                  Discografía publicada por Not a Bot
/discos/[slug]           Detalle de disco
/merch                   Catálogo de productos
/proyectos               Los proyectos del grupo
/checkout/[eventSlug]    Selección de cantidad + datos del comprador
/checkout/success        Confirmación post-pago
```

No requiere autenticación — el sitio es 100% público. Para comprar boletos solo se piden nombre y email.

---

## Landing page — orden de secciones

1. **Hero** — identidad de marca, tagline, CTA hacia cartelera
2. **Proyectos** — los proyectos del grupo (Parker & Lenox, Parnás & Lion, M Jazz, etc.)
3. **Cartelera** — próximos eventos destacados (3-4 cards)
4. **Discos** — últimos discos publicados
5. **Merch** — preview del catálogo

---

## Diseño visual

### Concepto
Romanticismo pictórico con chiaroscuro. La estética evoca pintura del siglo XIX (Goya, Delacroix) sin ser literal — el feeling, no el pastiche. Jazz club nocturno con profundidad y dramatismo.

### Paleta
| Uso | Color | Hex |
|---|---|---|
| Fondo principal | Negro cálido (undertone marrón) | `#0d0905` |
| Acento primario | Borgoña profundo | `#6b1a2a` |
| Acento secundario | Oro envejecido / ocre | `#b8922a` |
| Texto principal | Crema amarillenta | `#f0e6c8` |
| Texto secundario | Crema atenuada | `#a89880` |

### Tipografía
- **Títulos:** Cormorant Garamond o EB Garamond (serif clásica, carácter editorial/manuscrito)
- **UI y datos:** Inter (sans-serif limpia para precios, fechas, botones)

### Efectos visuales
- **Chiaroscuro en backgrounds:** gradientes asimétricos — una zona iluminada que se hunde en oscuridad
- **Tratamiento de imágenes:** overlay que eleva el contraste, sombras pesadas, luces cálidas — look "pintado"
- **Textura:** noise/grain sutil sobre fondos (sensación de óleo sobre lienzo) — nunca obvio
- **Tipografía ornamental:** separadores de línea fina, ningún elemento que grite "siglo XIX"
- **Animaciones:** lentas y suaves — nada rápido ni llamativo
- **Responsive:** mobile-first

---

## Integración con `core.notabot.mx`

### Endpoints existentes (ya disponibles)
- `GET /concerts` — cartelera
- `GET /concerts/:id` — detalle de evento
- `GET /tickets` — disponibilidad
- `POST /purchases` — crear orden
- `GET /payments` — iniciar sesión Stripe
- `GET /projects` — proyectos del grupo
- `GET /musicians` — artistas

### Endpoints a crear (nuevos)
- `GET /releases` — discos publicados por Not a Bot (tabla nueva en core)
- `GET /releases/:id` — detalle de disco
- `GET /products/public` — catálogo de merch (versión pública, sin admin data)

### Flujo de compra de boletos
1. Usuario selecciona evento + cantidad en `/cartelera/[slug]`
2. Redirige a `/checkout/[eventSlug]` — formulario nombre + email
3. Server Action de Next.js llama `POST /purchases` en `core.notabot.mx`
4. `core.notabot.mx` crea sesión de Stripe y devuelve `checkout_url`
5. Usuario es redirigido a Stripe Checkout (hosted page)
6. Stripe redirige a `/checkout/success` con confirmación

Las llaves de Stripe nunca son expuestas al browser.

---

## Variables de entorno

```env
CORE_API_URL=https://core.notabot.mx
NEXT_PUBLIC_APP_URL=https://staging.notabot.mx   # → https://notabot.mx en prod
NEXTAUTH_SECRET=<generar>
```

---

## Staging

- **Subdominio:** `staging.notabot.mx` — el contenedor `staging-wp-notabot-1` (WordPress) deja ese subdominio y el nuevo sitio lo toma
- **Traefik:** regla `Host('staging.notabot.mx')`, TLS con `mytlschallenge`, puerto interno 3000
- **Red Docker:** `n8n_default` (igual que todos los servicios de producción)

## Producción

- DNS de `notabot.mx` apunta a `5.183.8.20` (IP real del VPS) en hPanel de Hostinger
- Traefik añade regla `Host('notabot.mx')`
- El contenedor no cambia — solo DNS y variable `NEXT_PUBLIC_APP_URL`
- Hostinger (plan con Node.js) como hosting final — el contenedor se migra o se reploya allá

---

## Secciones pendientes de data model

### Discos publicados (`/releases`)
Tabla nueva en `notabot_core` (o modelo en Prisma de `concerts-api`):
- `id`, `title`, `artist`, `year`, `cover_image`, `description`, `spotify_url`, `bandcamp_url`, `apple_music_url`, `brand` (`parker_lenox` | `notabot` | etc.), `published_at`

### Merch público
Reutilizar tabla `products` existente en `notabot_core` con endpoint público (sin precios de costo ni data interna).

---

## Out of scope

- Login / cuentas de usuario en este sitio
- Panel de administración (eso es `humans.notabot.mx`)
- Conexión directa con `app.notabot.mx`
- Blog o contenido editorial
