## Why

Las pantallas que consultan datos muestran estados de carga y error de forma inconsistente. Algunas cargas no capturan fallos y pueden quedar indefinidamente en "Cargando…", mientras que ninguna ofrece un reintento manual uniforme que conserve el contexto del usuario.

Esta corrección busca que una falla de red o del servidor sea recuperable desde la interfaz sin recargar la página ni perder filtros, búsqueda, paginación o datos previamente visibles.

## What Changes

- Definir estados explícitos para la primera carga, carga exitosa, actualización, error y reintento manual.
- Incorporar mensajes de error seguros y accionables en listados, dashboard y vistas de detalle que consultan datos.
- Agregar una acción visible **Reintentar** para las cargas fallidas.
- Mantener los datos existentes mientras se ejecuta una actualización y evitar reemplazarlos por una pantalla vacía.
- Repetir el mismo request con sus parámetros actuales al seleccionar **Reintentar**.
- Cancelar o ignorar respuestas de requests obsoletos cuando cambien filtros, búsqueda, paginación o la pantalla se desmonte.
- Normalizar en el cliente API la información necesaria para distinguir errores recuperables de sesión, autorización, inexistencia o validación.
- Mantener el reintento manual como único mecanismo de reintento en esta etapa; no agregar reintentos automáticos.
- Agregar pruebas para estados iniciales, errores, reintentos exitosos, errores durante actualización y requests obsoletos.

## Capabilities

### New Capabilities

- `frontend-data-loading-resilience`: Estados consistentes de carga y error para consultas de datos del frontend, con reintento manual y preservación del contexto de la pantalla.

### Modified Capabilities

<!-- No se modifican requisitos de negocio ni contratos de las capacidades existentes. -->

## Impact

- Componentes de listados de presupuestos, clientes y catálogo.
- Dashboard y vistas de detalle de presupuestos, clientes y conceptos de catálogo.
- Cliente HTTP compartido del frontend y utilidades de estado para consultas.
- Pruebas unitarias y de componentes del frontend.
- No se modifican endpoints, persistencia, autenticación ni lógica de negocio del backend.
- No se agregan dependencias externas ni colores fuera de la paleta centralizada.
