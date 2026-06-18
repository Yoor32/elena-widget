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
    contemporaneo: `${BASE}/ST-tambor_cont-mqjrrfp1-1781803444346.png`,
    clasico: `${BASE}/ST-tambor_clasico-4827-1781803641296.png`,
    minimalista: `${BASE}/ST-tambor_minimalista-5193-1781803669120.png`,
    artesanal_tallado: `${BASE}/ST-tambor_artesanal-6310-1781803702059.png`
  },
  closet: {
    contemporaneo: `${BASE}/ST-closet_contemporaneo-7044-1781803740207.png`,
    clasico: `${BASE}/ST-closet_clasico-7711-1781803775882.png`,
    minimalista: `${BASE}/ST-closet_minimalista-8420-1781803811940.png`,
    artesanal_tallado: `${BASE}/ST-closet_artesanal-9156-1781803850598.png`
  },
  entrada: {
    contemporaneo: `${BASE}/ST-entrada_contemporaneo-1077-1781803888413.png`,
    clasico: `${BASE}/ST-entrada_clasico-2388-1781803924823.png`,
    minimalista: `${BASE}/ST-entrada_minimalista-3095-1781803950704.png`,
    artesanal_tallado: `${BASE}/ST-entrada_artesanal-4502-1781803973596.png`
  },
  cocina: {
    contemporaneo: `${BASE}/ST-cocina_contemporaneo-5839-1781803998079.png`,
    clasico: `${BASE}/ST-cocina_clasico-6546-1781804020901.png`,
    minimalista: `${BASE}/ST-cocina_minimalista-7253-1781804045526.png`,
    artesanal_tallado: `${BASE}/ST-cocina_artesanal-8960-1781804069143.png`
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
