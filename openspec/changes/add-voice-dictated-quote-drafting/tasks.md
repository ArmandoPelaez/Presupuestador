## 1. Fase 1 - Contrato frontend de dictado

- [x] 1.1 Definir tipos frontend para `SpeechRecognition`, `webkitSpeechRecognition`, eventos de resultado y eventos de error si no estan disponibles en TypeScript.
- [x] 1.2 Crear una utilidad o hook cliente para detectar soporte de reconocimiento de voz sin ejecutar APIs de navegador durante render server-side.
- [x] 1.3 Modelar estados de dictado (`idle`, `listening`, `stopping`, `unsupported`, `error`) y mensajes recuperables.
- [x] 1.4 Verificar criterio de aceptacion: navegadores sin soporte conservan el flujo escrito **Crear con IA** sin errores.

## 2. Fase 2 - UI de dictado en Crear con IA

- [x] 2.1 Agregar controles de microfono al modal **Crear con IA** usando componentes existentes, iconos `lucide-react` y la paleta centralizada de `frontend/src/app/globals.css`.
- [x] 2.2 Iniciar y detener dictado desde los controles, configurando idioma inicial `es-AR`.
- [x] 2.3 Mostrar feedback visual y accesible mientras el dictado escucha, se detiene o falla.
- [x] 2.4 Mantener el textarea editable durante el flujo y no borrar texto existente ante errores de dictado.
- [x] 2.5 Verificar criterio de aceptacion: el usuario puede dictar, detener, editar y continuar escribiendo antes de generar el borrador.

## 3. Fase 3 - Integracion con borrador IA existente

- [x] 3.1 Insertar la transcripcion final en `aiDescription`, preservando texto escrito previamente con separacion legible.
- [x] 3.2 Aplicar el mismo limite visual y funcional de longitud de descripcion existente para texto dictado.
- [x] 3.3 Reutilizar `generateAiQuoteDraft(description)` sin crear endpoint nuevo ni enviar audio al backend.
- [x] 3.4 Confirmar que el borrador generado desde dictado muestra el aviso existente de revision IA.
- [x] 3.5 Verificar criterio de aceptacion: texto dictado revisado -> endpoint IA existente -> formulario precargado, sin guardar automaticamente.

## 4. Fase 4 - Seguridad, privacidad y no persistencia

- [x] 4.1 Asegurar que la implementacion no use `MediaRecorder`, subida de archivos ni almacenamiento de audio en esta version.
- [x] 4.2 Asegurar que cancelar/cerrar el modal no cree presupuesto, no reserve numero y no persista items ni transcripcion.
- [x] 4.3 Revisar que no se registren transcripciones completas, audio, prompts completos, respuestas completas, claves, JWT ni tokens publicos.
- [x] 4.4 Documentar en README o docs del flujo IA que el dictado es progresivo, depende del navegador y no guarda presupuesto hasta revision.
- [x] 4.5 Verificar criterio de aceptacion: el presupuesto dictado solo se persiste despues del guardado manual del formulario normal.

## 5. Fase 5 - Pruebas frontend

- [x] 5.1 Agregar mocks de `SpeechRecognition` para pruebas del formulario o del hook de dictado.
- [x] 5.2 Probar navegador compatible: muestra controles, inicia escucha y agrega transcripcion final.
- [x] 5.3 Probar navegador no compatible: no rompe el modal y conserva ingreso escrito.
- [x] 5.4 Probar permiso/error/no-match: muestra mensaje recuperable y conserva texto existente.
- [x] 5.5 Probar que generar desde texto dictado llama al cliente IA existente y no guarda presupuesto hasta confirmacion.

## 6. Fase 6 - Validacion y entrega

- [x] 6.1 Ejecutar auditoria de paleta en `frontend/src/app` y `frontend/src/components` para confirmar que no se introdujeron colores fuera de `globals.css`.
- [x] 6.2 Ejecutar `npm.cmd run lint` en frontend.
- [x] 6.3 Ejecutar `npm.cmd run type-check` en frontend.
- [x] 6.4 Ejecutar `npm.cmd run build` en frontend.
- [x] 6.5 Ejecutar validacion OpenSpec estricta para `add-voice-dictated-quote-drafting`.
- [x] 6.6 Verificar criterio de aceptacion: todos los artefactos y pruebas confirman dictado por voz como entrada revisable, sin guardado automatico.
