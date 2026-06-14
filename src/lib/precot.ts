// Stepper de pre-cotización (mejora progresiva). NO llama APIs: compone UN mensaje
// natural que se envía al /chat; el backend hace la pre-cotización real.

export type PrecotTipo = "puerta de tambor" | "cocina" | "closet";

export type PrecotState = {
  tipo: PrecotTipo | null;
  medida: string; // metros lineales (cocina/closet) o nº de puertas (puerta de tambor)
  madera: string | null;
  acabado: string | null;
};

export const PRECOT_EMPTY: PrecotState = { tipo: null, medida: "", madera: null, acabado: null };

export const MADERAS = ["Cedro", "Caoba"]; // mismo precio
export const ACABADOS = ["Poliuretano", "Aceite de linaza", "Cera"];

// Único servicio con pre-cotizador visual en el chat: puerta de tambor.
// (Closet usa el mini-form de medidas; cocina/mueble/entrada son conversacionales.)
const TIPO_PATTERNS: { tipo: PrecotTipo; re: RegExp }[] = [
  { tipo: "puerta de tambor", re: /puertas?\s+de\s+tambor/i }
];

// Detecta si conviene ofrecer el stepper: el texto menciona puerta de tambor + contexto de cotizar.
export function detectPrecot(text: string): PrecotTipo | null {
  if (!text || !/cotiz|presupuest|precio/i.test(text)) return null;
  for (const p of TIPO_PATTERNS) if (p.re.test(text)) return p.tipo;
  return null;
}

export function medidaLabel(tipo: PrecotTipo | null): string {
  return tipo === "puerta de tambor" ? "Nº de puertas" : "Metros lineales";
}

export function isPrecotComplete(s: PrecotState): boolean {
  const n = Number(s.medida);
  return !!s.tipo && Number.isFinite(n) && n > 0 && !!s.madera && !!s.acabado;
}

// Compone el mensaje natural final, p. ej.:
// "Quiero pre-cotizar una cocina de 4 metros lineales en cedro acabado poliuretano"
export function composePrecotMessage(s: PrecotState): string {
  const madera = (s.madera || "").toLowerCase();
  const acabado = (s.acabado || "").toLowerCase();
  if (s.tipo === "puerta de tambor") {
    const n = Math.max(1, Math.round(Number(s.medida) || 1));
    const noun = n === 1 ? "una puerta de tambor" : `${n} puertas de tambor`;
    return `Quiero pre-cotizar ${noun} en ${madera} acabado ${acabado}`;
  }
  if (s.tipo === "closet") {
    return `Quiero pre-cotizar un clóset de ${s.medida} metros lineales en ${madera} acabado ${acabado}`;
  }
  return `Quiero pre-cotizar una cocina de ${s.medida} metros lineales en ${madera} acabado ${acabado}`;
}
