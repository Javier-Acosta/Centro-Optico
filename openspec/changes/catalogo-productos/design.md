# Design

## Context

La app actual conserva la plantilla inicial de Next.js 16.3.5 con React 19 y TypeScript. No existen modelos de negocio ni pantallas propias. PocketBase ya quedo elegido como backend, el SDK oficial `pocketbase` esta instalado y el MCP local `mcp-tienda-cata` verifica conexion mediante `C:/Proyectos/tienda-cata/.env.local`. Ver proposal.md para la motivacion y specs/ para los contratos observables.

## Goals / Non-Goals

**Goals:** mantener una sola aplicacion Next.js con PocketBase como persistencia, acceso del vendedor desde telefono y un flujo de compra pequeno y verificable.

**Non-Goals:** microservicios, cuentas de clientes, motor de promociones, calculo de envios y gestion automatica de inventario en esta primera version.

## Decisions

1. Conservar App Router y ejecutar operaciones de escritura y pagos desde servidor. Leer la documentacion local de Next.js antes de implementar. Una API separada agregaria despliegues innecesarios.
2. Usar PocketBase como fuente de verdad para productos, imagenes, pedidos, intentos de pago y datos administrativos. No usar SQLite propio ni almacenamiento efimero de archivos en Next.js. La app Next.js se conecta con el SDK oficial `pocketbase` usando variables de `.env.local` y sin exponer credenciales al navegador.
3. Colecciones propuestas: `products`, `orders`, `order_items`, `payment_attempts` y, si hace falta separar acceso del vendedor de `_superusers`, `seller_sessions` o una coleccion auth especifica. `products` contiene nombre, descripcion opcional, precio en unidades menores, moneda, estado publicado y archivo de imagen. `orders` guarda email de contacto, token publico no predecible, estado, total, moneda y snapshots. `payment_attempts` registra proveedor, referencia externa, estado e identificadores de Mercado Pago.
4. Guardar importes en unidades menores enteras, moneda explicita y snapshots de los articulos en el pedido. Propuesta inicial de moneda: ARS, configurable antes de operar. Despublicar productos sin eliminar referencias historicas.
5. Autenticacion: el vendedor entra por una ruta privada de la app. El servidor valida la sesion antes de modificar PocketBase. Las credenciales de superusuario PocketBase quedan solo en servidor para operaciones administrativas necesarias; no se envian al cliente. Sin registro publico de vendedores. Verificar autorizacion en cada operacion, no solo en la pagina.
6. Formulario administrativo pensado primero para telefono: control de imagen compatible con camara y galeria, vista previa, campo de precio visible y accion clara para publicar. La descripcion puede ser opcional para que la carga diaria sea rapida.
7. Validar contenido real, tamanos y formatos de imagen antes o durante la carga a PocketBase; aceptar JPEG, PNG y WebP hasta 5 MiB segun specs. Guardar referencias solo despues de una carga exitosa y evitar productos publicados con imagen rota.
8. Carrito local con identificadores y cantidades. El cliente agrega productos desde el catalogo y el servidor recalcula precios consultando PocketBase al checkout. Si cambian precio o publicacion, devuelve el carrito actualizado para que el comprador lo revise.
9. Proponer Checkout Pro para delegar el formulario de cobro a Mercado Pago y regresar a la tienda. El carrito y los pedidos pertenecen a la app; no se almacenan datos de tarjeta. Checkout embebido se descarta inicialmente por mayor complejidad. Crear el pedido primero en PocketBase, asignar una referencia externa estable y reutilizarlo frente a reintentos del mismo checkout.
10. Endpoint HTTPS de webhook con verificacion de firma segun la documentacion vigente. Consultar el pago por API y verificar referencia, cuenta receptora, total y moneda antes de actualizar PocketBase. Identificadores unicos de pago y procesamiento idempotente. No confiar en parametros de retorno. En eventos fuera de orden consultar el estado actual; conservar informacion de reembolsos o contracargos sin confundirlos con pagos pendientes. Reintentar errores transitorios y ofrecer reconciliacion de pedidos pendientes.
11. Consulta del comprador mediante token aleatorio no predecible, sin exponer otros pedidos; lista de pedidos solo para vendedor. No incluir credenciales ni datos sensibles en logs.
12. Usar el MCP local `mcp-tienda-cata` para inspeccionar colecciones y registros durante desarrollo, sin depender de el en runtime de la app.

## Risks / Trade-offs

- PocketBase simplifica datos y archivos, pero concentra la operacion en una instancia externa -> configurar backups y revisar reglas API antes de produccion.
- Usar credenciales de superusuario desde servidor facilita el MVP, pero exige aislarlas en `.env.local`/entorno productivo y nunca exponerlas al cliente.
- Sin control de stock puede venderse mas de lo disponible -> advertirlo en la configuracion operativa y definir inventario en otro cambio si los productos tienen unidades limitadas.
- Notificaciones retrasadas -> mostrar pendiente y reconciliar mediante API; nunca deducir aprobacion desde el navegador.
- Checkout Pro sale temporalmente de la tienda -> explicar la redireccion en el boton de pago y devolver al cliente al estado del pedido.

## Migration Plan

1. Crear o verificar colecciones PocketBase con campos, reglas y archivos necesarios; probar con datos de prueba mediante el MCP local y el SDK oficial.
2. Implementar y probar con credenciales de prueba; documentar variables sin secretos para PocketBase y Mercado Pago.
3. Configurar backups de PocketBase, dominio HTTPS, administrador/vendedor, reglas API y webhook.
4. Antes de cobrar en produccion, confirmar moneda y modalidad de entrega con el propietario y publicar sus condiciones. Si requiere tarifas o direccion de envio, ampliar las specs antes de habilitar pagos reales.
5. Validar el circuito de pago con credenciales de prueba. Activar credenciales productivas solo cuando el entorno y las condiciones comerciales esten configurados.
6. Para rollback, deshabilitar nuevos checkouts, conservar pedidos e imagenes en PocketBase y mantener la reconciliacion de pagos iniciados. No borrar datos al volver a una version anterior.

## References

- SDK oficial de PocketBase: https://github.com/pocketbase/js-sdk
- API de registros PocketBase: https://pocketbase.io/docs/api-records/
- Autenticacion PocketBase: https://pocketbase.io/docs/authentication/
- SDK oficial y Checkout Pro Mercado Pago: https://github.com/mercadopago/sdk-js
- Notificaciones y autenticidad Mercado Pago: https://www.mercadopago.com.ar/developers/en/docs/checkout-pro-preferences/payment-notifications
