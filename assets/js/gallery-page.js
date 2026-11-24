import {
  loadPublishedGalleryItems,
  GALLERY_CATEGORIES,
  galleryCategoryLabel,
} from "./gallery-source.js";

const root = document.getElementById("public-gallery-root");
const filtersRoot = document.getElementById("gallery-filters");
const dialog = document.getElementById("gallery-dialog");
const dialogImg = document.getElementById("gallery-dialog-img");
const closeBtn = document.getElementById("gallery-dialog-close");

let items = [];
let activeCategory = "all";

function currentLang() {
  return document.documentElement.lang === "en" ? "en" : "es";
}

function visibleItems() {
  if (activeCategory === "all") return items;
  return items.filter((item) => item.category === activeCategory);
}

function renderFilters() {
  if (!filtersRoot) return;
  const l = currentLang();
  const cats = [
    { id: "all", label: l === "en" ? "All projects" : "Todos los proyectos" },
    ...GALLERY_CATEGORIES.map((id) => ({ id, label: galleryCategoryLabel(id, l) })),
  ].filter((cat) => cat.id === "all" || items.some((item) => item.category === cat.id));

  filtersRoot.innerHTML = "";
  cats.forEach((cat) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      "gallery-filter" + (cat.id === activeCategory ? " is-active" : "");
    btn.textContent = cat.label;
    btn.dataset.cat = cat.id;
    btn.addEventListener("click", () => {
      activeCategory = cat.id;
      renderFilters();
      renderGrid();
    });
    filtersRoot.appendChild(btn);
  });
}

function renderGrid() {
  if (!root) return;
  root.innerHTML = "";
  const list = visibleItems();
  if (!list.length) {
    root.innerHTML =
      '<p class="col-span-full text-sm text-secondary p-6">No hay imágenes en esta categoría.</p>';
    return;
  }
  const l = currentLang();
  list.forEach((item, index) => {
    const t = l === "en" ? item.titleEn : item.titleEs;
    const s = l === "en" ? item.subtitleEn : item.subtitleEs;
    const art = document.createElement("article");
    art.className = `gallery-item ${index === 0 ? "gallery-item--featured" : ""}`;
    art.dataset.id = item.id;
    const src = item.thumbUrl || item.imageUrl;
    art.innerHTML = `
      <button type="button" class="gallery-trigger group w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 bg-white dark:bg-[#1c1b19]" data-full="${escapeAttr(item.imageUrl)}">
        <span class="gallery-image-frame block overflow-hidden bg-surface-container-low border-b border-black/10 transition-[border-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:border-primary/40">
          <img class="h-full w-full object-cover img-hover-zoom" src="${escapeAttr(src)}" alt="${escapeAttr(t)}" loading="lazy" width="800" height="600"/>
        </span>
        <span class="gallery-item-title block px-4 pt-4 text-sm font-headline font-bold text-on-surface uppercase tracking-wide">${escapeHtml(t)}</span>
        <span class="gallery-item-subtitle block px-4 pb-4 text-xs text-secondary">${escapeHtml(s)}</span>
      </button>`;
    root.appendChild(art);
  });
}

function updateGalleryI18n() {
  renderFilters();
  renderGrid();
}

function cssEscapeSelector(id) {
  if (typeof CSS !== "undefined" && CSS.escape) {
    return CSS.escape(id);
  }
  return String(id).replace(/"/g, '\\"');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function openDialog(src, alt) {
  if (!dialog || !dialogImg) return;
  dialogImg.src = src;
  dialogImg.alt = alt || "";
  dialog.showModal();
}

if (root) {
  root.addEventListener("click", (e) => {
    const trigger = e.target.closest(".gallery-trigger");
    if (!trigger) return;
    const img = trigger.querySelector("img");
    const full = trigger.getAttribute("data-full") || (img && (img.currentSrc || img.src));
    if (full) openDialog(full, img ? img.alt : "");
  });
}

if (closeBtn) {
  closeBtn.addEventListener("click", () => dialog?.close());
}
if (dialog) {
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });
}

document.addEventListener("bootik-lang", () => {
  updateGalleryI18n();
});

loadPublishedGalleryItems()
  .then((data) => {
    items = data;
    renderFilters();
    renderGrid();
  })
  .catch((err) => {
    console.warn(err);
    if (root) {
      root.innerHTML =
        '<p class="col-span-full text-sm text-secondary p-6">No se pudo cargar la galería.</p>';
    }
  });
