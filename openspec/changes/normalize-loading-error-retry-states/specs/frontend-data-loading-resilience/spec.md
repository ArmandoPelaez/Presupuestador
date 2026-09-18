## ADDED Requirements

### Requirement: Estados explícitos de consulta

El frontend SHALL representar explícitamente la primera carga, la carga exitosa, la actualización de datos y el error de cada consulta de lectura incluida en el alcance del cambio.

#### Scenario: Primera carga sin datos
- **WHEN** una pantalla inicia una consulta y todavía no tiene datos para mostrar
- **THEN** la pantalla muestra un indicador de carga accesible
- **AND** no muestra un mensaje de error antes de que la consulta termine

#### Scenario: Consulta exitosa
- **WHEN** una consulta de lectura termina correctamente
- **THEN** la pantalla muestra los datos recibidos
- **AND** deja de mostrar el indicador de carga o actualización

### Requirement: Error recuperable con reintento manual

Cuando una consulta de lectura falle, el frontend MUST mostrar un mensaje seguro y accionable junto con una acción **Reintentar** cuando la operación pueda repetirse.

#### Scenario: Error en la primera carga
- **WHEN** la consulta falla y no existen datos previos
- **THEN** la pantalla muestra el contexto del error
- **AND** muestra una acción visible llamada **Reintentar**
- **AND** no queda indefinidamente en el estado de carga

#### Scenario: Reintento exitoso
- **WHEN** el usuario activa **Reintentar**
- **THEN** se repite la misma consulta con los parámetros vigentes
- **AND** al finalizar correctamente se muestran los datos y desaparece el error

#### Scenario: Reintento mientras ya existe una consulta pendiente
- **WHEN** el usuario activa **Reintentar** mientras la consulta está pendiente
- **THEN** el control de reintento permanece deshabilitado
- **AND** no se crean solicitudes duplicadas por activaciones repetidas

### Requirement: Preservación durante actualización

El frontend MUST conservar los datos visibles cuando se ejecuta una nueva consulta sobre una pantalla que ya tiene datos.

#### Scenario: Actualización con datos previos
- **WHEN** el usuario cambia la página, el filtro o solicita una nueva carga
- **THEN** los datos anteriores permanecen visibles mientras se ejecuta la nueva consulta
- **AND** la interfaz indica que la información se está actualizando

#### Scenario: Error durante actualización
- **WHEN** una actualización falla después de que la pantalla ya mostró datos
- **THEN** los datos anteriores permanecen visibles
- **AND** se muestra el error de actualización
- **AND** se ofrece **Reintentar** sin perder los parámetros vigentes

### Requirement: Consistencia de parámetros de reintento

La acción **Reintentar** MUST volver a ejecutar la consulta con el mismo contexto vigente de la pantalla.

#### Scenario: Reintentar un listado filtrado
- **WHEN** falla un listado con búsqueda, filtro o paginación activa
- **THEN** el reintento conserva la búsqueda, el filtro y la página actuales
- **AND** no devuelve al usuario a la primera página ni elimina sus criterios

#### Scenario: Reintentar un detalle
- **WHEN** falla la carga de un cliente, concepto o presupuesto identificado por una ruta
- **THEN** el reintento consulta nuevamente el mismo identificador
- **AND** no navega a otra pantalla automáticamente

### Requirement: Protección contra requests obsoletos

El frontend MUST evitar que una respuesta de una consulta cancelada, desmontada u obsoleta reemplace el estado de la consulta vigente.

#### Scenario: Cambio rápido de filtros
- **WHEN** el usuario cambia rápidamente filtros, búsqueda o página
- **THEN** la respuesta de una consulta anterior no reemplaza los resultados de la consulta más reciente
- **AND** una cancelación esperada no se muestra como error

#### Scenario: Desmontaje de la pantalla
- **WHEN** el usuario abandona la pantalla mientras una consulta está pendiente
- **THEN** la respuesta posterior no actualiza el componente desmontado

### Requirement: Errores accesibles y clasificados

Los mensajes de error y acciones de recuperación MUST ser comprensibles, accesibles y coherentes con la clasificación existente del cliente API.

#### Scenario: Error anunciado al usuario
- **WHEN** una consulta falla
- **THEN** el mensaje de error se expone con semántica accesible de alerta o región viva
- **AND** el control **Reintentar** tiene un nombre accesible y es operable por teclado

#### Scenario: Sesión vencida
- **WHEN** el cliente API recibe un `401` para una ruta protegida
- **THEN** se mantiene el flujo existente de limpieza de sesión y redirección
- **AND** el error no se presenta como un fallo genérico recuperable de la consulta

#### Scenario: Error no recuperable por parámetros
- **WHEN** la API responde con un error de validación, autorización o recurso inexistente
- **THEN** la interfaz muestra un mensaje acorde al error
- **AND** no ejecuta reintentos automáticos

### Requirement: Reintentos exclusivamente manuales

El frontend MUST NOT ejecutar reintentos automáticos para las consultas incluidas en esta etapa.

#### Scenario: Fallo transitorio
- **WHEN** una consulta falla por red o por un error del servidor
- **THEN** la consulta termina en estado de error
- **AND** el sistema espera una acción explícita del usuario para volver a intentarla

#### Scenario: Operación mutante
- **WHEN** falla una operación de creación, edición, eliminación, descarga o envío
- **THEN** este cambio no repite automáticamente la operación
- **AND** conserva el comportamiento específico de error y bloqueo de esa acción
