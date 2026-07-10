import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getSpeechRecognitionConstructor,
  getVoiceDictationMessage,
  VOICE_DICTATION_MESSAGES,
  useVoiceDictation,
  useVoiceDictationSupport,
} from "./use-voice-dictation";

class MockSpeechRecognition extends EventTarget implements SpeechRecognition {
  static instances: MockSpeechRecognition[] = [];

  continuous = false;
  interimResults = false;
  lang = "";
  maxAlternatives = 1;
  onaudioend = null;
  onaudiostart = null;
  onend: ((this: SpeechRecognition, ev: Event) => unknown) | null = null;
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => unknown)
    | null = null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown)
    | null = null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown)
    | null = null;
  onsoundend = null;
  onsoundstart = null;
  onspeechend = null;
  onspeechstart = null;
  onstart: ((this: SpeechRecognition, ev: Event) => unknown) | null = null;
  abort = vi.fn();
  start = vi.fn(() => {
    this.onstart?.call(this, new Event("start"));
  });
  stop = vi.fn();

  constructor() {
    super();
    MockSpeechRecognition.instances.push(this);
  }

  emitEnd() {
    this.onend?.call(this, new Event("end"));
  }

  emitResult(transcript: string, isFinal = true) {
    const alternative = { transcript, confidence: 0.9 };
    const result = {
      0: alternative,
      isFinal,
      length: 1,
      item() {
        return alternative;
      },
    } as unknown as SpeechRecognitionResult;
    const event = {
      resultIndex: 0,
      results: {
        0: result,
        length: 1,
        item() {
          return result;
        },
      },
    } as unknown as SpeechRecognitionEvent;
    this.onresult?.call(this, event);
  }

  emitError(error: SpeechRecognitionErrorCode) {
    this.onerror?.call(this, { error } as SpeechRecognitionErrorEvent);
  }

  emitNoMatch() {
    this.onnomatch?.call(this, {} as SpeechRecognitionEvent);
  }
}

function setSpeechRecognitionSupport(Recognition?: SpeechRecognitionConstructor) {
  Object.defineProperty(window, "SpeechRecognition", {
    configurable: true,
    value: Recognition,
  });
  Object.defineProperty(window, "webkitSpeechRecognition", {
    configurable: true,
    value: undefined,
  });
}

afterEach(() => {
  vi.useRealTimers();
  MockSpeechRecognition.instances = [];
  setSpeechRecognitionSupport(undefined);
});

describe("voice dictation support", () => {
  it("detecta SpeechRecognition solo desde un origen cliente explicito", () => {
    expect(getSpeechRecognitionConstructor(null)).toBeNull();
    expect(
      getSpeechRecognitionConstructor({
        SpeechRecognition: MockSpeechRecognition,
        webkitSpeechRecognition: undefined,
      }),
    ).toBe(MockSpeechRecognition);
  });

  it("modela navegador sin soporte como unsupported sin romper el render inicial", async () => {
    setSpeechRecognitionSupport(undefined);

    const { result } = renderHook(() => useVoiceDictationSupport());

    await waitFor(() => {
      expect(result.current).toEqual({ state: "unsupported", Recognition: null });
    });
  });

  it("modela navegador compatible manteniendo estado idle", async () => {
    setSpeechRecognitionSupport(MockSpeechRecognition);

    const { result } = renderHook(() => useVoiceDictationSupport());

    await waitFor(() => {
      expect(result.current).toEqual({
        state: "idle",
        Recognition: MockSpeechRecognition,
      });
    });
  });

  it("expone mensajes recuperables para errores de dictado", () => {
    expect(getVoiceDictationMessage("not-allowed")).toBe(
      VOICE_DICTATION_MESSAGES.permissionDenied,
    );
    expect(getVoiceDictationMessage("audio-capture")).toBe(
      VOICE_DICTATION_MESSAGES.audioCapture,
    );
    expect(getVoiceDictationMessage("no-speech")).toBe(
      VOICE_DICTATION_MESSAGES.noSpeech,
    );
    expect(getVoiceDictationMessage("network")).toBe(
      VOICE_DICTATION_MESSAGES.network,
    );
    expect(getVoiceDictationMessage("aborted")).toBe(
      VOICE_DICTATION_MESSAGES.genericError,
    );
  });

  it("mantiene el reconocimiento continuo y reinicia si el navegador corta solo", async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() =>
      useVoiceDictation(MockSpeechRecognition),
    );

    act(() => result.current.start());

    expect(MockSpeechRecognition.instances).toHaveLength(1);
    expect(MockSpeechRecognition.instances[0].continuous).toBe(true);
    expect(result.current.state).toBe("listening");
    expect(result.current.message).toBe(VOICE_DICTATION_MESSAGES.listening);

    act(() => MockSpeechRecognition.instances[0].emitEnd());

    expect(result.current.state).toBe("starting");
    expect(result.current.message).toBe(VOICE_DICTATION_MESSAGES.restarting);

    act(() => vi.advanceTimersByTime(300));

    expect(MockSpeechRecognition.instances).toHaveLength(2);
    expect(MockSpeechRecognition.instances[1].start).toHaveBeenCalled();
    expect(result.current.state).toBe("listening");
  });

  it("expone texto provisional y solo confirma resultados finales", () => {
    const onFinalTranscript = vi.fn();
    const { result } = renderHook(() =>
      useVoiceDictation(MockSpeechRecognition, { onFinalTranscript }),
    );

    act(() => result.current.start());
    act(() => MockSpeechRecognition.instances[0].emitResult("en curso", false));

    expect(result.current.interimTranscript).toBe("en curso");
    expect(onFinalTranscript).not.toHaveBeenCalled();

    act(() => MockSpeechRecognition.instances[0].emitResult("confirmado"));

    expect(onFinalTranscript).toHaveBeenCalledWith("confirmado");
    expect(result.current.interimTranscript).toBe("");
  });

  it("muestra errores recuperables sin confirmar transcripcion", () => {
    const onFinalTranscript = vi.fn();
    const { result } = renderHook(() =>
      useVoiceDictation(MockSpeechRecognition, { onFinalTranscript }),
    );

    act(() => result.current.start());
    act(() => MockSpeechRecognition.instances[0].emitError("not-allowed"));

    expect(result.current.state).toBe("error");
    expect(result.current.message).toBe(
      VOICE_DICTATION_MESSAGES.permissionDenied,
    );
    expect(onFinalTranscript).not.toHaveBeenCalled();
  });

  it("trata no-match como falta de voz recuperable cuando el usuario ya detuvo", () => {
    const { result } = renderHook(() =>
      useVoiceDictation(MockSpeechRecognition),
    );

    act(() => result.current.start());
    act(() => result.current.stop());
    act(() => MockSpeechRecognition.instances[0].emitNoMatch());

    expect(result.current.state).toBe("error");
    expect(result.current.message).toBe(VOICE_DICTATION_MESSAGES.noSpeech);
  });
});
