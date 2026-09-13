"use client";

import { useEffect, useRef } from "react";
import type { CriterionId } from "@/lib/types/eo";

const DEFAULT_THRESHOLDS = [
  { label: "A1", value: 0.5, color: "#9CA3AF" },
  { label: "A2", value: 1.5, color: "#9CA3AF" },
  { label: "B1", value: 2.5, color: "#F59E0B" },
  { label: "B2", value: 4.0, color: "#10B981" },
  { label: "C1", value: 5.0, color: "#0D9488" },
  { label: "C2", value: 6.0, color: "#111827" },
];

const DEFAULT_AXES_LABELS: Record<CriterionId, string> = {
  P1: "Adéquation",
  P2: "Richesse",
  P3: "Cohérence",
  L1: "Grammaire",
  L2: "Vocabulaire",
  L3: "Phonique",
  S1: "Interaction",
};

const CRIT_ORDER: CriterionId[] = ["P1", "P2", "P3", "L1", "L2", "L3", "S1"];

interface Props {
  scores: Record<CriterionId, number>;
  max?: number;
  size?: number;
  className?: string;
  thresholds?: { label: string; value: number; color: string }[];
  legend?: boolean;
  axesLabels?: Record<CriterionId, string>;
}

export default function CanvasRadar({
  scores,
  max = 6,
  size = 420,
  className,
  thresholds = DEFAULT_THRESHOLDS,
  legend = true,
  axesLabels = DEFAULT_AXES_LABELS,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    const draw = () => {
      const rect = wrap.getBoundingClientRect();
      const cssSize = Math.min(rect.width || size, size);
      canvas.style.width = cssSize + "px";
      canvas.style.height = cssSize + "px";
      canvas.width = Math.round(cssSize * dpr);
      canvas.height = Math.round(cssSize * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const w = cssSize;
      const h = cssSize;
      const cx = w / 2;
      const cy = h / 2;
      const labelPad = 36;
      const radius = Math.min(w, h) / 2 - labelPad;
      const nAxes = CRIT_ORDER.length;

      ctx.clearRect(0, 0, w, h);

      for (let lv = 1; lv <= max; lv++) {
        const r = (lv / max) * radius;
        ctx.beginPath();
        for (let i = 0; i <= nAxes; i++) {
          const idx = i % nAxes;
          const angle = (idx / nAxes) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = "rgba(0,0,0,0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      for (let i = 0; i < nAxes; i++) {
        const angle = (i / nAxes) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.strokeStyle = "rgba(0,0,0,0.10)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      thresholds.forEach((th) => {
        const r = (Math.min(th.value, max) / max) * radius;
        if (r <= 0) return;
        ctx.beginPath();
        for (let i = 0; i <= nAxes; i++) {
          const idx = i % nAxes;
          const angle = (idx / nAxes) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = th.color;
        ctx.lineWidth = th.label === "B2" ? 1.6 : 1;
        ctx.setLineDash(th.label === "B2" ? [6, 4] : []);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      const polyPath: [number, number][] = [];
      for (let i = 0; i < nAxes; i++) {
        const cid = CRIT_ORDER[i];
        const raw = scores[cid] ?? 0;
        const val = Math.max(0, Math.min(max, raw));
        const r = (val / max) * radius;
        const angle = (i / nAxes) * Math.PI * 2 - Math.PI / 2;
        polyPath.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
      }

      ctx.beginPath();
      polyPath.forEach(([x, y], i) => {
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
      ctx.fill();
      ctx.strokeStyle = "#10B981";
      ctx.lineWidth = 2;
      ctx.stroke();

      polyPath.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#10B981";
        ctx.fill();
      });

      ctx.font = "11px ui-sans-serif, system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "#374151";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let i = 0; i < nAxes; i++) {
        const cid = CRIT_ORDER[i];
        const label = axesLabels[cid] || cid;
        const angle = (i / nAxes) * Math.PI * 2 - Math.PI / 2;
        const lx = cx + Math.cos(angle) * (radius + 18);
        const ly = cy + Math.sin(angle) * (radius + 18);
        ctx.fillText(label, lx, ly);
      }

      if (legend) {
        const b2 = thresholds.find((t) => t.label === "B2");
        if (b2) {
          ctx.font = "10px ui-sans-serif, system-ui";
          ctx.fillStyle = b2.color;
          ctx.textAlign = "right";
          ctx.textBaseline = "top";
          ctx.fillText(`--- B2 threshold = ${b2.value}`, w - 8, 8);
        }
      }
    };

    draw();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(draw);
      ro.observe(wrap);
    }
    window.addEventListener("resize", draw);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", draw);
    };
  }, [scores, max, size, thresholds, legend, axesLabels]);

  return (
    <div ref={wrapRef} className={className} style={{ width: "100%", maxWidth: size }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
