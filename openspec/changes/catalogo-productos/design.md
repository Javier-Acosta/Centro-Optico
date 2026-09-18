# Design

## Context

La app actual conserva la plantilla inicial de Next.js 16.3.5 con React 19 y TypeScript. No existen modelos de negocio, autenticacion ni almacenamiento. Ver proposal.md para la motivacion y specs/ para los contratos observables.

## Goals / Non-Goals

**Goals:** mantener una sola aplicacion Next.js con persistencia en servidor, acceso del vendedor desde telefono y un flujo de compra pequeno y verificable.

**Non-Goals:** microservicios, cuentas de clientes, motor de promociones, calculo de envios y gestion automatica de inventario en esta primera version.

## Decisions

1. Conservar App Router y ejecutar operaciones de escritura y pagos en servidor. Leer la documentacion local de Next.js antes de implementar. Una API separada agregaria despliegues innecesarios.
2. Proponer SQLite y un directorio persistente fuera de public/ para imagenes, en una sola instancia Node con volumen persistente. Es una base sencilla; no usar almacenamiento efimero ni localStorage como fuente de verdad. Si el alojamiento elegido exige multiples instancias o serverless, revisar este diseno hacia base de datos y almacenamiento de objetos gestionados antes de desplegar.
3. Modelo: Product, ProductImage, Order, OrderItem, PaymentAttempt y AdminSession. Guardar importes en unidades menores enteras, moneda explicita y snapshots de los articulos en el pedido. Propuesta inicial de moneda: ARS, configurable antes de operar. Despublicar productos sin eliminar referencias historicas.
4. Un vendedor configurado en servidor, contrasena con hash resistente y sesiones opacas persistidas, cookies HttpOnly/Secure/SameSite, vencimiento y control de origen en escrituras. Sin registro publico de vendedores. Verificar autorizacion en cada operacion, no solo en la pagina.
5. Formulario administrativo pensado primero para telefono: control de imagen compatible con camara y galeria, vista previa, campo de precio visible y accion clara para publicar. La descripcion puede ser opcional para que la carga diaria sea rapida.
6. Validar contenido real, tamanos y dimensiones de imagenes; generar nombres aleatorios y servir solo formatos admitidos. No ejecutar ni conservar nombres de archivo suministrados como rutas. Guardar referencias solo despues de una carga exitosa y limpiar archivos huerfanos.
7. Carrito local con identificadores y cantidades. El cliente agrega productos desde el catalogo y el servidor recalcula precios y valida disponibilidad al checkout. Si cambian, devuelve el carrito actualizado para que el comprador lo revise.
8. Proponer Checkout Pro para delegar el formulario de cobro a Mercado Pago y regresar a la tienda. El carrito y los pedidos pertenecen a la app; no se almacenan datos de tarjeta. Checkout embebido se descarta inicialmente por mayor complejidad. Crear el pedido primero, asignar una referencia externa estable y reutilizarlo frente a reintentos del mismo checkout.
9. Endpoint HTTPS de webhook con verificacion de firma segun la documentacion vigente. Consultar el pago por API y verificar referencia, cuenta receptora, total y moneda antes de una transaccion de actualizacion. Identificadores unicos de pago y procesamiento idempotente. No confiar en parametros de retorno. En eventos fuera de orden consultar el estado actual; conservar informacion de reembolsos o contracargos sin confundirlos con pagos pendientes. Reintentar errores transitorios y ofrecer reconciliacion de pedidos pendientes.
10. Consulta del comprador mediante token aleatorio no predecible, sin exponer otros pedidos; lista de pedidos solo para vendedor. No incluir credenciales ni datos sensibles en logs.

## Risks / Trade-offs

- Una instancia y disco persistente limitan el escalado -> copias de seguridad verificadas y migracion de almacenamiento si crece el uso.
- Sin control de stock puede venderse mas de lo disponible -> advertirlo en la configuracion operativa y definir inventario en otro cambio si los productos tienen unidades limitadas.
- Notificaciones retrasadas -> mostrar pendiente y reconciliar mediante API; nunca deducir aprobacion desde el navegador.
- Checkout Pro sale temporalmente de la tienda -> explicar la redireccion en el boton de pago y devolver al cliente al estado del pedido.

## Migration Plan

1. Implementar y probar con datos y cuentas de prueba; agregar migraciones y configuracion documentada sin secretos.
2. Configurar almacenamiento persistente, copias de seguridad, administrador, dominio HTTPS y webhook.
3. Antes de cobrar en produccion, confirmar moneda y modalidad de entrega con el propietario y publicar sus condiciones. Si requiere tarifas o direccion de envio, ampliar las specs antes de habilitar pagos reales.
4. Validar el circuito de pago con credenciales de prueba. Activar credenciales productivas solo cuando el entorno y las condiciones comerciales esten configurados.
5. Para rollback, deshabilitar nuevos checkouts, conservar pedidos e imagenes y mantener la reconciliacion de pagos iniciados. No borrar datos al volver a una version anterior.

## References

- SDK oficial y Checkout Pro: https://github.com/mercadopago/sdk-js
- Notificaciones y autenticidad: https://www.mercadopago.com.ar/developers/en/docs/checkout-pro-preferences/payment-notifications
