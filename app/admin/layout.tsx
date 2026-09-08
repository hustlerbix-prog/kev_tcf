"use client";

import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [test, setTest] = useState(false);

  useEffect(() => {
    try {
      const t = localStorage.getItem("tcf_admin_token");
      if (t) setToken(t);
    } catch {
      /* noop */
    }
  }, []);

  const valider = async () => {
    setTest(true);
    setErr(null);
    try {
      const r = await fetch(
        "/api/admin/settings?pw=" + encodeURIComponent(pw),
        {
          method: "GET",
          headers: { Authorization: "Bearer " + pw },
        }
      );
      if (r.ok) {
        try {
          localStorage.setItem("tcf_admin_token", pw);
        } catch {
          /* noop */
        }
        setToken(pw);
        setPw("");
      } else {
        setErr("Mot de passe incorrect.");
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setTest(false);
    }
  };

  if (!token) {
    return (
      <main className="app" style={{ justifyContent: "center" }}>
        <header className="bandeau" style={{ position: "sticky", top: 0 }}>
          <div className="marque">
            <b>TCF Canada</b>
            <span>Admin · paramètres du correcteur LLM</span>
          </div>
          <nav className="onglets">
            <a className="onglet" href="/expression-ecrite">
              Retour à l'éditeur
            </a>
          </nav>
        </header>
        <section
          className="carte visible"
          style={{ maxWidth: 460, margin: "8vh auto 0" }}
        >
          <div className="entete-carte">
            <h2>Accès administrateur</h2>
          </div>
          <div className="bloc">
            <p style={{ margin: "0 0 14px", fontSize: 13.5 }}>
              Ce panneau permet de choisir le modèle LLM, la température et
              d'éditer les prompts utilisés par le correcteur (barème TCF +
              réécriture B2). Toute modification est immédiatement répercutée
              sur les prochaines corrections.
            </p>
            <label
              htmlFor="pw"
              style={{ display: "block", fontSize: 12, marginBottom: 6, color: "var(--color-encre-2)" }}
            >
              Mot de passe admin
            </label>
            <input
              id="pw"
              type="password"
              autoComplete="current-password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void valider();
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: 14,
                fontFamily: "var(--font-mono)",
                border: "1px solid var(--color-grille)",
                borderRadius: 10,
                background: "var(--color-fond)",
                color: "var(--color-encre)",
              }}
              placeholder="••••••••••••"
            />
            {err && (
              <p style={{ color: "#F2A0AF", fontSize: 12.5, margin: "10px 0 0" }}>
                {err}
              </p>
            )}
            <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
              <button
                className="bouton principal"
                onClick={() => void valider()}
                disabled={test || !pw}
              >
                {test ? "Vérification…" : "Accéder au studio"}
              </button>
              <a className="bouton" href="/expression-ecrite">
                Annuler
              </a>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
      {children}
      <input type="hidden" data-admin-token={token} />
    </>
  );
}
