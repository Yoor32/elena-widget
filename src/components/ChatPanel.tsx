import { useEffect, useRef, useState } from "react";
import { CONFIG, QuickAction } from "../config";
import { ChatMsg, Product, loadHistory, saveHistory } from "../lib/session";
import { postChat } from "../lib/api";

function formatPrice(p: number | null): string {
  if (p == null) return "Cotizable";
  try { return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(p); }
  catch { return "$" + p; }
}

function ProductCards({ products }: { products: Product[] }) {
  const list = products.filter(p => p && p.nombre);
  if (!list.length) return null;
  return (
    <div className="lw-cards">
      {list.map((p, i) => (
        <div className="lw-card" key={i}>
          {p.imagen
            ? <div className="lw-card-img" style={{ backgroundImage: `url("${p.imagen}")` }} />
            : <div className="lw-card-img lw-card-noimg">Misantla</div>}
          <div className="lw-card-body">
            <div className="lw-card-name">{p.nombre}</div>
            <div className="lw-card-meta">
              <span className="lw-card-price">{formatPrice(p.precio)}</span>
              {p.disponibilidad && <span className="lw-card-stock">{p.disponibilidad}</span>}
            </div>
            {p.link && <a className="lw-card-btn" href={p.link} target="_blank" rel="noopener noreferrer">Ver producto</a>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatPanel({ initialMessage, onAction }: { initialMessage?: string | null; onAction: (a: QuickAction) => void }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>(loadHistory());
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); saveHistory(msgs); }, [msgs]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    setMsgs(m => [...m, { role: "user", text }]);
    setInput("");
    setBusy(true);
    try {
      const data = await postChat(text);
      setMsgs(m => [...m, { role: "bot", text: data.reply, products: data.products }]);
    } catch {
      setMsgs(m => [...m, { role: "bot", text: "Tuvimos un problema de conexión. ¿Lo intentamos de nuevo?" }]);
    } finally { setBusy(false); }
  }

  useEffect(() => {
    if (initialMessage && !sentInitial.current) { sentInitial.current = true; send(initialMessage); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage]);

  const chips = CONFIG.quickActions;

  return (
    <div className="lw-chat">
      <div className="lw-msgs">
        {msgs.length === 0 && (
          <div className="lw-msg lw-bot">
            ¡Hola! Soy {CONFIG.brand.assistant}, asesora de {CONFIG.brand.name}. ¿En qué le puedo ayudar?
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i}>
            <div className={`lw-msg ${m.role === "user" ? "lw-user" : "lw-bot"}`}>{m.text}</div>
            {m.role === "bot" && m.products && m.products.length > 0 && <ProductCards products={m.products} />}
          </div>
        ))}
        {busy && <div className="lw-msg lw-bot lw-typing">Escribiendo…</div>}
        <div ref={endRef} />
      </div>

      <div className="lw-quick">
        {chips.map(a => (
          <button key={a.id} onClick={() => onAction(a)} disabled={busy}>{a.emoji} {a.label}</button>
        ))}
      </div>

      <form className="lw-input" onSubmit={e => { e.preventDefault(); send(input); }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Escriba su mensaje…" disabled={busy} />
        <button type="submit" disabled={busy || !input.trim()}>Enviar</button>
      </form>
    </div>
  );
}
