# Proposal

## Why

Tienda Cata necesita una app sencilla para que un vendedor publique productos desde el telefono, usando la camara o una imagen guardada, agregue el precio y deje el producto visible para la venta. El cliente debe poder elegir productos publicados, agregarlos al carrito y pagar con Mercado Pago.

## What Changes

- Confirmado: carga de imagenes desde telefono por el vendedor, precio del producto, publicacion, carrito y pago con Mercado Pago.
- Propuesto para el MVP: acceso privado del vendedor; productos con nombre, descripcion opcional, precio e imagen; catalogo publico; compra como invitado; registro de pedidos y estado de pago.
- La integracion de envios, cuentas de clientes, promociones y control de stock quedan fuera de esta primera propuesta. La modalidad de entrega se definira antes de habilitar ventas reales.
- Los detalles de alojamiento y credenciales se configuraran durante la implementacion; este cambio documenta el plan, no activa cobros.

## Capabilities

### New Capabilities

- `administracion-productos`: acceso del vendedor y publicacion persistente de productos con imagenes cargadas desde telefono.
- `catalogo-carrito`: consulta publica, eleccion de productos publicados y agregado al carrito.
- `pedidos-pagos`: registro de pedidos y confirmacion verificable de pagos con Mercado Pago.

### Modified Capabilities

Ninguna: el proyecto todavia conserva la pantalla inicial de Next.js.

## Impact

Afectara las rutas de catalogo, administracion, carrito, checkout y notificaciones. Requiere persistencia de productos y pedidos, almacenamiento de imagenes, autenticacion administrativa y credenciales de Mercado Pago solo en servidor. Se conservara la base Next.js, React y TypeScript existente.
