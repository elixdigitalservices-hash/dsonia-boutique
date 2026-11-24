// Novedades de D'Sonia en Vercel Blob (solo servidor).
// Cada guardado es un fichero NUEVO `novedades/lista/<marca>.json` (nunca se sobrescribe: la CDN de Blob podría servir uno viejo);
// la lista vigente es la más nueva del listado, que no pasa por la CDN. Se conservan las 15 últimas versiones.
// Las fotos van a `novedades/fotos/`. Igual que la carta de Jaylu.
import { del, list, put } from '@vercel/blob';

const LISTA = 'novedades/lista/';
export const MAXIMO = 12;
const marca = (n) => String(n).padStart(15, '0');

export async function leerLista() {
  const { blobs } = await list({ prefix: LISTA, limit: 1000 });
  const ult = blobs.sort((a, b) => b.pathname.localeCompare(a.pathname))[0];
  if (!ult) return [];
  const r = await fetch(ult.url, { cache: 'no-store' });
  if (!r.ok) return [];
  const j = await r.json();
  return Array.isArray(j.items) ? j.items : [];
}

export async function guardarLista(items) {
  const ahora = Date.now();
  await put(`${LISTA}${marca(ahora)}.json`, JSON.stringify({ items, actualizada: new Date(ahora).toISOString() }), { access: 'public', contentType: 'application/json', addRandomSuffix: false });
  try {
    const { blobs } = await list({ prefix: LISTA, limit: 1000 });
    const viejas = blobs.sort((a, b) => b.pathname.localeCompare(a.pathname)).slice(15);
    if (viejas.length) await del(viejas.map((x) => x.url));
  } catch {
    // limpiar el historial no es imprescindible
  }
}

export async function subirFoto(datos, tipo) {
  const ext = tipo === 'image/webp' ? 'webp' : tipo === 'image/png' ? 'png' : 'jpg';
  const b = await put(`novedades/fotos/${Date.now()}.${ext}`, datos, { access: 'public', contentType: tipo, addRandomSuffix: true });
  return b.url;
}

export async function borrarFotos(urls) {
  if (urls.length) await del(urls).catch(() => {});
}
