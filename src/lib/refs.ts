// Referencias visuales precargadas (miniaturas) para estilo / acabado / tono de
// madera. Solo cedro/caoba + acabados reales del negocio. Los ids son los valores
// que viajan al backend; el label es el texto humano que se compone en el mensaje.
//
// El ESTILO es POR SERVICIO: el mismo id/label (contemporáneo, clásico, …) muestra
// una imagen distinta según el mueble (puerta de tambor, clóset, entrada, cocina).
// Acabado y tono de madera son muestras universales y no cambian por servicio.

export type Ref = { id: string; label: string; img: string };
export type Servicio = "tambor" | "closet" | "entrada" | "cocina";

const BASE = "https://raw.githubusercontent.com/Yoor32/elena-media/main/predisenos";

// id/label compartidos por todos los servicios (solo cambia la imagen).
const ESTILO_META: { id: string; label: string }[] = [
  { id: "contemporaneo", label: "Contemporáneo" },
  { id: "clasico", label: "Clásico" },
  { id: "minimalista", label: "Minimalista" },
  { id: "artesanal_tallado", label: "Artesanal tallado" }
];

// Imagen específica del mueble de cada servicio (pipeline cedro, fondo de estudio).
const ESTILO_IMG: Record<Servicio, Record<string, string>> = {
  tambor: {
    contemporaneo: `${BASE}/RC-tambor_contemporaneo-1781969615541.png`,
    clasico: `${BASE}/RC-tambor_clasico-1781969647289.png`,
    minimalista: `${BASE}/RC-tambor_minimalista-1781969683158.png`,
    artesanal_tallado: `${BASE}/RC-tambor_artesanal-1781969721594.png`
  },
  closet: {
    contemporaneo: `${BASE}/RC-closet_contemporaneo-1781969758271.png`,
    clasico: `${BASE}/RC-closet_clasico-1781969794491.png`,
    minimalista: `${BASE}/RC-closet_minimalista-1781969835211.png`,
    artesanal_tallado: `${BASE}/RC-closet_artesanal-1781969869009.png`
  },
  entrada: {
    contemporaneo: `${BASE}/RC-entrada_contemporaneo-1781969905199.png`,
    clasico: `${BASE}/RC-entrada_clasico-1781969944232.png`,
    minimalista: `${BASE}/RC-entrada_minimalista-1781969982702.png`,
    artesanal_tallado: `${BASE}/RC-entrada_artesanal-1781970021010.png`
  },
  cocina: {
    contemporaneo: `${BASE}/RC-cocina_contemporaneo-1781970057897.png`,
    clasico: `${BASE}/RC-cocina_clasico-1781970096099.png`,
    minimalista: `${BASE}/RC-cocina_minimalista-1781970134112.png`,
    artesanal_tallado: `${BASE}/RC-cocina_artesanal-1781970171014.png`
  }
};

function buildEstilos(s: Servicio): Ref[] {
  return ESTILO_META.map(m => ({ id: m.id, label: m.label, img: ESTILO_IMG[s][m.id] }));
}

// refsEstilo[servicio] → Ref[] listo para el RefPicker; cada Ref.img es la URL del mueble.
export const refsEstilo: Record<Servicio, Ref[]> = {
  tambor: buildEstilos("tambor"),
  closet: buildEstilos("closet"),
  entrada: buildEstilos("entrada"),
  cocina: buildEstilos("cocina")
};

// Etiqueta humana de un estilo (igual en todos los servicios).
export function estiloLabel(id: string | null): string {
  if (!id) return "";
  const m = ESTILO_META.find(x => x.id === id);
  return m ? m.label : id;
}

export const ACABADOS: Ref[] = [
  { id: "poliuretano", label: "Poliuretano", img: `${BASE}/ASSETF-poliuretano-mqe26y34-1781458165760.png` },
  { id: "aceite_linaza", label: "Aceite de linaza", img: `${BASE}/ASSETF-aceite-mqe27hoi-1781458188834.png` },
  { id: "cera", label: "Cera", img: `${BASE}/ASSETF-cera-mqe281u0-1781458215172.png` }
];

export const MADERAS: Ref[] = [
  { id: "cedro", label: "Cedro", img: `${BASE}/ASSETF-cedro-mqe28kes-1781458240141.png` },
  { id: "caoba", label: "Caoba", img: `${BASE}/ASSETF-caoba-mqe2952g-1781458267390.png` }
];

export function refLabel(list: Ref[], id: string | null): string {
  if (!id) return "";
  const r = list.find(x => x.id === id);
  return r ? r.label : id;
}
