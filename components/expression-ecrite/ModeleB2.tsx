"use client";

import { useState } from "react";
import { motsDe } from "@/lib/heuristiques/taches";

interface Props {
  onLoadModele: (texte: string) => void;
  start: boolean;
  params: { tache_num: 1 | 2 | 3; consigne?: string; copie: string };
  onDone?: (modele: string, formules: string[]) => void;
}

const esc = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export default function ModeleB2({ onLoadModele, start, params, onDone }: Props) {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [modele, setModele] = useState("");
  const [formules, setFormules] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const go = async () => {
    setLoading(true);
    setLoaded(false);
    setErr(null);
    try {
      const r = await fetch("/api/modele-b2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const d = (await r.json()) as { modele?: string; formules?: string[]; erreur?: string; detail?: string };
      if (!r.ok || !d.modele) {
        throw new Error(d.erreur || d.detail || "Échec");
      }
      setModele(d.modele);
      setFormules(d.formules || []);
      setLoaded(true);
      onDone?.(d.modele, d.formules || []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  if (start && !loading && !loaded && !err) {
    void go();
  }

  if (!start && !loaded) return null;

  if (loading) {
    return (
      <div className="bloc" id="modele-b2-bloc">
        <div className="charge" style={{ padding: 0 }}>
          <span className="spin" />
          Rédaction du modèle B2 et des tournures à réemployer.
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="bloc" id="modele-b2-bloc">
        <h3>Réécriture B2</h3>
        <p style={{ margin: "0 0 10px", fontSize: 13.5 }}>{esc(err)}</p>
        <button className="bouton" onClick={go}>
          Demander la réécriture
        </button>
      </div>
    );
  }

  if (!loaded) return null;

  const insererFormule = (p: string) => {
    if (typeof document === "undefined") return;
    const ta = document.getElementById("redaction") as HTMLTextAreaElement | null;
    if (!ta) return;
    const d = ta.selectionStart != null ? ta.selectionStart : ta.value.length;
    ta.value = ta.value.slice(0, d) + p + ta.value.slice(d);
    const ev = new Event("input", { bubbles: true });
    ta.dispatchEvent(ev);
    ta.focus();
    ta.selectionStart = ta.selectionEnd = d + p.length;
  };

  return (
    <div className="bloc" id="modele-b2-bloc">
      <h3>
        La même copie, rédigée en B2 — {motsDe(modele)} mots
      </h3>
      <div className="modele">{esc(modele)}</div>
      <div style={{ marginTop: 10 }}>
        <button
          className="bouton"
          onClick={() => onLoadModele(modele)}
        >
          Charger ce modèle dans l'éditeur
        </button>{" "}
        <button
          className="bouton"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(modele);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? "Copié" : "Copier le modèle"}
        </button>
      </div>
      {formules.length ? (
        <>
          <h3 style={{ marginTop: 16 }}>Tournures à réemployer</h3>
          <div className="tirettes">
            {formules.map((p, i) => (
              <span
                key={i}
                className="tirette"
                onClick={() => insererFormule(p)}
              >
                {esc(p)}
              </span>
            ))}
          </div>
          <p
            style={{
              margin: "10px 0 0",
              fontSize: 12.5,
              color: "var(--color-encre-2)",
            }}
          >
            Cliquez une tournure pour l'insérer à l'endroit du curseur.
          </p>
        </>
      ) : null}
    </div>
  );
}
