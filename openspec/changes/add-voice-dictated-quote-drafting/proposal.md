## Why

El flujo **Crear con IA** ya reduce la carga manual cuando el propietario puede escribir una descripcion libre, pero en uso movil o de trabajo en campo escribir todo el detalle del presupuesto sigue siendo una friccion. El dictado por voz permite capturar esa descripcion hablando y reutilizar el mismo borrador revisable que ya genera la IA, sin guardar presupuestos hasta confirmacion humana.

## What Changes

- Agregar dictado por voz dentro del modal o flujo **Crear con IA** para completar la descripcion del trabajo mediante transcripcion.
- Usar el reconocimiento de voz del navegador como primera version progresiva: si el navegador soporta `SpeechRecognition` o `webkitSpeechRecognition`, mostrar controles de microfono; si no, mantener el flujo escrito sin bloquear la creacion.
- Transcribir el audio dictado a texto editable en el mismo campo de descripcion que hoy alimenta `POST /ai/quote-drafts`.
- Permitir que el usuario revise, corrija o borre la transcripcion antes de pedir el borrador con IA.
- Reutilizar el endpoint y contrato existente de generacion de borradores IA; el dictado solo cambia el modo de entrada, no la persistencia ni el calculo.
- Mantener visible que el resultado es un borrador generado con IA y requiere revision antes de guardar.
- Excluir guardado automatico del presupuesto dictado, persistencia de audio, carga de archivos de audio al backend y transcripcion backend con OpenAI en esta primera version.

## Capabilities

### New Capabilities

- `voice-dictated-quote-drafting`: Captura de una descripcion de presupuesto por dictado de voz en el navegador, con transcripcion editable y fallback al ingreso escrito.

### Modified Capabilities

- `ai-assisted-quote-drafting`: Permitir que la descripcion libre usada para generar el borrador provenga de texto escrito o de una transcripcion de voz revisada por el usuario, manteniendo el mismo endpoint y contrato de borrador.
- `quote-management`: Mantener la regla de que un presupuesto originado desde dictado y/o IA solo se persiste cuando el propietario revisa y guarda el formulario normal.

## Impact

- Frontend Next.js: controles de microfono en el flujo **Crear con IA**, estado de escucha/transcripcion/error, deteccion de compatibilidad y fallback escrito.
- Tipos frontend: definicion local de los objetos `SpeechRecognition`/`webkitSpeechRecognition` si TypeScript no los expone de forma nativa.
- Accesibilidad y UX: botones claros para iniciar/detener dictado, feedback de estado y posibilidad de editar el texto transcripto.
- Seguridad y privacidad: no persistir audio, no enviar audio al backend, no registrar transcripciones completas y conservar la revision humana obligatoria.
- Pruebas frontend: mocks del reconocimiento de voz, casos de compatibilidad, transcripcion exitosa, errores/permisos y generacion del borrador desde texto transcripto.
- Documentacion: aclarar navegadores compatibles, fallback manual y que el presupuesto dictado no se guarda hasta verificacion.
