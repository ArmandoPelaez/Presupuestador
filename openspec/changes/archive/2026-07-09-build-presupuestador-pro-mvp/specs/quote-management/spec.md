## ADDED Requirements

### Requirement: Creación de presupuestos
El sistema SHALL crear un presupuesto para un cliente del usuario con número único, estado borrador, fechas, al menos un ítem y totales calculados.

#### Scenario: Crear presupuesto válido
- **WHEN** el usuario guarda un presupuesto con cliente propio, fechas válidas y uno o más ítems válidos
- **THEN** el sistema persiste el presupuesto completo en una transacción y devuelve su número y totales

#### Scenario: Fallo en un ítem
- **WHEN** cualquier ítem del presupuesto es inválido
- **THEN** el sistema rechaza toda la operación sin guardar un presupuesto parcial

### Requirement: Instantánea de ítems
El sistema MUST conservar en cada ítem la descripción, unidad, precio e impuesto usados al guardar el presupuesto, incluso si provienen del catálogo.

#### Scenario: Cambio posterior del catálogo
- **WHEN** se modifica un concepto de catálogo usado por un presupuesto existente
- **THEN** los datos y totales del presupuesto existente no cambian

### Requirement: Consulta y edición
El sistema SHALL permitir listar, buscar, filtrar y consultar presupuestos, y editar únicamente aquellos cuyo estado lo permita.

#### Scenario: Filtrar por estado
- **WHEN** el usuario filtra el listado por aprobado
- **THEN** el sistema devuelve de forma paginada únicamente sus presupuestos aprobados

#### Scenario: Editar presupuesto finalizado
- **WHEN** el usuario intenta editar un presupuesto aprobado o rechazado
- **THEN** el sistema rechaza la modificación y conserva el documento sin cambios

### Requirement: Ciclo de estados
El sistema SHALL admitir los estados borrador, enviado, aprobado y rechazado, y MUST validar cada transición.

#### Scenario: Aprobar presupuesto enviado
- **WHEN** el usuario cambia un presupuesto enviado a aprobado
- **THEN** el sistema registra el nuevo estado

#### Scenario: Transición inválida
- **WHEN** el usuario intenta cambiar directamente un borrador a aprobado
- **THEN** el sistema rechaza la transición y conserva el estado borrador

### Requirement: Eliminación acotada
El sistema SHALL permitir eliminar únicamente presupuestos en estado borrador.

#### Scenario: Eliminar presupuesto enviado
- **WHEN** el usuario intenta eliminar un presupuesto enviado
- **THEN** el sistema rechaza la eliminación y preserva el historial
