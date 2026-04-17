(function () {
  const dialog = document.getElementById("gallery-dialog");
  const dialogImg = document.getElementById("gallery-dialog-img");
  const closeBtn = document.getElementById("gallery-dialog-close");

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
