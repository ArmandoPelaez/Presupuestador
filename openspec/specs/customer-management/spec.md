## Purpose

Define la administracion de clientes privados del propietario y su relacion con presupuestos historicos.

## Requirements

### Requirement: Gestion de clientes
El sistema SHALL permitir crear, consultar y editar clientes con nombre obligatorio y datos de contacto opcionales.

#### Scenario: Alta valida de cliente
- **WHEN** el usuario guarda un cliente con nombre valido y campos opcionales validos
- **THEN** el sistema crea el cliente asociado exclusivamente a ese usuario

#### Scenario: Datos invalidos
- **WHEN** el usuario envia un cliente sin nombre o con email mal formado
- **THEN** el sistema rechaza la operacion e identifica los campos invalidos

### Requirement: Listado y busqueda de clientes
El sistema SHALL proporcionar un listado paginado y permitir buscar clientes del usuario por nombre, empresa, email o identificador fiscal.

#### Scenario: Busqueda sin coincidencias
- **WHEN** el criterio no coincide con ningun cliente del usuario
- **THEN** el sistema devuelve una lista vacia y metadatos de paginacion validos

### Requirement: Desactivacion de clientes
El sistema SHALL permitir desactivar un cliente sin eliminar su historial de presupuestos.

#### Scenario: Desactivar cliente vinculado
- **WHEN** el usuario desactiva un cliente con presupuestos existentes
- **THEN** el cliente deja de ofrecerse para presupuestos nuevos y los presupuestos historicos permanecen consultables
