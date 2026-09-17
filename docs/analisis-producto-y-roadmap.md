# Análisis técnico, funcional y roadmap de evolución

## 1. Resumen ejecutivo

El proyecto nació como un presupuestador y actualmente evolucionó hacia un MVP de gestión comercial con:

- Presupuestos.
- Clientes.
- Catálogo de productos y servicios.
- Cálculo de totales en backend.
- Exportación a PDF.
- Enlaces públicos para aceptar o rechazar presupuestos.
- Autenticación con email y Google.
- Generación de borradores asistidos por IA.

La base técnica es adecuada para continuar desarrollando el producto, pero todavía debe considerarse un MVP en etapa de estabilización. Antes de incorporar pagos, inventario, facturación o automatizaciones comerciales, es necesario asegurar la confiabilidad, seguridad y consistencia de los flujos actuales.

Actualmente el producto no es un punto de venta completo. Es un gestor de presupuestos con una primera capacidad de aprobación online.

## 2. Fortalezas actuales

### Arquitectura

- Backend modular en NestJS.
- Persistencia con Prisma y SQLite.
- Separación entre autenticación, clientes, catálogo, presupuestos, dashboard, PDF e IA.
- Cálculo autoritativo en backend mediante Decimal.
- Transacciones para crear y actualizar presupuestos.
- Aislamiento de datos por usuario autenticado.
- Validación global de DTOs con whitelist y rechazo de campos no autorizados.

### Seguridad y aprobación

- Tokens públicos de alta entropía.
- Hash del token para validación.
- Token recuperable almacenado cifrado.
- Vencimiento y respuesta única.
- Actualización autoritativa cuando el cliente acepta o rechaza.
- Rate limiting en las rutas públicas y de IA.

## 3. Hallazgos principales

### 3.1 PDF y documento comercial

El PDF de muestra presenta un problema de paginación: el contenido ocupa tres páginas, pero los números de página se agregan en tres páginas adicionales. El resultado termina teniendo seis páginas.

El test actual solo comprueba que se genere un archivo PDF válido, pero no valida paginación, cortes ni legibilidad.

También conviene mejorar:

- Formato monetario localizado.
- Estado traducido al español.
- Logo y datos completos del negocio.
- Condiciones comerciales.
- Métodos de pago.
- Datos bancarios o instrucciones de transferencia.
- Pie de página y contacto.
- Vista previa antes de descargar o compartir.

Referencia: backend/src/modules/quotes/pdf.service.ts.

### 3.2 Impuestos incompletos

El backend soporta tasas de impuesto por ítem, pero el flujo de usuario no permite utilizarlas correctamente:

- El catálogo no guarda una tasa de impuesto.
- Al agregar un concepto se asigna siempre tasa cero.
- El formulario no ofrece un campo visible para cambiar la tasa.

La funcionalidad existe técnicamente, pero no está completa desde el punto de vista del usuario.

### 3.3 Errores de carga

Varias pantallas realizan llamadas a la API sin manejar errores de red o servidor. Si la API falla, el usuario puede quedar indefinidamente viendo “Cargando…”.

Esto afecta principalmente a dashboard, presupuestos, clientes, catálogo, detalles y carga de datos dentro del formulario de presupuesto.

Todas estas vistas deben tener estados separados de carga, error, reintento y estado vacío.

### 3.4 Seguridad de autenticación

El JWT se almacena en localStorage, lo que lo expone ante una vulnerabilidad XSS. Para producción conviene migrar a cookies HttpOnly, Secure y SameSite, junto con refresh tokens rotativos.

Además:

- El secreto JWT tiene un valor por defecto incluso en producción.
- Login y registro no tienen throttling específico.
- No hay recuperación de contraseña.
- No hay invalidación de sesiones desde el servidor.
- No se observa una política CSP definida.

### 3.5 Estados y enlaces públicos

El enlace público puede seguir apareciendo asociado a presupuestos que ya fueron aprobados o rechazados en determinados caminos de actualización.

La consulta pública debería comprobar explícitamente que el presupuesto está enviado y que el enlace continúa habilitado antes de devolver información.

También conviene evitar que la URL completa con el token se repita en respuestas de error o sistemas de observabilidad.

### 3.6 Dashboard desaprovechado

