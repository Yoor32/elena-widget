import { CONFIG } from "../config";
import { getSessionId, Product } from "./session";

export type Faq = { pregunta: string; respuesta: string };

export async function getHelp(): Promise<Faq[]> {
  const r = await fetch(CONFIG.endpoints.help, { headers: { "Accept": "application/json" } });
  const data = await r.json();
  return Array.isArray(data.faqs) ? data.faqs : [];
}

// ---- Chat asíncrono: accept (/chat-async → job_id) + polling (/chat-result) ----

export type ChatReply = { reply: string; products: Product[]; ticket_id: string };

// Error con marca para distinguir el timeout de cortesía de un fallo de red.
export class ChatTimeoutError extends Error {
  constructor() { super("chat-timeout"); this.name = "ChatTimeoutError"; }
}

const POLL_INTERVAL_MS = 1800; // 1.5–2 s
const POLL_DEADLINE_MS = 60000; // ~60 s de cortesía

const delay = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

function normalizeReply(data: any): ChatReply {
  return {
    reply: data?.reply || "Disculpe, ¿me lo repite?",
    products: Array.isArray(data?.products) ? data.products : [],
    ticket_id: data?.ticket_id || ""
  };
}

// Endpoint síncrono original — fallback si el accept asíncrono no responde.
async function postChatSync(message: string): Promise<ChatReply> {
  const r = await fetch(CONFIG.endpoints.chat, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: getSessionId(), message })
  });
  return normalizeReply(await r.json());
}

// Envía el mensaje al chat asíncrono y sondea el resultado hasta `done`.
// - Si el accept falla, cae al endpoint síncrono (sigue vivo y arreglado).
// - Si tras ~60 s sigue `processing`, lanza ChatTimeoutError.
export async function postChat(message: string): Promise<ChatReply> {
  let jobId = "";
  try {
    const acc = await fetch(CONFIG.endpoints.chatAsync, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: getSessionId(), message })
    });
    const accData = await acc.json().catch(() => null);
    if (accData?.ok && accData?.job_id) jobId = accData.job_id;
    else return await postChatSync(message); // respuesta inesperada → fallback
  } catch {
    return await postChatSync(message); // accept caído → fallback
  }

  const deadline = Date.now() + POLL_DEADLINE_MS;
  while (Date.now() < deadline) {
    await delay(POLL_INTERVAL_MS);
    try {
      const res = await fetch(CONFIG.endpoints.chatResult, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId })
      });
      const data = await res.json().catch(() => null);
      if (data?.status === "done") return normalizeReply(data);
      // status "processing" (o respuesta transitoria) → seguir sondeando
    } catch {
      // error de red transitorio durante el polling → reintentar hasta el deadline
    }
  }
  throw new ChatTimeoutError();
}
