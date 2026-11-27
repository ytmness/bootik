// BOOTIK v2 — sitio público: contenido editable, galería, tienda y carrito.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = (n) => "$" + Number(n).toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const CATS = { cocheras: "Cocheras", accesos: "Accesos y caminos", terrazas: "Terrazas", plazas: "Plazas y patios", banquetas: "Banquetas", detalles: "Texturas", proceso: "En obra", otros: "Otros" };

async function getJSON(api, fallback) {
  try {
    const r = await fetch(api, { headers: { Accept: "application/json" } });
    if (!r.ok) throw 0;
    return await r.json();
  } catch {
    const r = await fetch(fallback);
    return r.json();
  }
}
const data = {};
const load = {
  site: () => (data.site ??= getJSON("/api/public/site", "/assets/data/site.json")),
  gallery: () => (data.gallery ??= getJSON("/api/public/gallery", "/assets/data/gallery.json").then((g) => ({ items: g.items.filter((x) => x.visible !== false).sort((a, b) => a.sort - b.sort) }))),
  products: () => (data.products ??= getJSON("/api/public/products", "/assets/data/products.json").then((p) => ({ ...p, products: p.products.filter((x) => x.active !== false).sort((a, b) => a.sort - b.sort) }))),
};
const waLink = (site, msg) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(msg || "Hola, quiero cotizar concreto estampado.")}`;

function toast(msg) {
  let t = $(".toast"); if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.append(t); }
  t.textContent = msg; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2200);
}

// ---------- Contenido del sitio ----------
async function applySite() {
  const s = await load.site();
  $$("[data-site]").forEach((el) => { const v = s[el.dataset.site]; if (v) el.textContent = v; else if (el.dataset.hideEmpty !== undefined) el.closest("[data-hide-wrap]")?.remove(); });
  $$("[data-wa]").forEach((a) => (a.href = waLink(s, a.dataset.wa)));
  $$("[data-tel]").forEach((a) => (a.href = "tel:+" + s.whatsapp));
  $$("[data-mail]").forEach((a) => { a.href = "mailto:" + s.email; if (!a.children.length) a.textContent = s.email; });
  $$("[data-maps]").forEach((a) => (a.href = s.mapsUrl));
  $$("[data-fb]").forEach((a) => (s.facebook ? (a.href = s.facebook) : a.closest("li")?.remove()));
  $$("[data-ig]").forEach((a) => (s.instagram ? (a.href = s.instagram) : a.closest("li")?.remove()));
  const sw = $("#swatches");
  if (sw && s.colors) sw.innerHTML = s.colors.map((c) => `<li class="swatch"><i style="--c:${esc(c.hex)}"></i><span>${esc(c.name)}</span></li>`).join("");
}

// ---------- Fotos ----------
const workFig = (g, cls = "") => `<figure class="work ${cls}" data-id="${esc(g.id)}" tabindex="0"><img loading="lazy" src="${esc(g.thumb || g.src)}" alt="${esc(g.title)}" width="720" height="960"><figcaption>${esc(g.title)}<small>${esc(g.place || "")}</small></figcaption></figure>`;

async function renderHero() {
  const box = $("#snaps"); if (!box) return;
  const [s, g] = await Promise.all([load.site(), load.gallery()]);
  const byId = new Map(g.items.map((x) => [x.id, x]));
  let pics = (s.heroImages || []).map((id) => byId.get(id)).filter(Boolean);
  if (pics.length < 3) pics = pics.concat(g.items.filter((x) => !pics.includes(x))).slice(0, 3);
  box.innerHTML = pics.slice(0, 3).map((p, i) => `<figure class="snap s${i + 1}"><img src="${esc(i === 0 ? p.src : p.thumb || p.src)}" alt="${esc(p.title)}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}><figcaption>${esc(p.title)}</figcaption></figure>`).join("");
}
async function renderWorks() {
  const box = $("#works"); if (!box) return;
  const g = await load.gallery();
  const list = g.items.filter((x) => x.featured).slice(0, 6);
  const pattern = ["tall", "", "", "wide", "", ""];
  box.innerHTML = list.map((x, i) => workFig(x, pattern[i] || "")).join("");
  bindLightbox(box, list);
}
async function renderGallery() {
  const box = $("#gallery"); if (!box) return;
  const g = await load.gallery();
  const cats = [...new Set(g.items.map((x) => x.category))];
  const f = $("#filters");
  f.innerHTML = `<button aria-pressed="true" data-c="">Todo (${g.items.length})</button>` + cats.map((c) => `<button aria-pressed="false" data-c="${c}">${CATS[c] || c}</button>`).join("");
  const draw = (c) => { const list = g.items.filter((x) => !c || x.category === c); box.innerHTML = list.map((x) => workFig(x)).join(""); bindLightbox(box, list); };
  f.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; $$("button", f).forEach((x) => x.setAttribute("aria-pressed", x === b)); draw(b.dataset.c); });
  draw("");
}
function bindLightbox(box, list) {
  let lb = $(".lb");
  if (!lb) {
    lb = document.createElement("div"); lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true");
    lb.innerHTML = `<img alt=""><p></p><button class="lb-x" aria-label="Cerrar">×</button><button class="lb-p" aria-label="Anterior">‹</button><button class="lb-n" aria-label="Siguiente">›</button>`;
    document.body.append(lb);
    lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("lb-x")) lb.classList.remove("open"); });
    document.addEventListener("keydown", (e) => { if (!lb.classList.contains("open")) return; if (e.key === "Escape") lb.classList.remove("open"); if (e.key === "ArrowRight") lb._go(1); if (e.key === "ArrowLeft") lb._go(-1); });
    $(".lb-p", lb).onclick = () => lb._go(-1); $(".lb-n", lb).onclick = () => lb._go(1);
  }
  const open = (i) => { lb._list = list; lb._i = i; const x = list[i]; $("img", lb).src = x.src; $("img", lb).alt = x.title; $("p", lb).textContent = [x.title, x.place].filter(Boolean).join(" · "); lb.classList.add("open"); };
  lb._go = (d) => open((lb._i + d + lb._list.length) % lb._list.length);
  box.onclick = (e) => { const f = e.target.closest(".work"); if (f) open(list.findIndex((x) => x.id === f.dataset.id)); };
  box.onkeydown = (e) => { if (e.key === "Enter") { const f = e.target.closest(".work"); if (f) open(list.findIndex((x) => x.id === f.dataset.id)); } };
}

