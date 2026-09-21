"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ErreurLive } from "@/lib/types/tcf";

interface Props {
  value: string;
  onChange: (val: string) => void;
  erreurs: ErreurLive[];
  onInsertAtCursor?: (texte: string) => void;
}

const esc = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const EXTRACT_SUGGESTION = /correction suggérée\s*:\s*"([^"]+)"/;

type TooltipState = {
  leftPx: number;
  topPx: number;
  suggestion: string;
  replacement: { start: number; end: number; old: string; suggestion: string; rule?: string; msg: string; code: string; gravity: ErreurLive["g"] } | null;
};

export default function EditeurSeyes({ value, onChange, erreurs, onInsertAtCursor }: Props) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const calqueRef = useRef<HTMLDivElement>(null);
  const gouttiereRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const ortCount = useMemo(() => erreurs.filter((e) => e.code === "ORT").length, [erreurs]);
  const grCount = useMemo(
    () => erreurs.filter((e) => e.code === "GR" || e.code === "CONJ").length,
    [erreurs]
  );

  const peindre = () => {
    const txt = value;
    let h = "";
    let pos = 0;
    erreurs.forEach((e, idx) => {
      h += esc(txt.slice(pos, e.i));
      const suggestAttr =
        e.code === "ORT" ? `data-suggest-idx="${idx}"` : "";
      h +=
        '<mark class="e-' +
        e.g +
        '" data-idx="' +
        idx +
        '" data-code="' +
        e.code +
        '" ' +
        suggestAttr +
        ">" +
        esc(txt.substr(e.i, e.l)) +
        "</mark>";
      pos = e.i + e.l;
    });
    h += esc(txt.slice(pos)) + "\n";
    if (calqueRef.current) calqueRef.current.innerHTML = h;
  };

  const marges = () => {
    const calque = calqueRef.current;
    const gouttiere = gouttiereRef.current;
    if (!calque || !gouttiere) return;
    const marks = calque.querySelectorAll("mark");
    const base = calque.getBoundingClientRect().top;
    const groupes: Record<number, Record<string, { r: number; g: ErreurLive["g"] }>> = {};
    marks.forEach((mk) => {
      const y =
        Math.round((mk.getBoundingClientRect().top - base) / 2) * 2;
      const el = mk as HTMLElement;
      const idx = Number(el.dataset.idx);
      const e = erreurs[idx];
      if (!e) return;
      if (!groupes[y]) groupes[y] = {};
      const rang = { haute: 3, moyenne: 2, basse: 1 }[e.g];
      if (!groupes[y][e.code] || groupes[y][e.code].r < rang)
        groupes[y][e.code] = { r: rang, g: e.g };
    });
    gouttiere.innerHTML = Object.keys(groupes)
      .map((y) => {
        return Object.keys(groupes[Number(y)])
          .slice(0, 2)
          .map(
            (code, n) =>
              '<span class="annot e-' +
              groupes[Number(y)][code].g +
              '" style="top:' +
              (Number(y) + 4 + n * 15) +
              'px">' +
              code +
              "</span>"
          )
          .join("");
      })
      .join("");
  };

  useEffect(() => {
    peindre();
    requestAnimationFrame(marges);
    setTooltip(null);
    setHoverIdx(null);
  }, [value, erreurs]);

  // Bind hovers + clicks on marks → show tooltip
  useEffect(() => {
    const wrap = wrapRef.current;
    const calque = calqueRef.current;
    if (!wrap || !calque) return;

    const onOver = (evt: Event) => {
      const tgt = (evt.target as HTMLElement | null)?.closest("mark[data-idx]");
      if (!tgt) return;
      const idx = Number((tgt as HTMLElement).dataset.idx);
      if (Number.isNaN(idx) || idx < 0) return;
      const e = erreurs[idx];
      if (!e) return;
      setHoverIdx(idx);
      const rect = (tgt as HTMLElement).getBoundingClientRect();
      const hostRect = wrap.getBoundingClientRect();
      const m = EXTRACT_SUGGESTION.exec(e.msg);
      const suggestion = m ? m[1] : "";
      const leftPx = rect.left - hostRect.left;
      const topPx = rect.bottom - hostRect.top + 8;
      setTooltip({
        leftPx,
        topPx,
        suggestion,
        replacement: suggestion
          ? {
              start: e.i,
              end: e.i + e.l,
              old: value.slice(e.i, e.i + e.l),
              suggestion,
              msg: e.msg,
              code: e.code,
              gravity: e.g,
            }
          : null,
      });
    };
    const onOut = (evt: Event) => {
      const rel = (evt as MouseEvent).relatedTarget as HTMLElement | null;
      const tgt = (evt.target as HTMLElement | null)?.closest("mark[data-idx]");
      if (tgt && rel && (tgt.contains(rel) || rel.closest("mark[data-idx]"))) return;
      setHoverIdx(null);
      // Hide tooltip after a short delay so user can move cursor on tooltip itself
      window.setTimeout(() => {
        const stillHover = wrap.querySelector("mark:hover");
        if (!stillHover) setTooltip(null);
      }, 160);
    };

    calque.addEventListener("mouseover", onOver);
    calque.addEventListener("mouseout", onOut);
    return () => {
      calque.removeEventListener("mouseover", onOver);
      calque.removeEventListener("mouseout", onOut);
    };
  }, [erreurs, value]);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    const onScroll = () => {
      if (calqueRef.current) calqueRef.current.scrollTop = ta.scrollTop;
    };
    ta.addEventListener("scroll", onScroll);
    const onResize = () => requestAnimationFrame(marges);
    window.addEventListener("resize", onResize);
    return () => {
      ta.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const autoResize = () => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.max(340, ta.scrollHeight) + "px";
  };
  useEffect(autoResize, [value]);

  const appliquerSuggestion = (replacement: NonNullable<TooltipState["replacement"]>) => {
    const ta = taRef.current;
    const avant = value.slice(0, replacement.start);
    const apres = value.slice(replacement.end);
    const nouveau = avant + replacement.suggestion + apres;
    onChange(nouveau);
    setTooltip(null);
    setHoverIdx(null);
    requestAnimationFrame(() => {
      if (ta) {
        ta.focus();
        const pos = replacement.start + replacement.suggestion.length;
        ta.selectionStart = ta.selectionEnd = pos;
      }
    });
  };

  return (
    <>
      <div
        className="copie"
        ref={wrapRef}
        style={{ position: "relative" }}
      >
        <div className="gouttiere" ref={gouttiereRef} />
        <div className="feuille">
          <div className="calque" ref={calqueRef} aria-hidden />
          <textarea
            id="redaction"
            ref={taRef}
            spellCheck={false}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Rédigez votre copie ici. Les traits rouges apparaissent au fil de l'écriture — survolez-les pour afficher la correction suggérée puis cliquez pour l'appliquer."
          />
          {tooltip && (
            <div
              role="dialog"
              aria-live="polite"
              onMouseEnter={() => {}}
              onMouseLeave={() => setTooltip(null)}
              style={{
                position: "absolute",
                left: Math.max(8, Math.min(tooltip.leftPx, (wrapRef.current?.clientWidth ?? 640) - 360)),
                top: tooltip.topPx,
                zIndex: 20,
                maxWidth: 360,
                padding: 14,
                borderRadius: 14,
                background: "#0B1220",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 24px 48px rgba(0,0,0,0.45)",
                fontFamily: "var(--font-sans)",
                fontSize: 13.5,
                lineHeight: 1.45,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    padding: "2px 10px",
                    borderRadius: 999,
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.05em",
                    fontWeight: 800,
                    background: tooltip.replacement
                      ? "rgba(220, 38, 38, 0.22)"
                      : "rgba(100,116,139,0.22)",
                    color: tooltip.replacement ? "#FCA5A5" : "#CBD5E1",
                    border: "1px solid",
                    borderColor: tooltip.replacement
                      ? "rgba(220,38,38,0.35)"
                      : "rgba(148,163,184,0.25)",
                  }}
                >
                  {tooltip.replacement?.code ?? "INFO"}
                </span>
                <span
                  style={{
                    color: "#E5E7EB",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                  }}
                >
                  {tooltip.replacement?.gravity === "haute"
                    ? "priorité haute"
                    : tooltip.replacement?.gravity === "moyenne"
                    ? "priorité moyenne"
                    : "priorité basse"}
                </span>
              </div>
              <div
                style={{
                  color: "#FDE68A",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  marginBottom: 8,
                  fontWeight: 600,
                }}
              >
                Mot détecté :{" "}
                <span
                  style={{
                    color: "#FCA5A5",
                    textDecoration: "line-through",
                    opacity: 0.9,
                  }}
                >
                  {tooltip.replacement?.old ?? "—"}
                </span>
              </div>
              {tooltip.replacement?.rule ? (
                <div
                  style={{
                    color: "#CBD5E1",
                    fontSize: 12.5,
                    opacity: 0.96,
                    marginBottom: 10,
                  }}
                >
                  {tooltip.replacement.rule}
                </div>
              ) : tooltip.replacement?.msg ? (
                <div
                  style={{
                    color: "#CBD5E1",
                    fontSize: 12.5,
                    marginBottom: 10,
                    opacity: 0.96,
                  }}
                >
                  {tooltip.replacement.msg}
                </div>
              ) : null}
              {tooltip.suggestion ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => tooltip.replacement && appliquerSuggestion(tooltip.replacement)}
                    style={{
                      borderRadius: 10,
                    padding: "9px 14px",
                      border: "1px solid rgba(16,185,129,0.35)",
                      background: "rgba(16,185,129,0.16)",
                      color: "#6EE7B7",
                      fontWeight: 800,
                      fontFamily: "var(--font-sans)",
                      fontSize: 13.5,
                      cursor: "pointer",
                      letterSpacing: "0.02em",
                    }}
                  >
                    ✅ Appliquer : « {tooltip.suggestion} »
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTooltip(null);
                      setHoverIdx(null);
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      background: "rgba(148,163,184,0.14)",
                      border: "1px solid rgba(148,163,184,0.25)",
                      color: "#E2E8F0",
                      fontFamily: "var(--font-sans)",
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Ignorer
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    paddingTop: 6,
                    color: "#94A3B8",
                    fontSize: 12,
                  }}
                >
                  Aucune suggestion de correction 1-clic disponible — corriger manuellement.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          marginTop: 10,
          padding: "6px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          borderRadius: 10,
          border: "1px solid rgba(226,232,240,0.9)",
          background: "#F8FAFC",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "#475569",
          letterSpacing: "0.02em",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span>
            <b style={{ color: ortCount > 0 ? "#B91C1C" : "#0F766E", marginRight: 4 }}>
              {ortCount}
            </b>{" "}
            orthographe
          </span>
          <span>
            <b style={{ color: grCount > 0 ? "#B45309" : "#0F766E", marginRight: 4 }}>
              {grCount}
            </b>{" "}
            grammaire / conjugaison
          </span>
          <span>
            <b style={{ color: erreurs.length - ortCount - grCount > 0 ? "#7C3AED" : "#0F766E", marginRight: 4 }}>
              {Math.max(0, erreurs.length - ortCount - grCount)}
            </b>{" "}
            autres
          </span>
        </div>
        <div
          style={{
            fontSize: 10.5,
            opacity: 0.8,
          }}
        >
          Survolez un mot souligné · cliquez sur la correction pour appliquer immédiatement
        </div>
      </div>
    </>
  );
}
