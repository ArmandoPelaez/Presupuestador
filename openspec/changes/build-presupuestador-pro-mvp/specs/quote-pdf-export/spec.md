## ADDED Requirements

### Requirement: Descarga de presupuesto en PDF
El sistema SHALL generar desde el backend un PDF del presupuesto solicitado por su propietario.

#### Scenario: Exportación exitosa
- **WHEN** el usuario solicita exportar uno de sus presupuestos
- **THEN** el sistema devuelve un archivo PDF descargable con nombre seguro

### Requirement: Contenido del documento
El PDF MUST incluir identificación disponible del negocio, número, estado, fechas, cliente, ítems, subtotal, descuento, impuestos, total y notas disponibles.

#### Scenario: PDF consistente
- **WHEN** se genera el PDF de un presupuesto guardado
- **THEN** sus importes y datos coinciden con la versión persistida y no con valores aportados por el navegador

### Requirement: Protección del PDF
El sistema MUST aplicar las mismas reglas de autenticación y propiedad a la exportación que a la consulta del presupuesto.

#### Scenario: Exportar presupuesto ajeno
- **WHEN** un usuario solicita el PDF de un presupuesto de otra cuenta
- **THEN** el sistema no genera ni revela el documento
