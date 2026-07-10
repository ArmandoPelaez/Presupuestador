"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

export type VoiceDictationState =
  | "idle"
  | "starting"
  | "listening"
  | "stopping"
  | "unsupported"
  | "error";

export type VoiceDictationMessageKey =
  | "unsupported"
  | "starting"
  | "listening"
  | "stopping"
  | "restarting"
  | "permissionDenied"
  | "audioCapture"
  | "noSpeech"
  | "network"
  | "genericError";

export type SpeechRecognitionWindow = Pick<
  Window,
  "SpeechRecognition" | "webkitSpeechRecognition"
>;

export type VoiceDictationSupport = {
  state: Extract<VoiceDictationState, "idle" | "unsupported">;
  Recognition: SpeechRecognitionConstructor | null;
};

export type VoiceDictationControls = {
  state: VoiceDictationState;
  message: string;
  interimTranscript: string;
  start: () => void;
  stop: () => void;
};

type UseVoiceDictationOptions = {
  onFinalTranscript?: (transcript: string) => void;
};

export const VOICE_DICTATION_MESSAGES: Record<
  VoiceDictationMessageKey,
  string
> = {
  unsupported:
    "Este navegador no ofrece dictado por voz. Podes escribir la descripcion manualmente.",
  starting: "Preparando microfono...",
  listening: "Escuchando dictado...",
  stopping: "Deteniendo dictado...",
  restarting: "El navegador pauso el dictado. Lo estamos reactivando...",
  permissionDenied:
    "No se pudo acceder al microfono. Revisa el permiso del navegador o continua escribiendo.",
  audioCapture:
    "No se detecto un microfono disponible. Podes continuar con texto escrito.",
  noSpeech:
    "No se reconocio voz en esta sesion. Podes intentarlo de nuevo o escribir la descripcion.",
  network:
    "El reconocimiento de voz no esta disponible en este momento. El ingreso escrito sigue activo.",
  genericError:
    "No se pudo completar el dictado. El texto escrito se conserva para que puedas continuar.",
};

const unsupportedSupport: VoiceDictationSupport = {
  state: "unsupported",
  Recognition: null,
};

const idleSupport: VoiceDictationSupport = {
  state: "idle",
  Recognition: null,
};

let lastRecognition: SpeechRecognitionConstructor | null = null;
let lastSupportedSnapshot: VoiceDictationSupport | null = null;

export function getSpeechRecognitionConstructor(
  source?: SpeechRecognitionWindow | null,
) {
  if (!source) return null;

  return source.SpeechRecognition ?? source.webkitSpeechRecognition ?? null;
}

export function getVoiceDictationMessage(
  error?: SpeechRecognitionErrorCode | null,
) {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return VOICE_DICTATION_MESSAGES.permissionDenied;
    case "audio-capture":
      return VOICE_DICTATION_MESSAGES.audioCapture;
    case "no-speech":
      return VOICE_DICTATION_MESSAGES.noSpeech;
    case "network":
      return VOICE_DICTATION_MESSAGES.network;
    default:
      return VOICE_DICTATION_MESSAGES.genericError;
  }
}

export function useVoiceDictationSupport(): VoiceDictationSupport {
  return useSyncExternalStore(
    () => () => {},
    () => {
      if (typeof window === "undefined") return idleSupport;

      const Recognition = getSpeechRecognitionConstructor(window);
      if (!Recognition) return unsupportedSupport;

      if (Recognition !== lastRecognition) {
        lastRecognition = Recognition;
        lastSupportedSnapshot = { state: "idle", Recognition };
      }

      return lastSupportedSnapshot ?? idleSupport;
    },
    () => idleSupport,
  );
}