// ---------- Carrito ----------
const CART_KEY = "bootik_cart_v2";
const cart = {
  get: () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } },
  set: (c) => { localStorage.setItem(CART_KEY, JSON.stringify(c)); updateCount(); },
  add(id, variant, qty) { const c = cart.get(); const l = c.find((x) => x.id === id && x.variant === variant); if (l) l.qty = Math.min(200, l.qty + qty); else c.push({ id, variant, qty }); cart.set(c); },
};
function updateCount() { const n = cart.get().reduce((s, x) => s + x.qty, 0); $$(".cart-count").forEach((b) => { b.textContent = n; b.dataset.n = n; }); }
async function cartLines() {
  const { products } = await load.products();
  const by = new Map(products.map((p) => [p.id, p]));
  const lines = cart.get().map((l) => ({ ...l, p: by.get(l.id) })).filter((l) => l.p && !l.p.placeholder && l.p.price > 0);
  return { lines, total: lines.reduce((s, l) => s + l.p.price * l.qty, 0) };
}
function lineHTML(l) {
  const img = l.p.image ? `<img src="${esc(l.p.image)}" alt="">` : `<div class="ph"></div>`;
  return `<div class="line" data-id="${esc(l.id)}" data-v="${esc(l.variant)}">${img}<div><b>${esc(l.p.name)}</b><small>${esc(l.p.unit)}${l.variant ? " · " + esc(l.variant) : ""}</small><br><span class="qty"><button type="button" data-d="-1" aria-label="Menos">−</button><input inputmode="numeric" value="${l.qty}" aria-label="Cantidad"><button type="button" data-d="1" aria-label="Más">+</button></span> <button class="rm" type="button">Quitar</button></div><strong>${money(l.p.price * l.qty)}</strong></div>`;
}
function bindLines(root, rerender) {
  root.onclick = (e) => {
    const line = e.target.closest(".line"); if (!line) return;
    const c = cart.get(); const i = c.findIndex((x) => x.id === line.dataset.id && x.variant === line.dataset.v); if (i < 0) return;
    if (e.target.closest(".rm")) c.splice(i, 1);
    else if (e.target.dataset.d) { c[i].qty = Math.max(1, Math.min(200, c[i].qty + Number(e.target.dataset.d))); }
    else return;
    cart.set(c); rerender();
  };
  root.onchange = (e) => {
    const line = e.target.closest(".line"); if (!line || e.target.tagName !== "INPUT") return;
    const c = cart.get(); const i = c.findIndex((x) => x.id === line.dataset.id && x.variant === line.dataset.v);
    c[i].qty = Math.max(1, Math.min(200, parseInt(e.target.value) || 1)); cart.set(c); rerender();
  };
}
async function renderDrawer() {
  const body = $("#drawer-body"); if (!body) return;
  const { lines, total } = await cartLines();
  body.innerHTML = lines.length ? lines.map(lineHTML).join("") : `<div class="empty">Tu carrito está vacío.<br><a href="/tienda.html">Ver materiales</a></div>`;
  $("#drawer-total").textContent = money(total);
  $("#drawer-go").toggleAttribute("disabled", !lines.length);
  bindLines(body, renderDrawer);
}
function setupDrawer() {
  if (!$("#drawer")) return;
  const open = () => { document.body.classList.add("cart-open"); renderDrawer(); };
  const close = () => document.body.classList.remove("cart-open");
  $$("[data-open-cart]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); open(); }));
  $$("[data-close-cart]").forEach((b) => b.addEventListener("click", close));
  $("#drawer-go").addEventListener("click", () => (location.href = "/carrito.html"));
  document.addEventListener("keydown", (e) => e.key === "Escape" && close());
  window.openCart = open;
}

// ---------- Tienda ----------
async function renderProducts() {
  const box = $("#products"); if (!box) return;
  const [{ products, payments }, s] = await Promise.all([load.products(), load.site()]);
  const limit = Number(box.dataset.limit || 0);
  const list = limit ? products.filter((p) => !p.placeholder).slice(0, limit) : products;
  box.innerHTML = list.map((p) => {
    const media = p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">` : `<div class="noimg">Foto pendiente</div>`;
    const priceHTML = p.placeholder || !(p.price > 0) ? `<div class="price tbd">Precio por confirmar</div>` : `<div class="price">${money(p.price)} <small>MXN</small></div>`;
    const variants = p.variants?.length ? `<div class="field"><label for="v-${p.id}">${esc(p.variantLabel || "Opción")}</label><select id="v-${p.id}" data-variant><option value="">Elige ${esc((p.variantLabel || "opción").toLowerCase())}…</option>${p.variants.map((v) => `<option>${esc(v)}</option>`).join("")}</select></div>` : "";
    const buy = p.placeholder || !(p.price > 0)
      ? `<a class="btn btn-wa" href="${waLink(s, `Hola, quiero cotizar: ${p.name}`)}" target="_blank" rel="noopener">Cotizar por WhatsApp</a>`
      : `${variants}<div class="buy-row"><span class="qty"><button type="button" data-q="-1" aria-label="Menos">−</button><input inputmode="numeric" value="1" aria-label="Cantidad" data-qty><button type="button" data-q="1" aria-label="Más">+</button></span><button class="btn btn-red" data-add>Agregar</button></div>`;
    return `<article class="product" data-id="${esc(p.id)}"><div class="product-media">${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}${media}</div><div class="product-body"><h3>${esc(p.name)}</h3><div class="unit">${esc(p.unit)}</div>${priceHTML}<p>${esc(p.description)}</p><div class="buy">${buy}</div></div></article>`;
  }).join("");
  const demo = $("#pay-mode"); if (demo) demo.hidden = payments !== "demo";
  box.addEventListener("click", (e) => {
    const card = e.target.closest(".product"); if (!card) return;
    const q = $("[data-qty]", card);
    if (e.target.dataset.q) { q.value = Math.max(1, Math.min(200, (parseInt(q.value) || 1) + Number(e.target.dataset.q))); return; }
    if (e.target.closest("[data-add]")) {
      const sel = $("[data-variant]", card);
      if (sel && !sel.value) { sel.focus(); toast("Elige el color primero"); return; }
      cart.add(card.dataset.id, sel ? sel.value : "", Math.max(1, Math.min(200, parseInt(q.value) || 1)));
      toast("Agregado al carrito"); window.openCart?.();
    }
  });
}

// ---------- Checkout ----------
async function setupCheckout() {
  const form = $("#checkout"); if (!form) return;
  const draw = async () => {
    const { lines, total } = await cartLines();
    $("#co-lines").innerHTML = lines.length ? lines.map(lineHTML).join("") : `<div class="empty">Tu carrito está vacío. <a href="/tienda.html">Ir a la tienda</a></div>`;
    $("#co-total").textContent = money(total);
    $("#co-pay").toggleAttribute("disabled", !lines.length);
    bindLines($("#co-lines"), draw);
  };
  draw();
  const { payments } = await load.products();
  $("#pay-mode").hidden = payments !== "demo";
  const addr = $("#addr-wrap");
  form.addEventListener("change", () => { addr.hidden = form.delivery.value !== "envio"; });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = $("#co-err"); err.textContent = "";
    const btn = $("#co-pay"); btn.disabled = true; btn.textContent = "Procesando…";
    try {
      const fd = new FormData(form);
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        items: cart.get(), delivery: fd.get("delivery"),
        customer: { name: fd.get("name"), phone: fd.get("phone"), email: fd.get("email"), address: fd.get("address"), notes: fd.get("notes") },
      }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "No se pudo crear el pedido. Escríbenos por WhatsApp.");
      localStorage.setItem("bootik_last_order", j.orderId);
      cart.set([]);
      location.href = j.redirect;
    } catch (ex) {
      err.textContent = ex.message === "Failed to fetch" ? "Sin conexión con la tienda. Intenta de nuevo o pide por WhatsApp." : ex.message;
      btn.disabled = false; btn.textContent = "Pagar con Mercado Pago";
    }
  });
}
async function renderOrderStatus() {
  const box = $("#order-status"); if (!box) return;
  const q = new URLSearchParams(location.search);
  const s = await load.site();
  const map = { pagado: ["✅", "¡Pago recibido!", "Gracias. Te contactamos por WhatsApp para coordinar la entrega."], pendiente_pago: ["⏳", "Pago pendiente", "Si pagaste en efectivo (OXXO) o transferencia, se confirma cuando Mercado Pago nos avise."], en_revision: ["⏳", "Pago en revisión", "Mercado Pago está revisando el pago. Te avisamos al confirmarse."], rechazado: ["⚠️", "El pago no pasó", "Puedes intentarlo con otra tarjeta o escribirnos por WhatsApp."], demo_sin_pago: ["🧪", "Pedido de prueba registrado", "La tienda está en modo prueba (Mercado Pago aún no está conectado). No se hizo ningún cargo. Para comprar ya, mándanos tu pedido por WhatsApp."] };
  try {
    const r = await fetch(`/api/order-status?id=${encodeURIComponent(q.get("id") || "")}&k=${encodeURIComponent(q.get("k") || "")}`);
    if (!r.ok) throw 0;
    const o = await r.json();
    const [ic, t, d] = map[o.status] || ["📦", "Pedido " + o.status.replace(/_/g, " "), ""];
    const msg = `Hola, mi pedido es ${o.id}: ` + o.items.map((i) => `${i.qty} × ${i.name}${i.variant ? " (" + i.variant + ")" : ""}`).join(", ") + `. Total ${money(o.total)}.`;
    box.innerHTML = `<div class="big">${ic}</div><h1>${esc(t)}</h1><p class="lead" style="margin:1rem auto">${esc(d)}</p><div class="card" style="text-align:left"><b>Pedido ${esc(o.id)}</b>${o.items.map((i) => `<div class="totals" style="font-weight:500;margin:.5rem 0"><span>${i.qty} × ${esc(i.name)}${i.variant ? " · " + esc(i.variant) : ""}</span><span>${money(i.subtotal)}</span></div>`).join("")}<div class="totals"><span>Total</span><strong>${money(o.total)}</strong></div><p class="note">${o.delivery === "envio" ? "Envío: el costo se confirma por WhatsApp." : "Recoges en Guadalupe, N.L."}</p></div><p style="margin-top:1.2rem"><a class="btn btn-wa" target="_blank" rel="noopener" href="${waLink(s, msg)}">Enviar pedido por WhatsApp</a></p>`;
  } catch {
    box.innerHTML = `<h1>No encontramos el pedido</h1><p class="lead" style="margin:1rem auto">Escríbenos por WhatsApp y lo revisamos.</p><a class="btn btn-wa" href="${waLink(s, "Hola, tengo una duda con mi pedido")}">WhatsApp</a>`;
  }
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  const mb = $("#menu-btn"), mm = $("#mobile-menu");
  mb?.addEventListener("click", () => { const o = mm.classList.toggle("open"); mb.setAttribute("aria-expanded", o); });
  updateCount(); setupDrawer();
  Promise.allSettled([applySite(), renderHero(), renderWorks(), renderGallery(), renderProducts(), setupCheckout(), renderOrderStatus()]).then((r) => r.forEach((x) => x.status === "rejected" && console.error(x.reason)));
  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();
});
