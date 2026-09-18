# Implementacion inicial

APIs elegidas despues de leer la documentacion local de Next.js 16.3.5 indicada en `AGENTS.md`:

- App Router con `app/page.tsx`, `app/admin/page.tsx` y `app/admin/productos/page.tsx`.
- Server Functions/Actions para login, logout, publicacion y despublicacion de productos.
- `cookies()` asincrono de `next/headers` para la sesion HttpOnly del vendedor.
- `headers()` para verificar origen en mutaciones del vendedor.
- Componentes cliente solo para estado interactivo local: carrito y formularios con `useActionState`.
- SDK oficial `pocketbase` solo en helpers de servidor para credenciales administrativas; el catalogo publico consulta registros publicados sin credenciales.
- Script `scripts/setup-pocketbase.mjs` para crear/verificar colecciones PocketBase de forma idempotente.

Estado de alcance:

- Implementado: colecciones PocketBase base, login vendedor, carga de productos con imagen validada, catalogo publico y carrito local.
- Pendiente: creacion real de pedidos, Mercado Pago, webhook y reconciliacion.

## Despliegue en Dokploy

El proyecto incluye un `Dockerfile` de producción para Next.js con salida `standalone`. En Dokploy conviene usar despliegue por Dockerfile y configurar el puerto interno `3000`.

Variables de entorno requeridas en Dokploy:

- `POCKETBASE_URL`
- `POCKETBASE_SUPERUSER_EMAIL`
- `POCKETBASE_SUPERUSER_PASSWORD`
- `SELLER_SESSION_SECRET`
- `NEXT_PUBLIC_APP_URL`

El archivo `.env.local` queda fuera de la imagen Docker mediante `.dockerignore`; las credenciales deben cargarse en Dokploy como variables de entorno.
