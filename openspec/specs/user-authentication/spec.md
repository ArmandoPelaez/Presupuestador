## Purpose

Define el registro, inicio de sesion y aislamiento por propietario para capacidades privadas.

## Requirements

### Requirement: Registro e inicio de sesion
El sistema SHALL permitir que una persona cree una cuenta con nombre, email unico y contrasena, e inicie sesion con credenciales validas.

#### Scenario: Registro exitoso
- **WHEN** una persona envia datos validos con un email no registrado
- **THEN** el sistema crea la cuenta sin almacenar la contrasena en texto plano y devuelve una sesion autenticada

#### Scenario: Credenciales invalidas
- **WHEN** una persona intenta iniciar sesion con email o contrasena incorrectos
- **THEN** el sistema rechaza el acceso sin revelar cual credencial fallo

### Requirement: Inicio de sesion con Google
El sistema SHALL permitir iniciar sesion con una cuenta de Google cuyo ID token sea verificado por el backend para el cliente OAuth configurado.

#### Scenario: Primera autenticacion con Google
- **WHEN** Google entrega un ID token valido con email verificado
- **THEN** el sistema crea o vincula la cuenta usando el identificador estable `sub` y devuelve una sesion autenticada

#### Scenario: Token de Google invalido
- **WHEN** el token esta vencido, tiene otra audiencia o no contiene un email verificado
- **THEN** el sistema rechaza el acceso sin crear ni modificar una cuenta

### Requirement: Acceso mediante JWT
El sistema SHALL exigir un JWT valido y no vencido para acceder a capacidades privadas.

#### Scenario: Solicitud sin token
- **WHEN** un cliente solicita un recurso protegido sin un JWT valido
- **THEN** el sistema responde con estado no autorizado y no expone datos

### Requirement: Aislamiento por propietario
El sistema MUST limitar toda consulta y modificacion de datos de negocio al usuario autenticado que los posee.

#### Scenario: Acceso a un recurso ajeno
- **WHEN** un usuario solicita o modifica el identificador de un recurso perteneciente a otra cuenta
- **THEN** el sistema no revela ni modifica el recurso
