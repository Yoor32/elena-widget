# Instrucción para Claude Code — Migrar el chat a async (respond-immediately + polling)

Contexto: trabajas SOLO en el widget (repo local `elena-widget`, deploy a GitHub Pages). NO toques n8n, ElevenLabs ni la voz. El backend async ya está publicado y probado (8/8 bajo carga, 0 vacíos). Tu trabajo es cambiar cómo el chat envía/recibe.

Objetivo: que el chat deje de "POST y esperar" y pase a "POST `/chat-async` → recibo `job_id` → hago polling a `/chat-result` hasta que la respuesta esté lista". Esto elimina cuelgues/timeouts bajo concurrencia. CORS ya permite `yoor32.github.io` y el sitio.

## Endpoints (ya en config.endpoints o agrégalos)
- Enviar: `POST https://yoor32.app.n8n.cloud/webhook/chat-async`
- Sondear: `POST https://yoor32.app.n8n.cloud/webhook/chat-result`
- Fallback síncrono (sigue vivo): `POST https://yoor32.app.n8n.cloud/webhook/chat`

## Contrato
1. Enviar mensaje:
   `POST /chat-async`  body `{ "message": "<texto>", "session_id": "<id persistente>" }`
   → `{ "ok": true, "job_id": "job-xxxxx", "status": "processing" }`  (~4–7 s, nunca vacío)
2. Sondear:
   `POST /chat-result`  body `{ "job_id": "job-xxxxx" }`
   → procesando: `{ "ok": true, "status": "processing" }`
   → listo: `{ "ok": true, "status": "done", "reply": "…", "products": [], "ticket_id": "" }`

## Qué implementar
1. En el handler de envío del chat:
   - POST a `/chat-async`; guarda `job_id`; muestra indicador "escribiendo…".
   - Inicia polling: cada **1500–2000 ms** POST a `/chat-result` con el `job_id`, hasta `status === "done"`.
   - Al `done`: renderiza `reply` (y `products` si vienen, con el mismo render de cards que ya usas); detén el polling y oculta el indicador.
   - Timeout de cortesía: si tras ~60 s sigue `processing`, muestra un mensaje tipo "Seguimos procesando, intenta de nuevo en un momento" y detén el polling.
2. Mantén el mismo `session_id` durante toda la conversación (como hoy).
3. Maneja errores de red del polling con reintento suave (no detengas el polling por un fallo aislado; aborta solo tras el timeout de cortesía).
4. Implementa un flag/config `useAsync` para poder caer al endpoint síncrono `/chat` si lo necesitas (fallback). Recomendado: async por defecto.

## Criterios de aceptación
- [ ] Enviar un mensaje devuelve respuesta visible vía polling (probar saludo simple y una cotización con datos).
- [ ] Indicador "escribiendo…" visible mientras se sondea; desaparece al `done`.
- [ ] `products` se renderizan igual que en el flujo actual cuando vienen.
- [ ] Bajo varios mensajes seguidos no se cuelga ni queda en blanco.
- [ ] Fallback síncrono disponible por config.
- [ ] Build verde + push a `main` + deploy de Pages OK.

## Notas
- `ticket_id` puede venir vacío; no es necesario mostrarlo al cliente.
- Bajo carga alta, `reply` puede ser una confirmación genérica (el ticket igual se crea) — es el comportamiento esperado.
- No cambies la voz ni el smart form ni los pickers de referencias visuales; esto es solo el transporte del chat de texto.
