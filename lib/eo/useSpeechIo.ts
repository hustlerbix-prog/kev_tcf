"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecordingMode = "auto" | "toggle" | "ptt";

export interface SpeechState {
  ttsAvailable: boolean;
  sttAvailable: boolean;
  selectedVoice?: string;
  lang: "fr-CA" | "fr-FR";
  isSpeaking: boolean;
  isListening: boolean;
  partialTranscript: string;
  finalTranscript: string;
  silenceMs: number;
  recordingMode: RecordingMode;
}

export interface SpeechApi {
  startListening: () => void;
  stopListening: () => void;
  speak: (
    text: string,
    opts?: {
      rate?: number;
      pitch?: number;
      onBoundary?: () => void;
    }
  ) => Promise<void>;
  cancelSpeak: () => void;
  setLang: (l: "fr-CA" | "fr-FR") => void;
  setRecordingMode: (m: RecordingMode) => void;
  resetRecognition: () => void;
  discardPending: () => void;
  voices: SpeechSynthesisVoice[];
}

interface UseSpeechIoOptions {
  onFinalText?: (text: string) => void;
  silenceThresholdMs?: number;
  continuous?: boolean;
}

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((ev: {
    resultIndex: number;
    results: ArrayLike<{
      isFinal: boolean;
      0: { transcript: string };
    }>;
  }) => void) | null;
  onerror: ((ev: unknown) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function joinSegments(a: string, b: string): string {
  const x = a.trim();
  const y = b.trim();
  if (!x) return y;
  if (!y) return x;
  return `${x} ${y}`;
}

export function useSpeechIo(
  opts: UseSpeechIoOptions = {}
): [SpeechState, SpeechApi] {
  const { onFinalText, silenceThresholdMs = 1800, continuous = false } = opts;

  const [state, setState] = useState<SpeechState>({
    ttsAvailable: false,
    sttAvailable: false,
    lang: "fr-CA",
    isSpeaking: false,
    isListening: false,
    partialTranscript: "",
    finalTranscript: "",
    silenceMs: 0,
    recordingMode: "auto",
  });

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const silenceStartRef = useRef<number>(0);
  const ttsQueueRef = useRef<string[]>([]);
  const ttsSpeakingIndexRef = useRef<number>(0);
  const ttsResolveRef = useRef<(() => void) | null>(null);
  const ttsRejectRef = useRef<((err: unknown) => void) | null>(null);
  const ttsUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const langRef = useRef<"fr-CA" | "fr-FR">("fr-CA");
  const recordingModeRef = useRef<RecordingMode>("auto");
  const onFinalTextRef = useRef(onFinalText);
  const continuousRef = useRef(continuous);
  const isListeningRef = useRef(false);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | undefined>(undefined);
  const finalBufferRef = useRef<string>("");
  const interimRef = useRef<string>("");
  const explicitStopRequestedRef = useRef(false);

  useEffect(() => {
    onFinalTextRef.current = onFinalText;
  }, [onFinalText]);

  useEffect(() => {
    continuousRef.current = continuous;
  }, [continuous]);

  useEffect(() => {
    langRef.current = state.lang;
  }, [state.lang]);

  useEffect(() => {
    recordingModeRef.current = state.recordingMode;
  }, [state.recordingMode]);

  useEffect(() => {
    let cancelled = false;

    if (typeof window === "undefined") return;

    const SR =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike })
        .webkitSpeechRecognition;

    const sttAvail = !!SR;
    const ttsAvail = typeof window.speechSynthesis !== "undefined";

    const initialLang: "fr-CA" | "fr-FR" = "fr-CA";
    langRef.current = initialLang;

    setState((prev) => ({
      ...prev,
      sttAvailable: sttAvail,
      ttsAvailable: ttsAvail,
      lang: initialLang,
    }));

    if (sttAvail && SR) {
      const rec = new SR();
      rec.lang = initialLang;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.continuous = false;

      rec.onresult = (ev) => {
        if (cancelled) return;
        let interim = "";
        let finalText = "";
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const res = ev.results[i];
          const transcript = res[0].transcript;
          if (res.isFinal) {
            finalText += transcript;
          } else {
            interim += transcript;
          }
        }

        if (finalText) {
          const seg = finalText.trim();
          if (seg) {
            finalBufferRef.current = joinSegments(finalBufferRef.current, seg);
          }
          interimRef.current = interim.trim();
          setState((prev) => ({
            ...prev,
            partialTranscript: interim,
            finalTranscript: finalBufferRef.current,
            silenceMs: 0,
          }));
          silenceStartRef.current = Date.now();
        } else if (interim) {
          interimRef.current = interim.trim();
          setState((prev) => ({
            ...prev,
            partialTranscript: interim,
          }));
          silenceStartRef.current = Date.now();
        }
      };

      rec.onerror = (ev: unknown) => {
        if (cancelled) return;

        let errCode = "unknown";
        try {
          errCode = String((ev as { error?: unknown })?.error ?? "unknown");
        } catch {
          errCode = "unknown";
        }

        // Chrome raises these on brief silence / internal restarts. In manual modes the mic
        // must stay open, so let onend restart it instead of treating it as a hard stop.
        const benign = errCode === "no-speech" || errCode === "aborted";
        const manual =
          recordingModeRef.current === "toggle" || recordingModeRef.current === "ptt";
        if (benign && manual && !explicitStopRequestedRef.current) return;

        stopSilenceTimer();
        explicitStopRequestedRef.current = true;
        isListeningRef.current = false;

        const permissionDenied =
          errCode === "not-allowed" ||
          errCode === "service-not-allowed" ||
          errCode === "permission-denied";

        if (permissionDenied) {
          setState((prev) => ({
            ...prev,
            isListening: false,
            partialTranscript: "",
            sttAvailable: false,
          }));
          return;
        }

        setState((prev) => ({ ...prev, isListening: false, partialTranscript: "" }));
      };

      rec.onend = () => {
        if (cancelled) return;
        stopSilenceTimer();
        const mode = recordingModeRef.current;
        const shouldAutoRestart =
          (mode === "toggle" || mode === "ptt") &&
          !explicitStopRequestedRef.current &&
          !cancelled;

        // Chrome ends a session on its own after pauses. In manual modes keep accumulating
        // and restart; the answer is only sent when the user stops the mic.
        if (shouldAutoRestart) {
          if (interimRef.current) {
            finalBufferRef.current = joinSegments(finalBufferRef.current, interimRef.current);
            interimRef.current = "";
            setState((prev) => ({
              ...prev,
              partialTranscript: "",
              finalTranscript: finalBufferRef.current,
            }));
          }
          setTimeout(() => {
            if (
              cancelled ||
              explicitStopRequestedRef.current ||
              !recognitionRef.current ||
              recordingModeRef.current !== mode
            ) {
              return;
            }
            try {
              const r = recognitionRef.current;
              r.lang = langRef.current;
              r.continuous = true;
              silenceStartRef.current = Date.now();
              r.start();
              startSilenceTimer(silenceThresholdMs);
            } catch {
              isListeningRef.current = false;
              setState((s) => ({ ...s, isListening: false }));
            }
          }, 30);
          return;
        }

        // Final end: deliver everything captured, including trailing text that never
        // became "final" (e.g. the last word before stop).
        const text = joinSegments(finalBufferRef.current, interimRef.current).trim();
        finalBufferRef.current = "";
        interimRef.current = "";
        isListeningRef.current = false;

        setState((prev) => ({
          ...prev,
          isListening: false,
          partialTranscript: "",
          finalTranscript: text,
          silenceMs: 0,
        }));

        if (text) {
          try {
            onFinalTextRef.current?.(text);
          } catch {
            // noop
          }
        }
      };

      rec.onstart = () => {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          try {
            window.speechSynthesis.cancel();
          } catch {
            // noop
          }
        }
      };

      recognitionRef.current = rec;
    }

    if (ttsAvail && typeof window !== "undefined") {
      const synth = window.speechSynthesis;

      const loadVoices = () => {
        try {
          const list = synth.getVoices();
          setVoices(list);
          if (!selectedVoiceRef.current) {
            const frCA = list.find(
              (v) => v.lang && (v.lang === "fr-CA" || v.lang.startsWith("fr_CA"))
            );
            const frFR = list.find(
              (v) => v.lang && (v.lang === "fr-FR" || v.lang.startsWith("fr_FR"))
            );
            const frAny = list.find(
              (v) => v.lang && v.lang.toLowerCase().startsWith("fr")
            );
            selectedVoiceRef.current = frCA || frFR || frAny || undefined;
            if (selectedVoiceRef.current) {
              setState((prev) => ({
                ...prev,
                selectedVoice: selectedVoiceRef.current?.name,
              }));
            }
          }
        } catch {
          // noop
        }
      };

      loadVoices();
      try {
        synth.onvoiceschanged = loadVoices;
      } catch {
        // noop
      }
    }

    return () => {
      cancelled = true;
      stopSilenceTimer();
      try {
        recognitionRef.current?.abort();
      } catch {
        // noop
      }
      try {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      } catch {
        // noop
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current !== null) {
      clearInterval(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const stopListeningInternal = useCallback((_triggerFinal: boolean) => {
    const rec = recognitionRef.current;
    explicitStopRequestedRef.current = true;
    isListeningRef.current = false;
    stopSilenceTimer();
    try {
      rec?.stop();
    } catch {
      // noop
    }
    setState((prev) => ({ ...prev, isListening: false, silenceMs: 0 }));
  }, [stopSilenceTimer]);

  const startSilenceTimer = useCallback(
    (threshold: number) => {
      stopSilenceTimer();
      silenceStartRef.current = Date.now();
      silenceTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - silenceStartRef.current;
        const mode = recordingModeRef.current;
        setState((prev) => ({
          ...prev,
          silenceMs: mode === "auto" ? Math.min(elapsed, 1800) : 0,
        }));
        if (
          mode === "auto" &&
          elapsed >= threshold &&
          isListeningRef.current &&
          !explicitStopRequestedRef.current
        ) {
          try {
            stopListeningInternal(true);
          } catch {
            // noop
          }
        }
      }, 100);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stopSilenceTimer, stopListeningInternal]
  );

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // noop
    }
    const rec = recognitionRef.current;
    if (!rec) return;

    finalBufferRef.current = "";
    interimRef.current = "";

    setState((prev) => ({
      ...prev,
      partialTranscript: "",
      finalTranscript: "",
      silenceMs: 0,
    }));

    const mode = recordingModeRef.current;
    const continuousForMode =
      mode === "toggle" || mode === "ptt" ? true : continuousRef.current;

    try {
      explicitStopRequestedRef.current = false;
      rec.lang = langRef.current;
      rec.continuous = continuousForMode;
      isListeningRef.current = true;
      setState((s) => ({ ...s, isListening: true }));
      rec.start();
      startSilenceTimer(silenceThresholdMs);
    } catch {
      isListeningRef.current = false;
      explicitStopRequestedRef.current = false;
      setState((s) => ({ ...s, isListening: false }));
    }
  }, [silenceThresholdMs, startSilenceTimer]);

  const stopListening = useCallback(() => {
    stopListeningInternal(false);
  }, [stopListeningInternal]);

  const cancelSpeak = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // noop
    }
    ttsQueueRef.current = [];
    ttsSpeakingIndexRef.current = 0;
    if (ttsRejectRef.current) {
      const rej = ttsRejectRef.current;
      ttsRejectRef.current = null;
      ttsResolveRef.current = null;
      try {
        rej(new Error("cancelled"));
      } catch {
        // noop
      }
    }
    setState((prev) => ({ ...prev, isSpeaking: false }));
  }, []);

  const speakNextChunk = useCallback(
    (opts?: { rate?: number; pitch?: number; onBoundary?: () => void }) => {
      if (typeof window === "undefined") return;
      const queue = ttsQueueRef.current;
      const idx = ttsSpeakingIndexRef.current;
      if (idx >= queue.length) {
        ttsQueueRef.current = [];
        ttsSpeakingIndexRef.current = 0;
        setState((prev) => ({ ...prev, isSpeaking: false }));
        const res = ttsResolveRef.current;
        ttsResolveRef.current = null;
        ttsRejectRef.current = null;
        try {
          res?.();
        } catch {
          // noop
        }
        return;
      }

      const chunk = queue[idx];
      const utter = new SpeechSynthesisUtterance(chunk);
      utter.lang = langRef.current;
      if (typeof opts?.rate === "number") utter.rate = opts.rate;
      if (typeof opts?.pitch === "number") utter.pitch = opts.pitch;
      if (selectedVoiceRef.current) {
        utter.voice = selectedVoiceRef.current;
      }
      utter.volume = 1;

      utter.onboundary = () => {
        try {
          opts?.onBoundary?.();
        } catch {
          // noop
        }
      };

      utter.onerror = (ev) => {
        ttsUtteranceRef.current = null;
        if ((ev as unknown as { error?: string })?.error === "canceled" ||
            (ev as unknown as { error?: string })?.error === "interrupted") {
          return;
        }
        ttsQueueRef.current = [];
        ttsSpeakingIndexRef.current = 0;
        setState((prev) => ({ ...prev, isSpeaking: false }));
        const rej = ttsRejectRef.current;
        ttsRejectRef.current = null;
        ttsResolveRef.current = null;
        try {
          rej?.(ev);
        } catch {
          // noop
        }
      };

      utter.onend = () => {
        ttsUtteranceRef.current = null;
        ttsSpeakingIndexRef.current += 1;
        setTimeout(() => {
          speakNextChunk(opts);
        }, 60);
      };

      ttsUtteranceRef.current = utter;
      try {
        window.speechSynthesis.speak(utter);
      } catch (e) {
        setState((prev) => ({ ...prev, isSpeaking: false }));
        const rej = ttsRejectRef.current;
        ttsRejectRef.current = null;
        ttsResolveRef.current = null;
        try {
          rej?.(e);
        } catch {
          // noop
        }
      }
    },
    []
  );

  const speak = useCallback(
    (
      text: string,
      opts?: {
        rate?: number;
        pitch?: number;
        onBoundary?: () => void;
      }
    ): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (typeof window === "undefined" || !window.speechSynthesis) {
          reject(new Error("speechSynthesis indisponible"));
          return;
        }
        if (!text || text.trim().length === 0) {
          resolve();
          return;
        }

        try {
          window.speechSynthesis.cancel();
        } catch {
          // noop
        }

        const parts = text
          .split(/([.!?]+\s+)/)
          .reduce<string[]>((acc, part, i, arr) => {
            if (i % 2 === 1) {
              const last = acc[acc.length - 1];
              if (last !== undefined) {
                acc[acc.length - 1] = last + part;
              } else {
                acc.push(part);
              }
            } else if (part.trim().length > 0) {
              acc.push(part);
            }
            void arr;
            return acc;
          }, []);

        if (parts.length === 0) {
          parts.push(text.trim());
        }

        ttsQueueRef.current = parts;
        ttsSpeakingIndexRef.current = 0;
        ttsResolveRef.current = resolve;
        ttsRejectRef.current = reject;
        setState((prev) => ({ ...prev, isSpeaking: true }));

        setTimeout(() => {
          speakNextChunk(opts);
        }, 40);
      });
    },
    [speakNextChunk]
  );

  const setLang = useCallback((l: "fr-CA" | "fr-FR") => {
    langRef.current = l;
    setState((prev) => ({ ...prev, lang: l }));
  }, []);

  const setRecordingMode = useCallback((m: RecordingMode) => {
    recordingModeRef.current = m;
    setState((prev) => (prev.recordingMode === m ? prev : { ...prev, recordingMode: m }));
  }, []);

  const resetRecognition = useCallback(() => {
    // Stop any in-flight listening, silence timer and reset refs; next startListening recreates state
    if (isListeningRef.current) {
      isListeningRef.current = false;
      try {
        recognitionRef.current?.abort();
      } catch {
        // noop
      }
    }
    stopSilenceTimer();
    finalBufferRef.current = "";
    interimRef.current = "";
    setState((prev) => ({
      ...prev,
      isListening: false,
      partialTranscript: "",
      finalTranscript: "",
      silenceMs: 0,
    }));
  }, [stopSilenceTimer]);

  // Drop whatever has been heard but not yet sent, and release the mic without
  // delivering it (abort() skips the final flush that stop() would trigger).
  const discardPending = useCallback(() => {
    explicitStopRequestedRef.current = true;
    isListeningRef.current = false;
    stopSilenceTimer();
    finalBufferRef.current = "";
    interimRef.current = "";
    try {
      recognitionRef.current?.abort();
    } catch {
      // noop
    }
    setState((prev) => ({
      ...prev,
      isListening: false,
      partialTranscript: "",
      finalTranscript: "",
      silenceMs: 0,
    }));
  }, [stopSilenceTimer]);

  const api: SpeechApi = {
    startListening,
    stopListening,
    speak,
    cancelSpeak,
    setLang,
    setRecordingMode,
    resetRecognition,
    discardPending,
    voices,
  };

  return [state, api];
}
