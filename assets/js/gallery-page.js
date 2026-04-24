import { loadPublishedGalleryItems } from "./gallery-source.js";

const root = document.getElementById("public-gallery-root");
const dialog = document.getElementById("gallery-dialog");
const dialogImg = document.getElementById("gallery-dialog-img");
const closeBtn = document.getElementById("gallery-dialog-close");

let items = [];

function currentLang() {
  return document.documentElement.lang === "en" ? "en" : "es";
}

function renderGrid() {
  if (!root) return;
  root.innerHTML = "";
  if (!items.length) {
    root.innerHTML =
      '<p class="col-span-full text-sm text-secondary">No hay imágenes en la galería.</p>';
    return;
  }
  const l = currentLang();
  items.forEach((item) => {
    const t = l === "en" ? item.titleEn : item.titleEs;
    const s = l === "en" ? item.subtitleEn : item.subtitleEs;
    const art = document.createElement("article");
    art.className = "gallery-item";
    art.dataset.id = item.id;
    art.innerHTML = `
      <button type="button" class="gallery-trigger group w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg">
        <span class="block aspect-[4/5] overflow-hidden rounded-lg border border-slate-200/90 bg-surface-container-low shadow-sm transition duration-300 group-hover:shadow-md group-hover:border-slate-300">
          <img class="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]" src="${escapeAttr(item.imageUrl)}" alt="${escapeAttr(t)}" loading="lazy"/>
        </span>
        <span class="gallery-item-title mt-2 block text-sm font-semibold text-on-surface">${escapeHtml(t)}</span>
        <span class="gallery-item-subtitle block text-xs text-secondary">${escapeHtml(s)}</span>
      </button>`;
    root.appendChild(art);
  });
}

function updateGalleryI18n() {
  if (!root) return;
  const l = currentLang();
  items.forEach((item) => {
    const art = root.querySelector(`[data-id="${cssEscapeSelector(item.id)}"]`);
    if (!art) return;
    const t = l === "en" ? item.titleEn : item.titleEs;
    const s = l === "en" ? item.subtitleEn : item.subtitleEs;
    const img = art.querySelector("img");
    if (img) {
      img.alt = t;
    }
    const titleEl = art.querySelector(".gallery-item-title");
    const subEl = art.querySelector(".gallery-item-subtitle");
    if (titleEl) titleEl.textContent = t;
    if (subEl) subEl.textContent = s;
  });
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
    if (img) {
      openDialog(img.currentSrc || img.src, img.alt);
    }
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
    renderGrid();
  })
  .catch((err) => {
    console.warn(err);
  });
