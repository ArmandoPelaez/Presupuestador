<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Guardrail visual obligatorio

La paleta oficial está centralizada en `src/app/globals.css`, en la sección `:root` que comienza en la línea 53. Todas las pantallas y componentes frontend deben usar esos tokens globales como fuente única de color.

Reglas:

- Usar variables/tokens globales (`primary`, `background`, `card`, `foreground`, `muted-foreground`, `border`, `--primary-hover`, `--total`, `--success`) o utilidades definidas en `globals.css`.
- No agregar colores hardcodeados, hex sueltos, gradientes propios ni clases Tailwind de color directo como `blue-*`, `slate-*`, `emerald-*`, `red-*`, `amber-*`, `green-*`, `violet-*`, `purple-*` o `lime-*`.
- Si una pantalla futura necesita un color nuevo, primero centralizarlo en `src/app/globals.css` y luego consumirlo desde ahí.
- Antes de cerrar un cambio visual, buscar colores fuera de paleta en `src/app` y `src/components`.
