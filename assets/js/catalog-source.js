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

export async function loadPublishedCatalog() {
  if (supabaseConfigured()) {
    const sb = await createBootikClient();
    if (sb) {
      const { data, error } = await sb
        .from("products")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true });
      if (error) {
        console.warn("[BOOTIK] Supabase catalogo:", error.message);
        return loadFromJson();
      }
      return (data || []).map(rowToProduct);
    }
  }
  return loadFromJson();
}

export async function loadPublishedProductById(id) {
  if (!id) return null;
  if (supabaseConfigured()) {
    const sb = await createBootikClient();
    if (sb) {
      const { data, error } = await sb
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("published", true)
        .maybeSingle();
      if (!error && data) return rowToProduct(data);
      if (error) console.warn("[BOOTIK] Supabase producto:", error.message);
    }
  }
  const list = await loadFromJson();
  return list.find((p) => p.id === id) || null;
}
