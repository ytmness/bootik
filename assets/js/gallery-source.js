import { createBootikClient, supabaseConfigured } from "./catalog-source.js";

/** @typedef {{ id: string, imageUrl: string, thumbUrl?: string, category?: string, titleEs: string, titleEn: string, subtitleEs: string, subtitleEn: string }} GalleryItem */

/** Galería local de obras reales. Siempre se muestra, aunque Supabase falle. */
export const LOCAL_GALLERY = [
  {
    "id": "sergio-plaza-arbol",
    "imageUrl": "assets/projects/sergio-plaza-arbol.webp",
    "thumbUrl": "assets/projects/thumbs/sergio-plaza-arbol.webp",
    "category": "plazas",
    "titleEs": "Plaza residencial con árbol",
    "titleEn": "Residential plaza with tree",
    "subtitleEs": "Plaza de concreto estampado con cajete de árbol, Guadalupe / Monterrey",
    "subtitleEn": "Stamped-concrete plaza with a tree well in Monterrey"
  },
  {
    "id": "quinta-acceso-dia",
    "imageUrl": "assets/projects/quinta-acceso-dia.webp",
    "thumbUrl": "assets/projects/thumbs/quinta-acceso-dia.webp",
    "category": "accesos",
    "titleEs": "Acceso residencial",
    "titleEn": "Residential driveway",
    "subtitleEs": "Acceso de concreto estampado en quinta residencial",
    "subtitleEn": "Stamped-concrete driveway at a country house"
  },
  {
    "id": "quinta-camino-dia",
    "imageUrl": "assets/projects/quinta-camino-dia.webp",
    "thumbUrl": "assets/projects/thumbs/quinta-camino-dia.webp",
    "category": "accesos",
    "titleEs": "Camino curvo",
    "titleEn": "Curved path",
    "subtitleEs": "Camino residencial de concreto estampado",
    "subtitleEn": "Residential stamped-concrete path"
  },
  {
    "id": "quinta-hero",
    "imageUrl": "assets/projects/quinta-hero.webp",
    "thumbUrl": "assets/projects/thumbs/quinta-hero.webp",
    "category": "accesos",
    "titleEs": "Acceso panorámico",
    "titleEn": "Panoramic driveway",
    "subtitleEs": "Acceso de concreto estampado con vista a la sierra",
    "subtitleEn": "Stamped-concrete driveway with mountain view"
  },
  {
    "id": "quinta-patio-atardecer",
    "imageUrl": "assets/projects/quinta-patio-atardecer.webp",
    "thumbUrl": "assets/projects/thumbs/quinta-patio-atardecer.webp",
    "category": "plazas",
    "titleEs": "Plaza al atardecer",
    "titleEn": "Plaza at dusk",
    "subtitleEs": "Plaza de concreto estampado al atardecer",
    "subtitleEn": "Stamped-concrete plaza at dusk"
  },
  {
    "id": "quinta-patio-vertical",
    "imageUrl": "assets/projects/quinta-patio-vertical.webp",
    "thumbUrl": "assets/projects/thumbs/quinta-patio-vertical.webp",
    "category": "terrazas",
    "titleEs": "Terraza residencial",
    "titleEn": "Residential terrace",
    "subtitleEs": "Terraza de concreto estampado integrada al jardín",
    "subtitleEn": "Stamped-concrete terrace by the garden"
  },
  {
    "id": "proceso-vaciado",
    "imageUrl": "assets/projects/proceso-vaciado.webp",
    "thumbUrl": "assets/projects/thumbs/proceso-vaciado.webp",
    "category": "proceso",
    "titleEs": "Vaciado de concreto",
    "titleEn": "Concrete pour",
    "subtitleEs": "Revolvedora vaciando concreto en obra",
    "subtitleEn": "Ready-mix truck pouring concrete on site"
  },
  {
    "id": "proceso-plaza-terminada",
    "imageUrl": "assets/projects/proceso-plaza-terminada.webp",
    "thumbUrl": "assets/projects/thumbs/proceso-plaza-terminada.webp",
    "category": "plazas",
    "titleEs": "Plaza terminada",
    "titleEn": "Finished plaza",
    "subtitleEs": "Plaza de concreto estampado recién terminada",
    "subtitleEn": "Freshly finished stamped-concrete plaza"
  }
];

const CATEGORY_LABELS = {
  accesos: { es: "Accesos y caminos", en: "Driveways and paths" },
  plazas: { es: "Plazas y estacionamientos", en: "Plazas and parking" },
  terrazas: { es: "Terrazas", en: "Terraces" },
  comercial: { es: "Comercial", en: "Commercial" },
  proceso: { es: "Proceso de obra", en: "On-site process" },
};

export function galleryCategoryLabel(id, lang) {
  const row = CATEGORY_LABELS[id];
  if (!row) return id;
  return lang === "en" ? row.en : row.es;
}

export const GALLERY_CATEGORIES = Object.keys(CATEGORY_LABELS);

function rowToItem(row) {
  return {
    id: String(row.id),
    imageUrl: String(row.image_url || row.imageUrl),
    thumbUrl: row.thumb_url || row.thumbUrl || String(row.image_url || row.imageUrl),
    category: String(row.category || "plazas"),
    titleEs: String(row.title_es ?? row.titleEs ?? ""),
    titleEn: String(row.title_en ?? row.titleEn ?? ""),
    subtitleEs: String(row.subtitle_es ?? row.subtitleEs ?? ""),
    subtitleEn: String(row.subtitle_en ?? row.subtitleEn ?? ""),
  };
}

async function withTimeout(promise, ms) {
  let t;
  const timeout = new Promise((_, rej) => {
    t = setTimeout(() => rej(new Error("timeout")), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(t);
  }
}

/**
 * @returns {Promise<GalleryItem[]>}
 */
export async function loadPublishedGalleryItems() {
  const local = LOCAL_GALLERY.map((item) => ({ ...item }));
  if (!supabaseConfigured()) {
    return local;
  }
  try {
    const sb = await withTimeout(createBootikClient(), 2500);
    if (!sb) return local;
    const { data, error } = await withTimeout(
      sb
        .from("gallery_images")
        .select("id, image_url, title_es, title_en, subtitle_es, subtitle_en, category")
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
      2500
    );
    if (error) {
      console.warn("[BOOTIK] Galería Supabase:", error.message);
      return local;
    }
    const remote = (data || []).map(rowToItem);
    const seen = new Set(local.map((i) => i.id));
    return [...local, ...remote.filter((i) => !seen.has(i.id))];
  } catch (err) {
    console.warn("[BOOTIK] Galería: usando datos locales.", err && err.message ? err.message : err);
    return local;
  }
}
