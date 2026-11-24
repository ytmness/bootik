/**
 * Datos públicos de contacto — Concretos Estampados BOOTIK.
 */
window.BOOTIK_CONTACT = {
  brand: "BOOTIK",
  legalName: "Concretos Estampados Bootik",
  phoneDisplay: "+52 81 8460 6667",
  phoneTel: "+528184606667",
  waNumber: "528184606667",
  email: "gerardo.concretosestampados@gmail.com",
  address: "Josefa Ortiz de Domínguez 220 Nte, Centro, Guadalupe, N.L.",
  addressShort: "Guadalupe, Nuevo León",
  mapsUrl: "https://maps.google.com/?q=Josefa+Ortiz+de+Dom%C3%ADnguez+220+Nte,+Centro,+Guadalupe,+N.L.",
  defaultMessage: "Hola, me interesa una cotización de concreto estampado.",
};

window.bootikWaUrl = function (text) {
  const c = window.BOOTIK_CONTACT;
  const msg = (text && String(text).trim()) || c.defaultMessage;
  return "https://wa.me/" + c.waNumber + "?text=" + encodeURIComponent(msg);
};

(function bindContact() {
  const c = window.BOOTIK_CONTACT;
  function apply() {
    document.querySelectorAll("[data-contact]").forEach((el) => {
      const key = el.getAttribute("data-contact");
      if (key === "email") {
        el.textContent = c.email;
        if (el.tagName === "A") el.href = "mailto:" + c.email;
      } else if (key === "phone") {
        el.textContent = c.phoneDisplay;
        if (el.tagName === "A") el.href = "tel:" + c.phoneTel;
      } else if (key === "address") {
        el.textContent = c.address;
        if (el.tagName === "A") el.href = c.mapsUrl;
      } else if (key === "addressShort") {
        el.textContent = c.addressShort;
      }
    });
    document.querySelectorAll("a[data-wa], a.fab-whatsapp, a.btn-whatsapp").forEach((a) => {
      if (a.hasAttribute("data-wa-skip")) return;
      const custom = a.getAttribute("data-wa-text");
      a.href = window.bootikWaUrl(custom || c.defaultMessage);
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
