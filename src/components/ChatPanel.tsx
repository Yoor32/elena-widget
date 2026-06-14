import { useEffect, useRef, useState } from "react";
import { CONFIG } from "../config";
import { ChatMsg, Product, getSessionId, loadHistory, saveHistory, loadStepperUI, saveStepperUI, loadScroll, saveScroll } from "../lib/session";
import { base64Bytes, compressImage, inferTipo, isAllowedImage, MAX_UPLOAD_BYTES, uploadMedia } from "../lib/upload";
import { PrecotState, PrecotTipo, PRECOT_EMPTY, detectPrecot } from "../lib/precot";
import { PrecotStepper } from "./PrecotStepper";
import { contextualGreeting } from "../lib/context";

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
              <div className="lw-card-actions">
                {p.link && (
                  <a className="lw-card-btn" href={p.link} target="_blank" rel="noopener noreferrer">
                    Ver producto
                  </a>
                )}
                <button
                  className="lw-card-btn lw-card-btn-ghost"
                  onClick={() => onSend(`Quiero agendar cita para ver ${p.nombre}`)}
                >
                  Agendar cita para verlo
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export function ChatPanel({ initialMessage, initialStepper }: {
  initialMessage?: string | null;
  initialStepper?: PrecotTipo | null;
} = {}) {
  const [msgs, setMsgs] = useState<ChatMsg[]>(loadHistory());
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Restaura el stepper guardado al minimizar/reabrir (se lee una sola vez al montar).
  const [bootStepper] = useState(() => loadStepperUI<PrecotState>());
  const [stepperOpen, setStepperOpen] = useState(bootStepper?.open ?? false);
  const [stepper, setStepper] = useState<PrecotState>(bootStepper?.state ?? PRECOT_EMPTY);
  const endRef = useRef<HTMLDivElement>(null);
  const msgsRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const prevLen = useRef(loadHistory().length);
  // Saludo adaptado a la categoría de la página del sitio (se calcula una vez).
  const [greeting] = useState(
    () => contextualGreeting(CONFIG.brand.assistant) ||
      `¡Hola! Soy ${CONFIG.brand.assistant}, de ${CONFIG.brand.name}. ¿En qué le puedo ayudar?`
  );

  // Último mensaje de Elena: detecta si conviene ofrecer el stepper guiado.
  const lastBot = [...msgs].reverse().find(m => m.role === "bot");
  const precotTipo = lastBot ? detectPrecot(lastBot.text) : null;

  function openStepper() {
    setStepper(precotTipo ? { ...PRECOT_EMPTY, tipo: precotTipo } : PRECOT_EMPTY);
    setStepperOpen(true);
  }

  function submitStepper(message: string) {
    setStepperOpen(false);
    setStepper(PRECOT_EMPTY);
    send(message);
  }

  // Persiste historial; baja al final SOLO cuando llega un mensaje nuevo (no al restaurar).
  useEffect(() => {
    saveHistory(msgs);
    if (msgs.length > prevLen.current) endRef.current?.scrollIntoView({ behavior: "smooth" });
    prevLen.current = msgs.length;
  }, [msgs]);

  // Al montar (abrir/reabrir): restaura el scroll guardado o baja al final.
  useEffect(() => {
    const el = msgsRef.current;
    const saved = loadScroll();
    if (el && saved != null) el.scrollTop = saved;
    else endRef.current?.scrollIntoView();
  }, []);

  // Persiste el estado del stepper al cambiar.
  useEffect(() => { saveStepperUI(stepperOpen, stepper); }, [stepperOpen, stepper]);

  // Mensaje enrutado desde Inicio/Ayuda/Cotizador → se envía una vez por valor.
  const sentInitial = useRef<string | null>(null);
  useEffect(() => {
    if (initialMessage && sentInitial.current !== initialMessage) {
      sentInitial.current = initialMessage;
      send(initialMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage]);

  // Apertura directa del pre-cotizador (p. ej. "Cotizar a medida" → Puerta de tambor).
  const openedStepper = useRef<PrecotTipo | null>(null);
  useEffect(() => {
    if (initialStepper && openedStepper.current !== initialStepper) {
      openedStepper.current = initialStepper;
      setStepper({ ...PRECOT_EMPTY, tipo: initialStepper });
      setStepperOpen(true);
    }
  }, [initialStepper]);

  // `payload` permite enviar al backend un mensaje distinto al que ve el cliente
  // (p. ej. fotos: el ticket recibe la URL privada, la burbuja no la muestra).
  async function send(text: string, payload: string = text) {
    if (!payload.trim() || busy) return;
    const next: ChatMsg[] = [...msgs, { role: "user" as const, text }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const r = await fetch(CONFIG.endpoints.chat, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: getSessionId(), message: payload })
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

  async function handleFile(file: File | null | undefined) {
    if (fileRef.current) fileRef.current.value = ""; // permite re-seleccionar el mismo archivo
    if (!file || uploading || busy) return;
    setUploadError(null);
    if (!isAllowedImage(file)) {
      setUploadError("Solo aceptamos imágenes JPG, PNG o WebP.");
      return;
    }
    setUploading(true);
    try {
      const { data_base64, mime } = await compressImage(file);
      if (base64Bytes(data_base64) > MAX_UPLOAD_BYTES) {
        setUploadError("La imagen es muy grande (máx 5 MB). Intente con otra.");
        return;
      }
      const userText = input.trim();
      const res = await uploadMedia({
        tipo: inferTipo(userText),
        mime,
        data_base64,
        session_id: getSessionId()
      });
      if (res.ok) {
        // El payload lleva la URL privada (para el ticket/asesor); la burbuja no la muestra.
        const payload = `[FOTO ADJUNTA: ${res.file_name}] ${res.url}` + (userText ? ` ${userText}` : "");
        const shown = userText ? `📷 Foto enviada — ${userText}` : "📷 Foto enviada";
        await send(shown, payload);
      } else {
        setUploadError(res.error || "No se pudo subir la imagen. Intente de nuevo.");
      }
    } catch {
      setUploadError("No se pudo procesar la imagen. Intente de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="lw-chat">
      <div className="lw-msgs" ref={msgsRef} onScroll={e => saveScroll(e.currentTarget.scrollTop)}>
        {msgs.length === 0 && (
          <div className="lw-msg lw-bot">{greeting}</div>
        )}
        {msgs.map((m, i) => (
          <div key={i}>
            <div className={`lw-msg ${m.role === "user" ? "lw-user" : "lw-bot"}`}>{m.text}</div>
            {m.role === "bot" && m.products && m.products.length > 0 && <ProductCards products={m.products} onSend={send} />}
          </div>
        ))}
        {uploading && <div className="lw-msg lw-user lw-typing">Subiendo foto…</div>}
        {busy && <div className="lw-msg lw-bot lw-typing">Escribiendo…</div>}
        <div ref={endRef} />
      </div>
      {uploadError && <div className="lw-upload-error">{uploadError}</div>}
      {stepperOpen ? (
        <PrecotStepper
          state={stepper}
          setState={setStepper}
          onSubmit={submitStepper}
          onCancel={() => { setStepperOpen(false); setStepper(PRECOT_EMPTY); }}
          disabled={busy}
        />
      ) : (
        precotTipo && (
          <div className="lw-precot-offer">
            <button type="button" onClick={openStepper} disabled={busy}>
              ✨ Armar pre-cotización de {precotTipo}
            </button>
          </div>
        )
      )}
      <div className="lw-quick">
        {CONFIG.quickReplies.map(q => (
          <button key={q} onClick={() => send(q)} disabled={busy}>{q}</button>
        ))}
      </div>
      <form className="lw-input" onSubmit={e => { e.preventDefault(); send(input); }}>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          hidden
          onChange={e => handleFile(e.target.files?.[0])}
        />
        <button
          type="button"
          className="lw-attach-btn"
          title="Adjuntar foto"
          aria-label="Adjuntar foto"
          onClick={() => fileRef.current?.click()}
          disabled={busy || uploading}
        >
          📎
        </button>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escriba su mensaje…"
          disabled={busy}
        />
        <button type="submit" disabled={busy || uploading || !input.trim()}>Enviar</button>
      </form>
    </div>
  );
}
