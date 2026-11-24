import { loadPublishedCatalog } from "./catalog-source.js";

const root = document.getElementById("shop-catalog-root");
if (root) {
  let catalog = [];

  function lang() {
    return document.documentElement.lang === "en" ? "en" : "es";
  }

  function nameOf(p) {
    return lang() === "en" ? p.nameEn : p.nameEs;
  }

  function descOf(p) {
    return lang() === "en" ? p.descriptionEn : p.descriptionEs;
  }

  function render() {
    root.innerHTML = "";
    if (!catalog.length) return;

    catalog.forEach((p) => {
      const a = document.createElement("article");
      a.className = "catalog-card group overflow-hidden flex flex-col";

      const imgWrap = document.createElement("div");
      imgWrap.className = "aspect-square overflow-hidden bg-surface-container-low relative border-b border-black/10";
      if (p.modelGlb) {
        const badge = document.createElement("span");
        badge.className =
          "absolute top-3 right-3 bg-primary text-white text-[10px] font-black tracking-widest px-2 py-1 z-10";
        badge.textContent = "3D";
        imgWrap.appendChild(badge);
      }
      const imgLink = document.createElement("a");
      imgLink.href = `producto.html?id=${encodeURIComponent(p.id)}`;
      imgLink.className = "block w-full h-full";
      const img = document.createElement("img");
      img.className = "w-full h-full object-cover img-hover-zoom";
      img.alt = nameOf(p);
      img.loading = "lazy";
      img.src = p.image;
      imgLink.appendChild(img);
      imgWrap.appendChild(imgLink);

      const body = document.createElement("div");
      body.className = "p-5 flex-grow flex flex-col";
      const row = document.createElement("div");
      row.className = "flex justify-between items-start mb-2 gap-3";
      const h3 = document.createElement("h3");
      h3.className = "font-headline text-lg font-bold text-on-surface leading-tight";
      const titleLink = document.createElement("a");
      titleLink.href = `producto.html?id=${encodeURIComponent(p.id)}`;
      titleLink.className = "no-underline text-inherit";
      titleLink.textContent = nameOf(p);
      h3.appendChild(titleLink);
      const price = document.createElement("span");
      price.className = "font-headline text-xl font-bold text-primary shrink-0";
      price.textContent = p.price;
      row.appendChild(h3);
      row.appendChild(price);
      const desc = document.createElement("p");
      desc.className = "text-secondary text-sm line-clamp-2";
      desc.textContent = descOf(p);
      body.appendChild(row);
      body.appendChild(desc);

      const wa = document.createElement("a");
      wa.className = "mt-4 inline-flex items-center justify-center btn-whatsapp px-4 py-2 text-xs font-bold uppercase tracking-widest no-underline rounded-sm";
      wa.href = p.whatsappLink || (window.bootikWaUrl ? window.bootikWaUrl("Hola, quiero cotizar " + nameOf(p) + ".") : "https://wa.me/528184606667");
      wa.target = "_blank";
      wa.rel = "noopener noreferrer";
      wa.textContent = lang() === "en" ? "Order on WhatsApp" : "Pedir por WhatsApp";
      body.appendChild(wa);

      a.appendChild(imgWrap);
      a.appendChild(body);
      root.appendChild(a);
    });
  }

  async function load() {
    try {
      catalog = await loadPublishedCatalog();
      render();
    } catch {
      root.innerHTML =
        "<p class=\"text-primary col-span-full text-center\">No se pudo cargar el catalogo.</p>";
    }
  }

  document.addEventListener("bootik-lang", render);
  load();
}
