// Panel admin BOOTIK: sesión por cookie HttpOnly, todo contra /api/admin/*
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (n) => "$" + Number(n).toLocaleString("es-MX", { maximumFractionDigits: 2 });
const CATS = { cocheras: "Cocheras", accesos: "Accesos y caminos", terrazas: "Terrazas", plazas: "Plazas y patios", banquetas: "Banquetas", detalles: "Texturas", proceso: "En obra", otros: "Otros" };
const STATUS = { pendiente_pago: "Pendiente de pago", pagado: "Pagado", en_revision: "Pago en revisión", preparando: "Preparando", enviado: "Enviado", entregado: "Entregado", cancelado: "Cancelado", rechazado: "Rechazado", reembolsado: "Reembolsado", demo_sin_pago: "Prueba (sin pago)", revisar_monto: "Revisar monto" };
const S = { products: [], gallery: [], site: {}, orders: [] };
let dirty = false;

function toast(m) { const t = $(".toast"); t.textContent = m; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2600); }
async function api(path, opts = {}) {
  const r = await fetch("/api/admin/" + path, { credentials: "same-origin", headers: opts.body ? { "Content-Type": "application/json" } : {}, ...opts, body: opts.body ? JSON.stringify(opts.body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401 && path !== "login") { showLogin(); throw new Error("Sesión expirada"); }
  if (!r.ok) throw new Error(j.error || "Error " + r.status);
  return j;
}
function showLogin() { $("#login").hidden = false; $("#app").hidden = true; $("#logout").hidden = true; $("#who").textContent = ""; }
async function boot() {
  try {
    const me = await api("me");
    $("#login").hidden = true; $("#app").hidden = false; $("#logout").hidden = false; $("#who").textContent = me.user;
    $("#mp-status").innerHTML = { sin_credenciales: "<b>No conectado.</b> La tienda está en <b>modo prueba</b>: los pedidos se registran pero no se cobra. Para cobrar hay que poner el Access Token de Mercado Pago en el servidor (archivo server/.env, variable MP_ACCESS_TOKEN).", prueba: "<b>Conectado en modo PRUEBA</b> (credenciales de prueba). Ningún cobro es real.", produccion: "<b>Conectado en PRODUCCIÓN.</b> Los pagos son reales y llegan a tu cuenta de Mercado Pago." }[me.mercadoPago];
    await Promise.all([loadOrders(), loadProducts(), loadGallery(), loadSite()]);
  } catch (e) { if (e.message !== "Sesión expirada") console.error(e); }
}

// Login / logout
$("#login-form").addEventListener("submit", async (e) => {
  e.preventDefault(); $("#login-err").textContent = "";
  try { const f = e.target; await api("login", { method: "POST", body: { user: f.user.value, password: f.password.value } }); f.password.value = ""; boot(); }
  catch (ex) { $("#login-err").textContent = ex.message; }
});
$("#logout").addEventListener("click", async () => { await api("logout", { method: "POST" }).catch(() => {}); showLogin(); });

// Tabs
$$(".a-tabs button").forEach((b) => b.addEventListener("click", () => {
  $$(".a-tabs button").forEach((x) => x.setAttribute("aria-selected", x === b));
  $$(".a-panel").forEach((p) => (p.hidden = p.id !== "tab-" + b.dataset.tab));
}));
window.addEventListener("beforeunload", (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });
document.addEventListener("input", (e) => { if (e.target.closest("#tab-productos,#tab-galeria,#tab-sitio")) dirty = true; });

// Imagen: reducir en el navegador y subir
function resize(file, max = 1600, q = 0.82) {
  return new Promise((ok, bad) => {
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      let d = c.toDataURL("image/webp", q); if (!d.startsWith("data:image/webp")) d = c.toDataURL("image/jpeg", q);
      ok(d);
    };
    img.onerror = () => bad(new Error("No se pudo leer la imagen " + file.name)); img.src = url;
  });
}
async function upload(file, max) { return (await api("upload", { method: "POST", body: { name: file.name.replace(/\.[^.]+$/, ""), dataUrl: await resize(file, max) } })).url; }

// ---------- Pedidos ----------
async function loadOrders() { S.orders = (await api("orders")).orders; drawOrders(); }
function drawOrders() {
  const f = $("#o-filter").value;
  const list = S.orders.filter((o) => !f || o.status === f);
  $("#orders").innerHTML = list.length ? list.map((o) => {
    const c = o.customer || {};
    const wa = `https://wa.me/52${(c.phone || "").replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(`Hola ${c.name}, te escribimos de Concretos Estampados BOOTIK por tu pedido ${o.id}.`)}`;
    return `<div class="order" data-id="${esc(o.id)}"><div class="order-top"><div><b>${esc(o.id)}</b> <span class="st ${esc(o.status)}">${esc(STATUS[o.status] || o.status)}</span><br><span class="note">${new Date(o.createdAt).toLocaleString("es-MX", { timeZone: "America/Monterrey" })}</span></div><b style="font-size:1.4rem">${money(o.total)}</b></div>
<div><b>${esc(c.name)}</b> · <a href="${wa}" target="_blank" rel="noopener">${esc(c.phone)}</a>${c.email ? " · " + esc(c.email) : ""}<br><span class="note">${o.delivery === "envio" ? "Envío a: " + esc(c.address) : "Recoge en Guadalupe"}${c.notes ? " · Nota: " + esc(c.notes) : ""}</span></div>
<ul>${o.items.map((i) => `<li>${i.qty} × ${esc(i.name)}${i.variant ? " (" + esc(i.variant) + ")" : ""} — ${money(i.subtotal)}</li>`).join("")}</ul>
${o.mp?.paymentId ? `<div class="note">Mercado Pago: pago ${esc(o.mp.paymentId)} · ${esc(o.mp.status)} ${esc(o.mp.method || "")}</div>` : ""}
<div class="row"><select data-st>${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${k === o.status ? "selected" : ""}>${v}</option>`).join("")}</select><input data-note placeholder="Nota interna" value="${esc(o.adminNote || "")}" style="flex:1;min-width:160px"><button class="mini" data-save>Guardar</button></div></div>`;
  }).join("") : `<p class="note">No hay pedidos todavía.</p>`;
}
$("#o-filter").addEventListener("change", drawOrders);
$("#orders").addEventListener("click", async (e) => {
  if (!e.target.dataset.hasOwnProperty("save")) return;
  const box = e.target.closest(".order");
  try { const o = await api("orders/" + box.dataset.id, { method: "PATCH", body: { status: $("[data-st]", box).value, adminNote: $("[data-note]", box).value } }); Object.assign(S.orders.find((x) => x.id === o.id), o); drawOrders(); toast("Pedido actualizado"); }
  catch (ex) { toast(ex.message); }
});

// ---------- Productos ----------
async function loadProducts() { S.products = (await api("products")).products.sort((a, b) => a.sort - b.sort); drawProducts(); }
function readProducts() {
  return $$("#products-ed .ed").map((el, i) => ({
    id: el.dataset.id, name: $("[name=name]", el).value, unit: $("[name=unit]", el).value,
    price: $("[name=price]", el).value === "" ? null : Number($("[name=price]", el).value),
    description: $("[name=description]", el).value, variantLabel: $("[name=variantLabel]", el).value,
    variants: $("[name=variants]", el).value.split(",").map((s) => s.trim()).filter(Boolean),
    badge: $("[name=badge]", el).value, image: $("[name=image]", el).value, active: $("[name=active]", el).checked, sort: i + 1,
  }));
}
function drawProducts() {
  $("#products-ed").innerHTML = S.products.map((p) => `<div class="ed ${p.active ? "" : "off"}" data-id="${esc(p.id)}">
<div><div class="thumb">${p.image ? `<img src="${esc(p.image)}" alt="">` : "Sin foto"}</div><label class="mini" style="display:block;text-align:center;margin-top:6px;cursor:pointer">Cambiar foto<input type="file" accept="image/*" hidden data-pimg></label></div>
<div class="fields">
<div class="field"><label>Nombre</label><input name="name" value="${esc(p.name)}"></div>
<div class="field"><label>Presentación</label><input name="unit" value="${esc(p.unit)}" placeholder="Saco de 20 kg"></div>
<div class="field"><label>Precio MXN (vacío = por confirmar)</label><input name="price" type="number" min="0" step="0.01" inputmode="decimal" value="${p.price ?? ""}"></div>
<div class="field"><label>Etiqueta (opcional)</label><input name="badge" value="${esc(p.badge)}" placeholder="Ahorras $400"></div>
<div class="field full"><label>Descripción</label><textarea name="description" rows="2">${esc(p.description)}</textarea></div>
<div class="field"><label>Nombre de la variante</label><input name="variantLabel" value="${esc(p.variantLabel)}" placeholder="Color"></div>
<div class="field"><label>Variantes (separadas por coma)</label><input name="variants" value="${esc((p.variants || []).join(", "))}"></div>
<input type="hidden" name="image" value="${esc(p.image)}">
<div class="tools"><label class="chk"><input type="checkbox" name="active" ${p.active ? "checked" : ""}> Visible en tienda</label><button class="mini" data-mv="-1" type="button">↑</button><button class="mini" data-mv="1" type="button">↓</button><button class="mini danger" data-del type="button">Eliminar</button></div>
</div></div>`).join("");
}
$("#products-ed").addEventListener("click", (e) => {
  const ed = e.target.closest(".ed"); if (!ed) return;
  if (e.target.dataset.mv) { S.products = readProducts(); const i = S.products.findIndex((p) => p.id === ed.dataset.id), j = i + Number(e.target.dataset.mv); if (j < 0 || j >= S.products.length) return; [S.products[i], S.products[j]] = [S.products[j], S.products[i]]; drawProducts(); dirty = true; }
  if (e.target.hasAttribute("data-del") && confirm("¿Eliminar este producto?")) { S.products = readProducts().filter((p) => p.id !== ed.dataset.id); drawProducts(); dirty = true; }
});
$("#products-ed").addEventListener("change", async (e) => {
  if (!e.target.hasAttribute("data-pimg") || !e.target.files[0]) return;
  const ed = e.target.closest(".ed");
  try { toast("Subiendo foto…"); const url = await upload(e.target.files[0], 1000); $("[name=image]", ed).value = url; $(".thumb", ed).innerHTML = `<img src="${url}" alt="">`; dirty = true; toast("Foto lista, falta Guardar"); } catch (ex) { toast(ex.message); }
});
$("#p-add").addEventListener("click", () => { S.products = readProducts(); S.products.push({ id: "nuevo-" + Date.now().toString(36), name: "Producto nuevo", unit: "", price: null, description: "", variantLabel: "", variants: [], badge: "", image: "", active: false }); drawProducts(); dirty = true; $("#products-ed .ed:last-child input").focus(); });
$("#p-save").addEventListener("click", async () => { try { S.products = (await api("products", { method: "PUT", body: { products: readProducts() } })).products; drawProducts(); dirty = false; toast("Productos guardados"); } catch (ex) { toast(ex.message); } });

// ---------- Galería ----------
async function loadGallery() { S.gallery = (await api("gallery")).items.sort((a, b) => a.sort - b.sort); drawGallery(); }
function readGallery() {
  return $$("#gallery-ed .g-card").map((el, i) => { const g = S.gallery.find((x) => x.id === el.dataset.id); return { ...g, title: $("[name=title]", el).value, place: $("[name=place]", el).value, category: $("[name=category]", el).value, featured: $("[name=featured]", el).checked, visible: $("[name=visible]", el).checked, sort: i + 1 }; });
}
function drawGallery() {
  $("#gallery-ed").innerHTML = S.gallery.map((g) => `<div class="g-card ${g.visible ? "" : "off"}" data-id="${esc(g.id)}"><img src="${esc(g.thumb || g.src)}" alt="" loading="lazy"><div class="b">
<input name="title" value="${esc(g.title)}" placeholder="Título"><input name="place" value="${esc(g.place)}" placeholder="Lugar (ej. Guadalupe, N.L.)">
<select name="category">${Object.entries(CATS).map(([k, v]) => `<option value="${k}" ${k === g.category ? "selected" : ""}>${v}</option>`).join("")}</select>
<div class="row"><label class="chk"><input type="checkbox" name="featured" ${g.featured ? "checked" : ""}> Destacada</label><label class="chk"><input type="checkbox" name="visible" ${g.visible ? "checked" : ""}> Visible</label></div>
<div class="row"><button class="mini" data-mv="-1">←</button><button class="mini" data-mv="1">→</button><button class="mini danger" data-del>Quitar</button></div></div></div>`).join("");
}
$("#gallery-ed").addEventListener("click", (e) => {
  const c = e.target.closest(".g-card"); if (!c) return;
  if (e.target.dataset.mv) { S.gallery = readGallery(); const i = S.gallery.findIndex((x) => x.id === c.dataset.id), j = i + Number(e.target.dataset.mv); if (j < 0 || j >= S.gallery.length) return; [S.gallery[i], S.gallery[j]] = [S.gallery[j], S.gallery[i]]; drawGallery(); dirty = true; }
  if (e.target.hasAttribute("data-del") && confirm("¿Quitar esta foto de la galería?")) { S.gallery = readGallery().filter((x) => x.id !== c.dataset.id); drawGallery(); dirty = true; }
});
$("#g-files").addEventListener("change", async (e) => {
  const files = [...e.target.files]; e.target.value = "";
  S.gallery = readGallery();
  for (const [n, f] of files.entries()) {
    try {
      toast(`Subiendo ${n + 1} de ${files.length}…`);
      const src = await upload(f, 1600); const thumb = await upload(f, 720);
      S.gallery.unshift({ id: "obra-" + Date.now().toString(36) + n, src, thumb, title: f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "), place: "", category: "otros", featured: false, visible: true, source: "real" });
      drawGallery(); dirty = true;
    } catch (ex) { toast(ex.message); }
  }
  toast("Fotos subidas. Ponles título y dale Guardar.");
});
$("#g-save").addEventListener("click", async () => { try { S.gallery = (await api("gallery", { method: "PUT", body: { items: readGallery() } })).items; drawGallery(); drawHeroPick(); dirty = false; toast("Galería guardada"); } catch (ex) { toast(ex.message); } });

// ---------- Sitio ----------
const SITE_FIELDS = [["heroKicker", "Frase arriba del título"], ["heroTitle", "Título principal"], ["heroText", "Texto de portada", "area"], ["announcement", "Barra superior (aviso)"], ["phoneDisplay", "Teléfono (como se muestra)"], ["whatsapp", "WhatsApp (con 52, solo números)"], ["email", "Correo"], ["address", "Dirección"], ["mapsUrl", "Link de Google Maps"], ["hours", "Horario (vacío = no se muestra)"], ["facebook", "Facebook (link)"], ["instagram", "Instagram (link, vacío = no se muestra)"], ["shippingNote", "Nota de envíos (carrito)", "area"]];
let heroSel = [];
async function loadSite() { S.site = await api("site"); heroSel = [...(S.site.heroImages || [])]; drawSite(); }
function drawSite() {
  $("#site-form").innerHTML = SITE_FIELDS.map(([k, l, t]) => `<div class="field" ${t ? 'style="grid-column:1/-1"' : ""}><label for="s-${k}">${l}</label>${t ? `<textarea id="s-${k}" name="${k}" rows="2">${esc(S.site[k])}</textarea>` : `<input id="s-${k}" name="${k}" value="${esc(S.site[k])}">`}</div>`).join("");
  drawHeroPick(); drawColors();
}
function drawHeroPick() {
  $("#hero-pick").innerHTML = S.gallery.filter((g) => g.visible).map((g) => { const n = heroSel.indexOf(g.id); return `<label class="${n >= 0 ? "on" : ""}"><input type="checkbox" value="${esc(g.id)}" ${n >= 0 ? "checked" : ""}><img src="${esc(g.thumb || g.src)}" alt="${esc(g.title)}">${n >= 0 ? `<span class="n">${n + 1}</span>` : ""}</label>`; }).join("");
}
$("#hero-pick").addEventListener("change", (e) => { const id = e.target.value; heroSel = e.target.checked ? [...heroSel, id].slice(-3) : heroSel.filter((x) => x !== id); dirty = true; drawHeroPick(); });
function drawColors() { $("#colors-ed").innerHTML = (S.site.colors || []).map((c) => `<div class="color-row"><input type="color" value="${esc(c.hex)}"><input value="${esc(c.name)}" placeholder="Nombre"><button class="mini danger" type="button" data-cdel>×</button></div>`).join(""); }
const readColors = () => $$("#colors-ed .color-row").map((r) => ({ hex: $("input[type=color]", r).value, name: $("input:not([type=color])", r).value })).filter((c) => c.name.trim());
$("#colors-ed").addEventListener("click", (e) => { if (e.target.hasAttribute("data-cdel")) { e.target.closest(".color-row").remove(); dirty = true; } });
$("#c-add").addEventListener("click", () => { S.site.colors = [...readColors(), { name: "Nuevo color", hex: "#888888" }]; drawColors(); });
$("#s-save").addEventListener("click", async () => {
  const body = Object.fromEntries(SITE_FIELDS.map(([k]) => [k, $(`#s-${k}`).value]));
  body.heroImages = heroSel; body.colors = readColors();
  try { S.site = await api("site", { method: "PUT", body }); dirty = false; toast("Textos guardados"); } catch (ex) { toast(ex.message); }
});

// ---------- Cuenta ----------
$("#pw-form").addEventListener("submit", async (e) => {
  e.preventDefault(); $("#pw-err").textContent = "";
  try { await api("password", { method: "POST", body: { current: $("#pw-cur").value, next: $("#pw-new").value } }); e.target.reset(); toast("Contraseña cambiada"); } catch (ex) { $("#pw-err").textContent = ex.message; }
});

boot();
