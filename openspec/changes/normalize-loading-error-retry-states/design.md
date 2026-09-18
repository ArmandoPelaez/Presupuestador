## Context

El frontend Next.js realiza consultas de lectura desde varios componentes independientes. Actualmente cada pantalla mantiene sus propios booleanos, algunas promesas no capturan errores y las recargas pueden dejar una vista vacía o mostrar resultados de una solicitud anterior. El cliente HTTP compartido ya acepta `RequestInit`, por lo que puede transportar señales de cancelación sin cambiar los endpoints.

El cambio afecta principalmente a los listados de presupuestos, clientes y catálogo, al dashboard y a las vistas de detalle. Debe conservar la paleta visual centralizada y mantener intactas las reglas de autenticación y negocio.

## Goals / Non-Goals

**Goals:**

- Definir un contrato común para estados de primera carga, éxito, actualización, error y reintento manual.
- Permitir que una vista reintente una consulta fallida conservando sus parámetros actuales.
- Conservar los datos visibles mientras una actualización está pendiente o falla.
- Evitar que requests obsoletos actualicen el estado de la vista.
- Normalizar los estados de error y hacerlos accesibles.
- Cubrir el comportamiento con pruebas de componentes y utilidades.

**Non-Goals:**

- No agregar reintentos automáticos en esta etapa.
- No reintentar automáticamente operaciones mutables como crear, editar o eliminar.
- No cambiar endpoints, contratos del backend, persistencia ni autenticación.
- No incorporar React Query, SWR u otra dependencia de fetching.
- No rediseñar las pantallas fuera de los estados necesarios para carga, error y reintento.

## Decisions

### 1. Usar una abstracción local para consultas de lectura

Se implementará una utilidad o hook local del frontend para encapsular la ejecución de consultas, el estado discriminado, el reintento manual y la cancelación. Los componentes conservarán sus parámetros de consulta y renderizarán estados mediante componentes o patrones reutilizables.

Se elige esta opción sobre mantener lógica duplicada por pantalla porque permite que el comportamiento sea uniforme sin introducir una dependencia ni modificar el backend.

### 2. Diferenciar carga inicial de actualización

Una consulta sin datos previos mostrará el estado de carga inicial. Una consulta que ya tiene datos conservará ese contenido y mostrará un indicador de actualización. Si la actualización falla, se mantendrán los datos anteriores y se ofrecerá reintentar; la pantalla no volverá a un estado vacío.

### 3. El reintento será manual y repetirá la consulta vigente

La acción **Reintentar** volverá a ejecutar la función de consulta con los mismos filtros, búsqueda, paginación e identificador de recurso que produjeron el error. No habrá reintentos automáticos ni reintentos de mutaciones.

### 4. Cancelar o invalidar requests obsoletos

Cada ejecución de consulta podrá recibir un `AbortSignal`. Al cambiar dependencias o desmontar el componente se abortará la ejecución anterior cuando sea posible. Además, la capa de estado ignorará respuestas de ejecuciones que ya no sean la consulta vigente. Las cancelaciones esperadas no se mostrarán como errores al usuario.

### 5. Mantener la clasificación de autenticación existente

El cliente API seguirá redirigiendo ante una sesión vencida (`401`) cuando corresponda. Los componentes mostrarán reintento para fallos recuperables de red o servidor, pero no convertirán errores de autenticación, autorización, inexistencia o validación en un reintento ciego sin contexto.

### 6. Componer los estados con accesibilidad y la paleta existente

Los mensajes de error deberán anunciarse con semántica accesible y el control de reintento deberá ser operable con teclado y tener un nombre claro. Los estilos usarán tokens y utilidades ya existentes en `globals.css`; no se agregarán colores directos en componentes.

## Risks / Trade-offs

- [La abstracción local puede no cubrir todas las particularidades de cada pantalla] → Mantener la función de consulta y el renderizado específico en cada consumidor, centralizando solo ciclo de vida, cancelación y reintento.
- [Abortar una consulta puede producir errores indistinguibles de fallos reales] → Tratar `AbortError` como cancelación esperada y no mostrarlo como alerta.
- [Una respuesta antigua puede llegar aunque no se cancele la request] → Usar un identificador de ejecución vigente además de `AbortController`.
- [Una recarga puede dejar datos antiguos visibles por más tiempo] → Mostrar un indicador explícito de actualización para que el usuario distinga datos conservados de datos recién cargados.
- [Un botón de reintento puede duplicar la ejecución si se pulsa varias veces] → Deshabilitarlo mientras la consulta está pendiente y restaurar su estado al finalizar.
