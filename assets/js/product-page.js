import "https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js";

await customElements.whenDefined("model-viewer");

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const loadingEl = document.getElementById("product-loading");
const detailEl = document.getElementById("product-detail");
const notFoundEl = document.getElementById("product-not-found");
const imageEl = document.getElementById("product-image");
const titleEl = document.getElementById("product-title");
const priceEl = document.getElementById("product-price");
const whatsappBtn = document.getElementById("product-whatsapp-btn");
const descEl = document.getElementById("product-desc");
const section3d = document.getElementById("product-3d-section");
const slot3d = document.getElementById("product-model-slot");
const overlay3d = document.getElementById("product-model-overlay");
const loadingText = document.getElementById("mv-i18n-loading");
const errorText = document.getElementById("mv-i18n-error");
const DEFAULT_WHATSAPP_REF_LINK = "https://wa.me/528100000000";

function lang() {
  return document.documentElement.lang === "en" ? "en" : "es";
}

function showState(which) {
  if (loadingEl) loadingEl.classList.toggle("hidden", which !== "loading");
  if (detailEl) detailEl.classList.toggle("hidden", which !== "detail");
  if (notFoundEl) notFoundEl.classList.toggle("hidden", which !== "404");
}

function showOverlay(kind) {
  if (!overlay3d) return;
  overlay3d.classList.remove("hidden", "pointer-events-none");
  const src = kind === "error" ? errorText : loadingText;
  overlay3d.textContent = src ? src.textContent.trim() : "";
}

function hideOverlay() {
  if (!overlay3d) return;
  overlay3d.classList.add("hidden", "pointer-events-none");
}

function buildWhatsAppLink(p) {
  if (p?.whatsappLink) {
    return p.whatsappLink;
  }
  const productName = lang() === "en" ? p?.nameEn : p?.nameEs;
  const text =
    lang() === "en"
      ? `Hello, I want details about: ${productName || "product"}`
      : `Hola, quiero informacion del producto: ${productName || "producto"}`;
  return `${DEFAULT_WHATSAPP_REF_LINK}?text=${encodeURIComponent(text)}`;
}

let currentProduct = null;
let viewerEl = null;

function fillText(p) {
  if (!p) return;
  if (imageEl) {
    imageEl.src = p.image;
    imageEl.alt = lang() === "en" ? p.nameEn : p.nameEs;
  }
  if (titleEl) titleEl.textContent = lang() === "en" ? p.nameEn : p.nameEs;
  if (priceEl) priceEl.textContent = p.price;
  if (whatsappBtn) {
    whatsappBtn.href = buildWhatsAppLink(p);
  }
  if (descEl) descEl.textContent = lang() === "en" ? p.descriptionEn : p.descriptionEs;
  document.title = `BOOTIK | ${lang() === "en" ? p.nameEn : p.nameEs}`;
}

function teardownViewer() {
  if (slot3d) slot3d.innerHTML = "";
  viewerEl = null;
}

function setupViewer(p) {
  if (!p.modelGlb || !slot3d || !section3d) {
    if (section3d) section3d.classList.add("hidden");
    return;
  }
  section3d.classList.remove("hidden");
  teardownViewer();
  showOverlay("load");

  const mv = document.createElement("model-viewer");
  mv.className = "w-full h-full block bg-slate-100";
  mv.style.minHeight = "320px";
  mv.setAttribute("camera-controls", "");
  mv.setAttribute("touch-action", "pan-y");
  mv.setAttribute("auto-rotate", "");
  mv.setAttribute("auto-rotate-delay", "4000");
  mv.setAttribute("interaction-prompt", "when-focused");
  mv.setAttribute("shadow-intensity", "1");
  mv.setAttribute("exposure", "1");
  mv.setAttribute("environment-image", "neutral");
  mv.setAttribute("alt", lang() === "en" ? p.nameEn : p.nameEs);
  mv.setAttribute("orientation", p.modelOrientation || "0deg 0deg 0deg");
  mv.setAttribute("src", p.modelGlb);

  mv.addEventListener("load", () => hideOverlay());
  mv.addEventListener("error", () => showOverlay("error"));

  slot3d.appendChild(mv);
  viewerEl = mv;
}

function renderProduct(p) {
  currentProduct = p;
  fillText(p);
  setupViewer(p);
  showState("detail");
}

async function init() {
  try {
    const r = await fetch("assets/data/products.json");
    if (!r.ok) throw new Error(String(r.status));
    const data = await r.json();
    const products = data.products || [];
    const p = products.find((x) => x.id === id);

    if (!id || !p) {
      showState("404");
      document.title = "BOOTIK | Producto";
      return;
    }

    renderProduct(p);
  } catch (e) {
    showState("404");
  }
}

document.addEventListener("bootik-lang", () => {
  if (currentProduct) {
    fillText(currentProduct);
    if (viewerEl) {
      viewerEl.setAttribute("alt", lang() === "en" ? currentProduct.nameEn : currentProduct.nameEs);
    }
  }
});

showState("loading");
init();
