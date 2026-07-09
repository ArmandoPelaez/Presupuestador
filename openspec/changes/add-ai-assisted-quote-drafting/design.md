## Context

El sistema ya permite gestionar clientes, catalogo y presupuestos autenticados con calculo autoritativo en backend. El editor de presupuesto acepta items manuales o provenientes del catalogo y el presupuesto real se crea solo al guardar.

La nueva funcion agrega IA como acelerador de carga: el usuario describe el trabajo, el backend llama a OpenAI y devuelve un borrador estructurado. La IA no guarda presupuestos, no calcula totales finales y no cambia estados. El formulario existente sigue siendo el punto de revision humana y el backend existente sigue siendo la autoridad de validacion, calculo y persistencia.

## Goals / Non-Goals

**Goals:**

- Crear un flujo **Crear con IA** dentro de presupuestos.
- Convertir texto libre en un borrador JSON validado y predecible.
- Usar OpenAI Responses API con Structured Outputs.
- Usar `gpt-5.4-mini` como modelo inicial configurable.
- Sugerir cliente, items, cantidades, unidades, notas, dias de validez y coincidencias opcionales con catalogo.
- Precargar el editor normal de presupuesto sin guardar automaticamente.
- Mantener aislamiento por usuario, minimizacion de datos y proteccion de secretos.

**Non-Goals:**

- Guardar presupuestos sin confirmacion humana.
- Permitir que la IA calcule o fuerce totales finales.
- Crear, editar o desactivar clientes/catalogo automaticamente.
- Enviar presupuestos por email, WhatsApp u otro canal externo.
- Hacer fine-tuning, embeddings o busqueda semantica avanzada en esta primera version.
- Permitir que clientes publicos usen IA desde `/p/[token]`.

## Decisions

### 1. Backend como unica puerta hacia OpenAI

El frontend llamara a un endpoint autenticado propio, por ejemplo `POST /ai/quote-drafts`, y nunca invocara OpenAI directamente. El backend agregara contexto permitido del usuario, validara entrada/salida y ocultara la clave `OPENAI_API_KEY`.

Alternativa considerada: llamar a OpenAI desde Next.js. Se descarta porque expondria secretos, duplicaria validaciones y haria mas dificil aplicar rate limiting y auditoria segura.

### 2. Responses API con Structured Outputs

La respuesta de OpenAI se solicitara con un JSON Schema estricto. El esquema del MVP incluira:

- `customerName`
- `customerMatchId`
- `items[]`
- `items[].description`
- `items[].quantity`
- `items[].unit`
- `items[].catalogMatchId`
- `notes`
- `validUntilDays`
- `warnings[]`

`warnings[]` permitira explicar incertidumbres como "no encontre precio en catalogo" sin romper el formulario. El backend rechazara respuestas que no cumplan el esquema o excedan limites.

Alternativa considerada: pedir texto libre y parsearlo manualmente. Se descarta porque aumenta errores, hace fragil el flujo y reduce testabilidad.

### 3. `gpt-5.4-mini` configurable por entorno

El modelo inicial sera `gpt-5.4-mini` por equilibrio entre costo, latencia y calidad para extraccion estructurada. Se agregara `OPENAI_MODEL` con default seguro a ese valor para permitir cambios posteriores sin tocar codigo.

Alternativa considerada: usar `gpt-5.5` como default. Se reserva para fallback o funciones futuras mas complejas, porque el MVP necesita principalmente transformar texto en un borrador JSON.

### 4. Contexto acotado de clientes y catalogo

El backend podra enviar a OpenAI una lista acotada de clientes activos y conceptos de catalogo activos del usuario autenticado. La lista debera estar limitada por cantidad y campos: ids internos, nombres, tipos, unidades y precios si son necesarios para sugerir coincidencias.

No se enviaran datos de otros usuarios, hashes, JWT, tokens de enlaces publicos, contrasenas ni informacion no necesaria. Si el catalogo es grande, el MVP usara busqueda previa local por texto y solo pasara candidatos relevantes.

### 5. Borrador efimero, no entidad persistida

La primera version devolvera el borrador al frontend sin persistir una tabla nueva. El usuario revisara y guardara mediante el endpoint existente de creacion de presupuesto.

Alternativa considerada: guardar `AiDraft` para retomar luego. Se pospone para evitar migracion y tratamiento adicional de datos sensibles hasta validar demanda real.

### 6. Precarga del editor normal

El frontend transformara el borrador a los valores iniciales del formulario existente de presupuesto. Los items con `catalogMatchId` valido se trataran como seleccion de catalogo; los demas se cargaran como conceptos manuales. Precios ausentes o inseguros quedaran editables y visibles para revision.

El editor mostrara que el borrador fue generado con IA y exigira confirmacion del usuario antes de guardar. Guardar llamara al flujo actual, que recalcula y persiste en backend.

### 7. Seguridad, limites y observabilidad

El endpoint tendra:

- JWT obligatorio.
- limite de longitud para la descripcion.
- rate limiting por usuario.
- timeout controlado para OpenAI.
- errores genericos para fallos del proveedor.
- logs sin prompt completo, respuesta completa, clave API ni datos sensibles.

Se podran registrar metadatos no sensibles como modelo usado, duracion, exito/error y cantidad aproximada de items generados.

## Risks / Trade-offs

- [La IA sugiere items incorrectos] -> El borrador nunca se guarda automaticamente y el formulario exige revision humana.
- [La IA devuelve JSON invalido] -> Structured Outputs, validacion de esquema en backend y mensaje de error recuperable.
- [Se filtran datos sensibles al proveedor] -> Contexto minimo, filtrado por propietario y exclusion explicita de secretos/tokens.
- [Costo o latencia alta] -> Modelo mini por defecto, limites de longitud, candidatos acotados y timeouts.
- [Coincidencias de catalogo equivocadas] -> Mostrar las coincidencias como editables y permitir convertir a item manual.
- [Dependencia externa no disponible] -> El flujo manual de presupuesto permanece intacto y el error no bloquea la creacion normal.

## Migration Plan

1. Agregar variables `OPENAI_API_KEY`, `OPENAI_MODEL` y limites operativos en `.env.example` del backend.
2. Incorporar dependencia oficial de OpenAI si no existe y crear el modulo backend de IA.
3. Exponer el endpoint autenticado de generacion de borrador sin cambios de base de datos.
4. Agregar UI **Crear con IA** y precarga del formulario existente.
5. Validar con pruebas unitarias, de API y frontend; luego ejecutar lint, type-check y build.

Rollback: ocultar el boton **Crear con IA** y deshabilitar el endpoint. El flujo manual y los presupuestos existentes no se ven afectados porque no hay migracion de datos en el MVP.

## Open Questions

- Definir el limite inicial de caracteres de la descripcion; propuesta: 2.000 caracteres.
- Definir cuantos clientes y conceptos de catalogo enviar como candidatos; propuesta: hasta 10 clientes y 30 items relevantes.
- Definir si `validUntilDays` debe tener default fijo cuando la IA no lo detecta; propuesta: `null` y que el formulario aplique su comportamiento actual.
