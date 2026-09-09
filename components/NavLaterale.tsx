import type { ReactNode } from "react";
import Link from "next/link";

export type SectionNav =
  | "editeur"
  | "conjugaison"
  | "prompts"
  | "progression"
  | "progression_erreurs"
  | "historique"
  | "admin";

interface Props {
  actif?: SectionNav;
  /** Alternative : active le lien dont le href commence par cette chaîne */
  routeActive?: string;
}

const LIENS_EE: {
  id: SectionNav;
  label: ReactNode;
  href: string;
  match?: string;
  sous?: boolean;
}[] = [
  { id: "editeur", label: "Éditeur & correction", href: "/expression-ecrite" },
  {
    id: "conjugaison",
    label: "Conjugaisons",
    href: "/expression-ecrite?tab=conjugaison",
  },
  {
    id: "editeur",
    label: (
      <span style={{ paddingLeft: 22, display: "inline-block" }}>
        <span aria-hidden style={{ color: "var(--color-encre-3)", marginRight: 8 }}>
          └
        </span>
        📚 Base de connaissance
      </span>
    ),
    href: "/expression-ecrite?tab=connaissance",
    sous: true,
  },
  { id: "prompts", label: "Tous les sujets", href: "/expression-ecrite/prompts" },
  {
    id: "progression",
    label: (
      <>📊 Progression · Objectif NCLC 8</>
    ),
    href: "/progression",
    match: "/progression",
  },
  {
    id: "progression_erreurs",
    label: (
      <span style={{ paddingLeft: 22, display: "inline-block" }}>
        <span aria-hidden style={{ color: "var(--color-encre-3)", marginRight: 8 }}>
          └
        </span>
        🖋 Suivi des erreurs · 10×
      </span>
    ),
    href: "/progression/erreurs",
    sous: true,
    match: "/progression/erreurs",
  },
  {
    id: "historique",
    label: "Historique des copies",
    href: "/expression-ecrite/historique",
  },
  { id: "admin", label: "⚙ Admin", href: "/admin/parametres" },
];

const LIENS_EO: {
  id: SectionNav;
  label: ReactNode;
  href: string;
  match?: string;
  sous?: boolean;
}[] = [
  {
    id: "editeur",
    label: (
      <span style={{ paddingLeft: 22, display: "inline-block" }}>
        <span aria-hidden style={{ color: "var(--color-encre-3)", marginRight: 8 }}>
          └
        </span>
        📚 Base EO Fiches
      </span>
    ),
    href: "/expression-orale?tab=connaissance",
    sous: true,
  },
  {
    id: "prompts",
    label: (
      <span style={{ paddingLeft: 22, display: "inline-block" }}>
        <span aria-hidden style={{ color: "var(--color-encre-3)", marginRight: 8 }}>
          └
        </span>
        💬 Tous les sujets oraux
      </span>
    ),
    href: "/expression-orale?tab=sujets",
    sous: true,
  },
];

type Lien = (typeof LIENS_EE)[number];

function estActif(l: Lien, actif?: SectionNav, routeActive?: string): boolean {
  if (actif && actif === l.id) return true;
  if (routeActive && routeActive.length) {
    const m = l.match ?? l.href;
    if (routeActive === m) return true;
    if (l.sous && routeActive.startsWith(m)) return true;
  }
  return false;
}

function renduLien(l: Lien, actif?: SectionNav, routeActive?: string) {
  const ariaCurrent = estActif(l, actif, routeActive) ? "page" : undefined;
  const style = l.sous && ariaCurrent !== "page"
    ? { fontSize: 13, color: "var(--color-encre-2)" }
    : undefined;
  return (
    <Link
      key={l.href}
      href={l.href}
      aria-current={ariaCurrent}
      style={style}
    >
      {l.label}
    </Link>
  );
}

export default function NavLaterale({ actif, routeActive }: Props) {
  return (
    <aside className="nav-laterale">
      <div className="marque-laterale">
        <b>TCF Canada</b>
        <span>Expression écrite · NCLC 8</span>
      </div>
      <nav>
        {LIENS_EE.map((l) => renduLien(l, actif, routeActive))}
      </nav>
      <hr style={{ margin: "12px 4px", borderTop: "1px solid rgba(0,0,0,.08)" }} />
      <div className="marque-laterale">
        <b>🎙 Expression Orale</b>
        <span>· NCLC 8</span>
      </div>
      <nav>
        {LIENS_EO.map((l) => renduLien(l, actif, routeActive))}
      </nav>
    </aside>
  );
}
