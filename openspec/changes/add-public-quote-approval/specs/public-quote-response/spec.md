## ADDED Requirements

### Requirement: Generación segura del enlace público
El sistema SHALL generar automáticamente un único enlace público al guardar un presupuesto y MUST proteger el token con hash para acceso público y cifrado para recuperación autenticada del propietario.

#### Scenario: Guardar un borrador
- **WHEN** el propietario guarda un presupuesto válido
- **THEN** el sistema crea su enlace estable y mantiene el presupuesto en borrador

#### Scenario: Recuperar el enlace
- **WHEN** el propietario vuelve a abrir el detalle antes de la respuesta o vencimiento
- **THEN** el sistema devuelve la misma URL desde el token cifrado sin reemplazarla

#### Scenario: Compartir un presupuesto finalizado
- **WHEN** el propietario intenta generar un enlace para un presupuesto aprobado o rechazado
- **THEN** el sistema rechaza la operación y no crea credenciales públicas

### Requirement: Vigencia del enlace
El sistema MUST mantener el enlace hasta que el cliente acepte, rechace o llegue su vencimiento y SHALL impedir su uso después de cualquiera de esos eventos.

#### Scenario: Abrir un enlace vencido
- **WHEN** una persona intenta abrir un enlace cuya vigencia terminó
- **THEN** el sistema no expone el presupuesto y devuelve una respuesta pública genérica

#### Scenario: Copiar el enlace
- **WHEN** el propietario activa el control Copiar link y la URL se copia correctamente
- **THEN** el sistema cambia el presupuesto de borrador a enviado y conserva la misma URL

#### Scenario: Descargar PDF
- **WHEN** el propietario descarga correctamente el PDF de un borrador
- **THEN** el sistema cambia el presupuesto a enviado y conserva la misma URL

### Requirement: Consulta pública mínima
El sistema SHALL mostrar mediante un enlace válido una representación de solo lectura del presupuesto y MUST excluir identificadores internos, credenciales y datos ajenos al documento compartido.

#### Scenario: Consultar un presupuesto enviado
- **WHEN** una persona abre un enlace activo y vigente de un presupuesto enviado
- **THEN** el sistema muestra identidad comercial disponible, número, fechas, cliente, ítems, moneda, notas y totales persistidos

#### Scenario: Consultar con token inválido
- **WHEN** una persona usa un token inexistente o alterado
- **THEN** el sistema no revela si el presupuesto existe ni expone datos de ninguna cuenta

### Requirement: Respuesta única del cliente
El sistema SHALL permitir aceptar o rechazar una única vez un presupuesto enviado mediante su enlace activo y MAY registrar un comentario acotado asociado a la respuesta.

#### Scenario: Aceptar un presupuesto
- **WHEN** el cliente confirma la aceptación usando un enlace válido de un presupuesto enviado
- **THEN** el sistema registra la respuesta y actualiza atómicamente el presupuesto original a aprobado

#### Scenario: Rechazar un presupuesto
- **WHEN** el cliente confirma el rechazo usando un enlace válido de un presupuesto enviado
- **THEN** el sistema registra la respuesta y actualiza atómicamente el presupuesto original a rechazado

#### Scenario: Responder nuevamente
- **WHEN** se intenta enviar otra decisión después de registrar una respuesta final
- **THEN** el sistema conserva la primera decisión y comunica que el presupuesto ya fue respondido

#### Scenario: Respuestas concurrentes
- **WHEN** llegan decisiones diferentes de forma simultánea para el mismo enlace
- **THEN** el sistema confirma una sola decisión y no deja el enlace y el presupuesto en estados contradictorios

### Requirement: Experiencia pública sin autenticación
El sistema SHALL ofrecer una pantalla pública responsive fuera del área autenticada, con acciones claras, confirmación previa y resultado final accesible.

#### Scenario: Responder desde un teléfono
- **WHEN** el cliente consulta y responde el presupuesto desde una pantalla móvil
- **THEN** puede leer el documento, confirmar su decisión y conocer el resultado sin iniciar sesión
