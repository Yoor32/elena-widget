import type { Ref } from "../lib/refs";

// Grid de miniaturas seleccionables (una sola selección por grupo). Estado
// controlado, accesible con teclado (botones nativos + aria-pressed) y lazy-load.
export function RefPicker({ label, options, value, onChange, disabled }: {
  label: string;
  options: Ref[];
  value: string | null;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="lw-refpicker" role="group" aria-label={label}>
      <span className="lw-ref-label">{label}</span>
      <div className="lw-ref-grid">
        {options.map(o => (
          <button
            key={o.id}
            type="button"
            className={`lw-ref ${value === o.id ? "sel" : ""}`}
            aria-pressed={value === o.id}
            aria-label={o.label}
            title={o.label}
            disabled={disabled}
            onClick={() => onChange(o.id)}
          >
            <img src={o.img} alt={o.label} loading="lazy" />
            <span className="lw-ref-cap">{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
