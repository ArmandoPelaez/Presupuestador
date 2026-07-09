## Context

El sistema ya cuenta con **Crear con IA** para convertir una descripcion escrita en un borrador estructurado de presupuesto. Ese borrador es efimero, se precarga en el formulario normal y solo se persiste cuando el propietario revisa y guarda.

El dictado por voz debe ser una mejora de entrada para ese flujo existente. La primera version no debe grabar archivos, no debe enviar audio al backend y no debe crear una segunda puerta hacia OpenAI. El audio se usa solo en el navegador para producir texto editable; despues el flujo sigue como hoy: texto libre -> `POST /ai/quote-drafts` -> borrador IA -> formulario revisable -> guardado manual.

## Goals / Non-Goals

**Goals:**

- Permitir que el propietario complete la descripcion de **Crear con IA** mediante dictado de voz.
- Detectar soporte de `SpeechRecognition` o `webkitSpeechRecognition` en cliente y mostrar el dictado solo cuando este disponible.
- Transcribir en idioma `es-AR` por defecto y colocar el resultado en el textarea existente.
- Permitir editar, borrar o completar manualmente la transcripcion antes de generar el borrador.
- Reutilizar el endpoint, validaciones, limites y contrato actual de borrador IA.
- Mantener la revision humana obligatoria antes de guardar cualquier presupuesto.
- Mantener el flujo escrito disponible para todos los navegadores.

**Non-Goals:**

- Guardar presupuestos automaticamente desde audio o transcripcion.
- Crear un endpoint backend de transcripcion de audio.
- Subir, almacenar o loguear archivos de audio.
- Usar OpenAI Audio/Transcription en esta primera version.
- Implementar dictado continuo multi-idioma avanzado, comandos de voz o edicion por voz.
- Permitir dictado en la pagina publica `/p/[token]`.

## Decisions

### 1. Dictado progresivo en frontend

La UI detectara `window.SpeechRecognition || window.webkitSpeechRecognition` solo en cliente. Si existe, mostrara un control de microfono dentro del modal **Crear con IA**; si no existe, no bloqueara la experiencia y mantendra el textarea escrito.

Alternativa considerada: mostrar siempre el boton y fallar al usarlo. Se descarta porque genera una experiencia confusa en navegadores sin soporte.

### 2. La transcripcion alimenta el mismo textarea

El resultado final del dictado se agregara al campo `aiDescription`. El usuario podra editarlo antes de llamar al backend. Si hay resultados intermedios, podran mostrarse como feedback temporal, pero solo el texto confirmado debe integrarse a la descripcion que se envia.

Alternativa considerada: enviar la transcripcion directamente al endpoint sin pasar por el textarea. Se descarta porque rompe la revision humana antes de generar el borrador.

### 3. Sin backend nuevo en el MVP

El dictado simple no requiere cambios en NestJS ni en OpenAI. La llamada existente `POST /ai/quote-drafts` seguira recibiendo `description` como string y aplicara los mismos limites de longitud, autenticacion, rate limiting y normalizacion.

Alternativa considerada: grabar audio con `MediaRecorder` y transcribir en backend con OpenAI. Se pospone porque agrega endpoint, subida de archivos, costos, limites de audio, privacidad mas sensible y pruebas de infraestructura.

### 4. Estados explicitos de captura

El frontend manejara estados como `idle`, `listening`, `stopping`, `unsupported` y `error`. Los errores de permiso denegado, falta de microfono o no reconocimiento deben ser recuperables y no deben cerrar el modal ni borrar texto ya escrito.

### 5. Privacidad por minimizacion

La primera version no persistira audio ni transcripciones. El texto transcripto quedara solamente en el estado local del formulario hasta que el usuario decida generar el borrador. La documentacion debe aclarar que el reconocimiento de voz depende del navegador y puede usar servicios del proveedor del navegador.

### 6. UI consistente con la paleta centralizada

Los controles de voz deben usar componentes existentes, iconos de `lucide-react` y los tokens definidos en `frontend/src/app/globals.css`. No se deben introducir colores hardcodeados ni familias Tailwind de color directo fuera de la paleta centralizada.

## Risks / Trade-offs

- [Compatibilidad parcial de navegadores] -> Mostrar dictado solo cuando la API exista y mantener el flujo escrito como fallback.
- [El navegador transcribe mal] -> Colocar el texto en un campo editable y exigir revision antes de generar el borrador.
- [Permiso de microfono denegado] -> Mostrar error recuperable y permitir continuar escribiendo.
- [Privacidad percibida del audio] -> No enviar audio al backend y documentar que el reconocimiento depende del navegador.
- [Resultados intermedios duplicados] -> Separar texto final confirmado de feedback temporal y cubrirlo con pruebas.
- [Texto demasiado largo luego del dictado] -> Respetar el limite existente del textarea y del DTO backend antes de generar el borrador.

## Migration Plan

1. Agregar tipos frontend para la API de reconocimiento de voz si el entorno TypeScript no los incluye.
2. Incorporar estado y controles de dictado al modal **Crear con IA**.
3. Integrar la transcripcion con `aiDescription` sin alterar el cliente API existente.
4. Agregar pruebas frontend con mocks de `SpeechRecognition`.
5. Documentar compatibilidad, fallback y privacidad.
6. Ejecutar validaciones frontend y OpenSpec.

Rollback: ocultar o deshabilitar el control de microfono. El flujo escrito **Crear con IA**, el endpoint backend y la creacion manual de presupuestos permanecen intactos.

## Open Questions

- Definir si el idioma inicial debe quedar fijo en `es-AR` o tomarlo de una futura preferencia del usuario.
- Definir si la transcripcion debe reemplazar el texto existente o agregarse al final; propuesta inicial: agregar al final con espacio separador para no perder texto escrito.
- Definir si se mostrara un aviso visible de compatibilidad cuando el navegador no soporte dictado o si simplemente se ocultara el control.
