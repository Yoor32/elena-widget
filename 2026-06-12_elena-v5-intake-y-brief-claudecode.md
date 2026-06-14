# Elena v5 — Captura conversacional de servicios + 2 gamas + unificación del widget

Fecha: 2026-06-12. Source of truth para esta fase. Decisiones del usuario:
- BASE: unificar en limpio = **Elena v4** (pre-cotizador, pre-diseño, fotos, voz) + **shell de 4 pestañas** (Inicio/Mensajes/Ayuda/Novedades + redes + saludo automático). Quitar lo que no se use.
- CAPTURA: **mayormente conversacional** (Elena pregunta paso a paso, chat y voz). Smart form visual SOLO para 1–2 cosas (mezcla interactiva).
- TRABAJO: **Widget → Claude Code** (clon local, git). **Backend (n8n + ElevenLabs + HubSpot) → este chat.**

> ⚠️ El widget en GitHub hoy es el rediseño de 4 pestañas (de este chat). El clon local de Claude Code tiene Elena v4 (desincronizado). Hay que reconciliar en una sola versión antes de seguir. Ver "Brief Claude Code".

---

## 0) REGLA GLOBAL: solo 2 gamas (aplica a chat de texto Y voz)

Elena **solo** ofrece y menciona estas dos:
- **Gama 1 — Premium:** madera de **cedro o caoba 100%**, barniz de poliuretano.
- **Gama 2 — Gama Alta:** **cedro/caoba combinado con triplay enchapado de cedro**.

**Prohibido** mencionar/ofrecer: otras maderas finas, MDF, aglomerados, melamina/laminado, herrería, muebles con metal, **estilo industrial**. Si el cliente lo pide → "Trabajamos exclusivamente carpintería fina en cedro y caoba (Gama 1 o 2); no manejamos metal/industrial ni MDF." Cedro y caoba = mismo precio.

Acabados que sí manejamos: **poliuretano, aceite de linaza, cera** (ya cargado en el pre-cotizador v4).

---

## 1) INTAKE ESENCIAL POR SERVICIO (lo que Elena debe recopilar)

Marca: **(req)** obligatorio para crear el ticket / cotizar · resto = se pregunta si fluye, el asesor afina.

### A. PUERTAS  (2 caminos)
Primero Elena pregunta el tipo:
- **Tambor (interior)** → **SE COTIZA** con el pre-cotizador v4 (ya existe). Recopila: número de puertas (req), diseño [Clásico/Moderno/Especiales], color [Nogal clásico, Cedro natural, Ciprés, Nogal americano, Chocolate, Blanco, personalizado], acabado [poliuretano/aceite/cera], dimensiones alto×ancho (req), cerradura, ¿factura?. Da precio estimado → ofrece confirmar/visita.
- **Entrada principal / personalizada** → **SOLO RECOPILA**, el precio lo da un asesor después. Recopila: número de puertas (req), descripción/diseño deseado (req), dimensiones alto×ancho (req), gama 1/2 (req), características arquitectónicas especiales, ¿visita técnica?, CP, contacto (req: nombre+tel). Crea ticket handoff "Puerta de entrada".

### B. CLOSET  (recopila → cotiza asesor; pre-diseño opcional)
(req) tipo de clóset [vestidor / empotrado / modular], medidas **ancho × alto × profundidad** (req), gama 1/2 (req), contacto (nombre+tel) (req). Opcional: motivación, tipo de puertas [corredizas/abatibles/sin puertas], traslape, riel oculto, elementos [ropa colgada / cajones / especializados], nº de tramos, estilo (NO industrial), color, jaladera, espejos, CP, fecha, ¿premarco?, ¿bosquejo visual? Crea ticket "Cotización closet".

### C. COCINA  (recopila → cotiza asesor; pre-diseño opcional)
(req) tipo de proyecto [nueva / remodelación / parcial / reemplazo], configuración [L / U / lineal / paralela], ¿isla?, **largo lineal de gabinetes bajos (m)** (req), gama 1/2 (req), contacto (nombre+tel) (req), CP. Opcional: uso, presupuesto, urgencia, estilo, usuarios, altura techo, color, acabado, cubierta, fregadero, lavavajillas, electrodomésticos, estufa, campana, vivienda/piso, ¿instalación?, ¿demolición?, fecha. Crea ticket "Cotización cocina".

### D. CARPINTERÍA B2B / MAYOREO  (lead → asesor B2B)
(req) tipo de negocio [Residencial premium, Restaurante, Retail, Oficina, Hotel, Interés social], ubicación del mueble, **cantidad/piezas (8+)** , gama 1/2 (req), contacto + **empresa** (req), CP. Opcional: espacio disponible, descripción, tonos, presupuesto, estilo (NO industrial), etapa. Crea ticket handoff B2B (prioridad alta).

