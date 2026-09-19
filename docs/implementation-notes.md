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
- Implementado: creacion real de pedidos pendientes y envio del resumen por WhatsApp.

## Despliegue en Dokploy

El proyecto incluye un `Dockerfile` de producción para Next.js con salida `standalone`. En Dokploy conviene usar despliegue por Dockerfile y configurar el puerto interno `3000`.

Variables de entorno requeridas en Dokploy:

- `POCKETBASE_URL`
- `POCKETBASE_SUPERUSER_EMAIL`
- `POCKETBASE_SUPERUSER_PASSWORD`
- `SELLER_SESSION_SECRET`
- `NEXT_PUBLIC_APP_URL`

El archivo `.env.local` queda fuera de la imagen Docker mediante `.dockerignore`; las credenciales deben cargarse en Dokploy como variables de entorno.

## WhatsApp para pedidos

El MVP usa WhatsApp para simplificar la venta. Al confirmar el carrito, el servidor crea el pedido pendiente en PocketBase, recalcula precios vigentes y redirige a WhatsApp con un mensaje que incluye productos, cantidades, total, email y referencia del pedido.

Variable opcional:

- `SELLER_WHATSAPP_NUMBER`: numero internacional del vendedor sin `+`, espacios ni guiones. Valor actual por defecto: `5493834523879`.

No hay cobros automaticos en esta etapa. El pago y la entrega se coordinan manualmente por WhatsApp.


## Acceso del vendedor

El panel `/admin` puede usar credenciales simples de vendedor configuradas por variables de entorno, separadas del superusuario de PocketBase:

- `SELLER_EMAIL`
- `SELLER_PASSWORD`

Si esas variables no existen, el login conserva el fallback al superusuario de PocketBase.
