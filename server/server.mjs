// BOOTIK API: admin (contenido, galería, productos, pedidos) + checkout Mercado Pago.
// Sin dependencias externas. Node >= 20.
import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ---------- Config (variables de entorno; ver server/.env.example) ----------
loadDotEnv(path.join(__dirname, ".env"));
const PORT = Number(process.env.PORT || 8790);
const HOST = process.env.HOST || "127.0.0.1";
const PUBLIC_DIR = path.resolve(process.env.PUBLIC_DIR || path.join(ROOT, "public"));
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(ROOT, "data"));
const SERVE_STATIC = process.env.SERVE_STATIC !== "0"; // en producción nginx sirve lo estático
const SITE_URL = (process.env.SITE_URL || `http://localhost:${PORT}`).replace(/\/$/, "");
const COOKIE_SECURE = process.env.COOKIE_SECURE === "1";
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || "";
const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET || "";
const MP_API = (process.env.MP_API_BASE || "https://api.mercadopago.com").replace(/\/$/, ""); // solo se cambia para pruebas locales
const MP_STATEMENT = (process.env.MP_STATEMENT_DESCRIPTOR || "BOOTIK").slice(0, 22);
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const SESSION_HOURS = 12;

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function loadDotEnv(file) {
  try {
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
}

// ---------- Almacenamiento JSON (escritura atómica) ----------
const SEED = { site: "site.json", gallery: "gallery.json", products: "products.json" };
async function readStore(name) {
  const f = path.join(DATA_DIR, `${name}.json`);
  try {
    return JSON.parse(await fsp.readFile(f, "utf8"));
  } catch {
    if (SEED[name]) return JSON.parse(await fsp.readFile(path.join(PUBLIC_DIR, "assets/data", SEED[name]), "utf8"));
    if (name === "orders") return { orders: [] };
    return null;
  }
}
let writing = Promise.resolve();
function writeStore(name, data) {
  writing = writing.then(async () => {
    const f = path.join(DATA_DIR, `${name}.json`);
    const tmp = `${f}.${process.pid}.tmp`;
    await fsp.writeFile(tmp, JSON.stringify(data, null, 2));
    await fsp.rename(tmp, f);
  });
  return writing;
}

// ---------- Contraseña admin (scrypt) ----------
const ADMIN_FILE = path.join(DATA_DIR, "admin.json");
export function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(pw, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}
function verifyPassword(pw, stored) {
  const [alg, s, h] = String(stored || "").split("$");
  if (alg !== "scrypt" || !s || !h) return false;
  const want = Buffer.from(h, "base64");
  const got = crypto.scryptSync(pw, Buffer.from(s, "base64"), want.length, { N: 16384, r: 8, p: 1 });
  return crypto.timingSafeEqual(want, got);
}
function adminConfig() {
  try { return JSON.parse(fs.readFileSync(ADMIN_FILE, "utf8")); } catch { return null; }
}

// ---------- Sesiones ----------
const sessions = new Map(); // token -> {user, exp}
const loginFails = new Map(); // ip -> {n, until}
function newSession(user) {
  const token = crypto.randomBytes(32).toString("base64url");
  sessions.set(token, { user, exp: Date.now() + SESSION_HOURS * 3600e3 });
  return token;
}
function getSession(req) {
  const m = (req.headers.cookie || "").match(/(?:^|;\s*)bk_admin=([\w-]+)/);
  if (!m) return null;
  const s = sessions.get(m[1]);
  if (!s || s.exp < Date.now()) { sessions.delete(m?.[1]); return null; }
  return { token: m[1], ...s };
}
function sessionCookie(token, maxAge) {
  return `bk_admin=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${COOKIE_SECURE ? "; Secure" : ""}`;
}

// ---------- Utilidades HTTP ----------
function send(res, code, body, headers = {}) {
  const isObj = typeof body === "object" && !Buffer.isBuffer(body);
  res.writeHead(code, {
    "Content-Type": isObj ? "application/json; charset=utf-8" : headers["Content-Type"] || "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...headers,
  });
  res.end(isObj ? JSON.stringify(body) : body);
}
async function readBody(req, limit = 1e6) {
  const chunks = []; let size = 0;
  for await (const c of req) { size += c.length; if (size > limit) throw Object.assign(new Error("Archivo o datos demasiado grandes"), { status: 413 }); chunks.push(c); }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { throw Object.assign(new Error("JSON inválido"), { status: 400 }); }
}
function clientIp(req) {
  return (req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim();
}
function sameOrigin(req) {
  const o = req.headers.origin;
  if (!o) return true; // fetch same-origin GET/HEAD o curl local
  try {
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    return new URL(o).host === host;
  } catch { return false; }
}
const str = (v, max = 500) => String(v ?? "").trim().slice(0, max);
const slug = (s) => str(s, 80).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || crypto.randomBytes(4).toString("hex");

// ---------- Validación de contenido ----------
function cleanSite(b, prev) {
  const keys = ["businessName","announcement","heroKicker","heroTitle","heroText","phoneDisplay","whatsapp","email","address","mapsUrl","hours","facebook","instagram","shippingNote"];
  const out = { ...prev };
  for (const k of keys) if (k in b) out[k] = str(b[k], 600);
  out.whatsapp = String(out.whatsapp || "").replace(/\D/g, "");
  if (Array.isArray(b.heroImages)) out.heroImages = b.heroImages.map((x) => str(x, 120)).filter(Boolean).slice(0, 6);
  if (Array.isArray(b.colors)) out.colors = b.colors.slice(0, 30).map((c) => ({ name: str(c.name, 40), hex: /^#[0-9a-f]{6}$/i.test(c.hex) ? c.hex : "#888888" }));
  return out;
}
function cleanProducts(list) {
  if (!Array.isArray(list)) throw Object.assign(new Error("Lista inválida"), { status: 400 });
  const seen = new Set();
  return list.slice(0, 200).map((p, i) => {
    let id = slug(p.id || p.name); while (seen.has(id)) id += "-2"; seen.add(id);
    const price = p.price === null || p.price === "" || p.price === undefined ? null : Math.round(Number(p.price) * 100) / 100;
    if (price !== null && (!Number.isFinite(price) || price < 0 || price > 1e6)) throw Object.assign(new Error(`Precio inválido en ${p.name}`), { status: 400 });
    return {
      id, name: str(p.name, 120) || "Producto", unit: str(p.unit, 120), price,
      image: str(p.image, 300), description: str(p.description, 1500),
      variantLabel: str(p.variantLabel, 40),
      variants: (Array.isArray(p.variants) ? p.variants : String(p.variants || "").split(",")).map((v) => str(v, 60)).filter(Boolean).slice(0, 40),
      badge: str(p.badge, 40), active: p.active !== false, placeholder: price === null || !!p.placeholder,
      sort: Number.isFinite(Number(p.sort)) ? Number(p.sort) : i + 1,
    };
  });
}
function cleanGallery(list) {
  if (!Array.isArray(list)) throw Object.assign(new Error("Lista inválida"), { status: 400 });
  const cats = new Set(["cocheras","accesos","terrazas","plazas","banquetas","detalles","proceso","otros"]);
  return list.slice(0, 500).map((g, i) => ({
    id: slug(g.id || g.title), src: str(g.src, 300), thumb: str(g.thumb || g.src, 300),
    title: str(g.title, 120), place: str(g.place, 120), category: cats.has(g.category) ? g.category : "otros",
    featured: !!g.featured, visible: g.visible !== false, sort: Number.isFinite(Number(g.sort)) ? Number(g.sort) : i + 1,
    source: g.source === "ia" ? "ia" : "real",
  })).filter((g) => g.src);
}

// ---------- Subida de imágenes (data URL base64, el admin ya la reduce en el navegador) ----------
async function saveUpload(dataUrl, name) {
  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ""));
  if (!m) throw Object.assign(new Error("Formato de imagen no permitido (usa JPG, PNG o WEBP)"), { status: 400 });
  const buf = Buffer.from(m[2], "base64");
  if (buf.length > 6e6) throw Object.assign(new Error("Imagen mayor a 6 MB"), { status: 413 });
  const sig = buf.subarray(0, 12).toString("hex");
  const ok = (m[1] === "jpeg" && sig.startsWith("ffd8ff")) || (m[1] === "png" && sig.startsWith("89504e47")) || (m[1] === "webp" && sig.startsWith("52494646") && buf.subarray(8, 12).toString() === "WEBP");
  if (!ok) throw Object.assign(new Error("El archivo no es una imagen válida"), { status: 400 });
  const ext = m[1] === "jpeg" ? "jpg" : m[1];
  const file = `${Date.now()}-${slug(name).slice(0, 40)}.${ext}`;
  await fsp.writeFile(path.join(UPLOADS_DIR, file), buf);
  return `/uploads/${file}`;
}

// ---------- Pedidos + Mercado Pago ----------
function orderPublic(o) {
  return { id: o.id, status: o.status, total: o.total, items: o.items, createdAt: o.createdAt, demo: !!o.demo, delivery: o.delivery };
}
async function createCheckout(body) {
  const { products } = await readStore("products");
  const byId = new Map(products.filter((p) => p.active && !p.placeholder && p.price > 0).map((p) => [p.id, p]));
  const items = [];
  for (const it of Array.isArray(body.items) ? body.items.slice(0, 50) : []) {
    const p = byId.get(String(it.id));
    const qty = Math.floor(Number(it.qty));
    if (!p || !(qty >= 1 && qty <= 200)) throw Object.assign(new Error("Hay un producto inválido o no disponible en el carrito"), { status: 400 });
    let variant = str(it.variant, 60);
    if (p.variants?.length) { if (!p.variants.includes(variant)) throw Object.assign(new Error(`Elige ${p.variantLabel || "opción"} para ${p.name}`), { status: 400 }); } else variant = "";
    items.push({ id: p.id, name: p.name, unit: p.unit, variant, qty, price: p.price, subtotal: Math.round(p.price * qty * 100) / 100 });
  }
  if (!items.length) throw Object.assign(new Error("El carrito está vacío"), { status: 400 });
  const c = body.customer || {};
  const customer = { name: str(c.name, 120), phone: str(c.phone, 30).replace(/[^\d+ ]/g, ""), email: str(c.email, 120), address: str(c.address, 400), notes: str(c.notes, 600) };
  if (customer.name.length < 3) throw Object.assign(new Error("Escribe tu nombre"), { status: 400 });
  if (customer.phone.replace(/\D/g, "").length < 10) throw Object.assign(new Error("Escribe un teléfono de 10 dígitos"), { status: 400 });
  if (customer.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customer.email)) throw Object.assign(new Error("Correo inválido"), { status: 400 });
  const delivery = body.delivery === "envio" ? "envio" : "recoger";
  if (delivery === "envio" && customer.address.length < 10) throw Object.assign(new Error("Escribe la dirección de envío"), { status: 400 });

  const total = Math.round(items.reduce((s, i) => s + i.subtotal, 0) * 100) / 100;
  const id = `BK-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const key = crypto.randomBytes(12).toString("base64url");
  const order = { id, key, createdAt: new Date().toISOString(), status: "pendiente_pago", items, total, currency: "MXN", customer, delivery, demo: !MP_ACCESS_TOKEN, mp: {} };

  let redirect;
  if (MP_ACCESS_TOKEN) {
    const back = (s) => `${SITE_URL}/pedido.html?id=${id}&k=${key}&r=${s}`;
    const pref = {
      items: items.map((i) => ({ id: i.id, title: `${i.name}${i.variant ? ` (${i.variant})` : ""}`.slice(0, 250), description: i.unit, quantity: i.qty, unit_price: i.price, currency_id: "MXN" })),
      payer: { name: customer.name, email: customer.email || undefined, phone: { number: customer.phone } },
      external_reference: id,
      back_urls: { success: back("ok"), pending: back("pendiente"), failure: back("error") },
      auto_return: "approved",
      notification_url: `${SITE_URL}/api/mp/webhook`,
      statement_descriptor: MP_STATEMENT,
      metadata: { order_id: id },
    };
    const r = await fetch(`${MP_API}/checkout/preferences`, {
      method: "POST",
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}`, "Content-Type": "application/json", "X-Idempotency-Key": id },
      body: JSON.stringify(pref),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.init_point) {
      console.error("MP preference error", r.status, j?.message || j?.error);
      throw Object.assign(new Error("No se pudo iniciar el pago con Mercado Pago. Intenta de nuevo o escríbenos por WhatsApp."), { status: 502 });
    }
    order.mp.preferenceId = j.id;
    redirect = MP_ACCESS_TOKEN.startsWith("TEST-") ? j.sandbox_init_point || j.init_point : j.init_point;
  } else {
    order.status = "demo_sin_pago";
    redirect = `/pedido.html?id=${id}&k=${key}&r=demo`;
  }
  const store = await readStore("orders");
  store.orders.unshift(order);
  await writeStore("orders", store);
  return { orderId: id, redirect, demo: order.demo };
}

