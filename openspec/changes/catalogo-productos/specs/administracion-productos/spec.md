## Purpose

Permitir que el vendedor publique y mantenga productos con imagenes desde el telefono para su venta en Tienda Cata.

## ADDED Requirements

### Requirement: Acceso exclusivo del vendedor
El sistema SHALL exigir una sesion administrativa valida del vendedor para modificar productos o cargar imagenes, incluyendo accesos directos al servidor.

#### Scenario: Visitante intenta modificar un producto
- **WHEN** un visitante sin permisos solicita una modificacion o carga de imagen
- **THEN** el sistema rechaza la operacion y no modifica datos

### Requirement: Publicacion persistente de productos
El sistema SHALL permitir crear y editar productos desde un telefono con nombre, descripcion opcional, precio positivo e imagen, publicarlos, despublicarlos y marcarlos como vendidos o disponibles. Los datos, imagenes y estado vendido SHALL persistir tras reiniciar la aplicacion.

#### Scenario: Publicacion valida
- **WHEN** el vendedor guarda un producto con nombre, precio positivo y al menos una imagen valida
- **THEN** el producto queda disponible en el catalogo y continua disponible despues de reiniciar

#### Scenario: Datos invalidos
- **WHEN** el administrador intenta publicar sin nombre, sin imagen o con precio no positivo
- **THEN** el sistema indica el problema sin publicar datos incompletos

#### Scenario: Despublicacion
- **WHEN** el administrador despublica un producto
- **THEN** deja de aparecer en el catalogo y no admite nuevas compras

#### Scenario: Estado vendido
- **WHEN** el administrador marca un producto publicado como vendido
- **THEN** el producto sigue visible con un sello "Vendido" y no admite nuevas compras

#### Scenario: Volver a disponible
- **WHEN** el administrador marca un producto vendido como disponible
- **THEN** el producto publicado vuelve a admitir compras

### Requirement: Validacion de imagenes
El sistema SHALL aceptar JPEG, PNG y WebP de hasta 5 MiB por archivo, incluyendo imagenes tomadas con la camara del telefono o seleccionadas desde galeria/archivo, verificar su contenido y mostrar errores recuperables sin perder los datos del formulario.

#### Scenario: Carga desde telefono
- **WHEN** el vendedor abre el formulario en un telefono y elige tomar una foto o seleccionar una imagen existente
- **THEN** el sistema permite adjuntar la imagen al producto y continuar con el precio y la publicacion

#### Scenario: Archivo invalido o demasiado grande
- **WHEN** se carga un archivo que no cumple el formato o limite
- **THEN** el sistema rechaza el archivo con una explicacion y conserva los demas datos

#### Scenario: Error de almacenamiento
- **WHEN** falla la carga de una imagen valida
- **THEN** el sistema permite reintentar y no publica una referencia a una imagen inexistente

