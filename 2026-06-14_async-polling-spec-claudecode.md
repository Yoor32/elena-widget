# Chat async (respond-immediately + polling) — Spec para Claude Code
**Fecha:** 2026-06-14 · **Estado:** backend publicado y probado (8/8 bajo carga, 0 vacíos)
**Base n8n:** `https://yoor32.app.n8n.cloud`

Objetivo: que el widget no se cuelgue ni reciba respuestas vacías bajo concurrencia. El chat pasa de "POST y esperar" a "POST → `job_id` → polling". CORS ya permite el sitio y `yoor32.github.io`.

## Contrato

### 1) Enviar mensaje (accept)
`POST /webhook/chat-async`
```json
{ "message": "texto del usuario", "session_id": "<id de sesión persistente>" }
```
Respuesta (~4–7s, nunca vacía):
```json
{ "ok": true, "job_id": "job-xxxxx", "status": "processing" }
```

### 2) Sondear resultado (poll)
`POST /webhook/chat-result`
```json
{ "job_id": "job-xxxxx" }
```
Mientras procesa:
```json
{ "ok": true, "status": "processing" }
```
Cuando está listo:
```json
{ "ok": true, "status": "done", "reply": "…texto de Elena…", "products": [], "ticket_id": "" }
```

## Lógica del widget
1. Al enviar: POST a `/chat-async`, guarda `job_id`, muestra indicador de "escribiendo…".
2. Polling: cada **1.5–2 s** POST a `/chat-result` con el `job_id`, hasta `status === "done"`.
3. Al `done`: pinta `reply` (y `products` si vienen) y detén el polling.
4. Timeout de cortesía: si tras ~60 s sigue `processing`, muestra "estamos procesando, intenta de nuevo" y detén.
5. Mantén el mismo `session_id` durante toda la conversación (igual que hoy).

## Notas
- El endpoint **síncrono `/webhook/chat` sigue vivo y arreglado** — sirve como fallback. Puedes migrar a async sin prisa.
- `products` ya viene como array; `ticket_id` puede venir vacío (no es necesario mostrarlo al cliente).
- Bajo carga alta, `reply` puede ser una confirmación genérica si el worker quedó en cola larga — es el comportamiento elegante esperado (el ticket igual se crea).
- No cambia nada del flujo de voz ni del smart form.

## Por qué
n8n Cloud (plan Starter) permite ~5 ejecuciones concurrentes y el webhook síncrono retenía el slot toda la ejecución (Gemini 10–20 s). Con async, el `accept` suelta el slot en ~4 s y el trabajo pesado corre en segundo plano; el cliente sondea y nunca recibe vacío/timeout. Probado: 8 requests concurrentes → 8 `job_id`, 0 vacíos.
