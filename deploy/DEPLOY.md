# Deploy propuesto (NO ejecutado; requiere aprobación de Sergio)

VPS 144.202.72.150 (nginx 1.18 + pm2 + Node 22). Hoy concretosestampados.com es 100 % estático:
`root /var/www/concretosestampados.com/current`. Otros sitios en pm2: archstack, archstack-chatbot-staging, somnus, thriveformative.
Puerto propuesto para la API: **127.0.0.1:3071** (libre al 27-nov-2026; verificar con `ss -ltnp | grep 3071`).

1. Respaldo: `cp -a /var/www/concretosestampados.com/current /var/www/concretosestampados.com/backup-$(date +%Y%m%d-%H%M)`
2. Subir `public/` a una carpeta nueva `/var/www/concretosestampados.com/v2/` y luego cambiar `current` (o copiar encima tras el respaldo).
3. API: copiar `server/`, `package.json`, `public/assets/data/*.json` (semillas) a `/opt/bootik-api/` (mantener `public/assets/data` dentro o apuntar `PUBLIC_DIR`).
   `mkdir -p /var/lib/bootik/uploads && chmod 700 /var/lib/bootik`
   `cp server/.env.example server/.env` y llenar (sin token de MP = modo demo).
   `DATA_DIR=/var/lib/bootik node server/set-password.mjs`  ← lo corre Sergio o su papá; la contraseña no pasa por el chat.
   `pm2 start deploy/ecosystem.config.cjs && pm2 save`   (solo agrega un proceso; no reinicia los demás)
4. nginx: pegar `deploy/nginx-concretosestampados.snippet.conf` en el bloque 443, `nginx -t` y `systemctl reload nginx` (reload, no restart; no tumba los otros sitios).
5. Probar: `curl https://concretosestampados.com/api/health`, entrar a `/admin/`, hacer un pedido demo.
6. Mercado Pago: poner token de prueba → compra de prueba → luego token de producción. Configurar webhook en el panel de MP: `https://concretosestampados.com/api/mp/webhook` (evento Pagos) y copiar la "clave secreta" a `MP_WEBHOOK_SECRET`.

Rollback: regresar `current` al respaldo, quitar el snippet de nginx y `pm2 delete bootik-api`.
