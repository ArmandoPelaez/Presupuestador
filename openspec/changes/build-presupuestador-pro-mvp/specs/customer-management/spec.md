## ADDED Requirements

### Requirement: Gestión de clientes
El sistema SHALL permitir crear, consultar y editar clientes con nombre obligatorio y datos de contacto opcionales.

#### Scenario: Alta válida de cliente
- **WHEN** el usuario guarda un cliente con nombre válido y campos opcionales válidos
- **THEN** el sistema crea el cliente asociado exclusivamente a ese usuario

#### Scenario: Datos inválidos
- **WHEN** el usuario envía un cliente sin nombre o con email mal formado
- **THEN** el sistema rechaza la operación e identifica los campos inválidos

### Requirement: Listado y búsqueda de clientes
El sistema SHALL proporcionar un listado paginado y permitir buscar clientes del usuario por nombre, empresa, email o identificador fiscal.

#### Scenario: Búsqueda sin coincidencias
- **WHEN** el criterio no coincide con ningún cliente del usuario
- **THEN** el sistema devuelve una lista vacía y metadatos de paginación válidos

### Requirement: Desactivación de clientes
El sistema SHALL permitir desactivar un cliente sin eliminar su historial de presupuestos.

#### Scenario: Desactivar cliente vinculado
- **WHEN** el usuario desactiva un cliente con presupuestos existentes
- **THEN** el cliente deja de ofrecerse para presupuestos nuevos y los presupuestos históricos permanecen consultables
