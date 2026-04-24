import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.8/+esm";
import { rowToProduct } from "../assets/js/catalog-source.js";

const cfg = globalThis.BOOTIK_SUPABASE;
if (!cfg?.url || !cfg?.anonKey) {
  document.body.innerHTML =
    "<p class=\"p-8 text-red-800 font-bold\">Falta url/anonKey en ../assets/js/bootik-config.js</p>";
  throw new Error("BOOTIK_SUPABASE");
}

const sb = createClient(cfg.url, cfg.anonKey);

const el = (id) => document.getElementById(id);

function isAdminUser(user) {
  return user?.app_metadata?.role === "admin";
}

function showLoginError(msg) {
  const p = el("login-error");
  p.textContent = msg;
  p.classList.toggle("hidden", !msg);
}

function showFormError(msg) {
  const p = el("form-error");
  p.textContent = msg;
  p.classList.toggle("hidden", !msg);
}

function setAuthedUI(session) {
  const inApp = Boolean(session?.user && isAdminUser(session.user));
  el("panel-login").classList.toggle("hidden", inApp);
  el("panel-app").classList.toggle("hidden", !inApp);
  el("btn-logout").classList.toggle("hidden", !inApp);
  el("auth-email").classList.toggle("hidden", !inApp);
  const linkG = el("link-gallery");
  if (linkG) {
    linkG.classList.toggle("hidden", !inApp);
  }
  if (session?.user?.email) {
    el("auth-email").textContent = session.user.email;
  }
  if (inApp) loadList();
}

async function uploadPublic(bucket, file, slug) {
  const safe = (file.name || "file").replace(/[^\w.-]+/g, "_");
  const path = `${slug}/${Date.now()}-${safe}`;
  const { error } = await sb.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = sb.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

function rowToDbFields(p) {
  return {
    id: p.id,
    name_es: p.nameEs,
    name_en: p.nameEn,
    price: p.price,
    image: p.image,
    description_es: p.descriptionEs,
    description_en: p.descriptionEn,
    model_glb: p.modelGlb || null,
    model_orientation: p.modelOrientation || "0deg 0deg 0deg",
    whatsapp_link: p.whatsappLink || null,
    published: p.published,
    sort_order: p.sortOrder,
  };
}

let editingOriginalId = null;
/** Evita filas duplicadas si varias peticiones a loadList se solapan (login + onAuthStateChange + getSession). */
let listRequestGen = 0;

async function loadList() {
  const gen = ++listRequestGen;
  const tbody = el("product-rows");
  const empty = el("list-empty");
  const { data, error } = await sb
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });
  if (gen !== listRequestGen) return;
  tbody.innerHTML = "";
  if (error) {
    empty.textContent = error.message;
    empty.classList.remove("hidden");
    return;
  }
  const rows = data || [];
  empty.classList.toggle("hidden", rows.length > 0);
  rows.forEach((r) => {
    const tr = document.createElement("tr");
    tr.className = "border-t border-slate-100 hover:bg-slate-50";
    tr.innerHTML = `
      <td class="px-4 py-2 font-mono text-xs">${escapeHtml(r.id)}</td>
      <td class="px-4 py-2">${escapeHtml(r.name_es)}</td>
      <td class="px-4 py-2">${r.published ? "si" : "no"}</td>
      <td class="px-4 py-2 text-right">
        <button type="button" class="text-red-800 font-semibold text-xs edit-btn">Editar</button>
      </td>`;
    tr.querySelector(".edit-btn").addEventListener("click", () => openEditor(r));
    tbody.appendChild(tr);
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function openEditor(dbRow) {
  el("editor").classList.remove("hidden");
  el("btn-delete").classList.toggle("hidden", !dbRow);
  editingOriginalId = dbRow ? dbRow.id : null;
  el("editor-title").textContent = dbRow ? "Editar producto" : "Nuevo producto";

  const fId = el("f-id");
  fId.value = dbRow?.id || "";
  fId.readOnly = Boolean(dbRow);
  fId.classList.toggle("bg-slate-100", Boolean(dbRow));

  const p = dbRow ? rowToProduct(dbRow) : null;
  el("f-name-es").value = p?.nameEs || "";
  el("f-name-en").value = p?.nameEn || "";
  el("f-price").value = p?.price || "Consultar";
  el("f-sort").value = dbRow?.sort_order ?? 0;
  el("f-image").value = p?.image || "";
  el("f-image-file").value = "";
  el("f-desc-es").value = p?.descriptionEs || "";
  el("f-desc-en").value = p?.descriptionEn || "";
  el("f-model").value = p?.modelGlb || "";
  el("f-model-file").value = "";
  el("f-orient").value = p?.modelOrientation || "0deg 0deg 0deg";
  el("f-wa").value = p?.whatsappLink || "";
  el("f-published").checked = dbRow ? Boolean(dbRow.published) : true;
  showFormError("");
}

function closeEditor() {
  el("editor").classList.add("hidden");
  editingOriginalId = null;
}

el("btn-close-editor").addEventListener("click", closeEditor);

el("btn-new").addEventListener("click", () => openEditor(null));

el("form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  showLoginError("");
  const email = el("login-email").value.trim();
  const password = el("login-password").value;
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    showLoginError(error.message);
    return;
  }
  if (!isAdminUser(data.user)) {
    await sb.auth.signOut();
    showLoginError("Este usuario no es admin (app_metadata.role).");
    return;
  }
  // La UI la actualiza onAuthStateChange (evita doble loadList con setAuthedUI aqui).
});

