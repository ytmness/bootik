const JSON_URL = "assets/data/products.json";

/** @param {Record<string, unknown>} row */
export function rowToProduct(row) {
  return {
    id: String(row.id),
    nameEs: String(row.name_es ?? ""),
    nameEn: String(row.name_en ?? ""),
    price: String(row.price ?? "Consultar"),
    image: String(row.image ?? ""),
    descriptionEs: String(row.description_es ?? ""),
    descriptionEn: String(row.description_en ?? ""),
    modelGlb: row.model_glb ? String(row.model_glb) : null,
    modelOrientation: String(row.model_orientation ?? "0deg 0deg 0deg"),
    whatsappLink: row.whatsapp_link ? String(row.whatsapp_link) : null,
  };
}

export function supabaseConfigured() {
  const c = globalThis.BOOTIK_SUPABASE;
  return Boolean(c && c.url && c.anonKey);
}

let supabaseEsm = null;

async function getCreateClient() {
  if (!supabaseEsm) {
    supabaseEsm = await import(
      "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.8/+esm"
    );
  }
  return supabaseEsm.createClient;
}

export async function createBootikClient() {
  const cfg = globalThis.BOOTIK_SUPABASE;
  if (!cfg?.url || !cfg?.anonKey) return null;
  const createClient = await getCreateClient();
  return createClient(cfg.url, cfg.anonKey);
}

export async function loadFromJson() {
  const r = await fetch(JSON_URL);
  if (!r.ok) throw new Error(String(r.status));
  const data = await r.json();
  return Array.isArray(data.products) ? data.products : [];
}

async function withTimeout(promise, ms) {
  let t;
  const timeout = new Promise((_, rej) => { t = setTimeout(() => rej(new Error("timeout")), ms); });
  try { return await Promise.race([promise, timeout]); }
  finally { clearTimeout(t); }
}

export async function loadPublishedCatalog() {
  // El catálogo público vive en products.json (precios de los flyers).
  // No se deja que un catálogo viejo en Supabase lo reemplace.
  return loadFromJson();
}

export async function loadPublishedProductById(id) {
  if (!id) return null;
  const list = await loadFromJson();
  return list.find((p) => p.id === id) || null;
}
