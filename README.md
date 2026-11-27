# Concretos Estampados BOOTIK — sitio v2 (tienda + admin)

- `public/` — sitio estático (lo sirve nginx). Páginas: inicio, galería, tienda, carrito, pedido, contacto, y `/admin/`.
- `server/` — API en Node 20+ sin dependencias: admin (login, productos, galería, textos, pedidos, subida de fotos) y checkout con Mercado Pago (Checkout Pro).
- `data/` — (no va en git) contenido editable, pedidos, hash de la contraseña y fotos subidas. En el servidor: `/var/lib/bootik`.
- `tools/build_pages.py` — regenera los HTML públicos (encabezado/pie compartidos).

## Local
```bash
npm run set-password          # crea usuario y contraseña del admin (entrada oculta; guarda solo el hash)
PORT=8796 npm start           # http://localhost:8796  y  http://localhost:8796/admin/
```
Sin `MP_ACCESS_TOKEN` la tienda trabaja en **modo demo**: registra el pedido y no cobra.

## Mercado Pago
Variables en `server/.env` (copiar de `server/.env.example`): `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`.
Flujo: carrito → `POST /api/checkout` (el servidor recalcula precios desde `products`) → preferencia de Checkout Pro → el cliente paga en Mercado Pago → regresa a `/pedido.html` → webhook `/api/mp/webhook` consulta el pago y marca el pedido como pagado.

Ver `deploy/DEPLOY.md` para subirlo al VPS.