El backend calcula importes agrupados por estado, pero la interfaz muestra principalmente cantidades. El dashboard debería incluir:

- Total presupuestado.
- Total aprobado.
- Total pendiente.
- Tasa de aprobación.
- Ticket promedio.
- Presupuestos próximos a vencer.
- Evolución mensual.

### 3.7 Funciones difíciles de encontrar

Existe una ruta para editar presupuestos, pero el detalle no muestra una acción visible para editar. Tampoco hay acciones visibles para eliminar borradores o actualizar manualmente el estado.

Las acciones importantes deben estar disponibles desde el lugar donde el usuario consulta el presupuesto.

### 3.8 Escalabilidad

SQLite es razonable para desarrollo, demostraciones y una instancia pequeña. No es la mejor opción para una aplicación SaaS con múltiples instancias o mayor concurrencia.

También deben revisarse la paginación dentro del formulario, las búsquedas sin debounce, las respuestas fuera de orden, la falta de cache y la ausencia de auditoría de cambios.

## 4. Evaluación desde el usuario final

El flujo ideal para un pequeño negocio es:

1. Configurar los datos del negocio.
2. Crear o seleccionar un cliente.
3. Agregar productos o servicios.
4. Revisar impuestos, descuentos y total.
5. Ver una previsualización profesional.
6. Compartir por WhatsApp, email o enlace.
7. Recibir aceptación o rechazo.
8. Hacer seguimiento.
9. Convertir el presupuesto aceptado en una venta.

El proyecto cubre razonablemente los pasos 2 a 7, pero todavía presenta fricción:

- No se puede crear un cliente rápidamente desde el presupuesto.
- No hay perfil completo del negocio.
- No hay previsualización del PDF.
- No hay notificación al propietario al recibir respuesta.
- El listado no busca por número ni descripción de ítems.
- Las tablas requieren desplazamiento horizontal en móvil.
- No se puede duplicar un presupuesto.
- La validez solo ofrece 7, 14 o 30 días.
- Productos y servicios no están suficientemente diferenciados.
- El cliente no ve claramente qué sucederá después de aceptar.

## 5. Si se quiere convertir en un punto de venta

Hoy faltan las piezas centrales de un POS:

- Venta u orden derivada de un presupuesto aprobado.
- Carrito y cobro inmediato.
- Métodos de pago.
- Caja diaria y cierres.
- Facturación o comprobantes.
- Devoluciones y anulaciones.
- Inventario con movimientos.
- Clientes frecuentes.
- Reportes de ventas y margen.
- Usuarios, cajeros y permisos.
- Tolerancia a mala conectividad.

El flujo objetivo sería:

Presupuesto → Aprobación → Orden de venta → Pago → Descuento de stock → Comprobante.

## 6. Roadmap recomendado

## Fase 1 — Estabilización, corrección y confiabilidad

Esta debe ser la primera fase. No se trata solamente de corregir bugs: busca que el MVP sea confiable, seguro y consistente para uso real.

### Cambios técnicos

- Corregir la paginación del PDF.
- Agregar estados de error y reintento en todas las cargas.
- Agregar debounce a las búsquedas.
- Cancelar solicitudes anteriores cuando cambia el criterio.
- Evitar que respuestas antiguas sobrescriban resultados nuevos.
- Validar PDF por cantidad de páginas y extracción de contenido.
- Agregar pruebas de integración para controllers.
- Agregar pruebas de error para endpoints principales.
- Hacer obligatorio JWT_SECRET en producción.
- Migrar progresivamente el JWT a cookies seguras.
- Agregar throttling a login y registro.
- Diseñar recuperación de contraseña.
- Evitar devolver tokens públicos dentro de URLs de error.
- Revisar expiración, revocación y estados de enlaces.
- Definir una política consistente para fechas y zonas horarias.

### Cambios funcionales mínimos

- Mostrar impuestos configurables por ítem.
- Agregar tasa predeterminada al catálogo.
- Mostrar importes con formato monetario consistente.
- Agregar editar, eliminar y cambiar estado desde el detalle.
- Mostrar errores accionables como Reintentar o Volver a cargar.

### Criterios de finalización

