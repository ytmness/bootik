/**
 * Tema: claro / oscuro. Guarda en localStorage (bootik-theme) al elegir; si no hay valor, usa prefers-color-scheme.
 * Añade la clase "dark" en <html> (Tailwind darkMode: "class" en tailwind.config.js o script inline de la pagina).
 */
(function () {
  const KEY = "bootik-theme";

  function prefersDark() {
    try {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  }

  function isStoredExplicit() {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark";
  }

  function applyTheme() {
    const root = document.documentElement;
    const s = localStorage.getItem(KEY);
    let useDark;
    if (s === "dark") useDark = true;
    else if (s === "light") useDark = false;
    else useDark = prefersDark();
    if (useDark) root.classList.add("dark");
    else root.classList.remove("dark");
  }

  function syncButtonLabel(btn) {
    if (!btn) return;
    const d = document.documentElement.classList.contains("dark");
    const es = document.documentElement.lang !== "en";
    btn.setAttribute(
      "aria-label",
      es
        ? d
          ? "Cambiar a tema claro"
          : "Cambiar a tema oscuro"
        : d
          ? "Switch to light theme"
          : "Switch to dark theme"
    );
  }

  applyTheme();

  try {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", () => {
      if (!isStoredExplicit()) applyTheme();
    });
  } catch {
    // ignore
  }

  function bindToggle() {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;
    const sync = () => syncButtonLabel(btn);
    sync();
    btn.addEventListener("click", () => {
      const nowDark = document.documentElement.classList.contains("dark");
      localStorage.setItem(KEY, nowDark ? "light" : "dark");
      applyTheme();
      sync();
    });
    document.addEventListener("bootik-lang", sync);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindToggle);
  } else {
    bindToggle();
  }
})();
