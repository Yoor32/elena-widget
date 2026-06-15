# Instrucción para Claude Code — Reducir bundle (~720KB) con code-splitting

Contexto: trabajas SOLO en el widget (`elena-widget`, Vite/React, deploy a GitHub Pages). NO toques backend/n8n/voz-lógica del lado servidor. El bundle inicial pesa ~720KB, dominado por `@elevenlabs/react` (módulo de voz) que se carga aunque el usuario nunca use voz.

Objetivo: que `@elevenlabs/react` (y el componente de voz / CallOverlay) **no esté en el bundle inicial**; que se cargue **bajo demanda** solo cuando el usuario abre la voz. Meta: bajar el chunk inicial significativamente (idealmente <300–400KB) sin perder funcionalidad.

## Qué hacer
1. **Lazy-load del componente de voz.** Envuelve el componente que importa `@elevenlabs/react` (p. ej. `CallOverlay` / `VoiceChat`) con `React.lazy(() => import('./CallOverlay'))` y renderízalo dentro de `<Suspense fallback={…}>` solo cuando el usuario activa la voz (al hacer clic en el botón de llamada, no al montar el widget).
   - Asegúrate de que `@elevenlabs/react` se importe ÚNICAMENTE dentro de ese componente lazy (ni en el árbol raíz, ni en `index`/`App`, ni en utilidades compartidas). Si algún import lo arrastra al chunk principal, muévelo.
2. **Verifica la separación de chunks.** Tras `vite build`, confirma en el output que `@elevenlabs/*` quedó en un chunk aparte (lazy) y NO en el `index-*.js` principal. Si usas `manualChunks` en `vite.config`, puedes forzar un chunk `voice` para `@elevenlabs/react`.
3. **Fallback/loading:** mientras carga el chunk de voz, muestra un spinner/estado "conectando…" en el overlay. Maneja el error de carga (red) con un mensaje suave y opción de reintentar.
4. **No regreses** funcionalidad: el chat de texto, los pickers, el async polling, el launcher y el smart form siguen igual. La voz funciona idéntica una vez cargada.
5. (Opcional) Revisa otros pesos: si `recharts`/`three`/libs grandes no se usan, quítalas; lazy-load de cualquier vista pesada de la pestaña "Novedades"/"Ayuda" si aplica.

## Criterios de aceptación
- [ ] `vite build` muestra `@elevenlabs/*` en un chunk separado, fuera del `index` principal.
- [ ] El chunk inicial baja de ~720KB de forma notable (reporta el antes/después).
- [ ] La voz sigue funcionando (se carga al abrirla, con fallback de loading).
- [ ] Chat de texto, async, pickers, launcher y smart form sin regresiones.
- [ ] Build verde + push a `main` + deploy de Pages OK.

## Nota
Es una mejora de rendimiento (tiempo de carga inicial), no cambia comportamiento. No bloqueante.
