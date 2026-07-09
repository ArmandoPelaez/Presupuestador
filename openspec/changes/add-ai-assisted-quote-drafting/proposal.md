## Why

Crear presupuestos completos desde cero sigue requiriendo cargar manualmente cliente, conceptos, cantidades, unidades y notas, aun cuando el usuario ya puede describir el trabajo en lenguaje natural. Un asistente de IA puede reducir esa friccion convirtiendo una descripcion libre en un borrador estructurado que el usuario revisa antes de guardar.

## What Changes

- Agregar una accion **Crear con IA** dentro del flujo de presupuestos.
- Permitir que el usuario escriba una descripcion libre del trabajo a presupuestar.
- Enviar la descripcion al backend autenticado para generar un borrador usando OpenAI Responses API con Structured Outputs.
- Usar inicialmente el modelo `gpt-5.4-mini`, configurable por entorno.
- Devolver un JSON estructurado con cliente sugerido, items, cantidades, unidades, coincidencias de catalogo opcionales, notas y dias de validez.
- Transformar el JSON en campos del formulario normal de presupuesto, dejando el presupuesto sin guardar hasta confirmacion humana.
- Mantener el calculo de totales, validaciones, permisos y persistencia como autoridad del backend existente.
- Excluir guardado automatico, aprobacion automatica, envio automatico por email/WhatsApp y decisiones de precio final hechas solo por IA.

## Capabilities

### New Capabilities

- `ai-assisted-quote-drafting`: Generacion de borradores de presupuesto desde texto libre mediante OpenAI, con salida JSON estructurada y revision humana obligatoria.

### Modified Capabilities

- `quote-management`: Incorporar un origen de borrador asistido por IA que precarga el formulario existente sin cambiar las reglas autoritativas de guardado, calculo ni estados.

## Impact

- Backend NestJS: nuevo modulo o servicio de IA, endpoint autenticado de generacion de borrador, validacion del input y normalizacion de la respuesta estructurada.
- OpenAI: integracion con Responses API, Structured Outputs y modelo inicial `gpt-5.4-mini`, con clave y modelo configurables por variables de entorno.
- Frontend Next.js: boton **Crear con IA**, formulario de descripcion libre, estados de carga/error y precarga del editor de presupuesto existente.
- Catalogo y clientes: uso de datos propios del usuario para sugerir coincidencias sin exponer informacion de otros usuarios.
- Seguridad y privacidad: no registrar prompts completos, respuestas con datos sensibles ni claves; limitar longitud de entrada y aplicar rate limiting.
- Calidad: pruebas unitarias para mapeo/validacion, pruebas de API para aislamiento y pruebas frontend del flujo descripcion -> formulario precargado.
