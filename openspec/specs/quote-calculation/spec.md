## Purpose

Define las reglas autoritativas de calculo, precision y validacion monetaria de presupuestos.

## Requirements

### Requirement: Calculo autoritativo
El sistema MUST calcular en el backend subtotales, descuento, impuestos y total, ignorando valores calculados enviados por el cliente.

#### Scenario: Cliente envia un total manipulado
- **WHEN** el payload contiene un total diferente del derivado de sus items y ajustes
- **THEN** el sistema guarda y devuelve exclusivamente el total calculado por el backend

### Requirement: Reglas de calculo
El sistema SHALL calcular el subtotal como suma de cantidad por precio, aplicar el descuento general, calcular impuestos sobre la base descontada y obtener el total como subtotal menos descuento mas impuestos.

#### Scenario: Porcentaje de descuento e impuesto
- **WHEN** un presupuesto contiene items gravados y un descuento porcentual valido
- **THEN** el sistema distribuye el descuento, calcula los impuestos sobre la base resultante y devuelve el desglose

#### Scenario: Descuento fijo excesivo
- **WHEN** el descuento fijo supera el subtotal
- **THEN** el sistema rechaza el presupuesto con un error de validacion

### Requirement: Precision monetaria
El sistema MUST usar aritmetica decimal y redondear importes monetarios a dos decimales con una regla consistente.

#### Scenario: Operacion con fracciones
- **WHEN** cantidad, precio, descuento o impuesto producen mas de dos decimales
- **THEN** el sistema aplica la misma regla de redondeo en persistencia, respuesta y PDF

### Requirement: Validacion de items y fechas
El sistema SHALL exigir cantidades mayores que cero, importes no negativos, porcentajes entre cero y cien, descripcion de item y vigencia no anterior a la emision.

#### Scenario: Cantidad cero y fecha invalida
- **WHEN** un presupuesto incluye cantidad cero o una vigencia anterior a la emision
- **THEN** el sistema rechaza la operacion e identifica cada dato invalido
