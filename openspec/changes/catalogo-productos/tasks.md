# Tasks

## 1. Persistencia y acceso

- [x] 1.1 Leer las guias locales de Next.js para rutas, formularios, server actions/API routes, cookies y carga de archivos; registrar las APIs elegidas antes de implementar.
- [x] 1.2 Crear/verificar colecciones PocketBase segun design.md (`products`, `orders`, `order_items`, `payment_attempts` y acceso vendedor); verificar campos, reglas, archivos y persistencia.
- [x] 1.3 Implementar cliente PocketBase solo-servidor con variables de `.env.local`; verificar que `POCKETBASE_URL` y credenciales no se importan en componentes cliente ni aparecen en el bundle.
- [x] 1.4 Implementar inicio y cierre de sesion del vendedor; verificar rechazo de escrituras anonimas, sesion vencida y solicitudes de origen no permitido.

## 2. Productos e imagenes

- [x] 2.1 Implementar carga validada de imagenes a PocketBase desde telefono; verificar camara/galeria, JPEG, PNG, WebP, limite de 5 MiB, archivo falso y fallo de almacenamiento sin referencias rotas.
- [x] 2.2 Crear formulario del vendedor para crear, editar, poner precio, publicar y despublicar productos en PocketBase; verificar flujo movil, campos obligatorios, precio positivo, imagen y persistencia tras reinicio.
- [x] 2.3 Crear catalogo publico adaptable consumiendo productos publicados desde PocketBase; verificar catalogo vacio y productos publicados en celular y escritorio, con etiquetas y texto alternativo accesibles.
- [x] 2.4 Implementar estado vendido para productos; verificar sello visible en catalogo, bloqueo de agregado al carrito, accion administrativa para marcar disponible/vendido y persistencia en PocketBase.
- [x] 2.5 Implementar vista ampliada de producto desde el catalogo; verificar imagen grande, descripcion, precio, cierre, estado vendido y bloqueo de agregado si esta vendido.
- [x] 2.6 Implementar eliminacion de producto desde el panel vendedor; verificar confirmacion, borrado del registro e imagen en PocketBase, salida del catalogo y rechazo de compras con producto eliminado.

## 3. Carrito y pedidos

- [x] 3.1 Implementar carrito persistente en navegador; verificar elegir producto desde catalogo, agregar, cambiar cantidad, eliminar, recargar y bloqueo de cantidades invalidas y carrito vacio.
- [x] 3.2 Crear pedidos en PocketBase desde servidor con email, precios vigentes y snapshots; verificar manipulacion de importes, producto despublicado y cambio de precio con revision obligatoria.
- [x] 3.3 Implementar consulta privada del estado del comprador y listado administrativo desde PocketBase; verificar que un visitante no puede consultar pedidos ajenos.

## 4. WhatsApp

- [x] 4.1 Configurar numero de vendedor y generar enlace de WhatsApp con resumen del pedido; verificar formato internacional, productos, cantidades, total, email y referencia.
- [x] 4.2 Abrir WhatsApp despues de crear el pedido pendiente; verificar que el pedido no se duplica frente a doble clic y que queda accesible si WhatsApp no abre.
- [x] 4.3 Mantener pedidos como pendientes sin cobro automatico; verificar que ningun retorno o parametro del navegador marque el pedido como pagado.

## 5. Verificacion y operacion

- [ ] 5.1 Ejecutar lint, build y pruebas de integracion del circuito vendedor-producto-carrito-WhatsApp con PocketBase; registrar resultados y limitaciones.
- [ ] 5.2 Documentar variables sin secretos, colecciones/reglas PocketBase, backups y configuracion de WhatsApp; verificar recuperacion de una copia de seguridad o export de PocketBase en entorno de prueba.
- [ ] 5.3 Antes de produccion, registrar confirmacion de moneda y entrega del propietario, actualizar las specs si aparecen envios, stock o cobros online, y verificar que los cobros automaticos permanecen deshabilitados.






