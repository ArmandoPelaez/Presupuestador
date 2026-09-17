## Why

La numeración actual del PDF se agrega después de generar el contenido y puede desbordar el área imprimible, provocando que PDFKit cree páginas adicionales. Esto produce documentos con una cantidad de páginas incorrecta y deja la numeración desalineada con el contenido; debe corregirse antes de confiar en la exportación para presupuestos de una o varias páginas.

## What Changes

- Corregir la numeración para que se dibuje dentro de cada página ya generada, sin crear páginas nuevas.
- Mantener los encabezados de tabla, el contenido existente y los pies de página durante la generación.
- Agregar pruebas que verifiquen la cantidad exacta de páginas para presupuestos de una y tres páginas.
- Agregar pruebas de extracción de texto para comprobar que cada página contiene su número correspondiente y que los datos e importes persistidos permanecen intactos.
- Verificar que la generación de PDFs de una y varias páginas conserve el contenido esperado y que todos los tests existentes continúen pasando.

## Capabilities

### New Capabilities

<!-- No se introduce una capacidad funcional nueva. -->

### Modified Capabilities

- `quote-pdf-export`: la exportación debe conservar exactamente la cantidad de páginas producida por el contenido y mostrar la numeración correspondiente dentro de cada página, manteniendo sus encabezados y pies de página.

## Impact

- `backend/src/modules/quotes/pdf.service.ts`: lógica de renderizado y numeración de páginas.
- `backend/src/modules/quotes/pdf.service.spec.ts` y utilidades de prueba PDF: pruebas de conteo de páginas, extracción de texto y preservación de datos.
- La respuesta HTTP de exportación mantiene el mismo formato PDF, datos persistidos, totales y reglas de acceso; no se modifica el modelo de presupuestos ni se agregan dependencias de negocio.