export function useVoiceDictation(
  Recognition: SpeechRecognitionConstructor | null,
  options: UseVoiceDictationOptions = {},
): VoiceDictationControls {
  const [state, setState] = useState<VoiceDictationState>(
    Recognition ? "idle" : "unsupported",
  );
  const [message, setMessage] = useState(
    Recognition ? "" : VOICE_DICTATION_MESSAGES.unsupported,
  );
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRecognitionRef = useRef<() => void>(() => {});
  const keepListeningRef = useRef(false);
  const stopRequestedRef = useRef(false);
  const stateRef = useRef<VoiceDictationState>(state);
  const onFinalTranscriptRef = useRef(options.onFinalTranscript);

  useEffect(() => {
    onFinalTranscriptRef.current = options.onFinalTranscript;
  }, [options.onFinalTranscript]);

  const updateState = useCallback((nextState: VoiceDictationState) => {
    stateRef.current = nextState;
    setState(nextState);
  }, []);

  useEffect(() => {
    return () => {
      keepListeningRef.current = false;
      stopRequestedRef.current = true;
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
      }
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const startRecognition = useCallback(() => {
    if (!Recognition) {
      updateState("unsupported");
      setMessage(VOICE_DICTATION_MESSAGES.unsupported);
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "es-AR";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      updateState("listening");
      setMessage(VOICE_DICTATION_MESSAGES.listening);
    };
    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interim = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) {
          finalTranscript += result[0]?.transcript ?? "";
        } else {
          interim += result[0]?.transcript ?? "";
        }
      }
      const normalizedTranscript = finalTranscript.trim();
      if (normalizedTranscript) {
        onFinalTranscriptRef.current?.(normalizedTranscript);
      }
      setInterimTranscript(interim.trim());
      setMessage(VOICE_DICTATION_MESSAGES.listening);
    };
    recognition.onnomatch = () => {
      if (keepListeningRef.current && !stopRequestedRef.current) {
        updateState("listening");
        setMessage(VOICE_DICTATION_MESSAGES.restarting);
        return;
      }
      updateState("error");
      setMessage(getVoiceDictationMessage("no-speech"));
    };
    recognition.onerror = (event) => {
      if (
        event.error === "no-speech" &&
        keepListeningRef.current &&
        !stopRequestedRef.current
      ) {
        updateState("listening");
        setMessage(VOICE_DICTATION_MESSAGES.restarting);
        return;
      }
      keepListeningRef.current = false;
      updateState("error");
      setMessage(getVoiceDictationMessage(event.error));
    };
    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }

      if (keepListeningRef.current && !stopRequestedRef.current) {
        updateState("starting");
        setInterimTranscript("");
        setMessage(VOICE_DICTATION_MESSAGES.restarting);
        restartTimerRef.current = setTimeout(() => {
          restartTimerRef.current = null;
          startRecognitionRef.current();
        }, 300);
        return;
      }

      if (stateRef.current === "stopping" || stateRef.current === "listening") {
        updateState("idle");
        setInterimTranscript("");
        setMessage("");
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      keepListeningRef.current = false;
      updateState("error");
      setMessage(VOICE_DICTATION_MESSAGES.genericError);
      recognitionRef.current = null;
    }
  }, [Recognition, updateState]);

  useEffect(() => {
    startRecognitionRef.current = startRecognition;
  }, [startRecognition]);

  const start = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    keepListeningRef.current = true;
    stopRequestedRef.current = false;
    setInterimTranscript("");
    updateState("starting");
    setMessage(VOICE_DICTATION_MESSAGES.starting);
    recognitionRef.current?.abort();
    startRecognition();
  }, [startRecognition, updateState]);

  const stop = useCallback(() => {
    keepListeningRef.current = false;
    stopRequestedRef.current = true;
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    setInterimTranscript("");

    if (!recognitionRef.current) {
      updateState("idle");
      setMessage("");
      return;
    }

    updateState("stopping");
    setMessage(VOICE_DICTATION_MESSAGES.stopping);
    recognitionRef.current.stop();
  }, [updateState]);

  const visibleState = Recognition
    ? state === "unsupported"
      ? "idle"
      : state
    : "unsupported";
  const visibleMessage = Recognition
    ? state === "unsupported"
      ? ""
      : message
    : VOICE_DICTATION_MESSAGES.unsupported;

  return {
    state: visibleState,
    message: visibleMessage,
    interimTranscript,
    start,
    stop,
  };
}
