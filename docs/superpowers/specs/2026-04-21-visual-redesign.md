# Not a Bot — Rediseño Visual

**Fecha:** 2026-04-21
**Estado:** Aprobado por usuario

---

## Contexto

El diseño original (romanticismo elegante, Cormorant Garamond en pesos ligeros, ornamentos dorados, estética de pintura del siglo XIX) resulta demasiado refinado para la identidad real de la marca. Not a Bot es resistencia musical — como la Revolución Francesa fue resistencia cultural. El nuevo diseño mantiene la base oscura y la tipografía serif pero la lleva hacia el territorio del cartel de teatro/ópera del siglo XX: imponente, dramático, sin ornamentación innecesaria.

**Dirección elegida:** C — Cartel de teatro oscuro (poster art dramático)

---

## Sistema visual

### Qué cambia

- **Tipografía de títulos**: Cormorant Garamond en pesos más agresivos (700–900 italic). Tamaños mucho mayores — títulos de sección que ocupan toda la pantalla. Menos ornamento, más impacto.
- **Oro**: Deja de ser decoración delicada y se convierte en acento fuerte y escaso. Solo en elementos clave: una línea horizontal, un número, una palabra de énfasis. Color más saturado: `#c8a030` (antes `#b8922a`).
- **Grain texture**: Intensidad levemente mayor — sensación de cartel impreso, no de pantalla digital.
- **Reglas horizontales**: Líneas finas de oro (`1px`, `rgba(200,160,48,0.4)`) que separan secciones, como en carteles de teatro del siglo XX.
- **Espaciado**: Mucho más aire alrededor del texto. El vacío es parte del diseño.
- **Pesos tipográficos**: Se eliminan los pesos `300` y `400` de los títulos principales. Mínimo `600`, preferiblemente `700–900 italic` para los grandes.

### Qué se queda

- Fondo negro cálido: `#0d0905`
- Familia tipográfica: Cormorant Garamond (serif) + Inter (sans)
- Paleta base: negro, oro, crema
- Texto principal: `#f0e6c8`
- Texto secundario: `#a89880`

### Paleta actualizada

| Token | Valor | Uso |
|---|---|---|
| `--color-canvas` | `#0d0905` | Fondo principal (sin cambio) |
| `--color-gold` | `#c8a030` | Acento fuerte (más saturado) |
| `--color-gold-muted` | `#8a6a1a` | Detalles secundarios |
| `--color-cream` | `#f0e6c8` | Texto principal (sin cambio) |
| `--color-cream-muted` | `#a89880` | Texto secundario (sin cambio) |
| `--color-section-alt` | `#110e0a` | Fondo de franjas alternas |

---

## Landing page — estructura

### 1. Hero

**Layout:** Split screen a pantalla completa (`min-h-screen`). Dos columnas — sin gap, sin margen entre ellas.

**Columna izquierda (60% desktop, 100% móvil):**
- Imagen de la mujer del logo ocupando todo el espacio a sangre completa — sin márgenes, sin marco, sin border-radius.
- Tratamiento pictórico sobre la imagen: `filter: contrast(1.15) saturate(0.75) sepia(0.1)` + gradiente sutil oscuro en la parte inferior para conectar con el fondo.
- Placeholder: `div` con fondo `radial-gradient(ellipse at 40% 30%, #2a1a0a 0%, #0d0905 100%)` y texto centrado `[Imagen de la mujer]` en Cormorant italic atenuado.
- En móvil: esta columna va arriba, ocupa 50vh.

**Columna derecha (40% desktop, 100% móvil):**
Centrado verticalmente, alineado a la izquierda, con padding generoso (`px-10 md:px-14`):

```
NOT A BOT                         Inter 9px, tracking 0.4em, color gold
────────────────────────────────  línea dorada 1px, ancho completo

Música de                         Cormorant Garamond 900 italic
humanos                           ~72-88px desktop / ~48px móvil
para                              color cream, line-height 0.9
humanos

────────────────────────────────  línea dorada 1px
Jazz · Vinilo · CDMX             Inter 9px, tracking 0.3em, cream-muted

[ Ver cartelera → ]              Botón: borde dorado 1px, Inter 10px
                                  uppercase tracking, sin relleno
                                  hover: bg gold/10
```

Sin gradientes, sin grain extra, sin subtítulo adicional. Solo tipografía, dos reglas y la imagen.

