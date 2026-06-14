import {
  PrecotState,
  composePrecotMessage,
  isPrecotComplete,
  medidaLabel
} from "../lib/precot";
import { ESTILOS, ACABADOS, MADERAS, refLabel } from "../lib/refs";
import { RefPicker } from "./RefPicker";

export function PrecotStepper({
  state,
  setState,
  onSubmit,
  onCancel,
  disabled
}: {
  state: PrecotState;
  setState: (s: PrecotState) => void;
  onSubmit: (message: string) => void;
  onCancel: () => void;
  disabled?: boolean;
}) {
  const { tipo, medida, madera, estilo, acabado } = state;
  const medidaOk = Number.isFinite(Number(medida)) && Number(medida) > 0;
  const complete = isPrecotComplete(state);

  // Chip-resumen de un valor ya elegido; al tocarlo se reinicia ese campo y los siguientes.
  function Chosen({ label, reset }: { label: string; reset: () => void }) {
    return (
      <button type="button" className="lw-step-chosen" onClick={reset} disabled={disabled}>
        {label} ✕
      </button>
    );
  }

  return (
    <div className="lw-stepper">
      <div className="lw-step-head">
        <strong>Pre-cotización guiada</strong>
        <button type="button" className="lw-step-close" onClick={onCancel} aria-label="Cerrar">✕</button>
      </div>

      <div className="lw-step-summary">
        {tipo && <Chosen label={tipo} reset={() => setState({ ...PRECOT_RESET, tipo: null })} />}
        {tipo && medidaOk && (
          <Chosen
            label={`${medida} ${tipo === "puerta de tambor" ? "pza" : "m"}`}
            reset={() => setState({ ...state, medida: "", madera: null, estilo: null, acabado: null })}
          />
        )}
        {madera && <Chosen label={refLabel(MADERAS, madera)} reset={() => setState({ ...state, madera: null, estilo: null, acabado: null })} />}
        {estilo && <Chosen label={refLabel(ESTILOS, estilo)} reset={() => setState({ ...state, estilo: null, acabado: null })} />}
        {acabado && <Chosen label={refLabel(ACABADOS, acabado)} reset={() => setState({ ...state, acabado: null })} />}
      </div>

      {!tipo && (
        <div className="lw-step-row">
          <span className="lw-step-q">¿Qué desea pre-cotizar?</span>
          <div className="lw-step-chips">
            {(["puerta de tambor", "cocina", "closet"] as const).map(t => (
              <button key={t} type="button" onClick={() => setState({ ...state, tipo: t })} disabled={disabled}>
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {tipo && !medidaOk && (
        <div className="lw-step-row">
          <span className="lw-step-q">{medidaLabel(tipo)}</span>
          <input
            className="lw-step-num"
            type="number"
            min="1"
            step={tipo === "puerta de tambor" ? "1" : "0.5"}
            inputMode="decimal"
            placeholder={tipo === "puerta de tambor" ? "ej. 3" : "ej. 4"}
            value={medida}
            onChange={e => setState({ ...state, medida: e.target.value })}
            disabled={disabled}
          />
        </div>
      )}

      {tipo && medidaOk && !madera && (
        <div className="lw-step-row">
          <span className="lw-step-q">Madera (mismo precio)</span>
          <div className="lw-step-chips">
            {MADERAS.map(m => (
              <button key={m.id} type="button" onClick={() => setState({ ...state, madera: m.id })} disabled={disabled}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {tipo && medidaOk && madera && !estilo && (
        <RefPicker
          label="Estilo"
          options={ESTILOS}
          value={estilo}
          onChange={id => setState({ ...state, estilo: id })}
          disabled={disabled}
        />
      )}

      {tipo && medidaOk && madera && estilo && !acabado && (
        <RefPicker
          label="Acabado"
          options={ACABADOS}
          value={acabado}
          onChange={id => setState({ ...state, acabado: id })}
          disabled={disabled}
        />
      )}

      {complete && (
        <button
          type="button"
          className="lw-step-calc"
          onClick={() => onSubmit(composePrecotMessage(state))}
          disabled={disabled}
        >
          Calcular
        </button>
      )}
    </div>
  );
}

const PRECOT_RESET = { medida: "", madera: null, estilo: null, acabado: null };
