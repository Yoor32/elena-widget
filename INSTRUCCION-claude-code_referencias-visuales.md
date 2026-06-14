# Instrucción para Claude Code — Selectores visuales (estilo / acabado / madera)

Contexto: trabajas SOLO en el widget (repo local `elena-widget`, ya reconciliado = Elena v4 + shell de 4 pestañas, deploy a GitHub Pages). NO toques n8n, ElevenLabs ni la lógica de voz. El backend ya está publicado y captura estos campos; tu trabajo es la UI.

Objetivo: agregar referencias visuales precargadas (miniaturas) para que el cliente elija **estilo, acabado y tono de madera** en los formularios que recopila Elena, mejorando la personalización. Mantén intacto lo existente (pre-cotizador de tambor, mini-form de closet, picker de Gama 1/2, quick actions, launcher con saludo).

Regla dura: solo cedro/caoba + 2 gamas. NO hay colores pintados (el "color" es tono de madera + barniz). No muestres otras maderas, MDF, metal ni estilo industrial en ningún copy/placeholder.

## 1. Assets (9 imágenes, PNG 1408×768, URLs estables)
Cópialas al repo en `/public/refs/<id>.png` (nombres limpios) o referencia las URLs raw directo.

Estilo:
- contemporaneo → https://raw.githubusercontent.com/Yoor32/elena-media/main/predisenos/ASSET-estilo-contemporaneo-mqe19x3x-1781456625187.png
- clasico → https://raw.githubusercontent.com/Yoor32/elena-media/main/predisenos/ASSET-estilo-clasico-mqe19x3y-1781456625034.png
- minimalista → https://raw.githubusercontent.com/Yoor32/elena-media/main/predisenos/ASSET3-minimalista-mqe1cqa7-1781456754580.png
- artesanal_tallado → https://raw.githubusercontent.com/Yoor32/elena-media/main/predisenos/ASSET3-artesanal-mqe1d92v-1781456779028.png

Acabado:
- poliuretano → https://raw.githubusercontent.com/Yoor32/elena-media/main/predisenos/ASSETF-poliuretano-mqe26y34-1781458165760.png
- aceite_linaza → https://raw.githubusercontent.com/Yoor32/elena-media/main/predisenos/ASSETF-aceite-mqe27hoi-1781458188834.png
- cera → https://raw.githubusercontent.com/Yoor32/elena-media/main/predisenos/ASSETF-cera-mqe281u0-1781458215172.png

Tono de madera:
- cedro → https://raw.githubusercontent.com/Yoor32/elena-media/main/predisenos/ASSETF-cedro-mqe28kes-1781458240141.png
- caoba → https://raw.githubusercontent.com/Yoor32/elena-media/main/predisenos/ASSETF-caoba-mqe2952g-1781458267390.png

## 2. Data model (valores que mandas al backend)
- estilo: contemporaneo | clasico | minimalista | artesanal_tallado
- acabado: poliuretano | aceite_linaza | cera
- madera: cedro | caoba
- gama: 1 | 2  (ya implementado, no lo cambies)

## 3. Qué construir
1. Componente reusable `RefPicker` (grid de miniaturas seleccionables con label; una sola selección por grupo; estado controlado; accesible con teclado; lazy-load de imágenes).
2. Mini-form de **closet** (ya existe): añade RefPicker de Estilo (4), Acabado (3) y Madera (2), además de medidas + gama que ya tiene.
3. Pre-cotizador de **puerta de tambor** (ya existe): añade RefPicker de Estilo y Acabado (la madera ya es cedro/caoba en ese flujo).

## 4. Cómo enviar al backend
- Closet (conversacional): al enviar, compón un mensaje natural y haz POST a `/webhook/chat` (como ya haces). Incluye los textos elegidos. Ejemplo:
  `"Quiero cotizar un clóset de 3.0 x 2.4 x 0.60 m, Gama 1 (cedro), estilo contemporáneo, acabado cera."`
  Elena ya está instruida para capturarlos en la cotización.
- Si algún form captura también contacto (nombre/teléfono/email/CP), puedes mandar campos estructurados a `/webhook/elena-form`:
  `{ action: "cotizacion", tipo: "closet", gama: "1", estilo: "contemporaneo", acabado: "cera", madera: "caoba", medidas_aproximadas: "...", nombre, telefono, email, ciudad_cp }`
- Tambor: mantén el flujo actual; añade estilo/acabado al payload que ya mandas.

## 5. Criterios de aceptación
- [ ] Las 9 miniaturas cargan y se ven bien (cover, sin deformar) en el mini-form de closet y en el pre-cotizador de tambor.
- [ ] Selección visible (borde/halo) y accesible (teclado + aria-label).
- [ ] Los ids elegidos viajan al backend (verifícalo en el mensaje compuesto o en el payload del form).
- [ ] Nada fuera de cedro/caoba ni colores pintados en ningún copy.
- [ ] No se rompe el pre-cotizador, el picker de gama, los quick actions ni el launcher con saludo.
- [ ] Build verde + push a `main` + deploy de Pages OK.

## 6. Endpoints (ya en config.endpoints, no cambian)
- chat: `https://yoor32.app.n8n.cloud/webhook/chat`
- form: `https://yoor32.app.n8n.cloud/webhook/elena-form`
