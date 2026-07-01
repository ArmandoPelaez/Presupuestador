## ADDED Requirements

### Requirement: Gestión de productos y servicios
El sistema SHALL permitir crear y editar conceptos de catálogo clasificados como producto o servicio, con nombre, unidad, precio unitario e impuesto predeterminado.

#### Scenario: Crear servicio válido
- **WHEN** el usuario guarda un servicio con nombre, unidad, precio no negativo e impuesto válido
- **THEN** el sistema lo incorpora al catálogo del usuario

#### Scenario: Valores monetarios inválidos
- **WHEN** el usuario envía precio negativo o una tasa fuera del rango permitido
- **THEN** el sistema rechaza la operación con errores de campo

### Requirement: Consulta del catálogo
El sistema SHALL listar y buscar los conceptos del usuario con filtros por tipo y estado activo.

#### Scenario: Filtrar productos activos
- **WHEN** el usuario solicita conceptos activos de tipo producto
- **THEN** el sistema devuelve únicamente sus productos activos de forma paginada

### Requirement: Desactivación de conceptos
El sistema SHALL desactivar conceptos sin alterar los ítems ya guardados en presupuestos.

#### Scenario: Desactivar concepto utilizado
- **WHEN** el usuario desactiva un concepto usado previamente
- **THEN** el sistema conserva intactas las instantáneas de todos los presupuestos existentes
