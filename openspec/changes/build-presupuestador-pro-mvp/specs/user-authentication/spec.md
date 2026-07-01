## ADDED Requirements

### Requirement: Registro e inicio de sesión
El sistema SHALL permitir que una persona cree una cuenta con nombre, email único y contraseña, e inicie sesión con credenciales válidas.

#### Scenario: Registro exitoso
- **WHEN** una persona envía datos válidos con un email no registrado
- **THEN** el sistema crea la cuenta sin almacenar la contraseña en texto plano y devuelve una sesión autenticada

#### Scenario: Credenciales inválidas
- **WHEN** una persona intenta iniciar sesión con email o contraseña incorrectos
- **THEN** el sistema rechaza el acceso sin revelar cuál credencial falló

### Requirement: Acceso mediante JWT
El sistema SHALL exigir un JWT válido y no vencido para acceder a capacidades privadas.

#### Scenario: Solicitud sin token
- **WHEN** un cliente solicita un recurso protegido sin un JWT válido
- **THEN** el sistema responde con estado no autorizado y no expone datos

### Requirement: Aislamiento por propietario
El sistema MUST limitar toda consulta y modificación de datos de negocio al usuario autenticado que los posee.

#### Scenario: Acceso a un recurso ajeno
- **WHEN** un usuario solicita o modifica el identificador de un recurso perteneciente a otra cuenta
- **THEN** el sistema no revela ni modifica el recurso
