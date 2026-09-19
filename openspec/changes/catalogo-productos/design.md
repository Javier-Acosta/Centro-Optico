# Design

## Context

La app actual conserva la plantilla inicial de Next.js 16.3.5 con React 19 y TypeScript. PocketBase ya quedo elegido como backend, el SDK oficial `pocketbase` esta instalado y el MCP local `mcp-tienda-cata` verifica conexion mediante `C:/Proyectos/tienda-cata/.env.local`. Ver proposal.md para la motivacion y specs/ para los contratos observables. El flujo de cobro automatico con Mercado Pago se reemplaza en este MVP por contacto directo por WhatsApp para simplificar la operacion inicial.

## Goals / Non-Goals

**Goals:** mantener una sola aplicacion Next.js con PocketBase como persistencia, acceso del vendedor desde telefono y un flujo de compra pequeno que guarde el pedido y abra WhatsApp al vendedor.

**Non-Goals:** microservicios, cuentas de clientes, motor de promociones, calculo de envios, gestion automatica de inventario y cobros online en esta primera version.

## Decisions

1. Conservar App Router y ejecutar operaciones de escritura desde servidor. Leer la documentacion local de Next.js antes de implementar. Una API separada agregaria despliegues innecesarios.
2. Usar PocketBase como fuente de verdad para productos, imagenes, pedidos y datos administrativos. No usar SQLite propio ni almacenamiento efimero de archivos en Next.js. La app Next.js se conecta con el SDK oficial `pocketbase` usando variables de `.env.local` y sin exponer credenciales al navegador.
3. Colecciones propuestas: `products`, `orders`, `order_items` y, si hace falta separar acceso del vendedor de `_superusers`, `seller_sessions` o una coleccion auth especifica. `products` contiene nombre, descripcion opcional, precio en unidades menores, moneda, estado publicado y archivo de imagen. `orders` guarda email de contacto, token publico no predecible, estado, total, moneda y snapshots.
4. Guardar importes en unidades menores enteras, moneda explicita y snapshots de los articulos en el pedido. Propuesta inicial de moneda: ARS. Despublicar productos sin eliminar referencias historicas.
5. Autenticacion: el vendedor entra por una ruta privada de la app. El servidor valida la sesion antes de modificar PocketBase. Las credenciales de superusuario PocketBase quedan solo en servidor para operaciones administrativas necesarias; no se envian al cliente. Sin registro publico de vendedores. Verificar autorizacion en cada operacion, no solo en la pagina.
6. Formulario administrativo pensado primero para telefono: control de imagen compatible con camara y galeria, vista previa, campo de precio visible y accion clara para publicar. La descripcion puede ser opcional para que la carga diaria sea rapida.
7. Validar contenido real, tamanos y formatos de imagen antes o durante la carga a PocketBase; aceptar JPEG, PNG y WebP hasta 5 MiB segun specs. Guardar referencias solo despues de una carga exitosa y evitar productos publicados con imagen rota.
8. Carrito local con identificadores y cantidades. El cliente agrega productos desde el catalogo y el servidor recalcula precios consultando PocketBase al confirmar. Si cambian precio o publicacion, devuelve el carrito actualizado para que el comprador lo revise.
9. Al confirmar el carrito, crear primero el pedido pendiente en PocketBase y luego abrir WhatsApp con un mensaje prearmado al numero del vendedor. El mensaje incluye referencia del pedido, productos, cantidades, total y email de contacto. El pedido no se marca como pagado automaticamente.
10. Consulta del comprador mediante token aleatorio no predecible, sin exponer otros pedidos; lista de pedidos solo para vendedor. No incluir credenciales ni datos sensibles en logs.
11. Usar el MCP local `mcp-tienda-cata` para inspeccionar colecciones y registros durante desarrollo, sin depender de el en runtime de la app.

## Risks / Trade-offs

- PocketBase simplifica datos y archivos, pero concentra la operacion en una instancia externa -> configurar backups y revisar reglas API antes de produccion.
- Usar credenciales de superusuario desde servidor facilita el MVP, pero exige aislarlas en `.env.local`/entorno productivo y nunca exponerlas al cliente.
- Sin control de stock puede venderse mas de lo disponible -> advertirlo en la configuracion operativa y definir inventario en otro cambio si los productos tienen unidades limitadas.
- WhatsApp simplifica ventas iniciales, pero el pago queda manual -> el vendedor debe confirmar pago y entrega fuera del sistema hasta implementar estados administrativos.
- Si WhatsApp no abre en el dispositivo del comprador, el pedido ya queda creado y el comprador conserva el enlace privado del pedido.

## Migration Plan

1. Crear o verificar colecciones PocketBase con campos, reglas y archivos necesarios; probar con datos de prueba mediante el MCP local y el SDK oficial.
2. Implementar y probar el flujo vendedor-producto-carrito-WhatsApp.
3. Configurar backups de PocketBase, dominio HTTPS, administrador/vendedor y reglas API.
4. Antes de operar con ventas reales, confirmar moneda, modalidad de entrega y proceso manual de pago con el propietario. Si requiere tarifas, direccion de envio, estados de pago o stock, ampliar las specs en otro cambio.
5. Para rollback, deshabilitar nuevos pedidos, conservar pedidos e imagenes en PocketBase y volver a una version anterior sin borrar datos.

## References

- SDK oficial de PocketBase: https://github.com/pocketbase/js-sdk
- API de registros PocketBase: https://pocketbase.io/docs/api-records/
- Autenticacion PocketBase: https://pocketbase.io/docs/authentication/
- Enlaces Click to Chat de WhatsApp: https://faq.whatsapp.com/5913398998672934
