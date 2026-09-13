"use client";

import { useEffect, useMemo, useState } from "react";
import NavLaterale from "@/components/NavLaterale";
import { markdownLite } from "@/lib/utils/markdownLite";
import Link from "next/link";

const ARTICLE_MARKDOWN = `# Tâche 1 — Expression orale du TCF Canada : réussir l'entretien dirigé sans stress

Vous vous demandez comment réussir la tâche 1 de l'expression orale du TCF Canada ? Cette première partie de l'oral est un **entretien dirigé** : l'examinateur vous pose des questions personnelles (présentation, travail ou études, ville, loisirs, projets) pendant environ **2 minutes**, sans temps de préparation. Beaucoup de candidats ont peur de bloquer ou de ne pas savoir quoi dire. Cette page vous donne le format exact, les types de questions qui tombent, une structure simple pour répondre avec spontanéité, et des phrases utiles prêtes à adapter. Objectif : comprendre ce qu'on attend de vous, éviter le stress et viser l'aisance et la fluidité pour un niveau **B2 / CLB 7 ou plus**.

> Ce n'est pas une page théorique sur le test ni une description complète de l'épreuve : c'est une page **méthode + rassurance**, avec des réponses structurées que vous pouvez réutiliser le jour J.

---

## Comprendre la Tâche 1 (contexte officiel)

La tâche 1 de l'expression orale TCF Canada dure **environ 2 minutes**. Elle se déroule **sans préparation** : l'examinateur pose des questions et vous répondez au fil de l'eau. Les sujets sont toujours des questions personnelles (qui vous êtes, ce que vous faites, où vous vivez, ce que vous aimez, vos projets). Pas de sujet au sort ni d'argumentation — c'est un échange simple pour évaluer votre capacité à vous exprimer de façon claire et spontanée.

### Que cherche réellement l'examinateur ?

L'examinateur évalue votre capacité à répondre **spontanément** à des questions ouvertes, avec clarté et cohérence. Il observe aussi votre **fluidité** (débit régulier, peu de blocages) et une correction grammaticale simple adaptée au niveau visé. Il ne cherche pas un discours préparé par cœur : il veut voir si vous savez vous présenter, parler de votre quotidien et de vos projets de façon naturelle. La **spontanéité est au centre** de l'évaluation pour cette tâche.

---

## Les types de questions posées

Les questions de l'entretien dirigé se regroupent en quelques thèmes. En voici des exemples par catégorie — pas une liste exhaustive, mais de quoi vous repérer.

| Catégorie | Exemples de questions |
|---|---|
| **Identité et parcours** | Comment vous appelez-vous ? D'où venez-vous ? Depuis combien de temps apprenez-vous le français ? Quel est votre parcours jusqu'à aujourd'hui ? |
| **Travail ou études** | Que faites-vous dans la vie ? Vous travaillez ou vous étudiez ? Quel est votre métier / votre formation ? Pourquoi avez-vous choisi ce domaine ? |
| **Ville / pays** | Où habitez-vous ? Vous aimez votre ville ? Qu'est-ce qui vous plaît dans votre pays ? |
| **Loisirs** | Quels sont vos loisirs ? Qu'aimez-vous faire pendant votre temps libre ? Vous pratiquez un sport ? Vous aimez voyager ? |
| **Projets** | Quels sont vos projets pour les mois à venir ? Pourquoi souhaitez-vous aller au Canada ? |

---

## 🧭 Méthode simple pour structurer chaque réponse

C'est le cœur de votre préparation : une méthode en **quatre temps**. Pour chaque question, commencez par bien comprendre ce que l'examinateur vous demande, gardez en tête une structure simple, appuyez-vous sur quelques phrases prêtes à adapter, puis entraînez-vous à répondre à l'oral dans un temps limité.

### 1️⃣ Comprendre la consigne et le type de questions

Rappelez-vous que la tâche 1 est un entretien dirigé de 2 minutes, sans préparation, avec des questions personnelles sur votre identité, votre travail ou vos études, votre ville, vos loisirs et vos projets. Il ne s'agit pas d'argumenter, mais de parler de vous de façon simple et claire.

### 2️⃣ Préparer une structure de réponse simple

Gardez mentalement la formule :

> **Réponse efficace = 1) réponse directe + 2) développement + 3) exemple ou justification**

Cette structure vous aide à construire **2–3 phrases** sans bloquer.

#### Exemple concret. Question : « Quels sont vos loisirs ? »

- **Réponse directe** : « J'aime beaucoup la lecture et la randonnée. »
- **Développement** : « Je lis surtout des romans le soir, et le week-end je sors marcher en nature. »
- **Exemple ou justification** : « Ça me permet de me détendre et de garder l'équilibre avec mon travail. »

### 3️⃣ Utiliser des phrases et tournures prêtes à adapter

Préparez quelques débuts de phrases pour vous présenter, parler de votre travail, de votre ville, de vos loisirs et de vos projets. Vous les adapterez selon la question, au lieu d'inventer chaque formulation sur le moment. Voir la section « Phrases utiles » ci-dessous.

### 4️⃣ S'entraîner à l'oral et gérer le stress

Entraînez-vous en vous enregistrant, en répondant à des séries de questions en 2 minutes et en pratiquant des phrases pour demander une reformulation si besoin (« Pourriez-vous répéter, s'il vous plaît ? »). Plus vous aurez simulé cette situation, plus il sera facile de rester calme et fluide le jour J.

---

## ✨ Phrases utiles et structures prêtes à adapter

Voici des tournures par thème. Ce n'est pas un script figé : choisissez celles qui vous correspondent et adaptez le contenu à votre situation (ou à une situation crédible que vous inventez).

### Se présenter
> « Je m'appelle… / Je viens de… / J'habite à… depuis… »
> « J'apprends le français depuis… / J'étudie le français parce que… »

### Parler de son travail
> « Je travaille comme… / Je suis en poste dans… / Mon métier consiste à… »
> « J'aime ce que je fais parce que… »

### Parler de sa ville
> « J'habite à… C'est une ville… (calme / dynamique). »
> « Ce qui me plaît, c'est… / Il y a beaucoup de… »

### Exprimer ses goûts
> « J'aime beaucoup… / Je suis passionné(e) de… »
> « Pendant mon temps libre, je… / Ça me permet de… »

### Parler de projets
> « Mon projet à court terme, c'est… / J'aimerais… »
> « Je souhaite aller au Canada pour… / Parce que… »

---

## 🎯 Comment viser CLB 7 ou plus

En tâche 1, la différence entre les niveaux se fait surtout par la **longueur et la qualité des réponses**.

- **CLB 5** : des phrases simples et correctes suffisent.
- **CLB 7** : ajoutez des **connecteurs simples** (« parce que », « donc », « en plus ») et un petit **développement (2–3 phrases)** avec un **exemple**.
- **CLB 9** : on attend une **précision lexicale plus marquée** et une **fluidité constante**.

La méthode « réponse directe + développement + exemple » vous place déjà dans la bonne dynamique pour viser CLB 7. Pour la suite de l'oral, préparez la **tâche 3 (débat)** pour l'argumentation structurée.

---

## ❌ Erreurs fréquentes à éviter

1. **Réponses trop courtes** : répondre par « oui » ou « non » sans développer ne montre pas votre niveau. Toujours ajouter au moins une ou deux phrases.
2. **Parler trop vite** : le stress peut accélérer le débit. Prenez une inspiration et gardez un rythme régulier.
3. **S'éloigner du sujet** : restez sur la question posée ; si vous partez trop loin, l'examinateur peut vous recadrer.
4. **Utiliser un registre trop familier** : évitez le langage SMS ou les expressions trop colloquiales. Un registre neutre ou semi-formel est adapté.

---

## 💪 S'entraîner efficacement

Pour gagner en aisance et en spontanéité :

- 🎧 **Auto-enregistrement** (répondez à une liste de questions types et réécoutez-vous)
- ⏱️ **Simulation chronométrée** (2 minutes avec un partenaire ou en solo)
- 📋 **Une liste de thèmes** (identité, travail, ville, loisirs, projets) à travailler un par un

Plus vous vous entraînez, moins le stress prend le dessus le jour J. Bon courage ! 💪
`;

