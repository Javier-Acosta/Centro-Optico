## Purpose

Permitir que clientes consulten los productos publicados, elijan articulos y los agreguen al carrito antes de pagar su pedido.

## ADDED Requirements

### Requirement: Catalogo publico
El sistema SHALL mostrar nombre, descripcion, precio e imagen de productos publicados sin exigir una cuenta de cliente, en dispositivos moviles y escritorio.

#### Scenario: Consulta del catalogo
- **WHEN** un visitante abre la tienda
- **THEN** ve los productos publicados con su precio e imagen

#### Scenario: Catalogo vacio
- **WHEN** no hay productos publicados
- **THEN** se muestra un mensaje claro de catalogo vacio

### Requirement: Gestion de carrito
El sistema SHALL permitir que el cliente agregue productos publicados desde el catalogo, cambiar cantidades enteras positivas y eliminar articulos; mostrar subtotales y total; y conservar el carrito al recargar el navegador.

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
- **WHEN** un producto fue despublicado o cambio de precio desde que se agrego al carrito
- **THEN** se informa el cambio y se requiere revisar el carrito antes de pagar
