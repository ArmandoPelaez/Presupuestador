## Context

`PdfService` genera documentos con PDFKit usando `bufferPages: true`. Después de renderizar el presupuesto, recorre `bufferedPageRange()` y cambia a cada página para escribir `Página N de M` en la coordenada fija `y = 800`. En un A4 con margen inferior, esa coordenada queda fuera del área segura de texto; PDFKit puede interpretar la operación como un desborde y agregar una página nueva.

El cambio está acotado al backend y debe conservar la estructura visual actual: datos del negocio, datos del cliente, encabezados de tabla, items, totales, notas y pie de página. La respuesta sigue siendo un `Buffer` PDF y no se altera el modelo ni la persistencia de presupuestos.

## Goals / Non-Goals

**Goals:**

- Escribir la numeración dentro de cada página existente y mantener estable el número total de páginas.
- Reservar una posición de pie compatible con el tamaño y los márgenes configurados en PDFKit.
- Mantener el encabezado de tabla al comenzar una página nueva y conservar todos los datos e importes persistidos.
- Cubrir con tests PDFs de una página y de tres páginas, incluyendo conteo de páginas y extracción de texto.

**Non-Goals:**

- Rediseñar la plantilla del PDF o cambiar tipografías, columnas, logo o datos comerciales.
- Modificar el modelo de presupuestos, cálculos, endpoints, autorización o formato de la respuesta.
- Introducir numeración basada en una segunda pasada que regenere el documento.

## Decisions

### 1. Mantener páginas bufferizadas y numerar en la pasada final

Se conservará `bufferPages: true`, `bufferedPageRange()` y `switchToPage(index)`. La numeración depende del total final de páginas, por lo que una pasada posterior a la generación del contenido es el mecanismo adecuado; no se agregará una página ni se volverá a generar el documento.

Alternativas consideradas:

- Numerar mientras se genera el contenido: no conoce el total `M` y no puede escribir `N de M` correctamente.
- Usar un stream o postprocesador externo: agrega complejidad y dependencias sin resolver la causa del desborde.

### 2. Calcular el pie desde la geometría de la página

Se usará `doc.page.height` y `doc.page.margins.bottom` para ubicar el texto a una distancia segura del límite inferior, dejando espacio para la altura de línea del texto. La coordenada no será un literal dependiente de A4. La escritura del pie usará una operación que no fuerce un salto de página y no cambiará el flujo de contenido de la página.

Además, el límite usado para decidir cuándo insertar una página para los items deberá respetar la zona reservada al pie. Así se evita que un item o sus separadores invadan la numeración en páginas largas.

Alternativas consideradas:

- Mantener `y = 800`: es la causa del defecto y depende accidentalmente del tamaño/margen actual.
- Eliminar el pie: evita páginas extra, pero incumple la numeración requerida.

### 3. Probar el PDF real generado

Los tests conservarán la aserción de firma y contenido mínimo, y añadirán una utilidad de prueba para leer el PDF generado. Se comprobará el conteo de páginas y que el texto extraído de cada página incluya el número correspondiente; también se verificará que los datos e importes esperados continúen presentes.

La extracción se resolverá con una dependencia de desarrollo/test compatible con Node y PDFKit, si el repositorio no dispone de una ya existente. No se añadirá una dependencia de runtime de la aplicación.

## Risks / Trade-offs

- [Riesgo] Un presupuesto muy extenso puede desbordar por el alto de un item o de las notas, no solo por el pie → [Mitigación] conservar el salto de página por contenido, reservar explícitamente la zona inferior y cubrir casos de una y varias páginas.
- [Riesgo] La extracción de texto puede variar en espacios o saltos de línea según el parser → [Mitigación] normalizar whitespace en la utilidad de tests y comprobar tokens significativos, no una cadena formateada frágil.
- [Riesgo] Cambiar el umbral de contenido podría alterar el reparto visual de páginas → [Mitigación] mantener columnas, encabezados y datos sin cambios, y verificar conteo/contenido en fixtures representativos.

## Migration Plan

No hay migración de datos ni cambio de API. Se implementa el ajuste, se ejecutan los tests del backend y se verifica la generación de PDFs de una y tres páginas. El rollback consiste en revertir el cambio de `PdfService` y sus tests si apareciera una regresión.

## Open Questions

Ninguna. El tamaño, los márgenes, el pie y el contenido existentes son la fuente de verdad para la corrección.