### E. MOBILIARIO RESIDENCIAL A MEDIDA  (lead → asesor)
(req) espacio(s) a intervenir [Dormitorios, Cocinas-Comedores, Recibidor, Sala, Jardín/Balcón, Oficina, Baños], situación [desde cero / cambiar estilo / complementos], gama 1/2 (req), contacto (req), CP. Opcional: espacio disponible, descripción, tonos, presupuesto, etapa. Crea ticket "Cotización a medida".

### F. FACTURACIÓN  (flujo aparte, opcional)
Folio/pedido, RFC, razón social, CP, uso CFDI, régimen fiscal, correo. Elena puede recopilar y crear ticket "Facturación" o redirigir a muebleriamisantla.com/facturacion. (Baja prioridad.)

---

## 2) QUÉ HAGO YO (backend, desde este chat)
1. **wf-chat-master** (Gemini): inyectar la REGLA de 2 gamas + los guiones de captura A–F (Elena pregunta lo esencial, una cosa a la vez, confirma datos, y llama la tool correcta). Leo el prompt actual antes para NO revertir lo del otro chat (strip de markdown, normalización de acabados).
2. **ElevenLabs (agente Elena)**: mismo cambio (2 gamas + guiones) para la voz.
3. **wf-tool-router / wf-elena-form**: tickets HubSpot por servicio con la info capturada (closet, cocina, puerta-entrada, B2B, residencial). Puerta de tambor reutiliza el pre-cotizador v4.
4. Verificación E2E (chat → ticket).

## 3) BRIEF PARA CLAUDE CODE (widget, clon local)
Objetivo: **una sola versión unificada y limpia** = funciones v4 + shell de 4 pestañas.

1. **Reconciliar fuentes** (CRÍTICO, hacer primero):
   - El repo GitHub `Yoor32/elena-widget` (main) hoy tiene el rediseño de 4 pestañas. El clon local tiene v4.
   - Decisión: tomar **v4 como base** y traerle el shell de 4 pestañas. Recomendado: en el clon local, `git fetch && git checkout` los componentes de 4 pestañas que sí queremos (Home.tsx, NewsPanel.tsx, HelpPanel.tsx, Icons.tsx, nav inferior en App.tsx, estilos lw-home/lw-nav/lw-social) y conservar de v4: PrecotStepper.tsx, lib/precot.ts, lib/context.ts, lib/upload.ts, la lógica de pre-diseño y subir fotos en ChatPanel. Eliminar duplicados/obsoletos. Que compile (`npm run build`).
2. **Aplicar 2 gamas en TODO picker visual**: en el pre-cotizador (madera = solo Cedro/Caoba, ya está) y en cualquier smart form, las opciones de material = solo **Gama 1 (cedro/caoba 100%)** y **Gama 2 (cedro/caoba + triplay)**. Quitar MDF/otras maderas/industrial.
3. **Smart forms visuales SOLO para 1–2 servicios** (mezcla): sugerido dejar visual el **pre-cotizador de puerta de tambor** (ya es visual) + **un mini-form de medidas de closet** (ancho/alto/prof). El resto (cocina, B2B, residencial, puerta entrada) = conversacional puro vía el chat (no formulario). Botón "Cotizar a medida" abre un selector: "¿Puerta / Closet / Cocina / Mueble?" y enruta a visual o conversacional según corresponda.
4. **Botón del chatbot (launcher) interactivo + saludo automático**: mostrar una burbuja proactiva tras ~3–5 s ("¡Hola! Soy Elena 👋 ¿Te ayudo con tu mueble?") que al hacer clic abre el chat. Animación sutil (pulse). Recordar no spamear (mostrar 1 vez por sesión con sessionStorage).
5. **Mantener** acciones rápidas (chips) y posición **abajo a la izquierda**.
6. Build + push a main (despliega a Pages). Verificar verde.

> Endpoints backend que el widget consume (no cambian de nombre): `/webhook/chat` (chat), `/webhook/elena-help` (FAQs), `/webhook/elena-form` (smart form). Yo aviso si agrego campos nuevos al form.

---

## 4) Coordinación anti-conflicto
- El **widget** solo lo toca Claude Code (clon local). Yo NO edito el repo por web durante esta fase.
- El **backend** solo lo toco yo. Claude Code no toca n8n/ElevenLabs.
- Antes de cada cambio en wf-chat-master leo el estado vivo para no pisar lo del otro chat.
