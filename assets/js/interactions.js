(function () {
  const prefersReduced =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initHeroLoad() {
    const hero = document.querySelector(".hero-load");
    if (!hero || prefersReduced) {
      if (hero) hero.classList.add("is-ready");
      return;
    }
    requestAnimationFrame(() => {
      hero.classList.add("is-ready");
    });
  }

  function initReveal() {
    const items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    if (prefersReduced) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    document.documentElement.classList.add("js-reveal-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );

    items.forEach((el) => observer.observe(el));
  }

  function initBeforeAfter() {
    const slider = document.querySelector("[data-ba-slider]");
    if (!slider) return;

    const afterLayer = slider.querySelector(".ba-slider__after");
    const handle = slider.querySelector(".ba-slider__handle");
    if (!afterLayer || !handle) return;

    let pos = 50;
    let dragging = false;

    function setPosition(pct) {
      pos = Math.max(8, Math.min(92, pct));
      afterLayer.style.clipPath = `inset(0 0 0 ${pos}%)`;
      handle.style.left = `${pos}%`;
      handle.setAttribute("aria-valuenow", String(Math.round(pos)));
    }

    function pctFromEvent(e) {
      const rect = slider.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      return ((clientX - rect.left) / rect.width) * 100;
    }

    function onDown(e) {
      dragging = true;
      slider.setAttribute("aria-busy", "true");
      setPosition(pctFromEvent(e));
      e.preventDefault();
    }

    function onMove(e) {
      if (!dragging) return;
      setPosition(pctFromEvent(e));
    }

    function onUp() {
      dragging = false;
      slider.removeAttribute("aria-busy");
    }

    handle.addEventListener("mousedown", onDown);
    handle.addEventListener("touchstart", onDown, { passive: false });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);

    slider.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        setPosition(pos - 2);
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        setPosition(pos + 2);
        e.preventDefault();
      }
    });

    handle.setAttribute("tabindex", "0");
    handle.setAttribute("role", "slider");
    handle.setAttribute("aria-valuemin", "8");
    handle.setAttribute("aria-valuemax", "92");
    handle.setAttribute("aria-valuenow", String(Math.round(pos)));
    handle.setAttribute("aria-label", "Comparar antes y después");

    setPosition(50);
  }

  function init() {
    initHeroLoad();
    initReveal();
    initBeforeAfter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
