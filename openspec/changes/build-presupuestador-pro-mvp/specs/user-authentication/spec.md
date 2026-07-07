## ADDED Requirements

### Requirement: Registro e inicio de sesión
El sistema SHALL permitir que una persona cree una cuenta con nombre, email único y contraseña, e inicie sesión con credenciales válidas.

#### Scenario: Registro exitoso
- **WHEN** una persona envía datos válidos con un email no registrado
- **THEN** el sistema crea la cuenta sin almacenar la contraseña en texto plano y devuelve una sesión autenticada

#### Scenario: Credenciales inválidas
- **WHEN** una persona intenta iniciar sesión con email o contraseña incorrectos
- **THEN** el sistema rechaza el acceso sin revelar cuál credencial falló

### Requirement: Inicio de sesión con Google
El sistema SHALL permitir iniciar sesión con una cuenta de Google cuyo ID token sea verificado por el backend para el cliente OAuth configurado.

#### Scenario: Primera autenticación con Google
- **WHEN** Google entrega un ID token válido con email verificado
- **THEN** el sistema crea o vincula la cuenta usando el identificador estable `sub` y devuelve una sesión autenticada

#### Scenario: Token de Google inválido
- **WHEN** el token está vencido, tiene otra audiencia o no contiene un email verificado
- **THEN** el sistema rechaza el acceso sin crear ni modificar una cuenta

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
