## ADDED Requirements

### Requirement: Actualización por respuesta pública
El sistema SHALL permitir que una respuesta pública válida realice la transición de un presupuesto enviado a aprobado o rechazado y MUST conservar las restricciones existentes para estados finales.

#### Scenario: Respuesta pública aceptada
- **WHEN** el enlace activo registra una aceptación sobre un presupuesto enviado
- **THEN** el presupuesto original queda aprobado y ya no admite edición, eliminación ni otra decisión

#### Scenario: Respuesta pública rechazada
- **WHEN** el enlace activo registra un rechazo sobre un presupuesto enviado
- **THEN** el presupuesto original queda rechazado y ya no admite edición, eliminación ni otra decisión

#### Scenario: Respuesta sobre estado no elegible
- **WHEN** una solicitud pública intenta responder un presupuesto que ya no está enviado
- **THEN** el sistema rechaza el cambio y conserva el estado existente
