## Purpose

Registrar pedidos de los clientes y facilitar el contacto por WhatsApp con el vendedor para coordinar pago y entrega.

## ADDED Requirements

### Requirement: Pedido y contacto por WhatsApp
El sistema SHALL permitir comprar como invitado, registrar un email de contacto y crear un pedido persistente con articulos, cantidades, moneda, precios y total calculados en servidor antes de abrir WhatsApp. Las credenciales de PocketBase SHALL permanecer en servidor.

#### Scenario: Envio de pedido
- **WHEN** el visitante confirma un carrito valido y un email valido
- **THEN** se registra un pedido pendiente y se abre WhatsApp con un mensaje que incluye productos, cantidades, total y referencia del pedido

#### Scenario: Manipulacion de importe
- **WHEN** el navegador envia precios o totales alterados
- **THEN** el servidor usa sus precios vigentes para registrar el pedido y armar el mensaje

#### Scenario: WhatsApp no disponible
- **WHEN** el navegador no puede abrir WhatsApp
- **THEN** el pedido permanece pendiente y el comprador puede ver el estado del pedido con la referencia generada

### Requirement: Gestion manual del pedido
El sistema SHALL conservar los pedidos como pendientes hasta que el vendedor coordine manualmente pago y entrega por WhatsApp. El sistema SHALL NOT presentar el pedido como pagado de forma automatica.

#### Scenario: Pedido pendiente
- **WHEN** un comprador envia el pedido por WhatsApp
- **THEN** el pedido queda pendiente y no se muestra como pagado

#### Scenario: Confirmacion manual futura
- **WHEN** el vendedor necesite marcar pedidos como pagados o entregados
- **THEN** esa operacion se implementara en un cambio posterior con estados administrativos explicitos

### Requirement: Consulta del estado de pedido
El sistema SHALL mostrar al comprador el estado pendiente mediante acceso no predecible y permitir al administrador consultar pedidos. Un pedido pendiente SHALL no presentarse como venta pagada.

#### Scenario: Pedido pendiente
- **WHEN** el comprador abre el enlace privado del pedido
- **THEN** ve los articulos, total y estado pendiente

#### Scenario: Acceso ajeno
- **WHEN** un visitante intenta consultar un pedido sin su acceso autorizado
- **THEN** no se exponen datos del comprador ni del pedido
