// POST /api/panel { clave, accion: 'entrar' | 'subir' | 'borrar', foto?, titulo?, id? } → { items }
// La clave está en la variable de entorno PANEL_CLAVE de Vercel (no en el código).
import { createHash, timingSafeEqual } from 'node:crypto';
import { MAXIMO, borrarFotos, guardarLista, leerLista, subirFoto } from './_almacen.js';

const huella = (s) => createHash('sha256').update(String(s)).digest();
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Solo POST' });
  const CLAVE = process.env.PANEL_CLAVE;
  if (!CLAVE || !process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({ error: 'El panel aún no está configurado.' });
  const cuerpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  if (!timingSafeEqual(huella(cuerpo.clave || ''), huella(CLAVE))) {
    await espera(900);
    return res.status(401).json({ error: 'Clave incorrecta.' });
  }
  try {
    let items = await leerLista();
    if (cuerpo.accion === 'subir') {
      const m = /^data:(image\/(?:webp|jpeg|png));base64,([A-Za-z0-9+/=]+)$/.exec(cuerpo.foto || '');
      if (!m) return res.status(400).json({ error: 'La foto no es válida.' });
      const datos = Buffer.from(m[2], 'base64');
      if (datos.length > 3.5 * 1024 * 1024) return res.status(413).json({ error: 'La foto pesa demasiado.' });
      const url = await subirFoto(datos, m[1]);
      const titulo = String(cuerpo.titulo || '').replace(/\s+/g, ' ').trim().slice(0, 60) || 'Recién llegado';
      items = [{ id: Date.now().toString(36), url, titulo, fecha: new Date().toISOString() }, ...items];
      const sobran = items.slice(MAXIMO);
      items = items.slice(0, MAXIMO);
      await guardarLista(items);
      await borrarFotos(sobran.map((x) => x.url));
    } else if (cuerpo.accion === 'borrar') {
      const quita = items.find((x) => x.id === cuerpo.id);
      if (quita) {
        items = items.filter((x) => x.id !== cuerpo.id);
        await guardarLista(items);
        await borrarFotos([quita.url]);
      }
    }
    res.status(200).json({ items });
  } catch (e) {
    res.status(500).json({ error: 'No se pudo guardar. Prueba otra vez en un momento.' });
  }
}
