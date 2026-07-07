# Guardrails del proyecto

## Paleta visual centralizada

- La paleta de colores oficial de la aplicación vive en `frontend/src/app/globals.css`, desde la sección `:root` que comienza en la línea 53.
- Toda pantalla, componente, estado visual, alerta, botón, tabla, tarjeta o formulario nuevo debe consumir esa paleta centralizada mediante variables CSS, tokens Tailwind del tema (`primary`, `background`, `card`, `foreground`, `muted-foreground`, `border`, etc.) o utilidades globales definidas en `globals.css`.
- No introducir colores hardcodeados ni clases Tailwind de color directo (`blue-*`, `slate-*`, `emerald-*`, `red-*`, `amber-*`, `green-*`, `violet-*`, `purple-*`, `lime-*`, gradientes de color, hex sueltos) en pantallas o componentes nuevos salvo que primero se agreguen como token centralizado en `globals.css`.
- Si una nueva necesidad visual requiere otro color, agregarlo primero a `globals.css`, justificar su propósito y reutilizarlo desde ahí.
- Antes de entregar cambios de UI, verificar que no haya colores fuera de la paleta en `frontend/src/app` y `frontend/src/components`.

## Validación mínima para cambios frontend

Después de modificar UI o estilos, ejecutar al menos:

```powershell
cd frontend
npm.cmd run lint
npm.cmd run type-check
npm.cmd run build
```
