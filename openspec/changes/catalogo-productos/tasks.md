# Tasks

## 1. Persistencia y acceso

- [ ] 1.1 Leer las guias locales de Next.js para rutas, formularios y cookies y registrar las APIs elegidas antes de implementar.
- [ ] 1.2 Crear modelos y migraciones SQLite segun design.md; verificar que productos, pedidos y snapshots sobreviven al reinicio y que un pago no puede registrarse dos veces.
- [ ] 1.3 Implementar inicio y cierre de sesion del vendedor; verificar rechazo de escrituras anonimas, sesion vencida y solicitudes de origen no permitido.

## 2. Productos e imagenes

- [ ] 2.1 Implementar almacenamiento persistente y carga validada desde telefono; verificar camara/galeria, JPEG, PNG, WebP, limite de 5 MiB, archivo falso y fallo de almacenamiento sin referencias rotas.
- [ ] 2.2 Crear formulario del vendedor para crear, editar, poner precio, publicar y despublicar; verificar flujo movil, campos obligatorios, precio positivo, imagen y persistencia tras reinicio.
- [ ] 2.3 Crear catalogo publico adaptable; verificar catalogo vacio y productos publicados en celular y escritorio, con etiquetas y texto alternativo accesibles.

## 3. Carrito y pedidos

- [ ] 3.1 Implementar carrito persistente en navegador; verificar elegir producto desde catalogo, agregar, cambiar cantidad, eliminar, recargar y bloqueo de cantidades invalidas y carrito vacio.
- [ ] 3.2 Crear pedidos en servidor con email, precios vigentes y snapshots; verificar manipulacion de importes, producto despublicado y cambio de precio con revision obligatoria.
- [ ] 3.3 Implementar consulta privada del estado del comprador y listado administrativo; verificar que un visitante no puede consultar pedidos ajenos.

## 4. Mercado Pago

- [ ] 4.1 Integrar Checkout Pro con credenciales de prueba solo en servidor; verificar asociacion al pedido, importe y moneda correctos sin exposicion del token al navegador.
- [ ] 4.2 Implementar reintentos de checkout asociados al mismo pedido; verificar doble clic, timeout y error del proveedor sin duplicar pedidos.
- [ ] 4.3 Implementar webhook autenticado y consulta del pago; verificar firma invalida, importe o moneda incorrectos, referencia ajena, duplicados y eventos fuera de orden.
- [ ] 4.4 Implementar retorno y reconciliacion; verificar aprobado, pendiente y rechazado, y que parametros falsificados de exito no marquen el pedido pagado.

## 5. Verificacion y operacion

- [ ] 5.1 Ejecutar lint, build y pruebas de integracion del circuito vendedor-producto-carrito-pago con cuentas de prueba; registrar resultados y limitaciones.
- [ ] 5.2 Documentar variables sin secretos, volumen persistente, backups y webhook HTTPS; verificar recuperacion de una copia de seguridad en entorno de prueba.
- [ ] 5.3 Antes de produccion, registrar confirmacion de moneda y entrega del propietario, actualizar las specs si aparecen envios o stock, y verificar que los cobros reales permanecen deshabilitados hasta completar esa configuracion.
