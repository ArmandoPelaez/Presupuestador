## Context

Los listados de clientes, catálogo y presupuestos mantienen el texto de búsqueda en estado local y lo incorporan directamente al `path` que consume `useApiQuery`. Por eso, cada pulsación puede iniciar una nueva consulta. El hook de consultas ya aborta la request anterior, ignora respuestas obsoletas y conserva los estados de carga, actualización, error y reintento; este cambio debe reutilizar ese comportamiento.

El frontend ya cuenta con React, Vitest y Testing Library, por lo que no es necesario agregar una dependencia de debounce. La búsqueda del formulario de presupuestos filtra datos locales en memoria y queda fuera del alcance.

## Goals / Non-Goals

**Goals:**

- Esperar exactamente 350 ms desde la última modificación del criterio antes de aplicar una búsqueda remota.
- Mantener el valor visible del input actualizado sin retraso.
- Aplicar el comportamiento a clientes, catálogo y presupuestos, aunque la consulta de presupuestos pueda resolverse mediante cache.
- Consultar únicamente el último criterio escrito durante una ráfaga de cambios.
- Reiniciar la consulta en la primera página al aplicar un nuevo criterio, sin provocar una request intermedia con la página anterior.
- Mantener la semántica existente de `useApiQuery`, incluidos cancelación, invalidación de respuestas obsoletas y estados de actualización.
- Cubrir el comportamiento con pruebas unitarias y de integración de componentes.

**Non-Goals:**

- No cambiar endpoints, parámetros, contratos, servicios backend ni persistencia.
- No implementar cache nueva ni modificar la estrategia de cache existente.
- No aplicar debounce a la búsqueda local del formulario de presupuestos.
- No cambiar el tiempo de espera por configuración de usuario.
- No agregar reintentos automáticos ni modificar el manejo de errores existente.

## Decisions

### 1. Crear una utilidad local reutilizable para valores debounced

Se implementará una utilidad o hook local, por ejemplo `useDebouncedValue`, que reciba el valor actual y el retraso de 350 ms. Usará un temporizador con limpieza al cambiar el valor o desmontar el componente, sin incorporar una dependencia externa.

**Alternativas consideradas:**

- **Usar `debounce-fn` u otra dependencia:** se descarta porque agrega acoplamiento innecesario y el comportamiento requerido es pequeño y controlable con APIs nativas de React.
- **Implementar un temporizador distinto en cada listado:** se descarta porque duplicaría la lógica y podría producir diferencias entre pantallas.
- **Usar `useDeferredValue`:** se descarta porque no garantiza un retraso fijo de 350 ms ni el contrato de “una consulta después de la última pulsación”.

### 2. Separar el valor de edición del criterio aplicado a la consulta

Cada listado conservará un valor de entrada inmediato y un criterio aplicado después del debounce. El `path` de `useApiQuery` dependerá del criterio aplicado, no del texto que todavía está siendo editado. Por lo tanto, durante la espera se conservan los resultados visibles y no se dispara una consulta por cada tecla.

Cuando el temporizador finalice, el criterio de búsqueda y la página de consulta se aplicarán como una única transición lógica con la página 1. Esto evita que, si el usuario estaba en otra página, se genere primero una request con el nuevo texto y la página antigua, seguida de otra request para la página 1.

### 3. Mantener el debounce delante de cualquier lookup o cache

La clave o `path` utilizado para consultar el listado de presupuestos solo se actualizará después de los 350 ms. La existencia de cache no cambia este requisito: primero se espera la pausa del usuario y luego se permite que la capa de consulta resuelva mediante red o cache.

### 4. Aplicar el comportamiento solamente a búsquedas remotas

El cambio cubrirá los campos de búsqueda de clientes, catálogo y presupuestos. El filtro `catalogSearch` del formulario de presupuestos no se modificará porque trabaja sobre datos ya cargados localmente y no inicia una consulta remota.

### 5. Conservar la integración con `useApiQuery`

No se agregará una segunda capa de cancelación ni se cambiará el hook de consultas salvo que sea estrictamente necesario para integrar el valor aplicado. Al cambiar el `path` después del debounce, `useApiQuery` seguirá cancelando la ejecución anterior, ignorando respuestas obsoletas y mostrando actualización sobre los datos existentes.

### 6. Validar con temporizadores controlados

Las pruebas usarán temporizadores falsos para comprobar que no existe una consulta antes de los 350 ms, que una ráfaga de cambios produce una única consulta con el último valor y que el temporizador se limpia durante un desmontaje. Se verificarán también el reinicio de página y el vaciado del criterio.

## Risks / Trade-offs

- [El usuario puede ver resultados del criterio anterior durante la espera] → Mantenerlos visibles y dejar que los estados existentes indiquen la actualización solamente cuando se aplica el nuevo criterio; esto evita pantallas vacías y es coherente con el comportamiento actual.
- [El cambio de búsqueda puede provocar una request intermedia con una página antigua] → Aplicar criterio y página 1 como una única transición de consulta y cubrirlo con una prueba desde una página mayor que 1.
- [Un temporizador pendiente puede actualizar un componente desmontado] → Limpiar el temporizador en el cleanup de la utilidad y verificarlo con una prueba de desmontaje.
- [La búsqueda de presupuestos puede devolver cache y ocultar el efecto del debounce] → Testear el momento en que cambia el `path` o la clave de consulta, independientemente de si la respuesta final proviene de cache o red.
- [Una implementación inconsistente entre listados puede generar experiencias distintas] → Centralizar la lógica temporal y reutilizar el mismo contrato en los tres consumidores.

## Migration Plan

1. Agregar la utilidad reutilizable y sus pruebas.
2. Migrar clientes, catálogo y presupuestos para separar input inmediato de criterio aplicado.
3. Agregar pruebas de cada listado o de una prueba compartida con cobertura explícita de los tres consumidores.
4. Ejecutar lint, type-check, build y la suite de tests del frontend.

No se requiere migración de datos ni despliegue coordinado con el backend. El rollback consiste en retirar la utilidad y restaurar el uso directo del estado de búsqueda en los tres listados.

## Open Questions

No quedan decisiones funcionales abiertas para implementar este cambio. El retraso está fijado en 350 ms y el debounce se aplica también al borrado del criterio, por lo que la carga sin búsqueda ocurre después de la misma pausa.
