## 1. Fase 1 - Contrato frontend de dictado

- [ ] 1.1 Definir tipos frontend para `SpeechRecognition`, `webkitSpeechRecognition`, eventos de resultado y eventos de error si no estan disponibles en TypeScript.
- [ ] 1.2 Crear una utilidad o hook cliente para detectar soporte de reconocimiento de voz sin ejecutar APIs de navegador durante render server-side.
- [ ] 1.3 Modelar estados de dictado (`idle`, `listening`, `stopping`, `unsupported`, `error`) y mensajes recuperables.
- [ ] 1.4 Verificar criterio de aceptacion: navegadores sin soporte conservan el flujo escrito **Crear con IA** sin errores.

## 2. Fase 2 - UI de dictado en Crear con IA

- [ ] 2.1 Agregar controles de microfono al modal **Crear con IA** usando componentes existentes, iconos `lucide-react` y la paleta centralizada de `frontend/src/app/globals.css`.
- [ ] 2.2 Iniciar y detener dictado desde los controles, configurando idioma inicial `es-AR`.
- [ ] 2.3 Mostrar feedback visual y accesible mientras el dictado escucha, se detiene o falla.
- [ ] 2.4 Mantener el textarea editable durante el flujo y no borrar texto existente ante errores de dictado.
- [ ] 2.5 Verificar criterio de aceptacion: el usuario puede dictar, detener, editar y continuar escribiendo antes de generar el borrador.

## 3. Fase 3 - Integracion con borrador IA existente

- [ ] 3.1 Insertar la transcripcion final en `aiDescription`, preservando texto escrito previamente con separacion legible.
- [ ] 3.2 Aplicar el mismo limite visual y funcional de longitud de descripcion existente para texto dictado.
- [ ] 3.3 Reutilizar `generateAiQuoteDraft(description)` sin crear endpoint nuevo ni enviar audio al backend.
- [ ] 3.4 Confirmar que el borrador generado desde dictado muestra el aviso existente de revision IA.
- [ ] 3.5 Verificar criterio de aceptacion: texto dictado revisado -> endpoint IA existente -> formulario precargado, sin guardar automaticamente.

## 4. Fase 4 - Seguridad, privacidad y no persistencia

- [ ] 4.1 Asegurar que la implementacion no use `MediaRecorder`, subida de archivos ni almacenamiento de audio en esta version.
- [ ] 4.2 Asegurar que cancelar/cerrar el modal no cree presupuesto, no reserve numero y no persista items ni transcripcion.
- [ ] 4.3 Revisar que no se registren transcripciones completas, audio, prompts completos, respuestas completas, claves, JWT ni tokens publicos.
- [ ] 4.4 Documentar en README o docs del flujo IA que el dictado es progresivo, depende del navegador y no guarda presupuesto hasta revision.
- [ ] 4.5 Verificar criterio de aceptacion: el presupuesto dictado solo se persiste despues del guardado manual del formulario normal.

## 5. Fase 5 - Pruebas frontend

- [ ] 5.1 Agregar mocks de `SpeechRecognition` para pruebas del formulario o del hook de dictado.
- [ ] 5.2 Probar navegador compatible: muestra controles, inicia escucha y agrega transcripcion final.
- [ ] 5.3 Probar navegador no compatible: no rompe el modal y conserva ingreso escrito.
- [ ] 5.4 Probar permiso/error/no-match: muestra mensaje recuperable y conserva texto existente.
- [ ] 5.5 Probar que generar desde texto dictado llama al cliente IA existente y no guarda presupuesto hasta confirmacion.

## 6. Fase 6 - Validacion y entrega

- [ ] 6.1 Ejecutar auditoria de paleta en `frontend/src/app` y `frontend/src/components` para confirmar que no se introdujeron colores fuera de `globals.css`.
- [ ] 6.2 Ejecutar `npm.cmd run lint` en frontend.
- [ ] 6.3 Ejecutar `npm.cmd run type-check` en frontend.
- [ ] 6.4 Ejecutar `npm.cmd run build` en frontend.
- [ ] 6.5 Ejecutar validacion OpenSpec estricta para `add-voice-dictated-quote-drafting`.
- [ ] 6.6 Verificar criterio de aceptacion: todos los artefactos y pruebas confirman dictado por voz como entrada revisable, sin guardado automatico.
