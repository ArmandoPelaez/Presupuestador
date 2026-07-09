## 1. Fase 1 - Configuracion y contrato IA

- [x] 1.1 Agregar variables backend `OPENAI_API_KEY`, `OPENAI_MODEL`, limite de descripcion y timeout en `.env.example` y validacion de entorno.
- [x] 1.2 Instalar y configurar el SDK oficial de OpenAI en backend sin exponer claves al frontend.
- [x] 1.3 Definir DTOs de request/response para borrador IA con validacion estricta de longitud, items, cantidades, unidades, ids opcionales y warnings.
- [x] 1.4 Definir el JSON Schema de Structured Outputs para el borrador de presupuesto y cubrirlo con pruebas unitarias de forma/limites.
- [x] 1.5 Verificar criterio de aceptacion: la app puede cargar configuracion IA en backend y rechaza entradas invalidas antes de llamar a OpenAI.

## 2. Fase 2 - Backend de generacion de borradores

- [x] 2.1 Crear modulo/servicio backend de IA con cliente OpenAI, modelo default `gpt-5.4-mini`, timeout y manejo de errores seguro.
- [x] 2.2 Implementar seleccion local de candidatos de clientes activos y catalogo activo filtrados por propietario.
- [x] 2.3 Implementar prompt y llamada Responses API con Structured Outputs, enviando solo contexto minimo necesario.
- [x] 2.4 Validar y normalizar la respuesta de OpenAI antes de devolverla al frontend, sin persistir presupuesto ni reservar numero.
- [x] 2.5 Crear endpoint autenticado `POST /ai/quote-drafts` con rate limiting por usuario.
- [x] 2.6 Agregar pruebas unitarias del servicio para respuesta valida, respuesta invalida, timeout, proveedor fallido y exclusion de datos sensibles en logs.
- [x] 2.7 Agregar pruebas de API para autenticacion, aislamiento entre usuarios, descripcion demasiado larga y ausencia de persistencia automatica.
- [x] 2.8 Verificar criterio de aceptacion: un usuario autenticado obtiene un borrador estructurado y ningun usuario accede a datos de otra cuenta.

## 3. Fase 3 - Frontend Crear con IA

- [x] 3.1 Agregar accion **Crear con IA** en la pantalla de presupuestos usando la paleta centralizada de `frontend/src/app/globals.css`.
- [x] 3.2 Crear pantalla o modal de descripcion libre con estados de carga, error recuperable y cancelacion.
- [x] 3.3 Integrar cliente API tipado para llamar `POST /ai/quote-drafts`.
- [x] 3.4 Mapear el borrador IA a los valores iniciales del formulario existente de presupuesto.
- [x] 3.5 Mostrar aviso de revision IA cuando el formulario se precarga desde un borrador generado.
- [x] 3.6 Permitir editar o descartar todos los campos generados antes de guardar.
- [x] 3.7 Verificar criterio de aceptacion: descripcion -> borrador -> formulario precargado funciona sin guardar hasta confirmacion.

## 4. Fase 4 - Guardado autoritativo y experiencia de revision

- [x] 4.1 Asegurar que guardar un presupuesto originado por IA usa el endpoint existente de creacion y recalculo backend.
- [x] 4.2 Manejar items con `catalogMatchId` valido como seleccion de catalogo y items sin match como conceptos manuales editables.
- [x] 4.3 Manejar clientes con `customerMatchId` valido como seleccion existente y clientes sin match como dato sugerido que requiere accion del usuario.
- [x] 4.4 Asegurar que precios, descuentos, impuestos, totales, numero y estado no quedan definidos de forma autoritativa por la IA.
- [x] 4.5 Agregar pruebas frontend del mapeo de borrador, edicion posterior, descarte y guardado manual.
- [x] 4.6 Verificar criterio de aceptacion: el backend conserva la autoridad de validacion, calculo, persistencia y estados.

## 5. Fase 5 - Calidad, seguridad y entrega

- [ ] 5.1 Revisar que prompts, respuestas completas, claves, JWT y tokens publicos no se registren en logs.
- [ ] 5.2 Documentar variables, limites, modelo default, fallback manual y comportamiento de privacidad en README/backend docs.
- [ ] 5.3 Ejecutar pruebas backend unitarias y e2e relacionadas con IA y presupuestos.
- [ ] 5.4 Ejecutar pruebas frontend relacionadas con el flujo **Crear con IA**.
- [ ] 5.5 Ejecutar `npm.cmd run lint`, `npm.cmd run type-check` y `npm.cmd run build` en backend cuando aplique.
- [ ] 5.6 Ejecutar `npm.cmd run lint`, `npm.cmd run type-check` y `npm.cmd run build` en frontend.
- [ ] 5.7 Ejecutar validacion OpenSpec estricta para `add-ai-assisted-quote-drafting`.
- [ ] 5.8 Verificar criterio de aceptacion: la funcionalidad queda lista para uso MVP sin romper el flujo manual de presupuestos.
