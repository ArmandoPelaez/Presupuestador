## 1. Fase 1 — Especificación y decisiones

- [x] 1.1 Definir el alcance del enlace público, la respuesta única y las exclusiones del MVP.
- [x] 1.2 Especificar generación, regeneración, revocación y vencimiento del enlace.
- [x] 1.3 Especificar la proyección pública mínima y la ausencia de autenticación del cliente.
- [x] 1.4 Especificar aceptación, rechazo, concurrencia y actualización autoritativa del estado.
- [x] 1.5 Registrar decisiones de seguridad, modelo de acceso bearer, riesgos y estrategia de migración.

## 2. Fase 2 — Persistencia y seguridad

- [x] 2.1 Incorporar `QuoteShareLink` al esquema Prisma con relación, hash único, vencimiento, revocación y respuesta.
- [x] 2.2 Crear y aplicar una migración compatible con los presupuestos existentes.
- [x] 2.3 Implementar generación criptográfica, hash y comparación segura de tokens sin registrarlos.
- [x] 2.4 Implementar una sola credencial activa por presupuesto y regeneración transaccional.
- [x] 2.5 Configurar duración por defecto, límites de comentario y URL pública por entorno.

## 3. Fase 3 — Backend privado y público

- [x] 3.1 Implementar servicio y endpoints autenticados para generar y revocar enlaces propios.
- [x] 3.2 Aplicar `DRAFT → SENT` de forma atómica durante la primera generación.
- [x] 3.3 Implementar consulta pública con proyección mínima y errores no enumerables.
- [x] 3.4 Implementar DTO y endpoint público de decisión con validación estricta.
- [x] 3.5 Actualizar enlace y presupuesto atómicamente, rechazando respuestas repetidas o concurrentes.
- [x] 3.6 Incorporar rate limiting específico para consulta y respuesta pública.

## 4. Fase 4 — Interfaz del propietario

- [x] 4.1 Agregar acciones de compartir, copiar, regenerar y revocar en el detalle del presupuesto.
- [x] 4.2 Mostrar estados de carga, confirmaciones, vencimiento y errores accesibles.
- [x] 4.3 Refrescar el detalle y el listado para reflejar envío y respuesta del cliente.

## 5. Fase 5 — Portal público del cliente

- [x] 5.1 Crear la ruta pública `/p/[token]` fuera del shell autenticado.
- [x] 5.2 Mostrar identidad comercial, presupuesto e importes persistidos en modo de solo lectura.
- [x] 5.3 Implementar aceptación y rechazo con confirmación y comentario opcional.
- [x] 5.4 Mostrar resultados finales y estados inválido, vencido, revocado o ya respondido.
- [ ] 5.5 Verificar accesibilidad y layouts móvil, tablet y escritorio.

## 6. Fase 6 — Pruebas y entrega

- [x] 6.1 Cubrir generación, hash, regeneración, revocación y vencimiento con pruebas unitarias.
- [x] 6.2 Cubrir proyección pública, aislamiento y ausencia de datos privados con pruebas de API.
- [x] 6.3 Cubrir aceptación, rechazo, repetición y decisiones concurrentes.
- [x] 6.4 Agregar recorrido e2e propietario → enlace público → cliente → estado actualizado.
- [x] 6.5 Ejecutar migración limpia, lint, type-check, pruebas y builds de ambos proyectos.
- [x] 6.6 Documentar variables, límites de seguridad, despliegue y operación del enlace público.

## 7. Revisión — Enlace automático y acciones de envío

- [x] 7.1 Actualizar diseño y especificaciones para enlace único generado al guardar y vigente hasta respuesta o vencimiento.
- [x] 7.2 Persistir el token cifrado junto al hash y recuperar la misma URL solo para el propietario autenticado.
- [x] 7.3 Generar o asegurar el enlace al crear y consultar un presupuesto sin cambiar su estado borrador.
- [x] 7.4 Cambiar borrador a enviado al copiar el enlace o descargar el PDF, de forma idempotente.
- [x] 7.5 Simplificar el detalle: URL compacta, check Copiar link y Descargar PDF; eliminar acciones manuales y el panel de gestión del enlace.
- [x] 7.6 Actualizar pruebas unitarias/e2e y documentación del comportamiento revisado.
- [x] 7.7 Ejecutar lint, type-check, pruebas, builds y validación OpenSpec estricta.
