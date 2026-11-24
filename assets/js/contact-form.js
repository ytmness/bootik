(function () {
  const form = document.querySelector("form.form-industrial, form#contact-form");
  if (!form) return;
  form.setAttribute("novalidate", "novalidate");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = (document.getElementById("contact-name") || {}).value || "";
    const email = (document.getElementById("contact-email") || {}).value || "";
    const message = (document.getElementById("contact-message") || {}).value || "";
    const lines = [
      "Hola, quiero una cotización de concreto estampado.",
      name.trim() ? "Nombre: " + name.trim() : "",
      email.trim() ? "Correo: " + email.trim() : "",
      message.trim() ? "Proyecto: " + message.trim() : "",
    ].filter(Boolean);
    const text = lines.join("\n");
    const wa = window.bootikWaUrl ? window.bootikWaUrl(text) : "#";
    const c = window.BOOTIK_CONTACT || {};
    const mailto =
      "mailto:" +
      encodeURIComponent(c.email || "gerardo.concretosestampados@gmail.com") +
      "?subject=" +
      encodeURIComponent("Cotización de concreto estampado") +
      "&body=" +
      encodeURIComponent(text);
    try {
      window.open(wa, "_blank", "noopener");
    } catch (err) {
      window.location.href = mailto;
    }
  });
})();
