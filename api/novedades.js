// GET /api/novedades → { items: [{ url, titulo, fecha }] } para la sección «Novedades de la semana» de la portada.
import { leerLista } from './_almacen.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300');
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(200).json({ items: [] });
  try {
    const items = await leerLista();
    res.status(200).json({ items: items.map(({ url, titulo, fecha }) => ({ url, titulo, fecha })) });
  } catch {
    res.status(200).json({ items: [] });
  }
}
