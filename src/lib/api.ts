import { CONFIG } from "../config";
import { getSessionId, Product } from "./session";

export type ChatResponse = { reply: string; products?: Product[]; ticket_id?: string };

export async function postChat(message: string): Promise<ChatResponse> {
  const r = await fetch(CONFIG.endpoints.chat, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: getSessionId(), message })
  });
  const data = await r.json();
  return { reply: data.reply || "Disculpe, ¿me lo repite?", products: Array.isArray(data.products) ? data.products : [], ticket_id: data.ticket_id || "" };
}

export type Faq = { pregunta: string; respuesta: string };

export async function getHelp(): Promise<Faq[]> {
  const r = await fetch(CONFIG.endpoints.help, { headers: { "Accept": "application/json" } });
  const data = await r.json();
  return Array.isArray(data.faqs) ? data.faqs : [];
}

export type FormResult = { ok: boolean; mensaje: string; ticket_id?: string; etapa?: string; no_encontrado?: boolean };

export async function postForm(payload: Record<string, unknown>): Promise<FormResult> {
  const r = await fetch(CONFIG.endpoints.form, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: getSessionId(), ...payload })
  });
  return r.json();
}