**Implementación:**
```tsx
// src/components/sections/HeroSection.tsx
<section className="relative min-h-screen flex flex-col md:flex-row overflow-hidden">
  {/* Columna izquierda — imagen */}
  <div className="relative w-full md:w-[60%] h-[50vh] md:h-auto">
    {/* Placeholder o imagen real cuando esté disponible */}
  </div>
  {/* Columna derecha — texto */}
  <div className="relative w-full md:w-[40%] flex items-center px-10 md:px-14 py-20 md:py-0 bg-canvas">
    <GrainOverlay opacity={0.06} />
    <div className="relative z-10 w-full">
      {/* Contenido del texto */}
    </div>
  </div>
</section>
```

---

### 2. Proyectos (franja de logos)

**Propósito:** Presentar los proyectos del grupo con sus logos como imágenes.

**Layout:**
- Fondo `#110e0a` (levemente diferente al canvas para separar secciones visualmente)
- Línea dorada de 1px arriba y abajo de la franja
- Label pequeño: `NUESTROS PROYECTOS` — Inter 9px, tracking 0.5em, gold
- Fila horizontal de logos: flex, justify-content: center, gap generoso
- En móvil: scroll horizontal si no caben todos

**Tratamiento de logos:**
- Cada logo: imagen en escala de grises (CSS `filter: grayscale(1) brightness(0.7)`)
- Hover: transición a color completo + `brightness(1)` — duración 400ms
- Sin cards, sin bordes, sin sombras — logos flotando sobre el fondo oscuro
- Placeholder por ahora: nombre del proyecto en Cormorant italic, color cream-muted

**Implementación:** Componente `ProyectosStrip.tsx` que recibe `projects: Project[]` de la API y renderiza logos con `project.photoUrl` o nombre como fallback.

---

### 3. Cartelera

**Título:**
- `Cartelera` en Cormorant Garamond 900 italic
- Tamaño: `clamp(72px, 10vw, 140px)` — ocupa casi todo el ancho
- Color crema, alineado a la izquierda
- Margen inferior grande antes de las tarjetas

**Tarjetas cinemáticas (horizontal scroll):**
- Contenedor: `overflow-x: auto`, scroll-snap-type x mandatory, padding lateral
- Cada tarjeta: `400px × 560px` fija — proporción de poster de cine
- `scroll-snap-align: start`
- Sin border-radius — corte limpio
- La última tarjeta visible debe quedar parcialmente cortada para indicar más contenido

**Anatomía de cada tarjeta:**
- Imagen del evento a sangre completa (`object-cover`)
- Filtro pintado sobre la imagen: `contrast(1.1) saturate(0.8) sepia(0.15)`
- Gradiente de abajo hacia arriba: `linear-gradient(to top, rgba(13,9,5,0.95) 0%, transparent 60%)`
- Sobre el gradiente, pegado al fondo de la tarjeta:
  - Fecha: Inter 9px, tracking 0.3em, color gold
  - Título: Cormorant Garamond 600 italic, ~28px, crema
  - Venue: Inter 10px, cream-muted
  - Si sold out: badge `AGOTADO` borde dorado
- Hover: `scale(1.02)` en la imagen (no en la tarjeta completa) + título sube 4px — transición 400ms

**Enlace:** Toda la tarjeta es un `<Link>` a `/cartelera/[slug]`.

**En móvil:** Las tarjetas se reducen a `280px × 400px`. El scroll horizontal se mantiene.

---

### 4. Discos, Merch, Proyectos (páginas internas)

Las secciones de la landing (DiscosPreview, MerchPreview) mantienen su estructura pero adoptan el nuevo sistema visual:
- Títulos en Cormorant 700 italic, mucho más grandes
- ReleaseCard y ProductCard: sin cambios estructurales, solo los tokens de color actualizados

Las páginas internas (`/discos`, `/merch`, `/proyectos`, `/cartelera`) mantienen su estructura actual — el rediseño afecta principalmente la landing page y el sistema visual global.

---

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/app/globals.css` | Actualizar `--color-gold`, agregar `--color-section-alt`, intensificar grain |
| `src/components/sections/HeroSection.tsx` | Reescritura completa — split layout |
| `src/components/sections/CarreleraPreview.tsx` | Título enorme + tarjetas cinemáticas horizontales |
| `src/components/sections/ProyectosPreview.tsx` | Reemplazar por `ProyectosStrip.tsx` — franja de logos |
| `src/components/ui/EventCard.tsx` | Nueva variante cinemática para el scroll horizontal |
| `src/app/page.tsx` | Actualizar orden e imports |

---

## Out of scope

- Rediseño de páginas internas (cartelera, discos, merch, proyectos, checkout) — solo se actualizan tokens de color
- Imagen real de la mujer del logo — placeholder por ahora, se agrega cuando esté disponible
- Logos reales de proyectos — placeholder por ahora
- Animaciones de entrada (scroll-triggered) — pueden agregarse después
