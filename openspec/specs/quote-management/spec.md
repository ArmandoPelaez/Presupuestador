## Purpose

Define la creacion, consulta, edicion, estados y eliminacion acotada de presupuestos privados.

## Requirements

### Requirement: Creacion de presupuestos
El sistema SHALL crear un presupuesto para un cliente del usuario con numero unico, estado borrador, fechas, al menos un item y totales calculados.

#### Scenario: Crear presupuesto valido
- **WHEN** el usuario guarda un presupuesto con cliente propio, fechas validas y uno o mas items validos
- **THEN** el sistema persiste el presupuesto completo en una transaccion y devuelve su numero y totales

#### Scenario: Fallo en un item
- **WHEN** cualquier item del presupuesto es invalido
- **THEN** el sistema rechaza toda la operacion sin guardar un presupuesto parcial

### Requirement: Instantanea de items
El sistema MUST conservar en cada item la descripcion, unidad, precio e impuesto usados al guardar el presupuesto, incluso si provienen del catalogo.

#### Scenario: Cambio posterior del catalogo
- **WHEN** se modifica un concepto de catalogo usado por un presupuesto existente
- **THEN** los datos y totales del presupuesto existente no cambian

### Requirement: Consulta y edicion
El sistema SHALL permitir listar, buscar, filtrar y consultar presupuestos, y editar unicamente aquellos cuyo estado lo permita.

#### Scenario: Filtrar por estado
- **WHEN** el usuario filtra el listado por aprobado
- **THEN** el sistema devuelve de forma paginada unicamente sus presupuestos aprobados

#### Scenario: Editar presupuesto finalizado
- **WHEN** el usuario intenta editar un presupuesto aprobado o rechazado
- **THEN** el sistema rechaza la modificacion y conserva el documento sin cambios

### Requirement: Ciclo de estados
El sistema SHALL admitir los estados borrador, enviado, aprobado y rechazado, y MUST validar cada transicion.

#### Scenario: Aprobar presupuesto enviado
- **WHEN** el usuario cambia un presupuesto enviado a aprobado
- **THEN** el sistema registra el nuevo estado

#### Scenario: Transicion invalida
- **WHEN** el usuario intenta cambiar directamente un borrador a aprobado
- **THEN** el sistema rechaza la transicion y conserva el estado borrador

### Requirement: Eliminacion acotada
El sistema SHALL permitir eliminar unicamente presupuestos en estado borrador.

#### Scenario: Eliminar presupuesto enviado
- **WHEN** el usuario intenta eliminar un presupuesto enviado
- **THEN** el sistema rechaza la eliminacion y preserva el historial
