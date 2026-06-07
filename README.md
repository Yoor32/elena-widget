# Elena · Widget de Mueblería Misantla

Widget de chat + voz para muebleriamisantla.com/ayuda.
Chat de texto: webhook n8n existente (Gemini). Voz: ElevenLabs Agents (agente Elena) vía @elevenlabs/react con WebRTC, activada con el botón "Hablar con un asesor".

## Desarrollo

```bash
npm install
npm run dev
```

## Build y deploy

`npm run build` genera `dist/elena-widget.js` + css. El workflow de GitHub Actions publica a GitHub Pages en cada push a main.

## Embed en Duda (custom widget)

```html
<div id="elena-widget-root"></div>
<link rel="stylesheet" href="https://TU-CDN/elena-widget.css">
<script type="module" src="https://TU-CDN/elena-widget.js"></script>
```

## Configuración

`src/config.ts`: agentId de ElevenLabs, URL del webhook de chat, marca y quick replies.

## Pendientes (V1)

- Cards de producto (buscar_producto devuelve imagen/precio/link).
- Pasar resumen_chat real como dynamic variable (ya implementado básico).
- Mensaje "llamada finalizada + resumen" vía post-call webhook.
- A/B de voces es-MX y cambio de modelo TTS a Flash v2.5 (requerido para language=es).
