export type QuickAction = {
  id: string;
  label: string;
  sub?: string;
  emoji: string;
  kind: "form" | "link" | "chat" | "tab" | "call";
  payload?: string; // form action, url, chat preset, or tab name
};

export const CONFIG = {
  agentId: "agent_4101ktatk4azetysvfp55qxs05f4",
  endpoints: {
    chat: "https://yoor32.app.n8n.cloud/webhook/chat",
    help: "https://yoor32.app.n8n.cloud/webhook/elena-help",
    form: "https://yoor32.app.n8n.cloud/webhook/elena-form"
  },
  brand: {
    name: "Mueblería Misantla",
    assistant: "Elena",
    tagline: "Carpintería fina en cedro y caoba",
    primary: "#7a4a21",
    accent: "#b07c4f",
    side: "left" as "left" | "right"
  },
  social: [
    { id: "whatsapp", label: "WhatsApp", url: "https://wa.me/2211845926" },
    { id: "instagram", label: "Instagram", url: "https://instagram.com/mueblerias_misantla" },
    { id: "facebook", label: "Facebook", url: "https://facebook.com/fabrica.misantla" },
    { id: "pinterest", label: "Pinterest", url: "https://pinterest.com/MuebleriaMisantla" }
  ],
  links: {
    catalogo: "https://www.muebleriamisantla.com/tienda",
    medida: "https://www.muebleriamisantla.com/Muebles-a-medida",
    envios: "https://www.muebleriamisantla.com/seguimiento-de-envio",
    garantias: "https://www.muebleriamisantla.com/Garantias"
  },
  quickActions: [
    { id: "catalogo", label: "Ver catálogo", sub: "Muebles en cedro listos para envío", emoji: "🪑", kind: "link", payload: "https://www.muebleriamisantla.com/tienda" },
    { id: "cotizar", label: "Cotizar a medida", sub: "Cocina, closet, puerta o mueble único", emoji: "📐", kind: "form", payload: "cotizacion" },
    { id: "rastrear", label: "Rastrear pedido", sub: "Estado de tu compra", emoji: "📦", kind: "form", payload: "rastrear" },
    { id: "asesoria", label: "Agendar asesoría", sub: "Showroom, videollamada o domicilio", emoji: "🗓️", kind: "form", payload: "asesoria" },
    { id: "envios", label: "Envíos y garantías", sub: "Tiempos, cobertura y respaldo", emoji: "🚚", kind: "chat", payload: "¿Cómo funcionan los envíos y las garantías?" }
  ] as QuickAction[],
  news: [
    {
      tag: "Catálogo",
      title: "Nuevas recámaras en cedro",
      body: "Bases, cabeceras y tocadores tallados a mano. Envíos a todo México.",
      url: "https://www.muebleriamisantla.com/tienda/Dormitorios-Recamaras-c62478393"
    },
    {
      tag: "A medida",
      title: "Cocinas y closets sobre diseño",
      body: "Diseñamos tu cocina o vestidor en maderas finas, con previsualización 3D.",
      url: "https://www.muebleriamisantla.com/gabinetes--cocinas-personalizadas"
    },
    {
      tag: "B2B",
      title: "Carpintería comercial",
      body: "Arquitectos, hoteles e inmobiliarias: precios y tiempos preferentes (8+ piezas).",
      url: "https://www.muebleriamisantla.com/Carpinteria-comercial-b2b"
    }
  ]
};
