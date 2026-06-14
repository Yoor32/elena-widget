import { CONFIG } from "../config";

export const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_DIM = 1600;

export type UploadTipo = "reclamo" | "espacio";

export type UploadResult =
  | { ok: true; file_id: string; url: string; file_name: string; mensaje?: string }
  | { ok: false; error: string };

export function isAllowedImage(file: File): boolean {
  return ALLOWED_MIME.includes(file.type);
}

// Heurística simple para clasificar la foto: reclamo (queja/garantía) vs espacio (medir/diseñar).
const RECLAMO_RE = /(reclam|queja|garant|defect|da[ñn]ad|roto|rota|falla|mal estado|devoluci)/i;
export function inferTipo(text: string): UploadTipo {
  return RECLAMO_RE.test(text || "") ? "reclamo" : "espacio";
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo leer la imagen"));
    img.src = src;
  });
}

// Redimensiona a ≤1600px (lado mayor) y devuelve base64 SIN el prefijo data:.
export async function compressImage(
  file: File
): Promise<{ data_base64: string; mime: string }> {
  const dataUrl = await readAsDataURL(file);
  const img = await loadImage(dataUrl);
  const longest = Math.max(img.width, img.height) || 1;
  const scale = Math.min(1, MAX_DIM / longest);
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible");
  ctx.drawImage(img, 0, 0, width, height);

  // PNG conserva transparencia; el resto sale como JPEG (mejor compresión).
  const outMime = file.type === "image/png" ? "image/png" : "image/jpeg";
  const outDataUrl = canvas.toDataURL(outMime, 0.82);
  const data_base64 = outDataUrl.split(",")[1] || "";
  return { data_base64, mime: outMime };
}

export function base64Bytes(b64: string): number {
  // tamaño aproximado en bytes del binario codificado en base64
  return Math.floor((b64.length * 3) / 4);
}

export async function uploadMedia(params: {
  tipo: UploadTipo;
  mime: string;
  data_base64: string;
  session_id: string;
}): Promise<UploadResult> {
  const r = await fetch(CONFIG.endpoints.upload, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params)
  });
  const data = await r.json().catch(() => null);
  if (data && typeof data.ok === "boolean") return data as UploadResult;
  return { ok: false, error: "Respuesta inesperada del servidor" };
}
