"use client";

import { useEffect, useRef } from "react";
import type { ErreurLive } from "@/lib/types/tcf";

interface Props {
  value: string;
  onChange: (val: string) => void;
  erreurs: ErreurLive[];
  onInsertAtCursor?: (texte: string) => void;
}

const esc = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export default function EditeurSeyes({ value, onChange, erreurs }: Props) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const calqueRef = useRef<HTMLDivElement>(null);
  const gouttiereRef = useRef<HTMLDivElement>(null);

  const peindre = () => {
    const txt = value;
    let h = "";
    let pos = 0;
    erreurs.forEach((e, idx) => {
      h += esc(txt.slice(pos, e.i));
      h +=
        '<mark class="e-' +
        e.g +
        '" data-idx="' +
        idx +
        '">' +
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
  }, [value, erreurs]);

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

  return (
    <div className="copie">
      <div className="gouttiere" ref={gouttiereRef} />
      <div className="feuille">
        <div className="calque" ref={calqueRef} aria-hidden />
        <textarea
          id="redaction"
          ref={taRef}
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Rédigez votre copie ici. Les traits rouges apparaissent au fil de l'écriture."
        />
      </div>
    </div>
  );
}
