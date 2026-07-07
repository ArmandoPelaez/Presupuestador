## Context

El sistema ya posee presupuestos asociados a un propietario, estados `DRAFT`, `SENT`, `APPROVED` y `REJECTED`, cálculo autoritativo en backend y una vista privada protegida por JWT. Actualmente el propietario cambia los estados manualmente y el cliente no dispone de una vista ni identidad dentro de la aplicación.

El enlace público será una credencial bearer: quien lo posea podrá consultar una representación limitada del presupuesto enviado y emitir una respuesta final. Esto cruza frontend, API y persistencia y exige prevenir enumeración, filtraciones en logs, respuestas dobles y exposición de datos privados.

## Goals / Non-Goals

**Goals:**

- Permitir compartir un presupuesto sin exigir una cuenta al cliente.
- Mantener el presupuesto persistido como fuente autoritativa de contenido, importes y estado.
- Permitir una única transición pública válida desde `SENT` a `APPROVED` o `REJECTED`.
- Hacer el acceso impredecible, revocable, vencible y resistente a solicitudes concurrentes.
- Exponer solamente los datos necesarios para evaluar el presupuesto.

**Non-Goals:**

- Enviar automáticamente el enlace por email, SMS o WhatsApp.
- Verificar la identidad legal del receptor, solicitar firma electrónica o aportar no repudio.
- Permitir negociación, edición del presupuesto o múltiples rondas de respuesta desde la página pública.
- Crear una cuenta de cliente o reutilizar la autenticación JWT del propietario.
- Mantener múltiples enlaces activos para el mismo presupuesto.

## Decisions

### 1. Enlace bearer sin cuenta del cliente

La ruta pública usará un token aleatorio de alta entropía generado por el backend al guardar el presupuesto. La base almacenará su hash para validar accesos públicos y una copia cifrada recuperable únicamente desde endpoints autenticados del propietario. El enlace será único y estable hasta aceptación, rechazo o vencimiento.

Alternativa considerada: autenticar al cliente con cuenta o código por email. Se descarta para esta primera versión porque agrega gestión de identidad y entrega de mensajes fuera del alcance solicitado.

### 2. Entidad separada para compartir

Se incorporará una entidad `QuoteShareLink` relacionada con `Quote`, con hash único, token cifrado, vencimiento, creación y respuesta. Solo podrá existir un enlace vigente por presupuesto y no se ofrecerán regeneración ni revocación manual.

Una entidad separada evita cargar `Quote` con credenciales y metadatos de acceso. No se guardarán IP ni user-agent en el MVP para reducir datos personales.

### 3. Copiar o descargar equivale a enviar

La generación automática conservará el presupuesto en `DRAFT`. Copiar el enlace o descargar el PDF realizará `DRAFT → SENT`; repetir cualquiera de esas acciones será idempotente. Los estados finales no admitirán enlaces nuevos.

La pantalla privada elimina aprobar, rechazar, editar y eliminar: muestra únicamente la URL compacta, el control para copiar y la descarga PDF. La decisión final corresponde exclusivamente al cliente desde el portal público.

### 4. API pública mínima

La API incorporará:

- Generación automática durante `POST /quotes`, recuperación autenticada de la URL y `POST /quotes/:id/share/copied` para registrar el envío.
- `GET /public/quotes/:token`, sin JWT, para obtener la proyección pública.
- `POST /public/quotes/:token/decision`, sin JWT, para aceptar o rechazar con comentario opcional.

La proyección pública incluirá identidad comercial disponible, número, estado, fechas, cliente, ítems, moneda, notas y totales. Excluirá IDs internos, email del propietario, hashes, metadatos del enlace y otros recursos de la cuenta.

### 5. Respuesta única y atómica

La decisión se procesará en una transacción que verifique simultáneamente: hash válido, enlace no revocado, no vencido, no respondido y presupuesto aún `SENT`. La actualización del estado y el registro de la respuesta se confirmarán juntos.

Una repetición posterior mostrará el resultado ya registrado sin cambiarlo. Solicitudes concurrentes no podrán producir decisiones diferentes.

### 6. Vencimiento y revocación

Si `validUntil` existe, será el límite máximo del enlace. Si no existe, se usará una duración configurable y acotada. El enlace permanecerá vigente hasta respuesta o vencimiento, sin regeneración ni revocación manual.

Para token inválido, vencido o revocado, la API devolverá una respuesta pública genérica que no permita distinguir presupuestos existentes de inexistentes.

### 7. Ruta pública fuera del shell privado

Next.js incorporará `/p/[token]` fuera del layout autenticado. La pantalla será de solo lectura, responsive y accesible, con confirmación antes de aceptar o rechazar, comentario opcional y resultado final explícito.

## Risks / Trade-offs

- [El enlace puede ser reenviado a otra persona] → Tratarlo como credencial, usar alta entropía, HTTPS, vencimiento, revocación y no registrarlo; documentar que no equivale a firma digital.
- [El token recuperable aumenta el impacto de una filtración de base] → Conservar el hash para acceso público y cifrar el token con una clave derivada del secreto del servidor.
- [Dos respuestas llegan al mismo tiempo] → Verificación y actualización condicional dentro de una transacción; solo una puede cerrar el presupuesto.
- [Un borrador ya posee enlace antes de enviarse] → Mantener la URL dentro del detalle autenticado y marcar `SENT` al copiarla o descargar el PDF.
- [La URL aparece en historial o herramientas analíticas] → No incorporar analítica de terceros en la ruta pública, usar política de referrer restrictiva y evitar logs de parámetros sensibles.
- [Abuso de endpoints públicos] → Respuestas uniformes, límites de tamaño, validación estricta y rate limiting por ruta antes de exposición pública.

## Migration Plan

1. Crear la tabla y los índices sin modificar presupuestos existentes.
2. Desplegar backend con endpoints privados y públicos deshabilitados hasta que la migración esté aplicada.
3. Desplegar la ruta pública y controles privados.
4. Validar generación, revocación, vencimiento y concurrencia en un entorno de prueba.
5. Habilitar la función; no se crean enlaces retroactivamente.

Rollback: deshabilitar los endpoints y la UI, conservar la tabla sin uso y volver a la versión anterior. Los estados ya aceptados o rechazados no se revertirán automáticamente.

## Open Questions

- Definir la duración por defecto cuando el presupuesto no tenga `validUntil`; propuesta inicial: 30 días.
- Confirmar si el comentario del cliente será opcional para aceptar y obligatorio para rechazar; propuesta inicial: opcional en ambos casos.
- Confirmar qué datos comerciales del propietario deben aparecer además de nombre del negocio y CUIT disponibles.
