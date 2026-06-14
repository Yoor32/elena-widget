// Referencias visuales precargadas (miniaturas) para estilo / acabado / tono de
// madera. Solo cedro/caoba + acabados reales del negocio. Los ids son los valores
// que viajan al backend; el label es el texto humano que se compone en el mensaje.

export type Ref = { id: string; label: string; img: string };

const BASE = "https://raw.githubusercontent.com/Yoor32/elena-media/main/predisenos";

export const ESTILOS: Ref[] = [
  { id: "contemporaneo", label: "Contemporáneo", img: `${BASE}/ASSET-estilo-contemporaneo-mqe19x3x-1781456625187.png` },
  { id: "clasico", label: "Clásico", img: `${BASE}/ASSET-estilo-clasico-mqe19x3y-1781456625034.png` },
  { id: "minimalista", label: "Minimalista", img: `${BASE}/ASSET3-minimalista-mqe1cqa7-1781456754580.png` },
  { id: "artesanal_tallado", label: "Artesanal tallado", img: `${BASE}/ASSET3-artesanal-mqe1d92v-1781456779028.png` }
];

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
