import { useState, type ReactNode } from "react";
import { postForm, FormResult } from "../lib/api";
import { rememberName } from "../lib/session";

type Action = "cotizacion" | "rastrear" | "asesoria";
type Data = Record<string, string>;

const TITLES: Record<Action, string> = {
  cotizacion: "Iniciar cotización a medida",
  rastrear: "Rastrear mi pedido",
  asesoria: "Agendar asesoría"
};

function Choice({ value, current, onPick, children }: { value: string; current: string; onPick: (v: string) => void; children: ReactNode }) {
  return (
    <button type="button" className={`lw-choice ${current === value ? "sel" : ""}`} onClick={() => onPick(value)}>{children}</button>
  );
}

export function SmartForm({ action, onClose }: { action: Action; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Data>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<FormResult | null>(null);
  const set = (k: string, v: string) => setData(d => ({ ...d, [k]: v }));

  // step definitions per action
  const steps: ((d: Data) => boolean)[] =
    action === "cotizacion" ? [d => !!d.tipo, d => true, d => !!(d.nombre && d.telefono)]
    : action === "asesoria" ? [d => !!d.tipo, d => !!(d.nombre && d.telefono)]
    : [d => !!d.email_or_phone];

  const last = step === steps.length - 1;
  const canNext = steps[step](data);

  async function submit() {
    setSubmitting(true);
    if (data.nombre) rememberName(data.nombre);
    try {
      const payload: Record<string, unknown> = { action, ...data };
      const r = await postForm(payload);
      setResult(r);
    } catch {
      setResult({ ok: false, mensaje: "Hubo un problema al enviar. Intente de nuevo." });
    } finally { setSubmitting(false); }
  }

  if (result) {
    return (
      <div className="lw-form-overlay">
        <div className="lw-form-head"><strong>{TITLES[action]}</strong><button className="lw-icon-btn" onClick={onClose}>✕</button></div>
        <div className="lw-form-done">
          <div className="lw-form-check">✓</div>
          <p>{result.mensaje}</p>
          <button className="lw-form-submit" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="lw-form-overlay">
      <div className="lw-form-head">
        <strong>{TITLES[action]}</strong>
        <button className="lw-icon-btn" onClick={onClose}>✕</button>
      </div>

      <div className="lw-form-body">
        {action === "cotizacion" && step === 0 && (
          <div className="lw-field">
            <label>¿Qué quieres cotizar?</label>
            <div className="lw-choices">
              <Choice value="cocina" current={data.tipo} onPick={v => set("tipo", v)}>🍽️ Cocina integral</Choice>
              <Choice value="closet" current={data.tipo} onPick={v => set("tipo", v)}>🚪 Closet / vestidor</Choice>
              <Choice value="puerta_recamara" current={data.tipo} onPick={v => set("tipo", v)}>🚪 Puerta</Choice>
              <Choice value="mueble" current={data.tipo} onPick={v => set("tipo", v)}>🪑 Mueble a medida</Choice>
            </div>
          </div>
        )}
        {action === "cotizacion" && step === 1 && (
          <>
            <div className="lw-field">
              <label>Línea / acabado</label>
              <div className="lw-choices">
                <Choice value="intermedio" current={data.nivel_interes} onPick={v => set("nivel_interes", v)}>Cedro (intermedio)</Choice>
                <Choice value="premium" current={data.nivel_interes} onPick={v => set("nivel_interes", v)}>Caoba (premium)</Choice>
                <Choice value="no_sabe" current={data.nivel_interes} onPick={v => set("nivel_interes", v)}>No estoy seguro</Choice>
              </div>
            </div>
            <div className="lw-field">
              <label>Medidas aproximadas (opcional)</label>
              <input value={data.medidas_aproximadas || ""} onChange={e => set("medidas_aproximadas", e.target.value)} placeholder="Ej. 3 x 2 m" />
            </div>
          </>
        )}
        {action === "cotizacion" && step === 2 && (
          <ContactFields data={data} set={set} email />
        )}

        {action === "asesoria" && step === 0 && (
          <>
            <div className="lw-field">
              <label>Tipo de asesoría</label>
              <div className="lw-choices">
                <Choice value="showroom" current={data.tipo} onPick={v => set("tipo", v)}>🏬 En showroom</Choice>
                <Choice value="videollamada" current={data.tipo} onPick={v => set("tipo", v)}>🎥 Videollamada</Choice>
                <Choice value="domicilio" current={data.tipo} onPick={v => set("tipo", v)}>🏠 A domicilio</Choice>
              </div>
            </div>
            <div className="lw-field">
              <label>¿Qué día/hora te conviene? (opcional)</label>
              <input value={data.preferencia || ""} onChange={e => set("preferencia", e.target.value)} placeholder="Ej. martes por la tarde" />
            </div>
          </>
        )}
        {action === "asesoria" && step === 1 && (
          <ContactFields data={data} set={set} />
        )}

        {action === "rastrear" && step === 0 && (
          <div className="lw-field">
            <label>Correo o teléfono de tu pedido</label>
            <input value={data.email_or_phone || ""} onChange={e => set("email_or_phone", e.target.value)} placeholder="correo@ejemplo.com o 22 1184 5926" />
          </div>
        )}
      </div>

      <div className="lw-form-nav">
        {step > 0 && <button className="lw-form-back" onClick={() => setStep(step - 1)} disabled={submitting}>‹ Atrás</button>}
        {!last && <button className="lw-form-submit" onClick={() => setStep(step + 1)} disabled={!canNext}>Continuar ›</button>}
        {last && <button className="lw-form-submit" onClick={submit} disabled={!canNext || submitting}>{submitting ? "Enviando…" : "Enviar"}</button>}
      </div>
    </div>
  );
}

function ContactFields({ data, set, email }: { data: Data; set: (k: string, v: string) => void; email?: boolean }) {
  return (
    <>
      <div className="lw-field"><label>Nombre *</label><input value={data.nombre || ""} onChange={e => set("nombre", e.target.value)} placeholder="Tu nombre" /></div>
      <div className="lw-field"><label>Teléfono / WhatsApp *</label><input value={data.telefono || ""} onChange={e => set("telefono", e.target.value)} placeholder="10 dígitos" /></div>
      {email && <div className="lw-field"><label>Correo (opcional)</label><input value={data.email || ""} onChange={e => set("email", e.target.value)} placeholder="correo@ejemplo.com" /></div>}
      <div className="lw-field"><label>Ciudad o CP (opcional)</label><input value={data.ciudad_cp || ""} onChange={e => set("ciudad_cp", e.target.value)} placeholder="Puebla, 72000" /></div>
    </>
  );
}
