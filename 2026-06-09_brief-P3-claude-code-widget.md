# Brief P3 · UI del widget Elena v4 (para Claude Code)

Copia este archivo como `CLAUDE.md` (o `docs/P3-BRIEF.md`) en el repo `elena-widget` y pide a Claude Code implementar las features en orden.

## Contexto

Widget React/Vite (`elena-widget`, GitHub Pages → embebido en Duda `/ayuda`). Chat de texto + llamada de voz WebRTC (ElevenLabs). El backend ya está LISTO y en producción — solo falta UI.

## Contratos de API (backend ya live, no tocar)

### 1. Chat — `POST https://yoor32.app.n8n.cloud/webhook/chat`
CORS: muebleriamisantla.com, www, yoor32.github.io.

Request: `{ "message": string, "session_id": string }`
Response: `{ "reply": string, "products": Product[] | undefined }`

```ts
type Product = {
  nombre: string;
  precio: number | null;      // null en pre-diseños AI
  link: string;
  imagen: string;
  disponibilidad: string;     // "En existencia" | "Sobre pedido" | "Pre-diseño AI"
}
```

**Nuevo en v4:** cuando el cliente pide ver un diseño, `products` trae UNA card con `disponibilidad: "Pre-diseño AI"` y `precio: null` — la imagen generada. Render distinto: badge "Pre-diseño AI", sin precio, botones *"Cotizar este diseño"* (envía mensaje "Quiero pre-cotizar este diseño") y *"Otra versión"* (envía "Genera otra versión del diseño"). Máx 3 por sesión (el backend lo limita y Elena lo explica).

El backend también pre-cotiza (puertas de tambor / cocinas / closets): Elena responde el rango en texto. No requiere UI nueva obligatoria — el stepper (abajo) es mejora progresiva.

### 2. Upload de fotos — `POST https://yoor32.app.n8n.cloud/webhook/upload-media`
Request JSON:
```json
{ "tipo": "reclamo" | "espacio", "mime": "image/jpeg|image/png|image/webp",
  "data_base64": "<base64 SIN prefijo data:>", "session_id": "<mismo del chat>" }
```
Response 200: `{ ok: true, file_id, url, file_name, mensaje }` · Response 400: `{ ok: false, error }`
Límites: jpg/png/webp, máx 5 MB. Las fotos van a Drive PRIVADO (no mostrar url al cliente; es para el asesor).

**Flujo UI tras subir:** comprimir/redimensionar client-side a ≤1600px antes de mandar; al recibir `ok:true`, enviar al chat el mensaje: `"[FOTO ADJUNTA: {file_name}] {url}"` + el texto del usuario — así queda en transcript/ticket y Elena reacciona.

## Features P3 (orden de implementación)

1. **Card "Pre-diseño AI"** (ver arriba) — rápida, desbloquea valor de P2 ya en producción.
2. **Botón cámara/clip en el input** — `<input type="file" accept="image/*" capture="environment">`, compresión, POST a /upload-media, estados subiendo/error/éxito, luego mensaje al chat.
3. **Stepper de pre-cotización** (mejora progresiva): si Elena menciona "puerta de tambor", "cocina" o "closet" + cotizar, ofrecer chips guiados: tipo → medidas (input numérico m lineales o nº puertas) → madera (Cedro/Caoba — mismo precio) → acabado → "Calcular". Al final compone UN mensaje natural: "Quiero pre-cotizar una cocina de 4 metros lineales en cedro acabado poliuretano" (el backend hace el resto). NO llamar APIs directas: todo vía /chat.
4. **Proactividad contextual**: leer `window.location` del parent (Duda pasa la URL o usar document.referrer); si contiene /tienda/categoría, saludo adaptado.
5. **Persistencia**: ya hay session en sessionStorage; añadir restore de scroll y del estado del stepper al minimizar/reabrir.
6. **Carrusel horizontal** de cards + botón "Agendar cita para verlo" (envía mensaje "Quiero agendar cita para ver {nombre}").

## Pendiente backend (no bloquea, lo hace Cowork)
- "Ver dimensiones" en cards: requiere que el sync Ecwid→Notion traiga dimensiones (hoy no las trae). Cuando esté, `Product` ganará `dimensiones?: string`.

## Convenciones del repo
- Estilos con prefijo `.lw-*` (legacy del widget). Componentes: `ChatPanel.tsx`, `ProductCards`, `CallOverlay`.
- Build: `npm run build` → deploy automático: push a `main` dispara `.github/workflows/deploy.yml` → GitHub Pages.
- Probar contra el webhook real (CORS ya permite yoor32.github.io y localhost NO — para dev local usar el dominio de Pages o agregar origin después).
- NO tocar la lógica de voz (CallOverlay) en P3.

## QA mínimo por feature
Carga del widget en Duda, envío de mensaje, render de cards normales, card de pre-diseño, subida de foto jpg/png (y rechazo de PDF), regresión de llamada de voz.
