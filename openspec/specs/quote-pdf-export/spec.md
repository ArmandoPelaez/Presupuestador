## Purpose

Define la exportacion segura de presupuestos a PDF desde datos persistidos.

## Requirements

### Requirement: Descarga de presupuesto en PDF
El sistema SHALL generar desde el backend un PDF del presupuesto solicitado por su propietario.

#### Scenario: Exportacion exitosa
- **WHEN** el usuario solicita exportar uno de sus presupuestos
- **THEN** el sistema devuelve un archivo PDF descargable con nombre seguro

### Requirement: Contenido del documento
El PDF MUST incluir identificacion disponible del negocio, numero, estado, fechas, cliente, items, subtotal, descuento, impuestos, total y notas disponibles.

#### Scenario: PDF consistente
- **WHEN** se genera el PDF de un presupuesto guardado
- **THEN** sus importes y datos coinciden con la version persistida y no con valores aportados por el navegador

### Requirement: Proteccion del PDF
El sistema MUST aplicar las mismas reglas de autenticacion y propiedad a la exportacion que a la consulta del presupuesto.

#### Scenario: Exportar presupuesto ajeno
- **WHEN** un usuario solicita el PDF de un presupuesto de otra cuenta
- **THEN** el sistema no genera ni revela el documento
