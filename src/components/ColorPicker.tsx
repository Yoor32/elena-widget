import { COLOR_FAMILIAS, type ColorFamilia, type ColorSel } from "../lib/refs";
import { RefPicker } from "./RefPicker";

// Selector de color/acabado (paleta Misantla). Un grupo de swatches por familia
// (Cedro natural · Nogal · Solid) con SELECCIÓN ÚNICA global: elegir en una familia
// limpia las otras. Maderas → imágenes (reusa RefPicker); Solid → chips de color CSS.
export function ColorPicker({ label, value, onChange, disabled }: {
  label: string;
  value: ColorSel | null;
  onChange: (sel: ColorSel) => void;
  disabled?: boolean;
}) {
  return (
    <div className="lw-colorpicker" role="group" aria-label={label}>
      <span className="lw-ref-label">{label}</span>
      {COLOR_FAMILIAS.map(fam => {
        const subtono = value?.familia === fam.familia ? value.subtono : null;
        const pick = (id: string) => onChange({ familia: fam.familia, subtono: id });
        return fam.kind === "image"
          ? <RefPicker
              key={fam.familia}
              label={fam.label}
              options={fam.swatches.map(s => ({ id: s.id, label: s.label, img: s.img! }))}
              value={subtono}
              onChange={pick}
              disabled={disabled}
            />
          : <ChipGroup key={fam.familia} familia={fam} selected={subtono} onPick={pick} disabled={disabled} />;
      })}
    </div>
  );
}

// Grupo de chips de color CSS (familia SOLID): muestra el color como fondo, sin <img>.
function ChipGroup({ familia, selected, onPick, disabled }: {
  familia: ColorFamilia;
  selected: string | null;
  onPick: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="lw-refpicker" role="group" aria-label={familia.label}>
      <span className="lw-ref-label">{familia.label}</span>
      <div className="lw-chip-grid">
        {familia.swatches.map(s => (
          <button
            key={s.id}
            type="button"
            className={`lw-chip ${selected === s.id ? "sel" : ""}`}
            aria-pressed={selected === s.id}
            aria-label={s.label}
            title={s.label}
            disabled={disabled}
            onClick={() => onPick(s.id)}
          >
            <span className="lw-chip-dot" style={{ background: s.hex }} />
            <span className="lw-ref-cap">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