const MP_STATUS = { approved: "pagado", authorized: "pagado", in_process: "en_revision", pending: "pendiente_pago", rejected: "rechazado", cancelled: "cancelado", refunded: "reembolsado", charged_back: "contracargo" };
function validMpSignature(req, url) {
  if (!MP_WEBHOOK_SECRET) return true; // sin secreto: igual consultamos el pago a MP con nuestro token
  const sig = String(req.headers["x-signature"] || "");
  const ts = /ts=([^,]+)/.exec(sig)?.[1]; const v1 = /v1=([^,]+)/.exec(sig)?.[1];
  const dataId = (url.searchParams.get("data.id") || "").toLowerCase();
  const manifest = `id:${dataId};request-id:${req.headers["x-request-id"] || ""};ts:${ts};`;
  const h = crypto.createHmac("sha256", MP_WEBHOOK_SECRET).update(manifest).digest("hex");
  return !!v1 && v1.length === h.length && crypto.timingSafeEqual(Buffer.from(h), Buffer.from(v1));
}
async function handleWebhook(req, url) {
  const body = await readBody(req, 2e5).catch(() => ({}));
  const type = url.searchParams.get("type") || url.searchParams.get("topic") || body.type;
  const paymentId = url.searchParams.get("data.id") || body?.data?.id;
  if (type !== "payment" || !paymentId || !MP_ACCESS_TOKEN) return;
  if (!validMpSignature(req, url)) { console.warn("Webhook MP con firma inválida"); return; }
  const r = await fetch(`${MP_API}/v1/payments/${encodeURIComponent(paymentId)}`, { headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` } });
  if (!r.ok) return;
  const p = await r.json();
  const store = await readStore("orders");
  const o = store.orders.find((x) => x.id === p.external_reference);
  if (!o) return;
  if (Math.abs(Number(p.transaction_amount) - o.total) > 0.01 && p.status === "approved") { o.status = "revisar_monto"; }
  else o.status = MP_STATUS[p.status] || o.status;
  o.mp = { ...o.mp, paymentId: p.id, status: p.status, statusDetail: p.status_detail, method: p.payment_method_id, paidAmount: p.transaction_amount, updatedAt: new Date().toISOString() };
  await writeStore("orders", store);
}

// ---------- Archivos estáticos (solo desarrollo local) ----------
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".xml": "application/xml", ".txt": "text/plain" };
async function serveFile(res, base, rel) {
  const p = path.normalize(path.join(base, decodeURIComponent(rel)));
  if (!p.startsWith(base)) return send(res, 403, "Prohibido");
  let f = p;
  try { if ((await fsp.stat(f)).isDirectory()) f = path.join(f, "index.html"); await fsp.access(f); }
  catch { return send(res, 404, "No encontrado"); }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-cache" });
  fs.createReadStream(f).pipe(res);
}

// ---------- Rutas ----------
async function route(req, res) {
  const url = new URL(req.url, "http://x");
  const p = url.pathname;
  const m = req.method;

  if (p.startsWith("/uploads/")) return serveFile(res, UPLOADS_DIR, p.slice(9));
  if (!p.startsWith("/api/")) {
    if (SERVE_STATIC) return serveFile(res, PUBLIC_DIR, p === "/" ? "index.html" : p);
    return send(res, 404, { error: "No encontrado" });
  }
  if (m !== "GET" && m !== "HEAD" && p !== "/api/mp/webhook" && !sameOrigin(req)) return send(res, 403, { error: "Origen no permitido" });

  // Público
  if (p === "/api/health") return send(res, 200, { ok: true, mercadoPago: MP_ACCESS_TOKEN ? (MP_ACCESS_TOKEN.startsWith("TEST-") ? "prueba" : "produccion") : "sin_credenciales" });
  if (m === "GET" && p === "/api/public/site") return send(res, 200, await readStore("site"), { "Cache-Control": "public, max-age=60" });
  if (m === "GET" && p === "/api/public/gallery") {
    const g = await readStore("gallery");
    return send(res, 200, { items: g.items.filter((x) => x.visible).sort((a, b) => a.sort - b.sort) }, { "Cache-Control": "public, max-age=60" });
  }
  if (m === "GET" && p === "/api/public/products") {
    const d = await readStore("products");
    return send(res, 200, { products: d.products.filter((x) => x.active).sort((a, b) => a.sort - b.sort), payments: MP_ACCESS_TOKEN ? "mercadopago" : "demo" }, { "Cache-Control": "public, max-age=60" });
  }
  if (m === "POST" && p === "/api/checkout") return send(res, 200, await createCheckout(await readBody(req, 1e5)));
  if (m === "GET" && p === "/api/order-status") {
    const { orders } = await readStore("orders");
    const o = orders.find((x) => x.id === url.searchParams.get("id"));
    const k = url.searchParams.get("k") || "";
    if (!o || !o.key || k.length !== o.key.length || !crypto.timingSafeEqual(Buffer.from(k), Buffer.from(o.key))) return send(res, 404, { error: "Pedido no encontrado" });
    return send(res, 200, orderPublic(o));
  }
  if (p === "/api/mp/webhook") { await handleWebhook(req, url).catch((e) => console.error("webhook", e.message)); return send(res, 200, { ok: true }); }

  // Admin: login
  if (m === "POST" && p === "/api/admin/login") {
    const ip = clientIp(req);
    const f = loginFails.get(ip);
    if (f && f.n >= 5 && f.until > Date.now()) return send(res, 429, { error: "Demasiados intentos. Espera 15 minutos." });
    const b = await readBody(req, 1e4);
    const cfg = adminConfig();
    if (!cfg) return send(res, 503, { error: "Falta crear la contraseña del admin (npm run set-password en el servidor)." });
    const ok = str(b.user, 60).toLowerCase() === String(cfg.user).toLowerCase() && verifyPassword(String(b.password || ""), cfg.hash);
    if (!ok) {
      const n = (f && f.until > Date.now() ? f.n : 0) + 1;
      loginFails.set(ip, { n, until: Date.now() + 15 * 60e3 });
      await new Promise((r) => setTimeout(r, 400));
      return send(res, 401, { error: "Usuario o contraseña incorrectos" });
    }
    loginFails.delete(ip);
    return send(res, 200, { ok: true, user: cfg.user }, { "Set-Cookie": sessionCookie(newSession(cfg.user), SESSION_HOURS * 3600) });
  }
  if (m === "POST" && p === "/api/admin/logout") {
    const s = getSession(req); if (s) sessions.delete(s.token);
    return send(res, 200, { ok: true }, { "Set-Cookie": sessionCookie("x", 0) });
  }
  const s = getSession(req);
  if (p.startsWith("/api/admin/")) {
    if (!s) return send(res, 401, { error: "Inicia sesión" });
    if (m === "GET" && p === "/api/admin/me") return send(res, 200, { user: s.user, mercadoPago: MP_ACCESS_TOKEN ? (MP_ACCESS_TOKEN.startsWith("TEST-") ? "prueba" : "produccion") : "sin_credenciales" });
    if (m === "GET" && p === "/api/admin/site") return send(res, 200, await readStore("site"));
    if (m === "PUT" && p === "/api/admin/site") { const d = cleanSite(await readBody(req), await readStore("site")); await writeStore("site", d); return send(res, 200, d); }
    if (m === "GET" && p === "/api/admin/products") return send(res, 200, await readStore("products"));
    if (m === "PUT" && p === "/api/admin/products") { const d = { products: cleanProducts((await readBody(req, 5e5)).products) }; await writeStore("products", d); return send(res, 200, d); }
    if (m === "GET" && p === "/api/admin/gallery") return send(res, 200, await readStore("gallery"));
    if (m === "PUT" && p === "/api/admin/gallery") { const d = { items: cleanGallery((await readBody(req, 5e5)).items) }; await writeStore("gallery", d); return send(res, 200, d); }
    if (m === "POST" && p === "/api/admin/upload") { const b = await readBody(req, 9e6); return send(res, 200, { url: await saveUpload(b.dataUrl, b.name) }); }
    if (m === "GET" && p === "/api/admin/orders") { const { orders } = await readStore("orders"); return send(res, 200, { orders: orders.map(({ key, ...o }) => o) }); }
    const om = p.match(/^\/api\/admin\/orders\/([\w-]+)$/);
    if (m === "PATCH" && om) {
      const b = await readBody(req, 1e4);
      const allowed = ["pendiente_pago","pagado","en_revision","preparando","enviado","entregado","cancelado","rechazado","reembolsado","demo_sin_pago","revisar_monto"];
      const store = await readStore("orders");
      const o = store.orders.find((x) => x.id === om[1]);
      if (!o) return send(res, 404, { error: "No existe" });
      if (b.status && allowed.includes(b.status)) o.status = b.status;
      if ("adminNote" in b) o.adminNote = str(b.adminNote, 1000);
      await writeStore("orders", store);
      const { key, ...rest } = o; return send(res, 200, rest);
    }
    if (m === "POST" && p === "/api/admin/password") {
      const b = await readBody(req, 1e4); const cfg = adminConfig();
      if (!verifyPassword(String(b.current || ""), cfg.hash)) return send(res, 400, { error: "La contraseña actual no coincide" });
      if (String(b.next || "").length < 10) return send(res, 400, { error: "La nueva contraseña debe tener al menos 10 caracteres" });
      fs.writeFileSync(ADMIN_FILE, JSON.stringify({ user: cfg.user, hash: hashPassword(String(b.next)) }), { mode: 0o600 });
      for (const [t, v] of sessions) if (t !== s.token) sessions.delete(t);
      return send(res, 200, { ok: true });
    }
  }
  return send(res, 404, { error: "No encontrado" });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  http.createServer((req, res) => {
    route(req, res).catch((e) => {
      if (!e.status) console.error(e);
      if (!res.headersSent) send(res, e.status || 500, { error: e.status ? e.message : "Error interno" });
    });
  }).listen(PORT, HOST, () => {
    console.log(`BOOTIK API en http://${HOST}:${PORT}  datos=${DATA_DIR}  MercadoPago=${MP_ACCESS_TOKEN ? "configurado" : "MODO DEMO (sin credenciales)"}`);
  });
}
