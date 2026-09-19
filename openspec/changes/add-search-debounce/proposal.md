## Why

Las búsquedas remotas de clientes, catálogo y presupuestos pueden iniciar una consulta por cada pulsación, incluso cuando el usuario todavía está escribiendo. Esto genera tráfico y trabajo innecesario, y puede producir actualizaciones excesivas de la interfaz; aplicar un debounce uniforme de 350 ms mejora la eficiencia sin cambiar el contrato de la API ni la respuesta inmediata del campo de entrada.

## What Changes

- Agregar debounce de 350 ms al criterio de búsqueda de los listados remotos de clientes, catálogo y presupuestos.
- Actualizar el valor visible del campo inmediatamente, pero ejecutar la consulta únicamente después de 350 ms sin nuevas pulsaciones.
- Reiniciar el temporizador ante cada cambio y consultar solamente el último criterio escrito.
- Restablecer la paginación a la primera página cuando cambie el criterio de búsqueda.
- Volver a cargar el listado sin criterio cuando el usuario limpie la búsqueda.
- Aplicar el debounce también al listado de presupuestos aunque la consulta pueda resolverse mediante cache.
- Conservar los estados actuales de carga, actualización, error y reintento, así como la protección contra respuestas obsoletas.
- Mantener fuera del alcance la búsqueda local del formulario de presupuestos.
- No modificar endpoints, parámetros de API ni persistencia.

## Capabilities

### New Capabilities

- `remote-search-debounce`: Comportamiento de debounce para búsquedas remotas en los listados de clientes, catálogo y presupuestos.

### Modified Capabilities

<!-- No se modifican los requisitos funcionales de clientes, catálogo ni presupuestos; el cambio agrega un contrato transversal del frontend para el inicio de sus búsquedas remotas. -->

## Impact

- Componentes frontend de los listados de clientes, catálogo y presupuestos.
- Posible utilidad o hook reutilizable de debounce en el frontend.
- Pruebas de componentes o utilidades con temporizadores controlados.
- Integración con el hook de consultas existente para conservar cancelación, invalidación de requests y estados de actualización.
- Sin cambios en endpoints, DTOs, servicios backend, cache, base de datos o autenticación.
