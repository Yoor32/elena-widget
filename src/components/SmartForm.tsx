import { useState, type ReactNode } from "react";
import type { PrecotTipo } from "../lib/precot";

// "Cotizar a medida": selector que enruta a captura VISUAL (pre-cotizador de puerta
// de tambor, mini-form de medidas de closet) o CONVERSACIONAL (cocina, mueble,
// puerta de entrada → Elena pregunta el resto paso a paso en el chat).

type Servicio = "puerta" | "closet" | "cocina" | "mueble";
type Gama = "Gama 1 — Premium (cedro/caoba 100%)" | "Gama 2 — Alta (cedro/caoba + triplay enchapado)";

const GAMAS: Gama[] = [
  "Gama 1 — Premium (cedro/caoba 100%)",
  "Gama 2 — Alta (cedro/caoba + triplay enchapado)"
];

function Choice({ value, current, onPick, children }: { value: string; current?: string; onPick: (v: string) => void; children: ReactNode }) {
  return (
    <button type="button" className={`lw-choice ${current === value ? "sel" : ""}`} onClick={() => onPick(value)}>{children}</button>
  );
}

export function SmartForm({ onClose, onGoChat, onOpenPrecot }: {
  onClose: () => void;
  onGoChat: (message: string) => void;
  onOpenPrecot: (tipo: PrecotTipo) => void;
}) {
  const [servicio, setServicio] = useState<Servicio | null>(null);
  // medidas + gama para el mini-form de closet
  const [ancho, setAncho] = useState("");
  const [alto, setAlto] = useState("");
  const [prof, setProf] = useState("");
  const [gama, setGama] = useState<string>("");

  const closetOk =
    [ancho, alto, prof].every(v => Number.isFinite(Number(v)) && Number(v) > 0) && !!gama;

  function submitCloset() {
    const msg =
      `Quiero cotizar un clóset a medida de ${ancho} m de ancho × ${alto} m de alto × ${prof} m de profundidad. ` +
      `Material: ${gama}.`;
    onGoChat(msg);
  }

  return (
    <div className="lw-form-overlay">
      <div className="lw-form-head">
        <strong>Cotizar a medida</strong>
        <button className="lw-icon-btn" onClick={onClose} aria-label="Cerrar">✕</button>
      </div>

      <div className="lw-form-body">
        {/* Paso 1: ¿qué desea cotizar? */}
        {!servicio && (
          <div className="lw-field">
            <label>¿Qué deseas cotizar?</label>
            <div className="lw-choices">
              <Choice value="puerta" onPick={() => setServicio("puerta")}>🚪 Puerta</Choice>
              <Choice value="closet" onPick={() => setServicio("closet")}>🚪 Closet / vestidor</Choice>
              <Choice value="cocina" onPick={() => onGoChat("Quiero cotizar una cocina integral a medida. ¿Me ayudas?")}>🍽️ Cocina integral</Choice>
              <Choice value="mueble" onPick={() => onGoChat("Quiero cotizar un mueble a medida. ¿Me ayudas?")}>🪑 Mueble a medida</Choice>
            </div>
          </div>
        )}

        {/* Paso 2 (Puerta): tambor → pre-cotizador visual · entrada → conversacional */}
        {servicio === "puerta" && (
          <div className="lw-field">
            <label>¿Qué tipo de puerta?</label>
            <div className="lw-choices">
              <Choice value="tambor" onPick={() => onOpenPrecot("puerta de tambor")}>
                🚪 De tambor (interior) — estimado al instante
              </Choice>
              <Choice value="entrada" onPick={() => onGoChat("Quiero cotizar una puerta de entrada / personalizada. ¿Me ayudas?")}>
                🏛️ De entrada / personalizada — la cotiza un asesor
              </Choice>
            </div>
          </div>
        )}

        {/* Paso 2 (Closet): mini-form de medidas + gama (2 gamas) */}
        {servicio === "closet" && (
          <>
            <div className="lw-field">
              <label>Medidas del espacio (en metros)</label>
              <div className="lw-dims">
                <input type="number" min="0.1" step="0.1" inputMode="decimal" placeholder="Ancho" value={ancho} onChange={e => setAncho(e.target.value)} />
                <span>×</span>
                <input type="number" min="0.1" step="0.1" inputMode="decimal" placeholder="Alto" value={alto} onChange={e => setAlto(e.target.value)} />
                <span>×</span>
                <input type="number" min="0.1" step="0.1" inputMode="decimal" placeholder="Prof." value={prof} onChange={e => setProf(e.target.value)} />
              </div>
            </div>
            <div className="lw-field">
              <label>Material</label>
              <div className="lw-choices">
                {GAMAS.map(g => (
                  <Choice key={g} value={g} current={gama} onPick={v => setGama(v)}>{g}</Choice>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="lw-form-nav">
        {servicio && <button className="lw-form-back" onClick={() => setServicio(null)}>‹ Atrás</button>}
        {servicio === "closet" && (
          <button className="lw-form-submit" onClick={submitCloset} disabled={!closetOk}>Continuar con Elena ›</button>
        )}
      </div>
    </div>
  );
}
