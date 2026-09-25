"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecordingMode = "auto" | "toggle" | "ptt";

export type VoiceBufferEventType =
  | "started"
  | "stopped"
  | "voice_start"
  | "voice_end"
  | "silence_timeout"
  | "turn_committed";

export interface VoiceBufferTurn {
  blob: Blob;
  mime: string;
  durationMs: number;
  startedAtMs: number;
  committedAtMs: number;
  bytes: number;
  peakRmsDb: number;
}

export interface VoiceBufferState {
  recorderAvailable: boolean;
  vadAvailable: boolean;
  isRecording: boolean;
  vadSpeaking: boolean;
  silenceMs: number;
  recordingMs: number;
  currentBlobBytes: number;
  lastTurn: VoiceBufferTurn | null;
  turnCount: number;
  peakRmsDb: number;
}

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
  voice: VoiceBufferState;
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
  startRecording: (opts?: { autoVadCommitMs?: number }) => Promise<{
    ok: boolean;
    error?: string;
    streamId?: string;
  }>;
  stopRecording: (opts?: { commit: boolean }) => Promise<{
    committed: VoiceBufferTurn | null;
    ok: boolean;
    error?: string;
  }>;
  discardCurrentRecording: () => void;
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

  const DEFAULT_VOICE: VoiceBufferState = {
    recorderAvailable: false,
    vadAvailable: false,
    isRecording: false,
    vadSpeaking: false,
    silenceMs: 0,
    recordingMs: 0,
    currentBlobBytes: 0,
    lastTurn: null,
    turnCount: 0,
    peakRmsDb: -Infinity,
  };

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
    voice: DEFAULT_VOICE,
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

  // ====== VoiceBuffer refs ======
  const vbStreamRef = useRef<MediaStream | null>(null);
  const vbRecorderRef = useRef<MediaRecorder | null>(null);
  const vbChunksRef = useRef<BlobPart[]>([]);
  const vbMimeRef = useRef<string>("audio/webm;codecs=opus");
  const vbStartRef = useRef<number>(0);
  const vbCommitAtRef = useRef<number>(0);
  const vbStartedRef = useRef<boolean>(false);
  const vbAutoCommitMsRef = useRef<number>(1500);
  const vbVadSpeakingRef = useRef<boolean>(false);
  const vbSilenceStartTsRef = useRef<number>(0);
  const vbAudioCtxRef = useRef<AudioContext | null>(null);
  const vbAnalyserRef = useRef<AnalyserNode | null>(null);
  const vbSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const vbVadIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const vbPeakRef = useRef<number>(-Infinity);
  const vbPendingBytesEstimateRef = useRef<number>(0);
  const vbTurnCountRef = useRef<number>(0);
  const vbLastTurnRef = useRef<VoiceBufferTurn | null>(null);
  const vbSubscribersRef = useRef<
    Partial<
      Record<
        VoiceBufferEventType,
        Set<(turn?: VoiceBufferTurn) => void>
      >
    >
  >({});
  const vbRecordingMsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

    type WinWithMedia = Window & {
      MediaRecorder?: typeof MediaRecorder;
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const w = window as WinWithMedia;
    const recorderAvail =
      typeof navigator !== "undefined" &&
      typeof navigator.mediaDevices !== "undefined" &&
      typeof navigator.mediaDevices.getUserMedia === "function" &&
      typeof w.MediaRecorder === "function";
    const audioCtxCtor: (typeof AudioContext) | undefined =
      w.AudioContext || w.webkitAudioContext;
    const vadAvail = recorderAvail && typeof audioCtxCtor === "function";

    const initialLang: "fr-CA" | "fr-FR" = "fr-CA";
    langRef.current = initialLang;

    setState((prev) => ({
      ...prev,
      sttAvailable: sttAvail,
      ttsAvailable: ttsAvail,
      lang: initialLang,
      voice: {
        ...prev.voice,
        recorderAvailable: recorderAvail,
        vadAvailable: vadAvail,
      },
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

  // ======================================================================
  // VoiceBuffer: MediaRecorder + AnalyserNode VAD silence detection
  // ======================================================================

  const vbPatchState = useCallback(
    (patch: Partial<VoiceBufferState> | ((prev: VoiceBufferState) => VoiceBufferState)) => {
      setState((prev) => {
        const nextVoice = typeof patch === "function" ? patch(prev.voice) : { ...prev.voice, ...patch };
        if (
          Object.keys(patch as Record<string, unknown>).length > 0 &&
          JSON.stringify(nextVoice) === JSON.stringify(prev.voice)
        ) {
          return prev;
        }
        return { ...prev, voice: nextVoice };
      });
    },
    []
  );

  const vbFire = useCallback((event: VoiceBufferEventType, turn?: VoiceBufferTurn) => {
    const set = vbSubscribersRef.current[event];
    if (set && set.size > 0) {
      for (const fn of set) {
        try {
          fn(turn);
        } catch {
          /* noop */
        }
      }
    }
  }, []);

  const vbStopAnalyser = useCallback(() => {
    try {
      if (vbVadIntervalRef.current) {
        clearInterval(vbVadIntervalRef.current);
        vbVadIntervalRef.current = null;
      }
    } catch {
      /* noop */
    }
    try {
      if (vbRecordingMsIntervalRef.current) {
        clearInterval(vbRecordingMsIntervalRef.current);
        vbRecordingMsIntervalRef.current = null;
      }
    } catch {
      /* noop */
    }
    try {
      vbSourceRef.current?.disconnect?.();
    } catch {
      /* noop */
    }
    vbSourceRef.current = null;
    vbAnalyserRef.current = null;
  }, []);

  const vbCleanStream = useCallback(() => {
    vbStopAnalyser();
    try {
      if (vbRecorderRef.current && vbRecorderRef.current.state !== "inactive") {
        try {
          vbRecorderRef.current.onstop = null as unknown as (() => void) | null;
          vbRecorderRef.current.ondataavailable = null as unknown as ((ev: BlobEvent) => void) | null;
          vbRecorderRef.current.onerror = null as unknown as ((ev: Event) => void) | null;
          vbRecorderRef.current.stop();
        } catch {
          /* noop */
        }
      }
    } catch {
      /* noop */
    }
    vbRecorderRef.current = null;
    vbStreamRef.current?.getTracks().forEach((t) => {
      try {
        t.stop();
      } catch {
        /* noop */
      }
    });
    vbStreamRef.current = null;
    vbChunksRef.current = [];
    vbStartedRef.current = false;
    vbPendingBytesEstimateRef.current = 0;
    vbVadSpeakingRef.current = false;
    vbSilenceStartTsRef.current = 0;
    vbPeakRef.current = -Infinity;
  }, [vbStopAnalyser]);

  const vbCommitTurn = useCallback(async (opts?: { fromVadTimeout?: boolean }): Promise<VoiceBufferTurn | null> => {
    const started = vbStartRef.current;
    const streamId = vbStreamRef.current?.id;
    if (!vbStartedRef.current || !streamId) return null;
    const committedAt = performance.now();
    vbStartRef.current = 0;
    vbStartedRef.current = false;
    const mime = vbMimeRef.current || "audio/webm";
    const peakRmsDb = vbPeakRef.current;
    const chunks = vbChunksRef.current.slice();
    vbChunksRef.current = [];
    vbPeakRef.current = -Infinity;
    let blob: Blob;
    try {
      blob = new Blob(chunks, { type: mime });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn("[useSpeechIo:VoiceBuffer] Blob construction failed:", msg);
      return null;
    }
    const turn: VoiceBufferTurn = {
      blob,
      mime,
      durationMs: Math.max(0, Math.round(committedAt - started)),
      startedAtMs: started,
      committedAtMs: committedAt,
      bytes: blob.size,
      peakRmsDb: Number.isFinite(peakRmsDb) ? peakRmsDb : -Infinity,
    };
    vbLastTurnRef.current = turn;
    vbTurnCountRef.current += 1;
    vbPatchState((prev) => ({
      ...prev,
      isRecording: false,
      recordingMs: 0,
      currentBlobBytes: 0,
      silenceMs: 0,
      vadSpeaking: false,
      turnCount: vbTurnCountRef.current,
      lastTurn: turn,
      peakRmsDb: Number.isFinite(peakRmsDb) ? peakRmsDb : -Infinity,
    }));
    vbCleanStream();
    vbFire(opts?.fromVadTimeout ? "silence_timeout" : "turn_committed", turn);
    vbFire("turn_committed", turn);
    return turn;
  }, [vbCleanStream, vbFire, vbPatchState]);

  const vbStartAnalyser = useCallback(
    (stream: MediaStream) => {
      type WinWithAudio = Window & {
        AudioContext?: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      };
      const win = typeof window !== "undefined"
        ? (window as WinWithAudio)
        : null;
      const AC = win ? (win.AudioContext || win.webkitAudioContext) : undefined;
      if (!AC) {
        vbPatchState((p) => ({ ...p, vadAvailable: false }));
        return;
      }
      try {
        const ctx = new AC();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.35;
        const src = ctx.createMediaStreamSource(stream);
        src.connect(analyser);
        vbAudioCtxRef.current = ctx;
        vbAnalyserRef.current = analyser;
        vbSourceRef.current = src;
        vbPatchState((p) => ({ ...p, vadAvailable: true }));

        const buf = new Float32Array(analyser.fftSize);
        vbVadSpeakingRef.current = false;
        vbSilenceStartTsRef.current = performance.now();
        vbPeakRef.current = -Infinity;

        const TICK_MS = 48;
        // RMS thresholds empirically OK for a headset mic ~ 5-10 cm.
        const SPEAKING_RMS = 0.035;     // above → speech
        const SILENCE_RMS = 0.018;       // below → silence (hysteresis)
        if (vbVadIntervalRef.current) clearInterval(vbVadIntervalRef.current);
        vbVadIntervalRef.current = setInterval(() => {
          if (!vbStartedRef.current || !vbAnalyserRef.current) return;
          try {
            vbAnalyserRef.current.getFloatTimeDomainData(buf);
            let sum = 0;
            for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
            const rms = Math.sqrt(sum / Math.max(1, buf.length));
            const db = rms > 0 ? 20 * Math.log10(rms) : -Infinity;
            if (Number.isFinite(db) && db > vbPeakRef.current) vbPeakRef.current = db;
            const currentlySpeaking = vbVadSpeakingRef.current
              ? rms >= SILENCE_RMS
              : rms >= SPEAKING_RMS;
            if (currentlySpeaking !== vbVadSpeakingRef.current) {
              vbVadSpeakingRef.current = currentlySpeaking;
              vbPatchState((p) => ({ ...p, vadSpeaking: currentlySpeaking }));
              vbFire(currentlySpeaking ? "voice_start" : "voice_end");
            }
            if (!currentlySpeaking) {
              const since = performance.now() - vbSilenceStartTsRef.current;
              vbPatchState((p) => (p.silenceMs === since ? p : { ...p, silenceMs: since }));
              const timeout = vbAutoCommitMsRef.current;
              if (timeout > 0 && since >= timeout) {
                // VAD-based turn commit (auto mode): commit then release,
                // parent room page will restart if continuous multi-turn mode.
                // To avoid double-stop: only stop recorder if currently
                // recording with auto mode.
                if (vbStartedRef.current) {
                  const committingTurn: VoiceBufferTurn = (async () => {
                    try {
                      if (
                        vbRecorderRef.current &&
                        vbRecorderRef.current.state === "recording"
                      ) {
                        explicitStopRequestedRef.current = false;
                        vbRecorderRef.current.stop();
                      }
                    } catch {
                      /* noop */
                    }
                    // Wait for recorder onstop → will resolve inside commitTurn
                    return await vbCommitTurn({ fromVadTimeout: true });
                  })() as unknown as VoiceBufferTurn;
                  void committingTurn;
                  return;
                }
              }
            } else {
              // Speech resumed → reset silence timer
              vbSilenceStartTsRef.current = performance.now();
              vbPatchState((p) => (p.silenceMs === 0 ? p : { ...p, silenceMs: 0 }));
            }
          } catch {
            /* noop */
          }
        }, TICK_MS);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn("[useSpeechIo:VoiceBuffer] AnalyserNode init failed:", msg);
        vbPatchState((p) => ({ ...p, vadAvailable: false }));
      }
    },
    [vbCommitTurn, vbFire, vbPatchState]
  );

  const startRecording = useCallback<SpeechApi["startRecording"]>(
    async (opts = {}) => {
      const hasMR =
        typeof window !== "undefined" &&
        typeof navigator !== "undefined" &&
        typeof navigator.mediaDevices?.getUserMedia === "function" &&
        typeof (window as unknown as { MediaRecorder?: typeof MediaRecorder }).MediaRecorder === "function";
      if (!hasMR) {
        return { ok: false, error: "MediaRecorder non supporté par ce navigateur." };
      }
      if (vbStartedRef.current) {
        return { ok: false, error: "Enregistrement déjà en cours." };
      }
      vbAutoCommitMsRef.current = typeof opts.autoVadCommitMs === "number" ? opts.autoVadCommitMs : 1500;
      vbPatchState((p) => ({ ...p, recorderAvailable: true }));
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000,
            channelCount: 1,
          },
          video: false,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        vbPatchState((p) => ({ ...p, recorderAvailable: false }));
        return {
          ok: false,
          error: `Accès au micro refusé ou indisponible : ${msg}`,
        };
      }
      vbStreamRef.current = stream;
      const MRCtor = (window as unknown as { MediaRecorder: typeof MediaRecorder }).MediaRecorder;
      // choose mimeType wisely (Opus = excellent speech, low bitrate)
      let chosenMime = "audio/webm;codecs=opus";
      const candidateMimes: string[] = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ];
      for (const m of candidateMimes) {
        try {
          if (typeof (MRCtor as typeof MediaRecorder & { isTypeSupported?: (t: string) => boolean }).isTypeSupported === "function") {
            if ((MRCtor as typeof MediaRecorder & { isTypeSupported: (t: string) => boolean }).isTypeSupported(m)) {
              chosenMime = m;
              break;
            }
          }
        } catch {
          /* noop */
        }
      }
      vbMimeRef.current = chosenMime;
      let recorder: MediaRecorder;
      try {
        recorder = new MRCtor(stream, { mimeType: chosenMime, audioBitsPerSecond: 64_000 });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        vbCleanStream();
        return {
          ok: false,
          error: `MediaRecorder non initialisable sur ce navigateur : ${msg}`,
        };
      }
      vbRecorderRef.current = recorder;
      vbChunksRef.current = [];
      vbPendingBytesEstimateRef.current = 0;
      const startedAt = performance.now();
      vbStartRef.current = startedAt;
      vbSilenceStartTsRef.current = startedAt;
      vbRecorderRef.current.ondataavailable = (ev: BlobEvent) => {
        if (!ev.data || ev.data.size === 0) return;
        vbChunksRef.current.push(ev.data);
        vbPendingBytesEstimateRef.current += ev.data.size;
        vbPatchState((p) =>
          p.currentBlobBytes === vbPendingBytesEstimateRef.current
            ? p
            : { ...p, currentBlobBytes: vbPendingBytesEstimateRef.current }
        );
      };
      vbRecorderRef.current.onstop = async () => {
        // Ensure a final commit at stop() time (always, even no data)
        if (vbStartedRef.current) {
          await vbCommitTurn();
        }
      };
      vbRecorderRef.current.onerror = (ev) => {
        console.warn("[useSpeechIo:VoiceBuffer] recorder.onerror:", ev);
      };
      try {
        // Emit data chunks every ~250ms so blob size updates regularly even for long recordings
        vbRecorderRef.current.start(250);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        vbCleanStream();
        return { ok: false, error: `Impossible de démarrer l'enregistrement : ${msg}` };
      }
      vbStartedRef.current = true;
      vbPatchState({
        isRecording: true,
        recordingMs: 0,
        silenceMs: 0,
        vadSpeaking: false,
        currentBlobBytes: 0,
        peakRmsDb: -Infinity,
        lastTurn: vbLastTurnRef.current,
        turnCount: vbTurnCountRef.current,
        recorderAvailable: true,
      });
      vbRecordingMsIntervalRef.current = setInterval(() => {
        if (!vbStartedRef.current) return;
        const ms = Math.max(0, Math.round(performance.now() - vbStartRef.current));
        vbPatchState((p) => (p.recordingMs === ms ? p : { ...p, recordingMs: ms }));
      }, 100);
      vbStartAnalyser(stream);
      vbFire("started");
      return { ok: true, streamId: stream.id };
    },
    [vbCleanStream, vbCommitTurn, vbFire, vbPatchState, vbStartAnalyser]
  );

  const stopRecording = useCallback<SpeechApi["stopRecording"]>(
    async (opts = { commit: true }) => {
      if (!vbStartedRef.current && !vbStreamRef.current) {
        return { ok: false, committed: null, error: "Aucun enregistrement en cours." };
      }
      try {
        if (opts.commit) {
          explicitStopRequestedRef.current = false;
          // Stop recorder → triggers onstop → vbCommitTurn inside that handler → set vbStartedRef = false
          if (
            vbRecorderRef.current &&
            vbRecorderRef.current.state === "recording"
          ) {
            vbRecorderRef.current.stop();
          }
          // Wait recorder to actually stop then return the committed turn
          const deadline = performance.now() + 2500;
          while (vbStartedRef.current && performance.now() < deadline) {
            await new Promise((r) => setTimeout(r, 20));
          }
          const last = vbLastTurnRef.current;
          vbCleanStream();
          return { ok: true, committed: last ?? null };
        } else {
          // Discard the current recording (no commit)
          vbStartRef.current = 0;
          vbStartedRef.current = false;
          vbChunksRef.current = [];
          vbCleanStream();
          vbPatchState({
            isRecording: false,
            recordingMs: 0,
            silenceMs: 0,
            vadSpeaking: false,
            currentBlobBytes: 0,
          });
          vbFire("stopped");
          return { ok: true, committed: null };
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        vbCleanStream();
        return { ok: false, committed: null, error: msg };
      }
    },
    [vbCleanStream, vbFire, vbPatchState]
  );

  const discardCurrentRecording = useCallback(() => {
    void stopRecording({ commit: false });
  }, [stopRecording]);

  const RECORDER_AVAILABLE =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    typeof navigator.mediaDevices?.getUserMedia === "function" &&
    typeof (window as unknown as { MediaRecorder?: typeof MediaRecorder }).MediaRecorder === "function";

  // initial availability (first run)
  useEffect(() => {
    vbPatchState((p) => {
      if (p.recorderAvailable === !!RECORDER_AVAILABLE) return p;
      return { ...p, recorderAvailable: !!RECORDER_AVAILABLE };
    });
    // cleanup on unmount: stop any pending recorder
    return () => {
      try {
        vbCleanStream();
      } catch {
        /* noop */
      }
      try {
        if (vbAudioCtxRef.current && typeof vbAudioCtxRef.current.close === "function") {
          void vbAudioCtxRef.current.close?.().catch(() => {});
        }
      } catch {
        /* noop */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    startRecording,
    stopRecording,
    discardCurrentRecording,
  };

  return [state, api];
}
