## ADDED Requirements

### Requirement: Cálculo autoritativo
El sistema MUST calcular en el backend subtotales, descuento, impuestos y total, ignorando valores calculados enviados por el cliente.

#### Scenario: Cliente envía un total manipulado
- **WHEN** el payload contiene un total diferente del derivado de sus ítems y ajustes
- **THEN** el sistema guarda y devuelve exclusivamente el total calculado por el backend

### Requirement: Reglas de cálculo
El sistema SHALL calcular el subtotal como suma de cantidad por precio, aplicar el descuento general, calcular impuestos sobre la base descontada y obtener el total como subtotal menos descuento más impuestos.

#### Scenario: Porcentaje de descuento e impuesto
- **WHEN** un presupuesto contiene ítems gravados y un descuento porcentual válido
- **THEN** el sistema distribuye el descuento, calcula los impuestos sobre la base resultante y devuelve el desglose

#### Scenario: Descuento fijo excesivo
- **WHEN** el descuento fijo supera el subtotal
- **THEN** el sistema rechaza el presupuesto con un error de validación

### Requirement: Precisión monetaria
El sistema MUST usar aritmética decimal y redondear importes monetarios a dos decimales con una regla consistente.

#### Scenario: Operación con fracciones
- **WHEN** cantidad, precio, descuento o impuesto producen más de dos decimales
- **THEN** el sistema aplica la misma regla de redondeo en persistencia, respuesta y PDF

### Requirement: Validación de ítems y fechas
El sistema SHALL exigir cantidades mayores que cero, importes no negativos, porcentajes entre cero y cien, descripción de ítem y vigencia no anterior a la emisión.

#### Scenario: Cantidad cero y fecha inválida
- **WHEN** un presupuesto incluye cantidad cero o una vigencia anterior a la emisión
- **THEN** el sistema rechaza la operación e identifica cada dato inválido
