import "https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js";

await customElements.whenDefined("model-viewer");

/**
 * Cada entrada puede llevar `orientation`: tres giros en orden X Y Z (grados).
 * Si el molde viene "acostado" sobre el plano del suelo, prueba por turno:
 *   "-90deg 0deg 0deg" o "90deg 0deg 0deg"  (inclinar respecto al eje X)
 *   "0deg 0deg 90deg" o "0deg 0deg -90deg"  (girar en el plano horizontal, eje Z)
 *   "0deg 90deg 0deg" o "0deg -90deg 0deg" (eje Y)
 * Meshy y otros exportadores no siempre respetan +Y arriba del glTF; ajusta solo el molde que lo necesite.
 * Opcional: `scale` como "1 1 1" si hace falta uniformar tamaño.
 *
 * Modelos actuales (Meshy, ~19–25 MB cada uno): conviene comprimir antes de producción
 * (gltf-transform, Blender decimate, o re-export en Meshy más liviano).
 */
const DEFAULT_ORIENTATION = "0deg 0deg 0deg";

const models = [
  {
    src: "assets/models/Meshy_AI_Beige_Stone_Block_Wal_0416004320_texture.glb",
    titleEs: "Muro / bloque piedra beige",
    titleEn: "Beige stone block wall",
    orientation: DEFAULT_ORIENTATION
  },
  {
    src: "assets/models/Meshy_AI_Crimson_Arc_Tile_Mosa_0416004434_texture.glb",
    titleEs: "Mosaico arco / loseta carmesí",
    titleEn: "Crimson arc tile mosaic",
    orientation: DEFAULT_ORIENTATION
  },
  {
    src: "assets/models/Meshy_AI_stone_wall_mold_0416004348_texture.glb",
    titleEs: "Molde muro de piedra",
    titleEn: "Stone wall mold",
    orientation: DEFAULT_ORIENTATION
  },
  {
    src: "assets/models/Meshy_AI_Yellow_Stone_Mosaic_0416004410_texture.glb",
    titleEs: "Mosaico piedra amarilla",
    titleEn: "Yellow stone mosaic",
    orientation: DEFAULT_ORIENTATION
  },
  {
    src: "assets/models/Meshy_AI_Stone_Flower_0416011051_texture.glb",
    titleEs: "Piedra floral / mandala",
    titleEn: "Stone flower / mandala",
    orientation: DEFAULT_ORIENTATION
  }
];

const viewer = document.getElementById("mold-model-viewer");
const caption = document.getElementById("mold-model-caption");
const prevBtn = document.getElementById("mold-model-prev");
const nextBtn = document.getElementById("mold-model-next");
const dotsEl = document.getElementById("mold-model-dots");
const chipsEl = document.getElementById("mold-model-chips");
const overlay = document.getElementById("mold-model-overlay");
const loadingSource = document.getElementById("mv-i18n-loading");
const errorSource = document.getElementById("mv-i18n-error");

function lang() {
  return document.documentElement.lang === "en" ? "en" : "es";
}

function titleAt(i) {
  const m = models[i];
  return lang() === "en" ? m.titleEn : m.titleEs;
}

function showOverlay(kind) {
  if (!overlay) return;
  overlay.classList.remove("hidden", "pointer-events-none");
  const src = kind === "error" ? errorSource : loadingSource;
  overlay.textContent = src ? src.textContent.trim() : "";
}

function hideOverlay() {
  if (!overlay) return;
  overlay.classList.add("hidden", "pointer-events-none");
}

let idx = 0;

function renderDots() {
  if (!dotsEl) return;
  dotsEl.innerHTML = "";
  models.forEach((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className =
      "h-2.5 w-2.5 rounded-full transition-colors " +
      (i === idx ? "bg-primary scale-110" : "bg-slate-300 hover:bg-slate-400");
    b.setAttribute("aria-label", `Modelo ${i + 1}`);
    b.setAttribute("aria-current", i === idx ? "true" : "false");
    b.addEventListener("click", () => {
      idx = i;
      applyModel();
    });
    dotsEl.appendChild(b);
  });
}

function renderChips() {
  if (!chipsEl) return;
  chipsEl.innerHTML = "";
  models.forEach((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className =
      "px-3 py-2 text-xs font-bold rounded-full border transition-colors max-w-[11rem] truncate " +
      (i === idx
        ? "border-primary bg-primary/10 text-primary"
        : "border-slate-300 bg-white text-on-surface hover:border-primary/60");
    b.textContent = titleAt(i);
    b.title = titleAt(i);
    b.addEventListener("click", () => {
      idx = i;
      applyModel();
    });
    chipsEl.appendChild(b);
  });
}

function updateCaption() {
  if (caption) {
    caption.textContent = titleAt(idx);
  }
  renderDots();
  renderChips();
}

function applyModel() {
  if (!viewer) return;
  showOverlay("load");
  const m = models[idx];
  viewer.setAttribute("orientation", m.orientation || DEFAULT_ORIENTATION);
  if (m.scale) {
    viewer.setAttribute("scale", m.scale);
  } else {
    viewer.removeAttribute("scale");
  }
  viewer.setAttribute("src", m.src);
  updateCaption();
}

if (viewer && models.length) {
  viewer.addEventListener("load", () => {
    hideOverlay();
  });
  viewer.addEventListener("error", () => {
    showOverlay("error");
  });

  prevBtn?.addEventListener("click", () => {
    idx = (idx - 1 + models.length) % models.length;
    applyModel();
  });
  nextBtn?.addEventListener("click", () => {
    idx = (idx + 1) % models.length;
    applyModel();
  });

  new MutationObserver(() => {
    updateCaption();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  applyModel();
}
