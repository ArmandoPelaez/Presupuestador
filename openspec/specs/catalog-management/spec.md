## Purpose

Define la administracion del catalogo privado de productos y servicios reutilizables en presupuestos.

## Requirements

### Requirement: Gestion de productos y servicios
El sistema SHALL permitir crear y editar conceptos de catalogo clasificados como producto o servicio, con nombre, unidad, precio unitario e impuesto predeterminado.

#### Scenario: Crear servicio valido
- **WHEN** el usuario guarda un servicio con nombre, unidad, precio no negativo e impuesto valido
- **THEN** el sistema lo incorpora al catalogo del usuario

#### Scenario: Valores monetarios invalidos
- **WHEN** el usuario envia precio negativo o una tasa fuera del rango permitido
- **THEN** el sistema rechaza la operacion con errores de campo

### Requirement: Consulta del catalogo
El sistema SHALL listar y buscar los conceptos del usuario con filtros por tipo y estado activo.

#### Scenario: Filtrar productos activos
- **WHEN** el usuario solicita conceptos activos de tipo producto
- **THEN** el sistema devuelve unicamente sus productos activos de forma paginada

### Requirement: Desactivacion de conceptos
El sistema SHALL desactivar conceptos sin alterar los items ya guardados en presupuestos.

#### Scenario: Desactivar concepto utilizado
- **WHEN** el usuario desactiva un concepto usado previamente
- **THEN** el sistema conserva intactas las instantaneas de todos los presupuestos existentes
