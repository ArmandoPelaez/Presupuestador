## ADDED Requirements

### Requirement: Debounce de búsquedas remotas

El frontend MUST actualizar inmediatamente el valor visible de la búsqueda, pero SHALL iniciar la consulta remota o la resolución de su clave de cache únicamente después de 350 ms sin nuevas pulsaciones en clientes, catálogo y presupuestos.

#### Scenario: Entrada inmediata durante la escritura
- **WHEN** el usuario escribe o modifica el texto de búsqueda
- **THEN** el campo refleja el nuevo valor inmediatamente
- **AND** no se inicia una consulta con el valor parcial mientras continúe escribiendo

#### Scenario: Pausa después de escribir
- **WHEN** el usuario deja de modificar el criterio durante 350 ms
- **THEN** se ejecuta una única consulta con el criterio vigente
- **AND** el criterio usado no contiene valores intermedios reemplazados durante la espera

#### Scenario: Escritura rápida en un listado
- **WHEN** el usuario escribe varios caracteres dentro de una ventana menor a 350 ms
- **THEN** se reinicia la espera ante cada modificación
- **AND** no se ejecutan consultas por cada pulsación
- **AND** al finalizar la pausa se consulta únicamente el último valor

### Requirement: Debounce independiente de cache

La búsqueda de presupuestos MUST respetar los 350 ms de debounce aunque exista un resultado cacheado o una capa de cache capaz de resolver inmediatamente la consulta.

#### Scenario: Presupuesto con resultado cacheado
- **WHEN** el usuario modifica la búsqueda de presupuestos y existe un resultado cacheado para el nuevo criterio
- **THEN** no se consulta la cache ni se inicia una request antes de que transcurran 350 ms sin nuevas pulsaciones
- **AND** después de la pausa se resuelve la consulta usando el mecanismo de cache o red vigente

### Requirement: Reinicio de paginación al aplicar una búsqueda

Cuando se aplique un nuevo criterio de búsqueda, el frontend MUST consultar la primera página y SHALL evitar una consulta intermedia con el criterio nuevo y la página anterior.

#### Scenario: Buscar desde una página posterior
- **WHEN** el usuario está en una página mayor que uno y modifica la búsqueda
- **THEN** la búsqueda aplicada después de los 350 ms se ejecuta con la página uno
- **AND** no se ejecuta una consulta intermedia con la página anterior

#### Scenario: Buscar estando en la primera página
- **WHEN** el usuario modifica la búsqueda mientras está en la primera página
- **THEN** la consulta aplicada conserva la página uno
- **AND** se respeta el debounce de 350 ms

### Requirement: Limpiar el criterio de búsqueda

Cuando el usuario elimine completamente el texto de búsqueda, el frontend MUST aplicar un criterio vacío después de 350 ms sin nuevas modificaciones y SHALL cargar nuevamente el listado sin criterio.

#### Scenario: Limpiar una búsqueda activa
- **WHEN** el usuario borra todo el texto del campo de búsqueda
- **THEN** el campo queda vacío inmediatamente
- **AND** no se inicia la carga sin criterio antes de que transcurran 350 ms
- **AND** después de la pausa se consulta la primera página sin parámetro de búsqueda efectivo

### Requirement: Conservación de estados y protección de consultas

El debounce MUST conservar los estados de carga, actualización, error y reintento existentes, y SHALL mantener la protección contra respuestas canceladas u obsoletas.

#### Scenario: Actualización después de una búsqueda aplicada
- **WHEN** transcurre el debounce y se inicia una consulta con datos previos visibles
- **THEN** los datos anteriores permanecen visibles mientras se actualiza el listado
- **AND** se muestra el estado de actualización existente

#### Scenario: Respuesta obsoleta después de cambiar la búsqueda
- **WHEN** una consulta anterior termina después de que se aplicó un criterio de búsqueda más reciente
- **THEN** su respuesta no reemplaza los resultados de la consulta vigente
- **AND** una cancelación esperada no se muestra como un error nuevo

#### Scenario: Error y reintento
- **WHEN** la consulta aplicada después del debounce falla
- **THEN** se conserva el manejo de error existente
- **AND** el usuario puede reintentar la consulta con el criterio y la página vigentes

### Requirement: Alcance limitado a búsquedas remotas

El debounce MUST aplicarse a los listados remotos de clientes, catálogo y presupuestos, y MUST NOT modificar la búsqueda local del formulario de presupuestos.

#### Scenario: Filtro local del formulario de presupuestos
- **WHEN** el usuario escribe en la búsqueda de productos o servicios del formulario de presupuestos
- **THEN** el filtrado local conserva su comportamiento actual
- **AND** no se agrega un temporizador de 350 ms ni se cambia su fuente de datos

#### Scenario: Carga inicial del listado
- **WHEN** se monta un listado sin que el usuario haya modificado su criterio de búsqueda
- **THEN** la carga inicial conserva su comportamiento actual
- **AND** no se retrasa únicamente por la existencia del debounce de búsquedas
