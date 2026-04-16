const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const yearEl = document.getElementById("year");
const langToggle = document.getElementById("lang-toggle");

const LANG_KEY = "bootik_lang";
const labels = {
  es: {
    "nav.home": "Inicio",
    "nav.services": "Servicios",
    "nav.gallery": "Galeria",
    "nav.shop": "Tienda",
    "nav.about": "Nosotros",
    "nav.contact": "Contacto",
    "nav.quote": "Cotizar",
    "home.badge": "EXCELENCIA EN CONCRETO",
    "home.hero.titlePrefix": "Transformamos espacios con",
    "home.hero.titleAccent": "concreto estampado",
    "home.hero.desc": "Arte industrial duradero para residencias y comercios de alta gama en Monterrey. Soluciones arquitectonicas que perduran.",
    "home.hero.cta1": "Solicitar cotizacion",
    "home.hero.cta2": "Ver proyectos",
    "home.impact.title1": "El impacto de la",
    "home.impact.title2": "renovacion",
    "home.impact.desc": "Observa como una superficie desgastada se convierte en una pieza central de diseno arquitectonico con BOOTIK.",
    "home.before": "ANTES",
    "home.after": "DESPUES",
    "home.testimonials.title": "Lo que dicen nuestros clientes",
    "home.testimonials.subtitle": "Confianza cimentada en resultados excepcionales.",
    "home.cta.title": "Listo para elevar tu proyecto?",
    "home.cta.desc": "Solicita una visita tecnica sin compromiso y descubre las posibilidades infinitas del concreto arquitectonico.",
    "home.cta.button": "Solicitar presupuesto GRATIS",
    "home.footer.desc": "Lideres en pavimentos arquitectonicos y concreto estampado de alta gama en el norte de Mexico.",
    "home.footer.services": "Servicios",
    "home.footer.residential": "Residencial",
    "home.footer.commercial": "Comercial",
    "home.footer.company": "Empresa",
    "home.footer.about": "Nosotros",
    "home.footer.contact": "Contacto",
    "home.footer.copy": "© 2024 BOOTIK Monterrey. Stamped Concrete Excellence.",
    "services.hero.desc": "Elevamos la infraestructura con acabados arquitectonicos que fusionan la durabilidad del concreto con la estetica del diseno contemporaneo.",
    "services.card1.title": "Concreto Estampado Residencial",
    "services.card1.desc": "Transformamos patios, cocheras y entradas en espacios de distincion con texturas premium.",
    "services.card2.title": "Diseno Personalizado",
    "services.card2.desc": "Patrones exclusivos, logotipos integrados y mezclas de colores personalizadas para proyectos de autor.",
    "services.card3.title": "Concreto Estampado Comercial",
    "services.card3.desc": "Soluciones de alta resistencia para centros comerciales y areas publicas.",
    "services.card4.title": "Reparacion y Mantenimiento",
    "services.card4.desc": "Sellado profesional, restauracion de color y reparacion estructural.",
    "services.contact": "Contactar",
    "services.cta.title": "LISTO PARA INICIAR TU PROYECTO?",
    "services.cta.desc": "Agenda una visita tecnica en Monterrey y recibe una cotizacion personalizada.",
    "services.cta.primary": "Solicitar Presupuesto",
    "services.cta.secondary": "Ver Portafolio",
    "gallery.badge": "Excelencia en concreto",
    "gallery.title": "GALERIA",
    "gallery.desc": "Explora nuestro portafolio de proyectos arquitectonicos de concreto.",
    "gallery.filter": "Filtrar por",
    "gallery.all": "Todos los proyectos",
    "gallery.patios": "Patios",
    "gallery.driveways": "Cocheras",
    "gallery.commercial": "Comercial",
    "gallery.overview.desc": "Vista general de nuestro portafolio completo: residencial, comercial e industrial.",
    "gallery.overview.tag1": "Residencial",
    "gallery.overview.tag2": "Comercial",
    "gallery.overview.tag3": "Industrial",
    "gallery.cta.title": "LISTO PARA DEJAR HUELLA?",
    "gallery.cta.desc": "Agenda una visita y recibe una cotizacion personalizada para tu proyecto.",
    "gallery.cta.primary": "Solicitar Cotizacion",
    "gallery.cta.secondary": "Contactar Ventas",
    "gallery.footer.desc": "Soluciones premium de concreto estampado en Monterrey.",
    "gallery.footer.contactInfo": "Contacto",
    "gallery.footer.navigation": "Navegacion",
    "gallery.footer.copy": "© 2024 BOOTIK Monterrey.",
    "contact.badge": "Permanencia en cada detalle",
    "contact.title1": "Construyamos tu",
    "contact.title2": "legado en concreto.",
    "contact.hero.desc": "Desde Monterrey transformamos espacios industriales y residenciales de alto nivel.",
    "contact.details.title": "Datos de contacto",
    "contact.details.address": "Av. Constitucion, Monterrey, NL, Mexico",
    "contact.form.name": "Nombre",
    "contact.form.email": "Correo electronico",
    "contact.form.message": "Describe tu proyecto...",
    "contact.form.submit": "Enviar solicitud",
    "contact.map.title": "Cobertura en el norte de Mexico",
    "contact.map.subtitle": "Oficina principal: Monterrey, Nuevo Leon",
    "contact.map.sideTitle": "Presencia local. Estandares industriales.",
    "contact.map.sideDesc": "Desplegamos cuadrillas en toda el area metropolitana para proyectos residenciales y comerciales.",
    "contact.footer.desc": "Especialistas en concreto estampado en Monterrey.",
    "contact.footer.explore": "Explorar",
    "contact.footer.residential": "Proyectos residenciales",
    "contact.footer.flooring": "Pisos industriales",
    "contact.footer.contactTitle": "Contacto",
    "contact.footer.city": "Monterrey, NL",
    "contact.footer.copy": "© 2024 BOOTIK Monterrey.",
    "shop.title1": "MATERIALES Y",
    "shop.title2": "MOLDES PROFESIONALES",
    "shop.desc": "Herramientas de grado industrial para acabados arquitectonicos de alta precision.",
    "shop.catalogNote": "El catalogo se carga desde assets/data/products.json (luego Supabase + panel admin).",
    "shop.models.loading": "Cargando modelo...",
    "shop.models.error": "No se pudo cargar este modelo. Comprueba el archivo .glb.",
    "shop.models.compressTip": "Para cargas mas rapidas: reduce poligonos y texturas antes de subir (Blender, gltf-transform o re-export en Meshy).",
    "product.back": "Volver a la tienda",
    "product.loading": "Cargando producto...",
    "product.modelTitle": "Modelo en 3D",
    "product.modelHint": "Arrastra para rotar; en movil puedes pellizcar para acercar o alejar.",
    "product.notFoundTitle": "Producto no encontrado",
    "product.notFoundDesc": "Comprueba el enlace o vuelve al catalogo.",
    "product.ctaTienda": "Ir a la tienda",
    "shop.cta.title": "NECESITAS UN DISENO ESPECIAL?",
    "shop.cta.desc": "Fabricamos moldes personalizados para proyectos comerciales y residenciales.",
    "shop.cta.button": "Hablar con un experto",
    "shop.footer.desc": "Expertos en moldes y herramientas para concreto estampado.",
    "shop.footer.menu": "Menu",
    "shop.footer.contact": "Contacto",
    "shop.footer.address": "Av. Industrias 405, Monterrey, NL",
    "shop.footer.copy": "© 2024 BOOTIK Monterrey.",
    "about.badge": "Nuestra herencia",
    "about.title1": "El arte del",
    "about.title2": "lujo",
    "about.title3": "permanente.",
    "about.hero.desc": "En Monterrey, BOOTIK nace para unir resiliencia y elegancia en concreto arquitectonico.",
    "about.durability.title": "La durabilidad es la estetica definitiva",
    "about.durability.desc": "En BOOTIK creemos que la belleza real debe resistir el tiempo.",
    "about.edge.title": "La ventaja BOOTIK",
    "about.edge.speedTitle": "Precision y rapidez",
    "about.edge.speedDesc": "Flujos optimizados para entregar mas rapido sin perder calidad.",
    "about.edge.mastery": "Anos de maestria",
    "about.edge.materialsTitle": "Materiales premium",
    "about.edge.materialsDesc": "Selladores y pigmentos de alta resistencia.",
    "about.team.title": "El equipo",
    "about.team.desc": "Ingenieros, disenadores y maestros del acabado.",
    "about.footer.copy": "© 2024 BOOTIK Monterrey.",
    "about.footer.explore": "Explorar",
    "about.footer.company": "Empresa",
    "about.footer.contactInfo": "Informacion de contacto",
    "about.footer.location": "Ubicacion: Monterrey",
    "about.footer.whatsapp": "WhatsApp"
  },
  en: {
    "nav.home": "Home",
    "nav.services": "Services",
    "nav.gallery": "Gallery",
    "nav.shop": "Shop",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.quote": "Quote",
    "home.badge": "CONCRETE EXCELLENCE",
    "home.hero.titlePrefix": "We transform spaces with",
    "home.hero.titleAccent": "stamped concrete",
    "home.hero.desc": "Durable industrial art for high-end residential and commercial projects in Monterrey.",
    "home.hero.cta1": "Request quote",
    "home.hero.cta2": "View projects",
    "home.impact.title1": "The impact of",
    "home.impact.title2": "renovation",
    "home.impact.desc": "See how a worn-out surface becomes an architectural centerpiece with BOOTIK.",
    "home.before": "BEFORE",
    "home.after": "AFTER",
    "home.testimonials.title": "What our clients say",
    "home.testimonials.subtitle": "Trust built on exceptional results.",
    "home.cta.title": "Ready to elevate your project?",
    "home.cta.desc": "Book a technical visit and discover the endless possibilities of architectural concrete.",
    "home.cta.button": "Request FREE quote",
    "home.footer.desc": "Leaders in premium stamped concrete and architectural pavements in northern Mexico.",
    "home.footer.services": "Services",
    "home.footer.residential": "Residential",
    "home.footer.commercial": "Commercial",
    "home.footer.company": "Company",
    "home.footer.about": "About",
    "home.footer.contact": "Contact",
    "home.footer.copy": "© 2024 BOOTIK Monterrey. Stamped Concrete Excellence.",
    "services.hero.desc": "We elevate infrastructure with architectural finishes that merge durability and contemporary design.",
    "services.card1.title": "Residential Stamped Concrete",
    "services.card1.desc": "We transform patios, driveways and entrances with premium textures.",
    "services.card2.title": "Custom Design",
    "services.card2.desc": "Exclusive patterns, integrated logos and custom color blends.",
    "services.card3.title": "Commercial Stamped Concrete",
    "services.card3.desc": "High-resistance solutions for malls and public areas.",
    "services.card4.title": "Repair & Maintenance",
    "services.card4.desc": "Professional sealing, color restoration and structural repair.",
    "services.contact": "Contact",
    "services.cta.title": "READY TO START YOUR PROJECT?",
    "services.cta.desc": "Book a technical visit in Monterrey and get a custom quote.",
    "services.cta.primary": "Request Quote",
    "services.cta.secondary": "View Portfolio",
    "gallery.badge": "Excellence in concrete",
    "gallery.title": "GALLERY",
    "gallery.desc": "Explore our portfolio of architectural concrete projects.",
    "gallery.filter": "Filter By",
    "gallery.all": "All Projects",
    "gallery.patios": "Patios",
    "gallery.driveways": "Driveways",
    "gallery.commercial": "Commercial",
    "gallery.overview.desc": "General view of our full portfolio: residential, commercial, and industrial.",
    "gallery.overview.tag1": "Residential",
    "gallery.overview.tag2": "Commercial",
    "gallery.overview.tag3": "Industrial",
    "gallery.cta.title": "READY TO LEAVE YOUR MARK?",
    "gallery.cta.desc": "Schedule a site visit and receive a custom quote for your project.",
    "gallery.cta.primary": "Request Quote",
    "gallery.cta.secondary": "Contact Sales",
    "gallery.footer.desc": "Premium stamped concrete solutions in Monterrey.",
    "gallery.footer.contactInfo": "Contact Info",
    "gallery.footer.navigation": "Navigation",
    "gallery.footer.copy": "© 2024 BOOTIK Monterrey.",
    "contact.badge": "Crafting permanence",
    "contact.title1": "Let's build your",
    "contact.title2": "legacy in concrete.",
    "contact.hero.desc": "From Monterrey, we transform industrial and high-end residential spaces.",
    "contact.details.title": "Contact details",
    "contact.details.address": "Constitucion Ave, Monterrey, NL, Mexico",
    "contact.form.name": "Name",
    "contact.form.email": "Email",
    "contact.form.message": "Describe your project...",
    "contact.form.submit": "Send inquiry",
    "contact.map.title": "Coverage across northern Mexico",
    "contact.map.subtitle": "Main office: Monterrey, Nuevo Leon",
    "contact.map.sideTitle": "Local presence. Industrial standards.",
    "contact.map.sideDesc": "We deploy crews across the metro area for residential and commercial projects.",
    "contact.footer.desc": "Stamped concrete specialists in Monterrey.",
    "contact.footer.explore": "Explore",
    "contact.footer.residential": "Residential projects",
    "contact.footer.flooring": "Industrial flooring",
    "contact.footer.contactTitle": "Contact",
    "contact.footer.city": "Monterrey, NL",
    "contact.footer.copy": "© 2024 BOOTIK Monterrey.",
    "shop.title1": "MATERIALS &",
    "shop.title2": "PROFESSIONAL MOLDS",
    "shop.desc": "Industrial-grade tools for high-precision architectural finishes.",
    "shop.catalogNote": "The catalog loads from assets/data/products.json (later Supabase + admin panel).",
    "shop.models.loading": "Loading model...",
    "shop.models.error": "Could not load this model. Check the .glb file.",
    "shop.models.compressTip": "For faster loads: reduce polygons and texture size before upload (Blender, gltf-transform, or Meshy re-export).",
    "product.back": "Back to shop",
    "product.loading": "Loading product...",
    "product.modelTitle": "3D model",
    "product.modelHint": "Drag to rotate; on mobile pinch to zoom in or out.",
    "product.notFoundTitle": "Product not found",
    "product.notFoundDesc": "Check the link or return to the catalog.",
    "product.ctaTienda": "Go to shop",
    "shop.cta.title": "NEED A CUSTOM DESIGN?",
    "shop.cta.desc": "We manufacture custom molds for commercial and residential projects.",
    "shop.cta.button": "Talk to an expert",
    "shop.footer.desc": "Experts in stamped concrete molds and tools.",
    "shop.footer.menu": "Menu",
    "shop.footer.contact": "Contact",
    "shop.footer.address": "405 Industrias Ave, Monterrey, NL",
    "shop.footer.copy": "© 2024 BOOTIK Monterrey.",
    "about.badge": "Our heritage",
    "about.title1": "The art of",
    "about.title2": "permanent",
    "about.title3": "luxury.",
    "about.hero.desc": "In Monterrey, BOOTIK was born to merge resilience and elegance in architectural concrete.",
    "about.durability.title": "Durability is the ultimate aesthetic",
    "about.durability.desc": "At BOOTIK, we believe true beauty must stand the test of time.",
    "about.edge.title": "The BOOTIK edge",
    "about.edge.speedTitle": "Precision speed",
    "about.edge.speedDesc": "Optimized workflows to deliver faster without compromising quality.",
    "about.edge.mastery": "Years of mastery",
    "about.edge.materialsTitle": "Premium materials",
    "about.edge.materialsDesc": "High-resistance sealers and pigments.",
    "about.team.title": "The team",
    "about.team.desc": "Engineers, designers and finishing masters.",
    "about.footer.copy": "© 2024 BOOTIK Monterrey.",
    "about.footer.explore": "Explore",
    "about.footer.company": "Company",
    "about.footer.contactInfo": "Contact info",
    "about.footer.location": "Location: Monterrey",
    "about.footer.whatsapp": "WhatsApp"
  }
};

