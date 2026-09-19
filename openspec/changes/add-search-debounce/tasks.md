## 1. Utilidad reutilizable de debounce

- [x] 1.1 Implementar una utilidad o hook local para devolver el último valor después de 350 ms sin cambios, limpiando el temporizador al cambiar el valor o desmontar el componente.
- [x] 1.2 Agregar pruebas unitarias con temporizadores controlados para verificar actualización inmediata del valor de entrada, espera de 350 ms, reinicio ante cambios rápidos, aplicación del último valor, limpieza del criterio y cleanup al desmontar.

## 2. Integración en listados remotos

- [x] 2.1 Migrar el listado de clientes para separar el valor visible del input del criterio aplicado al `path`, mantener la página uno al aplicar una nueva búsqueda y conservar los estados actuales de `useApiQuery`.
- [x] 2.2 Migrar el listado de catálogo con el mismo contrato de debounce, manteniendo el comportamiento inmediato de los filtros de tipo y evitando una consulta intermedia con la página anterior.
- [x] 2.3 Migrar el listado de presupuestos para aplicar el debounce antes de cualquier resolución de cache o request, manteniendo los filtros de estado y sin modificar la búsqueda local del formulario de presupuestos.
- [x] 2.4 Verificar que la carga inicial de los tres listados no se retrase por el debounce y que limpiar la búsqueda recargue la primera página sin criterio después de la pausa.

## 3. Estados, concurrencia y pruebas de integración

- [x] 3.1 Verificar que la integración continúa usando `useApiQuery` para conservar carga inicial, actualización, error, reintento, cancelación y descarte de respuestas obsoletas.
- [x] 3.2 Agregar pruebas de interacción para clientes, catálogo y presupuestos que comprueben que una ráfaga de escritura produce una sola consulta con el último valor.
- [x] 3.3 Agregar una prueba desde una página posterior que confirme que el nuevo criterio se consulta directamente en la página uno sin request intermedia con la página anterior.
- [x] 3.4 Agregar una prueba específica del listado de presupuestos que confirme que un resultado cacheado no evita la espera de 350 ms antes de resolver la búsqueda.
- [x] 3.5 Verificar que la búsqueda local del formulario de presupuestos no incorpora temporizador ni cambia su filtrado en memoria.

## 4. Validación final

- [x] 4.1 Ejecutar la suite de tests del frontend y corregir regresiones relacionadas con búsquedas, paginación, filtros o estados de consulta.
- [x] 4.2 Ejecutar `npm.cmd run lint` desde `frontend`.
- [x] 4.3 Ejecutar `npm.cmd run type-check` desde `frontend`.
- [x] 4.4 Ejecutar `npm.cmd run build` desde `frontend`.