const PAGE_STYLE: React.CSSProperties = {
  minHeight: "100vh",
  background: "#FDF8F3",
  fontFamily: "var(--font-sans)",
  color: "#1F2937",
  padding: "32px 24px 80px",
};

const ARTICLE_STYLE: React.CSSProperties = {
  maxWidth: 860,
  margin: "24px auto 0 280px",
  background: "linear-gradient(180deg, #FFFEFA 0%, #FDF6E8 100%)",
  borderRadius: 18,
  padding: "56px 64px 64px",
  border: "1px solid rgba(168, 60, 20, 0.12)",
  boxShadow: "0 20px 50px -24px rgba(168, 60, 20, 0.18)",
  fontSize: 16.5,
  lineHeight: 1.7,
  color: "#2F1F14",
};

const BADGE_HERO: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 14px",
  borderRadius: 999,
  background: "rgba(168, 60, 20, 0.12)",
  color: "#A83C14",
  fontWeight: 700,
  fontSize: 13,
  letterSpacing: 0.2,
  border: "1px solid rgba(168, 60, 20, 0.22)",
  marginBottom: 18,
};

const HERO_H1: React.CSSProperties = {
  fontSize: 40,
  lineHeight: 1.15,
  margin: "0 0 14px",
  color: "#A83C14",
  fontWeight: 800,
  letterSpacing: -0.4,
  fontFamily: "var(--font-serif)",
};

const HERO_SUBTITLE: React.CSSProperties = {
  fontSize: 18,
  lineHeight: 1.55,
  color: "#6B5140",
  margin: 0,
  fontWeight: 500,
};

const CTA_WRAP: React.CSSProperties = {
  marginTop: 48,
  padding: "28px 28px",
  borderRadius: 16,
  background: "linear-gradient(135deg, rgba(37, 111, 81, 0.1) 0%, rgba(37, 111, 81, 0.04) 100%)",
  border: "1px solid rgba(37, 111, 81, 0.25)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
};

