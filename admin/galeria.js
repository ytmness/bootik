import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.8/+esm";

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
  el("link-catalog").classList.toggle("hidden", !inApp);
  if (session?.user?.email) {
    el("auth-email").textContent = session.user.email;
  }
  if (inApp) loadList();
}

async function uploadGalleryImage(file) {
  const safe = (file.name || "file").replace(/[^\w.-]+/g, "_");
  const path = `${Date.now()}-${safe}`;
  const { error } = await sb.storage.from("gallery").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = sb.storage.from("gallery").getPublicUrl(path);
  return { publicUrl: data.publicUrl, storagePath: path };
}

let editingId = null;
let editingStoragePath = null;
/** URL de imagen al abrir el editor (evita mezclar storage_path con URL pegada) */
let initialImageUrl = "";
let listRequestGen = 0;

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function loadList() {
  const gen = ++listRequestGen;
  const tbody = el("gallery-rows");
  const empty = el("list-empty");
  const { data, error } = await sb
    .from("gallery_images")
    .select("id, image_url, title_es, title_en, sort_order, published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
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
      <td class="px-4 py-2">
        <img src="${escapeHtml(r.image_url)}" alt="" class="h-12 w-12 object-cover rounded border border-slate-200" loading="lazy"/>
      </td>
      <td class="px-4 py-2">${escapeHtml(r.title_es)}</td>
      <td class="px-4 py-2">${escapeHtml(String(r.sort_order ?? 0))}</td>
      <td class="px-4 py-2">${r.published ? "si" : "no"}</td>
      <td class="px-4 py-2 text-right">
        <button type="button" class="text-red-800 font-semibold text-xs edit-btn">Editar</button>
      </td>`;
    tr.querySelector(".edit-btn").addEventListener("click", () => openEditor(r));
    tbody.appendChild(tr);
  });
}

function fillEditorForm(dbRow) {
  el("editor").classList.remove("hidden");
  el("btn-delete").classList.toggle("hidden", !dbRow);
  editingId = dbRow ? dbRow.id : null;
  editingStoragePath = dbRow?.storage_path ?? null;
  initialImageUrl = dbRow?.image_url || "";
  el("editor-title").textContent = dbRow ? "Editar imagen" : "Nueva imagen";
  el("f-id-hint").textContent = dbRow
    ? `Id: ${dbRow.id}`
    : "Nueva fila: se asignara un id al guardar.";

  el("f-title-es").value = dbRow?.title_es || "";
  el("f-title-en").value = dbRow?.title_en || "";
  el("f-subtitle-es").value = dbRow?.subtitle_es || "";
  el("f-subtitle-en").value = dbRow?.subtitle_en || "";
  el("f-sort").value = dbRow?.sort_order ?? 0;
  el("f-image").value = dbRow?.image_url || "";
  el("f-image-file").value = "";
  el("f-published").checked = dbRow ? Boolean(dbRow.published) : true;

  const prev = el("f-preview");
  if (dbRow?.image_url) {
    prev.src = dbRow.image_url;
    prev.classList.remove("hidden");
  } else {
    prev.removeAttribute("src");
    prev.classList.add("hidden");
  }
  showFormError("");
}

/** @param {{ id?: string } | null} rowFromList */
async function openEditor(rowFromList) {
  if (!rowFromList?.id) {
    fillEditorForm(null);
    return;
  }
  const { data, error } = await sb
    .from("gallery_images")
    .select("*")
    .eq("id", rowFromList.id)
    .single();
  if (error) {
    showFormError(error.message);
    el("editor").classList.remove("hidden");
    return;
  }
  fillEditorForm(data);
}

function closeEditor() {
  el("editor").classList.add("hidden");
  editingId = null;
  editingStoragePath = null;
}

el("btn-close-editor").addEventListener("click", closeEditor);
el("btn-new").addEventListener("click", () => openEditor(null));

el("f-image").addEventListener("input", () => {
  const u = el("f-image").value.trim();
  if (u !== initialImageUrl) {
    editingStoragePath = null;
  }
  const prev = el("f-preview");
  if (u) {
    prev.src = u;
    prev.classList.remove("hidden");
  } else if (!el("f-image-file").files?.[0]) {
    prev.classList.add("hidden");
  }
});
el("f-image-file").addEventListener("change", () => {
  const f = el("f-image-file").files?.[0];
  const prev = el("f-preview");
  if (f) {
    prev.src = URL.createObjectURL(f);
    prev.classList.remove("hidden");
  }
});

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
});

el("btn-logout").addEventListener("click", async () => {
  await sb.auth.signOut();
});

el("form-gallery").addEventListener("submit", async (e) => {
  e.preventDefault();
  showFormError("");

  let imageUrl = el("f-image").value.trim();
  let storagePath = editingStoragePath;

  try {
    const file = el("f-image-file").files?.[0];
    if (file) {
      if (editingId && storagePath) {
        const { error: remErr } = await sb.storage.from("gallery").remove([storagePath]);
        if (remErr) throw remErr;
      }
      const up = await uploadGalleryImage(file);
      imageUrl = up.publicUrl;
      storagePath = up.storagePath;
      el("f-image").value = imageUrl;
    }

    if (!imageUrl) {
      showFormError("Indica una URL de imagen o sube un archivo.");
      return;
    }

    const row = {
      image_url: imageUrl,
      storage_path: storagePath || null,
      title_es: el("f-title-es").value.trim(),
      title_en: el("f-title-en").value.trim(),
      subtitle_es: el("f-subtitle-es").value.trim(),
      subtitle_en: el("f-subtitle-en").value.trim(),
      sort_order: Number(el("f-sort").value) || 0,
      published: el("f-published").checked,
    };

    if (editingId) {
      const { error } = await sb.from("gallery_images").update(row).eq("id", editingId);
      if (error) throw error;
    } else {
      const { error } = await sb.from("gallery_images").insert(row);
      if (error) throw error;
    }

    closeEditor();
    await loadList();
  } catch (err) {
    showFormError(err.message || String(err));
  }
});

el("btn-delete").addEventListener("click", async () => {
  if (!editingId) return;
  if (!confirm("Eliminar esta imagen de la galeria?")) return;

  const pathToRemove = editingStoragePath;
  try {
    if (pathToRemove) {
      const { error: sErr } = await sb.storage.from("gallery").remove([pathToRemove]);
      if (sErr) throw sErr;
    }
    const { error } = await sb.from("gallery_images").delete().eq("id", editingId);
    if (error) throw error;
    closeEditor();
    await loadList();
  } catch (err) {
    showFormError(err.message || String(err));
  }
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
