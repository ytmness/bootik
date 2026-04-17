(function () {
  const dialog = document.getElementById("gallery-dialog");
  const dialogImg = document.getElementById("gallery-dialog-img");
  const closeBtn = document.getElementById("gallery-dialog-close");

  document.querySelectorAll("[data-gallery-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = btn.getAttribute("data-gallery-filter");
      document.querySelectorAll("[data-gallery-filter]").forEach((b) => {
        b.classList.remove("bg-primary", "text-white", "border-primary");
        b.classList.add("bg-white", "text-on-surface", "border-slate-200");
      });
      btn.classList.add("bg-primary", "text-white", "border-primary");
      btn.classList.remove("bg-white", "text-on-surface", "border-slate-200");

      document.querySelectorAll(".gallery-item").forEach((item) => {
        const cat = item.getAttribute("data-category") || "";
        const show = f === "all" || cat === f;
        item.classList.toggle("hidden", !show);
      });
    });
  });

  function openDialog(src, alt) {
    if (!dialog || !dialogImg) return;
    dialogImg.src = src;
    dialogImg.alt = alt || "";
    dialog.showModal();
  }

  document.querySelectorAll(".gallery-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const img = trigger.querySelector("img");
      if (img) openDialog(img.currentSrc || img.src, img.alt);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => dialog?.close());
  }
  if (dialog) {
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });
  }
})();
