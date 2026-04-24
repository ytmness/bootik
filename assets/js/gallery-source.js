import { createBootikClient, supabaseConfigured } from "./catalog-source.js";

/** @typedef {{ id: string, imageUrl: string, titleEs: string, titleEn: string, subtitleEs: string, subtitleEn: string }} GalleryItem */

/** Misma galeria estatica previa si Supabase no esta o falla */
const STATIC_FALLBACK = [
  {
    id: "fb-1",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAiYr0Tso5Giv87bqei5p_JwYellJGVT4tpd8xSayUlvwYBcyqvwJWox_xB3vLiHSTpc-plPUm1jgculHk7cSZiTHOTgmUSr7Rq8JJZP2oprSk3GOn_KyO3Mvc2mnAtpYqUxff-n5rIq9jJlVrPs0kH2h3zOM67pOtpdHAh832JrjA7dlDUQ-kIsRkfc2wfPbWUyoC9O4HGSJ2ScsUHSXQiCrA_FjTMNrSsKaRId2cWAf4j-szv0XZC6TXuus5aGvr_t5TvRCpbDQ",
    titleEs: "Patio",
    titleEn: "Patio",
    subtitleEs: "Concreto estampado",
    subtitleEn: "Stamped concrete",
  },
  {
    id: "fb-2",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCvo9xBb6aumIvTA4o8rBo6mqvzG2Ru8citkeGf4QfvTsgpKoX_gbwf7x_cRAr7HbOeCv4jNiLmWvPZ3yvUnrH5FLORn4VKR7MSnPWLeHa14Y6RhkWT6BoegslbP72yM-hiSaohKCPmiHQMKuP-Yqna20YTsBOe17IB415kK4GcmXG7CqD-5wdbXOvwEmHtqtO399LyyiczMAeqR3N_gkP2AJPWqvskuctDfQKJh4AC67J0Ko-iQ0l4Vly1F3ROcZgAh6cPynLDcA",
    titleEs: "Cochera",
    titleEn: "Driveway",
    subtitleEs: "Textura piedra",
    subtitleEn: "Stone texture",
  },
  {
    id: "fb-3",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCQx_fXc0z1suG5htppxlOGSNuGiHxmPPY4otGu0s57atUSCoB9_7HgpHpgq3TWXv9k9gc2P2Qi68QzN1JkEDSKkkS89sfi2gGdGPsCPzalxwbc4kx-8p4qTg5rOI9qnErqpRub0N0SxLhh9Aj41xy2QTWvjGaSMvN7NCnBrNy0mGDHPMe7Jqk9rKQxz_ZMr9rAjF4Zkha-btxDMKfaz-GeeaO_K2VGpbUYVLNgWqZBCKSdjTSOJNP7BmmAY3hhVY7gOW-IWs0Q5w",
    titleEs: "Comercial",
    titleEn: "Commercial",
    subtitleEs: "Gran formato",
    subtitleEn: "Large format",
  },
  {
    id: "fb-4",
    imageUrl: "assets/ejemplo 2.png",
    titleEs: "Residencial",
    titleEn: "Residential",
    subtitleEs: "Acabado texturizado",
    subtitleEn: "Textured finish",
  },
  {
    id: "fb-5",
    imageUrl: "assets/ejemplo 1.png",
    titleEs: "Diseño",
    titleEn: "Design",
    subtitleEs: "Patrón a medida",
    subtitleEn: "Custom pattern",
  },
  {
    id: "fb-6",
    imageUrl: "assets/485722715_1478659913197878_6115133834387971438_n.png",
    titleEs: "En obra",
    titleEn: "On site",
    subtitleEs: "Monterrey",
    subtitleEn: "Monterrey",
  },
];

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
  return rows.map(rowToItem);
}