el("btn-logout").addEventListener("click", async () => {
  await sb.auth.signOut();
});

el("form-product").addEventListener("submit", async (e) => {
  e.preventDefault();
  showFormError("");
  const slug = el("f-id").value.trim();
  if (!slug) {
    showFormError("Id requerido.");
    return;
  }

  try {
    let imageUrl = el("f-image").value.trim();
    let modelUrl = el("f-model").value.trim() || null;

    const imgFile = el("f-image-file").files?.[0];
    if (imgFile) {
      imageUrl = await uploadPublic("product-images", imgFile, slug);
      el("f-image").value = imageUrl;
    }

    const glbFile = el("f-model-file").files?.[0];
    if (glbFile) {
      modelUrl = await uploadPublic("product-models", glbFile, slug);
      el("f-model").value = modelUrl || "";
    }

    const payload = rowToDbFields({
      id: slug,
      nameEs: el("f-name-es").value.trim(),
      nameEn: el("f-name-en").value.trim(),
      price: el("f-price").value.trim() || "Consultar",
      image: imageUrl,
      descriptionEs: el("f-desc-es").value.trim(),
      descriptionEn: el("f-desc-en").value.trim(),
      modelGlb: modelUrl,
      modelOrientation: el("f-orient").value.trim() || "0deg 0deg 0deg",
      whatsappLink: el("f-wa").value.trim() || null,
      published: el("f-published").checked,
      sortOrder: Number(el("f-sort").value) || 0,
    });

    if (editingOriginalId) {
      const { id, ...rest } = payload;
      const { error } = await sb.from("products").update(rest).eq("id", editingOriginalId);
      if (error) throw error;
    } else {
      const { error } = await sb.from("products").insert(payload);
      if (error) throw error;
    }

    closeEditor();
    await loadList();
  } catch (err) {
    showFormError(err.message || String(err));
  }
});

el("btn-delete").addEventListener("click", async () => {
  if (!editingOriginalId) return;
  if (!confirm(`Eliminar producto "${editingOriginalId}" ?`)) return;
  const { error } = await sb.from("products").delete().eq("id", editingOriginalId);
  if (error) {
    showFormError(error.message);
    return;
  }
  closeEditor();
  await loadList();
});

sb.auth.onAuthStateChange((_event, session) => {
  if (session?.user && !isAdminUser(session.user)) {
    sb.auth.signOut();
    showLoginError("Sesion cerrada: se requiere rol admin.");
    setAuthedUI(null);
    return;
  }
  setAuthedUI(session);
});

const { data: { session: initialSession } } = await sb.auth.getSession();
if (initialSession?.user && !isAdminUser(initialSession.user)) {
  await sb.auth.signOut();
  showLoginError("Este usuario no es admin.");
  setAuthedUI(null);
} else {
  setAuthedUI(initialSession);
}
// Puede coincidir con onAuthStateChange; listRequestGen evita filas duplicadas en la tabla.
