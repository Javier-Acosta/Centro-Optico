## Purpose

Permitir que clientes consulten los productos publicados, elijan articulos y los agreguen al carrito antes de pagar su pedido.

## ADDED Requirements

### Requirement: Catalogo publico
El sistema SHALL mostrar nombre, descripcion, precio, imagen y sello de vendido cuando corresponda para productos publicados sin exigir una cuenta de cliente, en dispositivos moviles y escritorio.

#### Scenario: Consulta del catalogo
- **WHEN** un visitante abre la tienda
- **THEN** ve los productos publicados con su precio e imagen

#### Scenario: Catalogo vacio
- **WHEN** no hay productos publicados
- **THEN** se muestra un mensaje claro de catalogo vacio

#### Scenario: Producto vendido
- **WHEN** un producto publicado esta marcado como vendido
- **THEN** el visitante ve el sello "Vendido" y no puede agregarlo al carrito

### Requirement: Gestion de carrito
El sistema SHALL permitir que el cliente agregue productos publicados y disponibles desde el catalogo, cambiar cantidades enteras positivas y eliminar articulos; mostrar subtotales y total; y conservar el carrito al recargar el navegador.

#### Scenario: Producto elegido desde el catalogo
- **WHEN** el cliente selecciona agregar un producto publicado al carrito
- **THEN** el producto aparece en el carrito con cantidad inicial valida y total actualizado

#### Scenario: Cambio de cantidad
- **WHEN** el visitante modifica una cantidad valida
- **THEN** se actualizan subtotales y total y se conserva la seleccion al recargar

#### Scenario: Cantidad invalida
- **WHEN** se intenta ingresar una cantidad negativa, cero o fraccionaria
- **THEN** se rechaza el cambio y se indica como ingresar una cantidad valida

#### Scenario: Carrito vacio
- **WHEN** el visitante elimina todos los articulos
- **THEN** se muestra el carrito vacio y no se permite iniciar el pago

### Requirement: Revalidacion antes del pago
El sistema SHALL verificar precios y publicacion en servidor antes de crear un pedido y solicitar revision al cliente si cambiaron.

#### Scenario: Producto cambiado
- **WHEN** un producto fue despublicado, marcado como vendido o cambio de precio desde que se agrego al carrito
- **THEN** se informa el cambio y se requiere revisar el carrito antes de pagar


### Requirement: Vista ampliada de producto
El sistema SHALL permitir abrir una vista ampliada de un producto publicado desde el catalogo, mostrando imagen grande, nombre, descripcion, precio y estado vendido cuando corresponda.

#### Scenario: Abrir producto
- **WHEN** el visitante selecciona un producto publicado en el catalogo
- **THEN** ve una vista ampliada con los detalles del producto y una forma clara de cerrarla

#### Scenario: Producto vendido ampliado
- **WHEN** el visitante abre un producto vendido
- **THEN** la vista ampliada muestra el sello "Vendido" y no permite agregarlo al carrito
