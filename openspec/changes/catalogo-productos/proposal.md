# Proposal

## Why

Tienda Cata necesita una app sencilla para que un vendedor publique productos desde el telefono, usando la camara o una imagen guardada, agregue el precio y deje el producto visible para la venta. El cliente debe poder elegir productos publicados, agregarlos al carrito y enviar el pedido por WhatsApp al vendedor para coordinar pago y entrega. La persistencia elegida ahora es PocketBase, ya conectado localmente mediante `.env.local` y el MCP `mcp-tienda-cata`.

## What Changes

- Confirmado: carga de imagenes desde telefono por el vendedor, precio del producto, publicacion, carrito y envio del pedido por WhatsApp.
- Confirmado: usar PocketBase como backend de datos y archivos para productos, imagenes, pedidos y datos administrativos.
- Propuesto para el MVP: acceso privado del vendedor; productos con nombre, descripcion opcional, precio e imagen; catalogo publico; compra como invitado; registro de pedidos y contacto por WhatsApp.
- La integracion de envios, cuentas de clientes, promociones, control de stock y cobros automaticos quedan fuera de esta primera propuesta. La modalidad de pago y entrega se coordina manualmente por WhatsApp.
- Los detalles de credenciales se cargan en `.env.local`; este cambio no activa cobros online.

## Capabilities

### New Capabilities

- `administracion-productos`: acceso del vendedor y publicacion persistente de productos con imagenes cargadas desde telefono y almacenadas en PocketBase.
- `catalogo-carrito`: consulta publica, eleccion de productos publicados y agregado al carrito.
- `pedidos-pagos`: registro de pedidos en PocketBase y contacto por WhatsApp para coordinar pago y entrega.

### Modified Capabilities

Ninguna: el proyecto todavia conserva la pantalla inicial de Next.js.

## Impact

Afectara las rutas de catalogo, administracion, carrito y consulta de pedidos. Requiere colecciones PocketBase para productos, pedidos y acceso administrativo; almacenamiento de imagenes en PocketBase; credenciales de PocketBase solo en servidor. Se conservara la base Next.js, React y TypeScript existente.
