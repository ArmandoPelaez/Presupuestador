## ADDED Requirements

### Requirement: Numeración de páginas sin páginas adicionales

El sistema MUST agregar el número correspondiente dentro de cada página existente del PDF y MUST conservar exactamente la cantidad de páginas producida por el contenido del presupuesto.

#### Scenario: Presupuesto de una página

- **WHEN** se exporta un presupuesto cuyo contenido ocupa una sola página
- **THEN** el PDF contiene exactamente una página y el texto extraído de esa página incluye `Página 1 de 1`

#### Scenario: Presupuesto de tres páginas

- **WHEN** se exporta un presupuesto cuyo contenido ocupa tres páginas
- **THEN** el PDF contiene exactamente tres páginas y el texto extraído de cada página incluye, respectivamente, `Página 1 de 3`, `Página 2 de 3` y `Página 3 de 3`

### Requirement: Conservación del contenido al paginar

El sistema MUST mantener los encabezados de tabla al iniciar cada página de items y MUST conservar en el PDF los datos e importes del presupuesto persistido al agregar la numeración.

#### Scenario: Contenido y totales persistidos

- **WHEN** se exporta un presupuesto con cliente, items, notas y totales persistidos
- **THEN** el texto extraído contiene esos datos y los valores de subtotal, descuento, impuestos y total sin cambios, además de la numeración de sus páginas

#### Scenario: Encabezado en páginas posteriores

- **WHEN** los items requieren más de una página
- **THEN** cada página que contiene items comienza con los encabezados `Descripción`, `Cantidad`, `Precio` y `Total`