const testimonialPools = {
  es: {
    featured: [
      {
        quote: "\"El nivel de detalle en el estampado supero expectativas. Equipo profesional y puntual.\"",
        name: "Ricardo Garza",
        meta: "Residencial San Pedro"
      },
      {
        quote: "\"El patio quedo impecable. Coordinaron con el arquitecto y respetaron cada plazo.\"",
        name: "Carmen Flores",
        meta: "Fracc. Bosques del Valle"
      },
      {
        quote: "\"Calidad de resort en nuestra cochera. El sellado ha aguantado lluvias fuertes sin problema.\"",
        name: "Jorge Cantu",
        meta: "Carretera Nacional"
      },
      {
        quote: "\"Nos asesoraron en textura y color; el resultado supera renders y fotos de referencia.\"",
        name: "Sofia Delgado",
        meta: "Proyecto Citadel"
      },
      {
        quote: "\"Equipo limpio, ordenado y cuidadoso con el jardin. Recomendamos BOOTIK sin dudar.\"",
        name: "Mariana Ruiz",
        meta: "Residencial Chipinque"
      },
      {
        quote: "\"Piso antiderrapante en rampa de estacionamiento: cumplio norma y se ve de lujo.\"",
        name: "Luis Ortega",
        meta: "Edificio corporativo SPGG"
      }
    ],
    dark: [
      {
        quote: "\"Excelente servicio para nuestro local comercial. Acabado premium.\"",
        name: "Monica Villarreal",
        meta: "Boutique Valle"
      },
      {
        quote: "\"Renovamos bodega y zona de carga: resistencia y estetica al mismo tiempo.\"",
        name: "Paola Jimenez",
        meta: "Parque industrial"
      },
      {
        quote: "\"Showroom listo para inauguracion en tiempo record.\"",
        name: "Daniela N.",
        meta: "Retail Forum"
      },
      {
        quote: "\"Mantenimiento anual puntual; el color se ve como el primer dia.\"",
        name: "Ernesto V.",
        meta: "Cadena de cafeterias"
      },
      {
        quote: "\"Logotipo en concreto fresco: precision milimetrica.\"",
        name: "Ivan Mendoza",
        meta: "Agencia creativa MTY"
      }
    ],
    warm: [
      {
        quote: "\"La mejor inversion para el area de alberca. Antiderrapante y fresco.\"",
        name: "Alejandro Trevino",
        meta: "Residencial privado"
      },
      {
        quote: "\"Alberca y deck integrados; textura comoda bajo el sol.\"",
        name: "Familia Gutierrez",
        meta: "Club residencial"
      },
      {
        quote: "\"Cancelamos ceramica por estampado: menos juntas, mas higiene en bar.\"",
        name: "Alberto F.",
        meta: "Skybar zona Tec"
      },
      {
        quote: "\"Escalones exteriores seguros para abuelos y ninos.\"",
        name: "Lucia Paredes",
        meta: "Jardines de la Loma"
      },
      {
        quote: "\"Area asador con acabado que no se calienta igual que loseta.\"",
        name: "Hector Gamez",
        meta: "Quinta Allende"
      }
    ]
  },
  en: {
    featured: [
      {
        quote: "\"The stamping detail exceeded expectations. Professional, punctual crew.\"",
        name: "Ricardo Garza",
        meta: "San Pedro Residential"
      },
      {
        quote: "\"Our patio looks flawless. They coordinated with the architect and hit every deadline.\"",
        name: "Carmen Flores",
        meta: "Bosques del Valle"
      },
      {
        quote: "\"Driveway quality like a resort. Sealing has held up through heavy rain.\"",
        name: "Jorge Cantu",
        meta: "Carretera Nacional"
      },
      {
        quote: "\"They guided us on texture and color; the result beats renders and reference photos.\"",
        name: "Sofia Delgado",
        meta: "Citadel project"
      },
      {
        quote: "\"Clean, tidy team that respected the garden. We recommend BOOTIK without hesitation.\"",
        name: "Mariana Ruiz",
        meta: "Chipinque residential"
      },
      {
        quote: "\"Non-slip ramp in the parking garage: code-compliant and still looks premium.\"",
        name: "Luis Ortega",
        meta: "Corporate tower SPGG"
      }
    ],
    dark: [
      {
        quote: "\"Excellent service for our retail space. Premium finish.\"",
        name: "Monica Villarreal",
        meta: "Valle boutique"
      },
      {
        quote: "\"We refreshed the warehouse and loading zone: durability and aesthetics together.\"",
        name: "Paola Jimenez",
        meta: "Industrial park"
      },
      {
        quote: "\"Showroom ready to open on a tight timeline.\"",
        name: "Daniela N.",
        meta: "Retail forum"
      },
      {
        quote: "\"Annual maintenance on schedule; color still looks day-one fresh.\"",
        name: "Ernesto V.",
        meta: "Coffee chain"
      },
      {
        quote: "\"Logo embedded in fresh concrete: millimeter precision.\"",
        name: "Ivan Mendoza",
        meta: "Creative agency MTY"
      }
    ],
    warm: [
      {
        quote: "\"Best investment for our pool deck: slip-resistant and cool underfoot.\"",
        name: "Alejandro Trevino",
        meta: "Private residence"
      },
      {
        quote: "\"Pool and deck feel integrated; comfortable texture in the sun.\"",
        name: "Gutierrez family",
        meta: "Country club residential"
      },
      {
        quote: "\"We skipped tile for stamped concrete: fewer joints, easier bar hygiene.\"",
        name: "Alberto F.",
        meta: "Skybar Tec area"
      },
      {
        quote: "\"Exterior steps feel safe for grandparents and kids.\"",
        name: "Lucia Paredes",
        meta: "Jardines de la Loma"
      },
      {
        quote: "\"Outdoor grill area that does not heat up like pavers did.\"",
        name: "Hector Gamez",
        meta: "Quinta Allende"
      }
    ]
  }
};

