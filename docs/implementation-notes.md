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
- `NEXT_PUBLIC_APP_URL`

El archivo `.env.local` queda fuera de la imagen Docker mediante `.dockerignore`; las credenciales deben cargarse en Dokploy como variables de entorno.

## WhatsApp para pedidos

El MVP usa WhatsApp para simplificar la venta. Al confirmar el carrito, el servidor crea el pedido pendiente en PocketBase, recalcula precios vigentes y redirige a WhatsApp con un mensaje que incluye productos, cantidades, total, email y referencia del pedido.

Variable opcional:

- `SELLER_WHATSAPP_NUMBER`: numero internacional del vendedor sin `+`, espacios ni guiones. Valor actual por defecto: `5493834523879`.

No hay cobros automaticos en esta etapa. El pago y la entrega se coordinan manualmente por WhatsApp.


## Acceso del vendedor

El panel /admin autentica email y contrasena contra la coleccion de autenticacion `sellers` de PocketBase. No usa credenciales de vendedor en variables de entorno ni permite iniciar sesion con el superusuario.

Preparacion inicial: ejecutar `node scripts/setup-sellers.mjs` con las variables de PocketBase configuradas. El script es idempotente y no cambia contrasenas existentes. Para migrar una unica vez las antiguas variables locales SELLER_EMAIL y SELLER_PASSWORD, usar `node scripts/setup-sellers.mjs --migrate-local-seller` y luego eliminar esas dos variables.

Para crear vendedores:

1. Entrar al panel de administracion de PocketBase (ruta /_/) con la cuenta de superusuario.
2. Abrir Collections > sellers > New record.
3. Completar email, password y passwordConfirm; name es opcional.
4. Guardar y entrar a /admin de la tienda con esa cuenta.

El vendedor con rol admin puede gestionar ayudantes desde /admin/usuarios: crear cuentas, cambiar contrasenas y activar o desactivar accesos. Las cuentas nuevas reciben siempre el rol assistant y pueden trabajar con el catalogo y los pedidos existentes. No pueden gestionar usuarios. El administrador de PocketBase conserva la gestion completa de cuentas.

La tienda guarda el token de PocketBase en una cookie HttpOnly, SameSite=Lax y Secure en produccion, con duracion maxima de ocho horas. Cada comprobacion de acceso valida el token con PocketBase. Eliminar la cuenta o cambiar su contrasena invalida el token anterior. Las sesiones anteriores al cambio dejan de ser validas.

Despliegue: publicar el codigo actualizado en Dokploy. Mantener POCKETBASE_URL, POCKETBASE_SUPERUSER_EMAIL y POCKETBASE_SUPERUSER_PASSWORD para las operaciones de servidor existentes, y NEXT_PUBLIC_APP_URL con la URL publica. SELLER_EMAIL, SELLER_PASSWORD y SELLER_SESSION_SECRET ya no se utilizan y pueden eliminarse de Dokploy. El archivo .env.local no se incluye en Docker.

## Roles y ayudantes de ventas

Despues de preparar sellers, ejecutar `node scripts/setup-seller-roles.mjs correo-del-administrador` para asignar el administrador inicial y configurar los campos role y disabled. La migracion conserva contrasenas y es idempotente. Las cuentas existentes sin rol pasan a assistant, salvo el administrador indicado. No se habilita registro publico ni acceso directo a la gestion de cuentas desde PocketBase para vendedores.

En el panel, el administrador vera Usuarios de ventas. Puede crear ayudantes con nombre, email y contrasena de 12 a 72 caracteres, cambiar sus contrasenas y desactivar o reactivar su acceso. Ninguna accion de esta pantalla permite modificar administradores ni elevar un ayudante a administrador. Desactivar una cuenta invalida el acceso en la siguiente comprobacion de sesion.

Prueba de integracion: configurar TEST_ADMIN_EMAIL y TEST_ADMIN_PASSWORD, opcionalmente TEST_APP_URL (por defecto http://localhost:3000), y ejecutar `node scripts/test-seller-roles.mjs`. Usa las variables de PocketBase para verificar resultados y crea un ayudante temporal que elimina al finalizar. Comprueba permisos, intentos de elevacion de rol, bloqueo, reactivacion y cambio de contrasena.
