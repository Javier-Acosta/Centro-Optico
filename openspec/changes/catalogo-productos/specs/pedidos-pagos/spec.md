## Purpose

Registrar pedidos de los clientes y cobrar con Mercado Pago, confirmando cada pago a partir de informacion verificable.

## ADDED Requirements

### Requirement: Pedido y checkout
El sistema SHALL permitir comprar como invitado, registrar un email de contacto y crear un pedido persistente con articulos, cantidades, moneda, precios y total calculados en servidor antes de iniciar Mercado Pago. Las credenciales SHALL permanecer en servidor.

#### Scenario: Inicio de pago
- **WHEN** el visitante confirma un carrito valido y un email valido
- **THEN** se registra un pedido pendiente y se abre el checkout de Mercado Pago asociado a ese pedido

#### Scenario: Manipulacion de importe
- **WHEN** el navegador envia precios o totales alterados
- **THEN** el servidor usa sus precios vigentes sin cobrar el importe manipulado

#### Scenario: Falla de Mercado Pago
- **WHEN** no se puede iniciar el checkout
- **THEN** se informa el error, se conserva el pedido pendiente y se permite reintentar sin duplicar el pedido

### Requirement: Confirmacion verificable e idempotente
El sistema SHALL confirmar pagos consultando Mercado Pago desde servidor, validar autenticidad de notificaciones y comprobar pedido, cuenta receptora, importe y moneda. Notificaciones repetidas o antiguas SHALL evitar duplicados y regresiones de estado.

#### Scenario: Pago aprobado
- **WHEN** una notificacion autentica conduce a un pago aprobado con datos coincidentes
- **THEN** el pedido queda pagado y registra el identificador del pago

#### Scenario: Retorno del navegador
- **WHEN** el cliente vuelve con parametros que indican exito pero el pago no fue verificado
- **THEN** el pedido permanece pendiente de confirmacion

#### Scenario: Notificacion repetida o fuera de orden
- **WHEN** se recibe nuevamente un evento o un evento antiguo
- **THEN** se consulta el estado vigente sin duplicar pedidos ni retroceder un pago confirmado

#### Scenario: Notificacion invalida
- **WHEN** la firma es invalida o los datos del pago no coinciden con el pedido
- **THEN** el pedido no se marca como pagado

### Requirement: Consulta del estado de pedido
El sistema SHALL mostrar al comprador el estado pendiente, aprobado o rechazado mediante acceso no predecible y permitir al administrador consultar pedidos. Un pago pendiente o rechazado SHALL no presentarse como venta pagada.

#### Scenario: Pago pendiente o rechazado
- **WHEN** Mercado Pago informa un estado pendiente o rechazado
- **THEN** el comprador ve ese estado sin una confirmacion falsa de pago

#### Scenario: Acceso ajeno
- **WHEN** un visitante intenta consultar un pedido sin su acceso autorizado
- **THEN** no se exponen datos del comprador ni del pedido
