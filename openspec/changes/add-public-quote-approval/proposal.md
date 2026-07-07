## Why

El propietario necesita cerrar el ciclo comercial sin pedir al cliente que responda por un canal separado y luego actualizar manualmente el presupuesto. Un enlace público seguro permitirá que el cliente consulte la versión enviada y registre su aceptación o rechazo, manteniendo el presupuesto original sincronizado.

## What Changes

- Generar automáticamente un único enlace público al guardar el presupuesto y mantenerlo hasta la respuesta o el vencimiento.
- Cambiar un presupuesto borrador a enviado únicamente cuando el propietario copia el enlace o descarga el PDF.
- Incorporar una vista pública de solo lectura que no requiera cuenta del cliente.
- Permitir que el cliente acepte o rechace una única vez y deje un comentario opcional.
- Actualizar de forma autoritativa el presupuesto original a aprobado o rechazado.
- Aplicar vencimiento, respuesta única y minimización de datos públicos, sin regeneración ni revocación manual en la interfaz.
- Mantener fuera de alcance el envío automático por email o WhatsApp y la firma electrónica.

## Capabilities

### New Capabilities

- `public-quote-response`: Creación y gestión del enlace público, consulta segura del presupuesto y registro de una respuesta única del cliente.

### Modified Capabilities

- `quote-management`: Extender el ciclo de estados para que una respuesta pública válida pueda cambiar un presupuesto enviado a aprobado o rechazado.

## Impact

- Backend NestJS: nuevos endpoints autenticados de compartir/revocar y endpoints públicos de consulta/respuesta.
- Prisma/SQLite: persistencia del token protegido, vencimiento, fechas de envío/respuesta y comentario opcional.
- Frontend Next.js: controles para compartir en el detalle privado y una ruta pública responsive fuera del shell autenticado.
- Seguridad: el enlace actúa como credencial bearer, debe ser impredecible, revocable, no registrarse en logs y exponer solo datos necesarios.
- Calidad: pruebas unitarias, de integración y e2e para tokens, estados, concurrencia y aislamiento.
