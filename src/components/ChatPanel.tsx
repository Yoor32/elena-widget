import { useEffect, useRef, useState } from "react";
import { CONFIG } from "../config";
import { ChatMsg, Product, getSessionId, loadHistory, saveHistory } from "../lib/session";

function formatPrice(p: number | null): string {
  if (p == null) return "Cotizable";
  try {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(p);
  } catch {
    return "$" + p;
  }
}

function isPreDiseno(p: Product): boolean {
  return p.disponibilidad === "Pre-diseño AI" || (p.precio == null && /pre-?dise/i.test(p.disponibilidad || ""));
}

function PreDisenoCard({ p, onSend }: { p: Product; onSend: (text: string) => void }) {
  return (
    <div className="lw-card lw-card-ai">
      {p.imagen ? (
        <div className="lw-card-ai-img" style={{ backgroundImage: `url("${p.imagen}")` }} />
      ) : (
        <div className="lw-card-ai-img lw-card-noimg">Pre-diseño AI</div>
      )}
      <div className="lw-card-body">
        <span className="lw-card-badge-ai">✨ Pre-diseño AI</span>
        <div className="lw-card-name">{p.nombre}</div>
        <div className="lw-card-ai-actions">
          <button className="lw-card-btn" onClick={() => onSend("Quiero pre-cotizar este diseño")}>
            Cotizar este diseño
          </button>
          <button className="lw-card-btn lw-card-btn-ghost" onClick={() => onSend("Genera otra versión del diseño")}>
            Otra versión
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductCards({ products, onSend }: { products: Product[]; onSend: (text: string) => void }) {
  const list = products.filter(p => p && p.nombre);
  if (list.length === 0) return null;
  return (
    <div className="lw-cards">
      {list.map((p, i) =>
        isPreDiseno(p) ? (
          <PreDisenoCard key={i} p={p} onSend={onSend} />
        ) : (
          <div className="lw-card" key={i}>
            {p.imagen ? (
              <div className="lw-card-img" style={{ backgroundImage: `url("${p.imagen}")` }} />
            ) : (
              <div className="lw-card-img lw-card-noimg">Mueblería Misantla</div>
            )}
            <div className="lw-card-body">
              <div className="lw-card-name">{p.nombre}</div>
              <div className="lw-card-meta">
                <span className="lw-card-price">{formatPrice(p.precio)}</span>
                {p.disponibilidad && <span className="lw-card-stock">{p.disponibilidad}</span>}
              </div>
              {p.link && (
                <a className="lw-card-btn" href={p.link} target="_blank" rel="noopener noreferrer">
                  Ver producto
                </a>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}

export function ChatPanel() {
  const [msgs, setMsgs] = useState<ChatMsg[]>(loadHistory());
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); saveHistory(msgs); }, [msgs]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const next: ChatMsg[] = [...msgs, { role: "user" as const, text }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const r = await fetch(CONFIG.chatWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: getSessionId(), message: text })
      });
      const data = await r.json();
      const products: Product[] = Array.isArray(data.products) ? data.products : [];
      setMsgs(m => [...m, { role: "bot", text: data.reply || "Disculpe, ¿me lo repite?", products }]);
    } catch {
      setMsgs(m => [...m, { role: "bot", text: "Tuvimos un problema de conexión. ¿Lo intentamos de nuevo?" }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="lw-chat">
      <div className="lw-msgs">
        {msgs.length === 0 && (
          <div className="lw-msg lw-bot">
            ¡Hola! Soy {CONFIG.brand.assistant}, de {CONFIG.brand.name}. ¿En qué le puedo ayudar?
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i}>
            <div className={`lw-msg ${m.role === "user" ? "lw-user" : "lw-bot"}`}>{m.text}</div>
            {m.role === "bot" && m.products && m.products.length > 0 && <ProductCards products={m.products} onSend={send} />}
          </div>
        ))}
        {busy && <div className="lw-msg lw-bot lw-typing">Escribiendo…</div>}
        <div ref={endRef} />
      </div>
      <div className="lw-quick">
        {CONFIG.quickReplies.map(q => (
          <button key={q} onClick={() => send(q)} disabled={busy}>{q}</button>
        ))}
      </div>
      <form className="lw-input" onSubmit={e => { e.preventDefault(); send(input); }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escriba su mensaje…"
          disabled={busy}
        />
        <button type="submit" disabled={busy || !input.trim()}>Enviar</button>
      </form>
    </div>
  );
}
