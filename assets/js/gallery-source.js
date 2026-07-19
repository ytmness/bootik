import { createBootikClient, supabaseConfigured } from "./catalog-source.js";

/** @typedef {{ id: string, imageUrl: string, titleEs: string, titleEn: string, subtitleEs: string, subtitleEn: string }} GalleryItem */

/** Proyectos reales destacados; siempre aparecen primero en la galería pública. */
const FEATURED_PROJECTS = [
  {
    id: "quinta-hero",
    imageUrl: "assets/projects/quinta-hero.webp",
    titleEs: "Acceso panorámico",
    titleEn: "Panoramic driveway",
    subtitleEs: "Concreto estampado · Monterrey",
    subtitleEn: "Stamped concrete · Monterrey",
  },
  {
    id: "quinta-patio-vertical",
    imageUrl: "assets/projects/quinta-patio-vertical.webp",
    titleEs: "Patio residencial",
    titleEn: "Residential courtyard",
    subtitleEs: "Textura arquitectónica",
    subtitleEn: "Architectural texture",
  },
  {
    id: "quinta-patio-atardecer",
    imageUrl: "assets/projects/quinta-patio-atardecer.webp",
    titleEs: "Plaza al atardecer",
    titleEn: "Courtyard at dusk",
    subtitleEs: "Acabado estampado de gran formato",
    subtitleEn: "Large-format stamped finish",
  },
  {
    id: "quinta-acceso-dia",
    imageUrl: "assets/projects/quinta-acceso-dia.webp",
    titleEs: "Acceso residencial",
    titleEn: "Residential driveway",
    subtitleEs: "Integración con paisaje",
    subtitleEn: "Landscape integration",
  },
  {
    id: "quinta-camino-dia",
    imageUrl: "assets/projects/quinta-camino-dia.webp",
    titleEs: "Camino curvo",
    titleEn: "Curved driveway",
    subtitleEs: "Concreto estampado residencial",
    subtitleEn: "Residential stamped concrete",
  },
];

const STATIC_FALLBACK = FEATURED_PROJECTS;

function rowToItem(row) {
  return {
    id: String(row.id),
    imageUrl: String(row.image_url),
    titleEs: String(row.title_es ?? ""),
    titleEn: String(row.title_en ?? ""),
    subtitleEs: String(row.subtitle_es ?? ""),
    subtitleEn: String(row.subtitle_en ?? ""),
  };
}

/**
 * @returns {Promise<GalleryItem[]>}
 */
export async function loadPublishedGalleryItems() {
  if (!supabaseConfigured()) {
    return STATIC_FALLBACK;
  }
  const sb = await createBootikClient();
  if (!sb) {
    return STATIC_FALLBACK;
  }
  const { data, error } = await sb
    .from("gallery_images")
    .select("id, image_url, title_es, title_en, subtitle_es, subtitle_en")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.warn("[BOOTIK] Galeria Supabase:", error.message);
    return STATIC_FALLBACK;
  }
  const rows = data || [];
  if (rows.length === 0) {
    return STATIC_FALLBACK;
  }
  const remoteItems = rows.map(rowToItem);
  const featuredUrls = new Set(FEATURED_PROJECTS.map((item) => item.imageUrl));
  return [
    ...FEATURED_PROJECTS,
    ...remoteItems.filter((item) => !featuredUrls.has(item.imageUrl)),
  ];
}
