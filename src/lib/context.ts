// Proactividad contextual: deduce la página del sitio donde está embebido el widget
// y adapta el saludo. El iframe vive en Duda, así que la URL del parent puede venir
// por query param, por document.referrer o (si el origin lo permite) por window.parent.

export function parentUrl(): string {
  // 1) Query param que Duda puede inyectar al embeber el widget
  try {
    const q = new URLSearchParams(window.location.search);
    const fromQuery = q.get("ref") || q.get("parent") || q.get("page") || q.get("url");
    if (fromQuery) return decodeURIComponent(fromQuery);
  } catch {
    /* noop */
  }
  // 2) Página que embebe el iframe
  if (document.referrer) return document.referrer;
  // 3) Acceso directo al parent (puede fallar por cross-origin)
  try {
    if (window.parent && window.parent !== window) return window.parent.location.href;
  } catch {
    /* cross-origin: ignorar */
  }
  return window.location.href;
}

type Rule = { re: RegExp; greet: (assistant: string) => string };

// Reglas por categoría (orden = prioridad). El texto se aplica a la URL del parent.
const RULES: Rule[] = [
  { re: /cocina/i, greet: a => `¡Hola! Soy ${a} 👋 Veo que le interesan las cocinas integrales. ¿Le armo una pre-cotización a su medida o le muestro diseños?` },
  { re: /cl[oó]set|vestidor/i, greet: a => `¡Hola! Soy ${a} 👋 ¿Busca un clóset a medida? Le puedo pre-cotizar según sus metros lineales o mostrarle opciones.` },
  { re: /puerta/i, greet: a => `¡Hola! Soy ${a} 👋 ¿Le interesan las puertas de tambor? Dígame cuántas y en qué madera y le doy un estimado.` },
  { re: /rec[aá]mara|cama|colch/i, greet: a => `¡Hola! Soy ${a} 👋 ¿Renovando la recámara? Le muestro camas y recámaras o le ayudo con una cotización.` },
  { re: /sala|sill[oó]n|sof[aá]/i, greet: a => `¡Hola! Soy ${a} 👋 ¿Buscando sala o sillones? Le muestro modelos disponibles o sobre pedido.` },
  { re: /comedor/i, greet: a => `¡Hola! Soy ${a} 👋 ¿Le interesa un comedor? Le muestro opciones o le cotizo uno a su medida.` },
  { re: /oficina|escritorio/i, greet: a => `¡Hola! Soy ${a} 👋 ¿Amueblando la oficina? Le ayudo con escritorios y muebles a medida.` },
  { re: /tienda|categor|catalog|product/i, greet: a => `¡Hola! Soy ${a} 👋 ¿Le ayudo a encontrar el mueble ideal o a cotizar uno a su medida?` }
];

// Devuelve un saludo adaptado a la categoría de la página, o null si no aplica (usar default).
export function contextualGreeting(assistant: string): string | null {
  const url = parentUrl();
  for (const r of RULES) if (r.re.test(url)) return r.greet(assistant);
  return null;
}
