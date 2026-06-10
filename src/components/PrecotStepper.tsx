import {
  ACABADOS,
  MADERAS,
  PrecotState,
  composePrecotMessage,
  isPrecotComplete,
  medidaLabel
} from "../lib/precot";

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
  const { tipo, medida, madera, acabado } = state;
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
        {tipo && <Chosen label={tipo} reset={() => setState({ ...state, tipo: null, medida: "", madera: null, acabado: null })} />}
        {tipo && medidaOk && (
          <Chosen
            label={`${medida} ${tipo === "puerta de tambor" ? "pza" : "m"}`}
            reset={() => setState({ ...state, medida: "", madera: null, acabado: null })}
          />
        )}
        {madera && <Chosen label={madera} reset={() => setState({ ...state, madera: null, acabado: null })} />}
        {acabado && <Chosen label={acabado} reset={() => setState({ ...state, acabado: null })} />}
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
              <button key={m} type="button" onClick={() => setState({ ...state, madera: m })} disabled={disabled}>
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

      {tipo && medidaOk && madera && !acabado && (
        <div className="lw-step-row">
          <span className="lw-step-q">Acabado</span>
          <div className="lw-step-chips">
            {ACABADOS.map(a => (
              <button key={a} type="button" onClick={() => setState({ ...state, acabado: a })} disabled={disabled}>
                {a}
              </button>
            ))}
          </div>
        </div>
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
