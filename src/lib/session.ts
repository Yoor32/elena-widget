const KEY = "elena_session_id";

export function getSessionId(): string {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = "web-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    localStorage.setItem(KEY, id);
  }
  return id;
}

export type Product = {
  nombre: string;
  precio: number | null;
  link: string;
  imagen: string;
  disponibilidad: string;
};

export type ChatMsg = { role: "user" | "bot"; text: string; products?: Product[] };

const HIST = "elena_history";

export function loadHistory(): ChatMsg[] {
  try { return JSON.parse(sessionStorage.getItem(HIST) || "[]"); } catch { return []; }
}

export function saveHistory(msgs: ChatMsg[]) {
  sessionStorage.setItem(HIST, JSON.stringify(msgs.slice(-30)));
}

export function chatSummary(msgs: ChatMsg[]): string {
  return msgs.slice(-6).map(m => (m.role === "user" ? "Cliente: " : "Elena: ") + m.text).join("\n").slice(0, 800);
}

export function rememberName(name: string) {
  if (name && name.trim()) localStorage.setItem("elena_nombre", name.trim());
}

// --- Persistencia de UI al minimizar/reabrir (el panel se desmonta al cerrar) ---

const STEPPER = "elena_stepper";

export function loadStepperUI<T>(): { open: boolean; state: T } | null {
  try {
    const v = sessionStorage.getItem(STEPPER);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}

export function saveStepperUI<T>(open: boolean, state: T) {
  try { sessionStorage.setItem(STEPPER, JSON.stringify({ open, state })); } catch { /* noop */ }
}

const SCROLL = "elena_scroll";

export function loadScroll(): number | null {
  const v = sessionStorage.getItem(SCROLL);
  return v == null ? null : Number(v);
}

export function saveScroll(top: number) {
  try { sessionStorage.setItem(SCROLL, String(top)); } catch { /* noop */ }
}
