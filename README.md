# BOOTIK - Landing Page

Sitio web estatico para BOOTIK, enfocado en servicios de concreto estampado en Monterrey.

## Estructura

```text
BOOTIK/
  index.html
  assets/
    css/
      main.css
    js/
      tailwind.config.js
      main.js
```

## Desarrollo local

1. Abrir `index.html` directamente en navegador, o
2. Levantar un servidor estatico (recomendado para pruebas):

```bash
python -m http.server 5500
```

Luego entrar a `http://localhost:5500`.

## Antes de publicar

- Reemplazar los numeros de WhatsApp en `index.html`.
- Configurar dominio/canonical y metadatos sociales si se requiere.
- Comprimir imagenes (si se migran a archivos locales).
- Publicar en Netlify, Vercel o servidor estatico equivalente.