const testimonialRotatorCleanups = [];

function shuffleIndices(length) {
  const order = Array.from({ length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

function nextRoundOrder(poolLength, lastPoolIndex) {
  let order = shuffleIndices(poolLength);
  if (poolLength > 1 && typeof lastPoolIndex === "number" && order[0] === lastPoolIndex) {
    const swapIdx = order.findIndex((idx, i) => i > 0 && idx !== lastPoolIndex);
    if (swapIdx > 0) {
      [order[0], order[swapIdx]] = [order[swapIdx], order[0]];
    }
  }
  return order;
}

function clearTestimonialRotators() {
  testimonialRotatorCleanups.forEach((fn) => fn());
  testimonialRotatorCleanups.length = 0;
}

function bindTestimonialRotator(slotEl, pool, periodMs, phaseMs) {
  const anim = slotEl.querySelector("[data-testimonial-anim]");
  const quoteEl = slotEl.querySelector("[data-testimonial-quote]");
  const nameEl = slotEl.querySelector("[data-testimonial-name]");
  const metaEl = slotEl.querySelector("[data-testimonial-meta]");
  if (!anim || !quoteEl || !nameEl || !metaEl || !pool?.length) {
    return;
  }

  let order = nextRoundOrder(pool.length);
  let pos = 0;

  function renderItem(poolIndex) {
    const item = pool[poolIndex];
    quoteEl.textContent = item.quote;
    nameEl.textContent = item.name;
    metaEl.textContent = item.meta || "";
  }

  function advance() {
    anim.classList.add("is-exiting");
    window.setTimeout(() => {
      const lastPoolIndex = order[pos];
      pos += 1;
      if (pos >= order.length) {
        order = nextRoundOrder(pool.length, lastPoolIndex);
        pos = 0;
      }
      renderItem(order[pos]);
      anim.classList.remove("is-exiting");
    }, 450);
  }

  renderItem(order[pos]);

  const phase = typeof phaseMs === "number" ? phaseMs : 0;
  const firstTimer = window.setTimeout(() => {
    advance();
    const intervalId = window.setInterval(advance, periodMs);
    testimonialRotatorCleanups.push(() => window.clearInterval(intervalId));
  }, phase + periodMs);

  testimonialRotatorCleanups.push(() => window.clearTimeout(firstTimer));
}

function initTestimonialRotators() {
  clearTestimonialRotators();
  const lang = document.documentElement.lang === "en" ? "en" : "es";
  const pools = testimonialPools[lang];
  if (!pools) {
    return;
  }
  const featured = document.querySelector('[data-testimonial-slot="featured"]');
  const dark = document.querySelector('[data-testimonial-slot="dark"]');
  const warm = document.querySelector('[data-testimonial-slot="warm"]');
  if (featured) {
    bindTestimonialRotator(featured, pools.featured, 6800, 0);
  }
  if (dark) {
    bindTestimonialRotator(dark, pools.dark, 7200, 2400);
  }
  if (warm) {
    bindTestimonialRotator(warm, pools.warm, 7600, 4800);
  }
}

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    mobileMenu.classList.toggle("hidden");
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.add("hidden");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function applyLanguage(lang) {
  const safeLang = lang === "en" ? "en" : "es";
  document.documentElement.lang = safeLang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const text = labels[safeLang][key];
    if (text) {
      el.textContent = text;
    }
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    const text = labels[safeLang][key];
    if (text) {
      el.setAttribute("placeholder", text);
    }
  });
  if (langToggle) {
    langToggle.textContent = safeLang === "es" ? "EN" : "ES";
  }
  document.dispatchEvent(new CustomEvent("bootik-lang", { detail: { lang: safeLang } }));
}

const savedLanguage = localStorage.getItem(LANG_KEY) || "es";
applyLanguage(savedLanguage);
initTestimonialRotators();

if (langToggle) {
  langToggle.addEventListener("click", () => {
    const current = document.documentElement.lang === "en" ? "en" : "es";
    const next = current === "es" ? "en" : "es";
    localStorage.setItem(LANG_KEY, next);
    applyLanguage(next);
    initTestimonialRotators();
  });
}
