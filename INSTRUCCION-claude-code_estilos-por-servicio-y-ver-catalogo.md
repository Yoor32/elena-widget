# Instrucción para Claude Code — (1) Imágenes de estilo por servicio + (2) "Ver catálogo" conversacional
**Fecha:** 2026-06-18 · Backend ya publicado y verificado en vivo. Trabajas SOLO en el widget; no toques n8n/voz.

---

## CAMBIO 1 — Imágenes de estilo POR SERVICIO

Hoy `lib/refs.ts` usa el mismo set de estilo (clósets genéricos) en todos lados. Reemplázalo por imágenes **específicas del mueble de cada servicio**. Todas generadas con el pipeline (cedro, fondo de estudio) y alojadas en `raw.githubusercontent.com/Yoor32/elena-media`.

### Mapa (servicio → estilo → URL)
**Puerta de tambor (pre-cotizador):**
- contemporaneo → `…/predisenos/ST-tambor_cont-mqjrrfp1-1781803444346.png`
- clasico → `…/predisenos/ST-tambor_clasico-4827-1781803641296.png`
- minimalista → `…/predisenos/ST-tambor_minimalista-5193-1781803669120.png`
- artesanal_tallado → `…/predisenos/ST-tambor_artesanal-6310-1781803702059.png`

**Clóset (mini-form):**
- contemporaneo → `…/predisenos/ST-closet_contemporaneo-7044-1781803740207.png`
- clasico → `…/predisenos/ST-closet_clasico-7711-1781803775882.png`
- minimalista → `…/predisenos/ST-closet_minimalista-8420-1781803811940.png`
- artesanal_tallado → `…/predisenos/ST-closet_artesanal-9156-1781803850598.png`

**Puerta de entrada principal:**
- contemporaneo → `…/predisenos/ST-entrada_contemporaneo-1077-1781803888413.png`
- clasico → `…/predisenos/ST-entrada_clasico-2388-1781803924823.png`
- minimalista → `…/predisenos/ST-entrada_minimalista-3095-1781803950704.png`
- artesanal_tallado → `…/predisenos/ST-entrada_artesanal-4502-1781803973596.png`

**Cocina integral:**
- contemporaneo → `…/predisenos/ST-cocina_contemporaneo-5839-1781803998079.png`
- clasico → `…/predisenos/ST-cocina_clasico-6546-1781804020901.png`
- minimalista → `…/predisenos/ST-cocina_minimalista-7253-1781804045526.png`
- artesanal_tallado → `…/predisenos/ST-cocina_artesanal-8960-1781804069143.png`

(Prefijo común: `https://raw.githubusercontent.com/Yoor32/elena-media/main/`)

### Qué hacer
- Reestructura `lib/refs.ts` para que las imágenes de **estilo** sean por servicio: `refsEstilo[servicio][estilo] = url`. Servicios: `tambor`, `closet`, `entrada`, `cocina`.
- En el **pre-cotizador de puerta de tambor**, el RefPicker de estilo usa `refsEstilo.tambor.*`.
- En el **mini-form de clóset**, el RefPicker de estilo usa `refsEstilo.closet.*`.
- Para **entrada principal** y **cocina** (hoy conversacionales): cuando se muestre selección de estilo (picker o carrusel de referencia en el chat), usa `refsEstilo.entrada.*` y `refsEstilo.cocina.*` respectivamente.
- **Acabado** (poliuretano/aceite/cera) y **tono de madera** (cedro/caoba) se quedan como están (muestras universales) — no cambian.
- Opcional: copia las 16 a `/public/refs/` con nombres limpios (`estilo-tambor-contemporaneo.png`, etc.) o referencia las URLs raw directo (estables).

---

## CAMBIO 2 — Botón "Ver catálogo" → conversación + fichas con stock

El botón **deja de ser un link**; ahora **inicia una conversación**. Backend ya listo: Elena detecta el tipo de mueble (con sinónimos) y devuelve productos.

### Flujo
1. Al tocar **"Ver catálogo"**, envía al chat (`/chat` o async, como ya manejas) un mensaje de intención, p. ej. `"Quiero ver el catálogo en línea"`. Elena preguntará qué tipo de mueble busca (o detéctalo si el usuario ya lo dijo).
2. Cuando el usuario indique el mueble, Elena llama `buscar_producto` y la respuesta del chat incluye `function_response.products` (o `products` en el payload), un array con campos por producto:
   `{ nombre, precio, link, imagen, disponibilidad, categoria, descripcion }`
   - `disponibilidad` ∈ `"En existencia"` | `"Sobre pedido"` | `"Agotado"`.
   - Incluye TODO (también agotados/sobre pedido). Vienen coincidencias + relacionados (hasta 8).
3. Renderiza cada producto como **ficha en el chat** (reusa tu card de producto) con:
   - imagen, nombre, precio (MXN), descripción corta.
   - **Badge de stock:** `En existencia` → verde "Compra inmediata"; `Sobre pedido`/`Agotado` → ámbar "Pre-orden".
   - **Acción por stock:**
     - `En existencia` → botón **"Comprar en tienda"** que abre `link` (Link tienda) en nueva pestaña.
     - `Sobre pedido` / `Agotado` → botón **"Pre-ordenar / Cotizar"** que **manda un mensaje al chat** (p. ej. `"Quiero pre-ordenar la <nombre>"`) para que Elena capture datos y cree el ticket. No abre la tienda.
4. Muestra todas las fichas devueltas; si Elena pide aclarar el tipo, respeta ese turno conversacional.

### Notas
- No inventes productos: usa solo lo que regresa `buscar_producto`.
- El matching ya es flexible (sinónimos + categoría) del lado backend; tú solo envías el texto del usuario.
- Imágenes de producto vienen de la tienda (cloudfront) vía `imagen`.

## Criterios de aceptación
- [ ] Las 4 fichas de estilo del pre-cotizador de tambor muestran **puertas de recámara interior** (no clósets), una por estilo.
- [ ] El mini-form de clóset muestra **clósets** por estilo; entrada→puertas de entrada; cocina→cocinas.
- [ ] "Ver catálogo" inicia conversación; al indicar un tipo se ven **fichas en el chat** con coincidencias + relacionados, **incluyendo agotados/sobre pedido**.
- [ ] Cada ficha muestra badge de stock y la acción correcta (tienda vs pre-orden) según `disponibilidad`.
- [ ] Build verde + push a `main` + deploy de Pages OK.
