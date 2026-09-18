## 1. Base de estados y cliente HTTP

- [x] 1.1 Definir el modelo de estado compartido para primera carga, éxito, actualización y error de consultas de lectura.
- [x] 1.2 Implementar la utilidad o hook local para ejecutar consultas, exponer `retry`, aceptar `AbortSignal` y evitar respuestas de ejecuciones obsoletas.
- [x] 1.3 Ajustar el cliente API para propagar cancelación mediante `RequestInit`, conservar la redirección existente para `401` y normalizar errores utilizables por la UI.
- [x] 1.4 Agregar pruebas unitarias para éxito, error, cancelación, reintento manual y descarte de respuestas obsoletas.

## 2. Componentes reutilizables de interfaz

- [x] 2.1 Crear o adaptar componentes de estado de carga inicial, actualización y error con acción **Reintentar**.
- [x] 2.2 Garantizar semántica accesible para alertas, regiones vivas, foco, nombres de botones y estado deshabilitado durante un reintento.
- [x] 2.3 Verificar que los estados visuales consuman únicamente tokens y utilidades de la paleta centralizada.
- [x] 2.4 Agregar pruebas de componentes para carga, error, reintento exitoso y reintento bloqueado mientras hay una consulta pendiente.

## 3. Listados y dashboard

- [x] 3.1 Migrar el listado de presupuestos para distinguir carga inicial de actualización y agregar reintento conservando filtro y paginación.
- [x] 3.2 Migrar los listados de clientes y catálogo para capturar errores, mostrar recuperación y conservar búsqueda, filtros y página.
- [x] 3.3 Completar el dashboard para manejar errores de resumen y de presupuestos de forma independiente, con reintento manual para cada carga fallida.
- [x] 3.4 Cancelar o invalidar consultas anteriores cuando cambien búsqueda, filtros, paginación o se desmonte una pantalla de listado.
- [x] 3.5 Agregar o actualizar pruebas de los listados y dashboard para respuestas fuera de orden, errores iniciales y errores durante actualización.

## 4. Vistas de detalle

- [x] 4.1 Migrar el detalle de presupuesto para mostrar error inicial y reintentar la carga del mismo presupuesto sin alterar las acciones existentes.
- [x] 4.2 Migrar los detalles de cliente y catálogo para mostrar error inicial y reintentar el mismo identificador.
- [x] 4.3 Evitar que la cancelación de una carga de detalle se anuncie como error y preservar el estado de las acciones mutantes existentes.
- [x] 4.4 Agregar o actualizar pruebas de detalle para error, reintento exitoso y desmontaje durante la carga.

## 5. Verificación transversal

- [x] 5.1 Revisar que no queden consultas de lectura dentro del alcance sin captura de error ni acción de recuperación cuando corresponda.
- [x] 5.2 Verificar que no se hayan introducido reintentos automáticos ni repetición automática de operaciones mutantes.
- [x] 5.3 Ejecutar `npm.cmd run lint`, `npm.cmd run type-check` y `npm.cmd run build` desde `frontend`.
- [x] 5.4 Ejecutar la suite de pruebas frontend y verificar los criterios de aceptación del cambio.