- El PDF conserva la cantidad correcta de páginas.
- Ninguna pantalla queda bloqueada indefinidamente ante un error.
- Las búsquedas no producen resultados inconsistentes.
- Las rutas críticas tienen pruebas de éxito y error.
- No se puede iniciar producción con el secreto JWT por defecto.
- Los impuestos pueden configurarse y verificarse desde la interfaz.

## Fase 2 — Producto de presupuestos profesional

### Perfil del negocio

- Nombre comercial.
- Logo.
- CUIT y condición fiscal.
- Dirección, teléfono y email.
- Moneda.
- Términos y condiciones.
- Datos de pago.

### Presupuestos

- Vista previa antes de compartir.
- Plantillas reutilizables.
- Duplicar presupuesto.
- Título o proyecto asociado.
- Fecha de validez personalizada.
- Búsqueda por número, cliente, notas e ítems.
- Filtros por fecha y vencimiento.
- Alertas de presupuestos por vencer.
- Historial de cambios.
- Exportación de listados.

### Comunicación

- Compartir por WhatsApp.
- Envío por email.
- Notificación al propietario al aceptar o rechazar.
- Recordatorios de seguimiento.
- Mensajes configurables para cada estado.

### Clientes y catálogo

- Crear cliente desde el presupuesto.
- Historial de presupuestos por cliente.
- Reactivar clientes y conceptos.
- Unidad y tasa de impuesto predeterminadas.
- SKU o código interno.
- Categorías.
- Precio de costo y margen.

## Fase 3 — Conversión comercial

- Convertir presupuesto aprobado en orden de venta.
- Relacionar presupuesto, orden y cliente.
- Registrar pagos parciales o completos.
- Estados de cobro.
- Saldos pendientes.
- Comprobantes.
- Notas internas.
- Seguimiento de entrega o ejecución del servicio.

## Fase 4 — Punto de venta e inventario

- Carrito de venta.
- Venta rápida sin presupuesto previo.
- Métodos de pago.
- Caja diaria, apertura y cierre.
- Usuarios y permisos de cajero.
- Movimientos de inventario.
- Entradas, salidas, ajustes y devoluciones.
- Reserva y descuento automático de stock.
- Stock mínimo y alertas.
- Costos y rentabilidad.
- Facturación o integración fiscal según el país.
- Reportes de ventas.
- Operación tolerante a conectividad intermitente.

## Fase 5 — Escalabilidad y operación

- Migrar SQLite a PostgreSQL cuando el volumen lo justifique.
- Automatizar backups y pruebas de restauración.
- Agregar observabilidad sin registrar datos sensibles.
- Métricas de errores y tiempos de respuesta.
- Logs estructurados con redacción de tokens y datos personales.
- Ejecutar pruebas E2E dentro de CI.
- Agregar tests frontend de flujos críticos.
- Incorporar pruebas de accesibilidad y responsive.
- Generar cliente API tipado desde un contrato OpenAPI.

## 7. Prioridad recomendada

| Prioridad | Objetivo | Resultado |
|---|---|---|
| P0 | PDF, errores de carga, seguridad JWT y enlaces públicos | MVP confiable y seguro |
| P1 | Impuestos, acciones del detalle, perfil comercial y formatos | Presupuestos utilizables |
| P1 | Duplicación, búsqueda, vencimientos y notificaciones | Mejor seguimiento comercial |
| P2 | Órdenes, pagos y comprobantes | Conversión de presupuesto a venta |
| P2 | Inventario y caja | Primer núcleo de POS |
| P3 | PostgreSQL, observabilidad y permisos avanzados | SaaS escalable |

## 8. Conclusión

La recomendación es comenzar por la Fase 1. El proyecto ya tiene suficiente base funcional para evolucionar, pero necesita consolidar confiabilidad y seguridad antes de ampliar su alcance.

Una vez finalizada esa fase, el producto podrá posicionarse como una herramienta profesional de presupuestos. Luego habrá que decidir si la prioridad es profundizar la gestión comercial o avanzar hacia un verdadero punto de venta.

## 9. Verificación realizada

- Frontend: lint, type-check, tests y build correctos.
- Backend: lint, type-check y tests unitarios correctos.
- Pruebas E2E existentes correctas, aunque no forman parte del pipeline principal de CI.
- Cobertura backend aproximada: 41% de statements.
- La inspección del PDF confirmó el problema de páginas adicionales.