const CTA_BTN: React.CSSProperties = {
  display: "inline-block",
  padding: "14px 26px",
  borderRadius: 12,
  background: "#256F51",
  color: "#FDF8F3",
  fontWeight: 800,
  fontSize: 15.5,
  textDecoration: "none",
  border: "1px solid rgba(0,0,0,0.22)",
  cursor: "pointer",
  boxShadow: "0 8px 22px -10px rgba(37, 111, 81, 0.6)",
};

const INJECTED_STYLES = `
.ressource-eo-article h2 {
  font-size: 26px;
  font-weight: 800;
  color: #A83C14;
  margin: 42px 0 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(168, 60, 20, 0.18);
  letter-spacing: -0.2;
  font-family: var(--font-serif);
}
.ressource-eo-article h3 {
  font-size: 20px;
  font-weight: 700;
  color: #7A2E0F;
  margin: 28px 0 10px;
  letter-spacing: -0.1;
  font-family: var(--font-serif);
}
.ressource-eo-article h4 {
  font-size: 17px;
  font-weight: 700;
  color: #5F2508;
  margin: 20px 0 8px;
  font-family: var(--font-serif);
}
.ressource-eo-article p {
  margin: 10px 0;
  font-size: 16.5;
  line-height: 1.7;
}
.ressource-eo-article ul {
  margin: 10px 0 10px 22px;
  padding: 0;
}
.ressource-eo-article ul li {
  margin: 6px 0;
  line-height: 1.65;
}
.ressource-eo-article ol {
  margin: 10px 0 10px 22px;
  padding: 0;
}
.ressource-eo-article ol li {
  margin: 8px 0;
  line-height: 1.65;
}
.ressource-eo-article blockquote {
  margin: 16px 0;
  padding: 14px 18px;
  border-left: 4px solid #F59E0B;
  background: "rgba(245, 158, 11, 0.08)";
  background-color: rgba(245, 158, 11, 0.08);
  border-radius: 0 10px 10px 0;
  color: "#5C3D0A";
  color: rgb(92, 61, 10);
  font-style: italic;
  font-size: 15.5;
}
.ressource-eo-article blockquote + blockquote {
  margin-top: -8px;
}
.ressource-eo-article hr {
  border: none;
  border-top: 1px dashed rgba(168, 60, 20, 0.28);
  margin: 36px 0;
}
.ressource-eo-article table {
  width: 100%;
  border-collapse: collapse;
  margin: 18px 0 22px;
  font-size: 15;
  background: #FFFEF7;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px -4px rgba(168, 60, 20, 0.12);
}
.ressource-eo-article th, .ressource-eo-article td {
  border: 1px solid rgba(168, 60, 20, 0.18);
  padding: 12px 14px;
  text-align: left;
  vertical-align: top;
  line-height: 1.55;
}
.ressource-eo-article th {
  background: rgba(168, 60, 20, 0.10);
  color: #7A2E0F;
  font-weight: 800;
  font-size: 14;
}
.ressource-eo-article strong {
  color: #7A2E0F;
  font-weight: 800;
}
.ressource-eo-article code {
  background: rgba(168, 60, 20, 0.08);
  padding: 1px 6px;
  border-radius: 5px;
  font-size: 14;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.ressource-eo-article a {
  color: #28569E;
  text-decoration: underline;
  text-underline-offset: 3px;
}
`;

export default function PageRessourceT1EO() {
  const html = useMemo(() => markdownLite(ARTICLE_MARKDOWN), []);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div style={PAGE_STYLE}>
      <NavLaterale routeActive={"/ressources"} />
      <div style={ARTICLE_STYLE} className={"ressource-eo-article"}>
        <span style={BADGE_HERO}>🎙 Ressource · Expression Orale · Tâche 1</span>
        <h1 style={HERO_H1}>
          Tâche 1 — Expression orale TCF Canada : réussir l'entretien dirigé sans stress
        </h1>
        <p style={HERO_SUBTITLE}>
          Méthode 4 temps · 5 catégories de questions · Phrases prêtes à adapter · Cible B2 / CLB 7 · Entraînement efficace.
        </p>

        <div style={{ margin: "36px 0 0" }} suppressHydrationWarning={!mounted} dangerouslySetInnerHTML={{ __html: html }} />

        <div style={CTA_WRAP}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: "#256F51", marginBottom: 4 }}>
              Prêt·e à vous entraîner ?
            </div>
            <div style={{ fontSize: 14.5, color: "#4C5A6E" }}>
              Ouvrez le catalogue des sujets T1 et lancez un drill texte ou voix. 0 crédit pour le drill texte · 1 crédit pour le drill voix.
            </div>
          </div>
          <Link href="/expression-orale?task=1" style={CTA_BTN}>
            Commencer Tâche 1 →
          </Link>
        </div>
      </div>
      <style>{INJECTED_STYLES}</style>
    </div>
  );
}
