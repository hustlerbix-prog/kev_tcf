"use client";

import { useEffect, useRef, useState } from "react";

interface Point {
  x: string;
  y: number;
  mode?: string;
}

interface Props {
  points: Point[];
  target?: number;
  minY?: number;
  maxY?: number;
  className?: string;
  height?: number;
  axesYLabel?: string;
  color?: string;
}

export default function CanvasLineChart({
  points,
  target,
  minY = 0,
  maxY = 20,
  className,
  height = 260,
  axesYLabel,
  color = "#2563EB",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? Math.max(2, window.devicePixelRatio || 1) : 2;

    const draw = () => {
      const rect = wrap.getBoundingClientRect();
      const cssW = rect.width || 600;
      const cssH = height;
      canvas.style.width = cssW + "px";
      canvas.style.height = cssH + "px";
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const padL = 44;
      const padR = 20;
      const padT = 24;
      const padB = 48;
      const plotW = Math.max(10, cssW - padL - padR);
      const plotH = Math.max(10, cssH - padT - padB);
      const w = cssW;
      const h = cssH;

      ctx.clearRect(0, 0, w, h);

      const yAt = (n: number) => {
        const clamped = Math.max(minY, Math.min(maxY, n));
        const ratio = (clamped - minY) / (maxY - minY || 1);
        return padT + plotH - ratio * plotH;
      };
      const xAt = (i: number) => {
        if (points.length <= 1) return padL + plotW / 2;
        return padL + (i / (points.length - 1)) * plotW;
      };

      const yTicks: number[] = [];
      const step = maxY - minY <= 10 ? 2 : 5;
      for (let v = minY; v <= maxY; v += step) yTicks.push(v);
      if (yTicks[yTicks.length - 1] !== maxY) yTicks.push(maxY);

      yTicks.forEach((y) => {
        const yy = yAt(y);
        ctx.beginPath();
        ctx.moveTo(padL, yy);
        ctx.lineTo(w - padR, yy);
        ctx.strokeStyle = "rgba(0,0,0,0.06)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.fillStyle = "#6B7280";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(String(y), padL - 8, yy);
      });

      if (typeof target === "number") {
        const ty = yAt(target);
        ctx.beginPath();
        ctx.moveTo(padL, ty);
        ctx.lineTo(w - padR, ty);
        ctx.strokeStyle = "#10B981";
        ctx.setLineDash([5, 4]);
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = "10px ui-monospace, monospace";
        ctx.fillStyle = "#10B981";
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        ctx.fillText(`cible ${target}`, w - padR - 4, ty - 4);
      }

      if (axesYLabel) {
        ctx.save();
        ctx.translate(12, padT + plotH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.font = "10px ui-sans-serif, system-ui";
        ctx.fillStyle = "#6B7280";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(axesYLabel, 0, 0);
        ctx.restore();
      }

      ctx.beginPath();
      ctx.moveTo(padL, padT + plotH);
      ctx.lineTo(w - padR, padT + plotH);
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();

      const proj = points.map((p, i) => ({ x: xAt(i), y: yAt(p.y), i, p }));

      if (proj.length > 1) {
        ctx.beginPath();
        proj.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, padT + plotH);
          ctx.lineTo(pt.x, pt.y);
        });
        ctx.lineTo(proj[proj.length - 1].x, padT + plotH);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, padT, 0, padT + plotH);
        grad.addColorStop(0, color + "22");
        grad.addColorStop(1, color + "03");
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        proj.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      proj.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.stroke();
      });

      ctx.save();
      ctx.font = "10px ui-monospace, monospace";
      ctx.fillStyle = "#6B7280";
      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      proj.forEach((pt, i) => {
        if (proj.length > 8 && i % Math.ceil(proj.length / 8) !== 0 && i !== proj.length - 1) return;
        ctx.save();
        ctx.translate(pt.x - 2, padT + plotH + 6);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(pt.p.x, 0, 0);
        ctx.restore();
      });
      ctx.restore();
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
  }, [points, target, minY, maxY, height, color, axesYLabel]);

  const onMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || points.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const padL = 44;
    const padR = 20;
    const plotW = Math.max(10, rect.width - padL - padR);
    const xAt = (i: number) => points.length <= 1 ? padL + plotW / 2 : padL + (i / (points.length - 1)) * plotW;
    let best = -1;
    let bestD = Infinity;
    for (let i = 0; i < points.length; i++) {
      const d = Math.abs(xAt(i) - mx);
      if (d < bestD) { bestD = d; best = i; }
    }
    if (best >= 0 && bestD < 24) {
      const padT = 24;
      const padB = 48;
      const plotH = Math.max(10, rect.height - padT - padB);
      const yAt = (n: number) => {
        const clamped = Math.max(minY, Math.min(maxY, n));
        const ratio = (clamped - minY) / (maxY - minY || 1);
        return padT + plotH - ratio * plotH;
      };
      setHover({ i: best, x: xAt(best), y: yAt(points[best].y) });
    } else {
      setHover(null);
    }
  };

  const onLeave = () => setHover(null);

  return (
    <div ref={wrapRef} className={className} style={{ width: "100%", position: "relative" }}>
      <canvas
        ref={canvasRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ display: "block" }}
      />
      {hover && (
        <div
          style={{
            position: "absolute",
            left: Math.min(Math.max(hover.x + 10, 8), (wrapRef.current?.getBoundingClientRect().width ?? 600) - 96),
            top: Math.max(hover.y - 28, 4),
            padding: "4px 8px",
            borderRadius: 6,
            background: "rgba(17,24,39,0.92)",
            color: "#FFFFFF",
            fontSize: 11,
            fontFamily: "ui-monospace, monospace",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          <div style={{ fontWeight: 600 }}>{points[hover.i].y.toFixed(1)} / {maxY}</div>
          <div style={{ opacity: 0.75, fontSize: 10 }}>{points[hover.i].x}</div>
        </div>
      )}
    </div>
  );
}
