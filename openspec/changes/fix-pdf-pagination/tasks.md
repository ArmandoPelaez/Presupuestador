## 1. Corrección de la paginación

- [x] 1.1 Ajustar `PdfService` para calcular la posición del pie usando la altura y los márgenes reales de la página, dejando la numeración dentro del área imprimible.
- [x] 1.2 Revisar el límite de salto de página del contenido para reservar espacio al pie sin cambiar las columnas, los encabezados ni el contenido comercial existente.
- [x] 1.3 Confirmar que la pasada final con `bufferedPageRange()` y `switchToPage()` solo escribe en páginas existentes y que el documento se cierra sin páginas agregadas por la numeración.

## 2. Cobertura de tests PDF

- [x] 2.1 Incorporar una utilidad/dependencia de desarrollo para contar páginas y extraer texto por página del Buffer PDF generado.
- [x] 2.2 Extender los fixtures de `PdfService` para generar un presupuesto que ocupe una página y otro que ocupe tres páginas.
- [x] 2.3 Agregar aserciones de cantidad exacta de páginas: una para el fixture corto y tres para el fixture largo.
- [x] 2.4 Agregar aserciones de extracción de contenido para `Página 1 de 1` y para `Página 1 de 3`, `Página 2 de 3` y `Página 3 de 3` en sus páginas respectivas.
- [x] 2.5 Verificar mediante extracción que encabezados, datos del cliente, items, notas y subtotal, descuento, impuestos y total persistidos no cambien.

## 3. Verificación

- [x] 3.1 Ejecutar los tests existentes y nuevos del backend.
- [x] 3.2 Ejecutar `npm run lint`, `npm run type-check` y `npm run build` dentro de `backend` y corregir cualquier regresión.
- [x] 3.3 Revisar manualmente o mediante una verificación automatizada los PDFs de una y varias páginas para confirmar que el encabezado se conserva y que el pie no provoca páginas adicionales.
