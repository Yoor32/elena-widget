import { useEffect, useMemo, useState } from "react";
import { Faq, getHelp } from "../lib/api";

export function HelpPanel({ onAsk }: { onAsk: (q: string) => void }) {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    getHelp().then(f => { if (alive) { setFaqs(f); setLoading(false); } }).catch(() => setLoading(false));
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return faqs;
    return faqs.filter(f => (f.pregunta + " " + f.respuesta).toLowerCase().includes(t));
  }, [q, faqs]);

  return (
    <div className="lw-help">
      <div className="lw-help-search">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar ayuda…" />
        <span>🔍</span>
      </div>

      {loading && <div className="lw-help-empty">Cargando preguntas frecuentes…</div>}
      {!loading && filtered.length === 0 && (
        <div className="lw-help-empty">
          No encontramos resultados.
          {q.trim() && <button className="lw-help-ask" onClick={() => onAsk(q)}>Preguntar a Elena ›</button>}
        </div>
      )}

      <div className="lw-faq-list">
        {filtered.map((f, i) => (
          <div className={`lw-faq ${open === i ? "open" : ""}`} key={i}>
            <button className="lw-faq-q" onClick={() => setOpen(open === i ? null : i)}>
              <span>{f.pregunta}</span><span className="lw-faq-caret">{open === i ? "–" : "+"}</span>
            </button>
            {open === i && <div className="lw-faq-a">{f.respuesta}</div>}
          </div>
        ))}
      </div>

      {!loading && filtered.length > 0 && (
        <button className="lw-help-ask wide" onClick={() => onAsk(q || "Tengo una duda")}>¿No encuentras algo? Pregúntale a Elena ›</button>
      )}
    </div>
  );
}
