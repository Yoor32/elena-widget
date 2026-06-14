import { CONFIG } from "../config";

export type Faq = { pregunta: string; respuesta: string };

export async function getHelp(): Promise<Faq[]> {
  const r = await fetch(CONFIG.endpoints.help, { headers: { "Accept": "application/json" } });
  const data = await r.json();
  return Array.isArray(data.faqs) ? data.faqs : [];
}
