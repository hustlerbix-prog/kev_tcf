import { useCallback, useEffect, useRef, useState } from 'react';

interface UseEoTimerParams {
  totalMs: number;
  running: boolean;
  onExpire?: () => void;
  intervalMs?: number;
}

interface UseEoTimerResult {
  remainingMs: number;
  totalMs: number;
  remainingPct: number;
  isLast15s: boolean;
  formatted: string;
  tickOnce: () => void;
}

function formatTime(totalSeconds: number): string {
  const clamped = Math.max(0, Math.round(totalSeconds));
  const mm = Math.floor(clamped / 60);
  const ss = clamped % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

export function useEoTimer({
  totalMs,
  running,
  onExpire,
  intervalMs = 250,
}: UseEoTimerParams): UseEoTimerResult {
  const [remainingMs, setRemainingMs] = useState(totalMs);
  const expiredRef = useRef(false);
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    setRemainingMs(totalMs);
    expiredRef.current = false;
  }, [totalMs]);

  const tickOnce = useCallback(() => {
    setRemainingMs((prev) => {
      const step = intervalMs;
      const next = Math.max(0, prev - step);
      if (next === 0 && prev > 0 && !expiredRef.current) {
        expiredRef.current = true;
        queueMicrotask(() => onExpireRef.current?.());
      }
      return next;
    });
  }, [intervalMs]);

  useEffect(() => {
    if (!running) {
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      return;
    }

    if (remainingMs <= 0) return;

    intervalIdRef.current = setInterval(() => {
      tickOnce();
    }, intervalMs);

    return () => {
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [running, intervalMs, tickOnce, remainingMs]);

  const remainingPct =
    totalMs > 0 ? Math.max(0, Math.min(1, remainingMs / totalMs)) : 0;

  const isLast15s = remainingMs > 0 && remainingMs <= 15_000;

  const formatted = formatTime(remainingMs / 1000);

  return {
    remainingMs,
    totalMs,
    remainingPct,
    isLast15s,
    formatted,
    tickOnce,
  };
}
