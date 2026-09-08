# TCF Canada — Atelier de la copie (B2 · CLB 8)

> Application Next.js 15 + Supabase + OpenRouter pour préparer l'épreuve d'**Expression Écrite** du TCF Canada (cible B2 / NCLC CLB 8).
> 5 couches de défense pour une présentation des résultats **indépendante du modèle LLM** : règles prompts fermées, schéma JSON provider, normalisation serveur FR→EN, purge clés non-canoniques, remplissage 3 exemples B1/B2/C1.

* * *

## Table des matières

1.  [Stack technique](#stack-technique)
2.  [Prérequis](#prérequis)
    -   [macOS / Linux](#macos--linux)
    -   [Windows 10/11](#windows-1011)
3.  [Installation — 3 OS](#installation--3-os)
    -   [0. Cloner le dépôt](#0-cloner-le-dépôt)
    -   [1. macOS (Homebrew)](#1-macos-homebrew)
    -   [2. Linux (Debian / Ubuntu)](#2-linux-debian--ubuntu)
    -   [3. Windows (PowerShell + Winget)](#3-windows-powershell--winget)
4.  [Configuration](#configuration)
    -   [4. Variables d'environnement `.env.local`](#4-variables-denvironnement-envlocal)
    -   [5. Créer un projet Supabase + appliquer les migrations](#5-créer-un-projet-supabase--appliquer-les-migrations)
    -   [6. Clé API OpenRouter](#6-clé-api-openrouter)
5.  [Démarrer l'application](#démarrer-lapplication)
    -   [Développement](#développement)
    -   [Type-check strict](#type-check-strict)
    -   [Build & Production](#build--production)
6.  [Cibles TCF — Barème & CECRL](#cibles-tcf--barème--cecrl)
7.  [Architecture · 5 couches anti-dérive LLM](#architecture--5-couches-anti-dérive-llm)
8.  [Administration · Enregistrer le prompt dans Supabase](#administration--enregistrer-le-prompt-dans-supabase)
9.  [Dépannage · 3 OS](#dépannage--3-os)
10. [Dossier `.github_deploy_keys/` — sécurité](#dossier-github_deploy_keys--sécurité)
11. [Licence](#licence)

* * *

## Stack technique

| Couche | Version |
|---|---|
| **Next.js** | `15.0.3` (App Router) |
| **React** | `19.0.0-rc-66855b96-20241106` |
| **TypeScript** | `^5.6.3` (strict) |
| **Tailwind CSS** | `v4.0.0-beta.3` avec `@tailwindcss/postcss` |
| **Supabase SSR** | `@supabase/ssr 0.5` + `@supabase/supabase-js 2.45` |
| **Migrations SQL** | `001 → 005` dans [supabase/migrations/](supabase/migrations/) |
| **OpenRouter** | endpoint `https://openrouter.ai/api/v1/chat/completions` (multi-modèles, dont `minimax-m3:free` · `anthropic/claude-sonnet`) |
| **Node** | Recommandé `v20.10+` · validé sur `v24.11.1` |
| **NPM** | Recommandé `10+` · validé sur `11.6.2` |

* * *

## Prérequis

### macOS / Linux

-   **Node.js ≥ 20.10 LTS** ou ≥ 22
-   **npm ≥ 10** (géré par Node)
-   **Git ≥ 2.40**
-   Compte **Supabase** (gratuit) + projet vierge
-   Compte **[OpenRouter](https://openrouter.ai/)** + crédits (ou modèle `:free`)

### Windows 10/11

Toutes les étapes sont faites **en PowerShell 7+ (Administrateur recommandé)**. WSL2 fonctionne aussi (voir Linux).

-   **[Git for Windows](https://git-scm.com/download/win)** ≥ 2.45
-   **Node.js ≥ 20.10 LTS** : installateur [nodejs.org](https://nodejs.org/en/download/package-manager) → choisir **x64 .msi**
-   **PowerShell 7+** (optionnel mais recommandé) : `winget install Microsoft.PowerShell`
-   Compte **Supabase** + **OpenRouter** identiques à macOS/Linux

* * *

## Installation — 3 OS

### 0. Cloner le dépôt

```bash
# Tous OS — SSH (recommandé, deploy key)
git clone git@github.com:hustlerbix-prog/kev_tcf.git tfc-app
cd tfc-app

# Alternative : HTTPS (nécessite Personal Access Token pour push)
# git clone https://github.com/hustlerbix-prog/kev_tcf.git tfc-app
```

> ⚠️ Sous **Windows Git Bash** : chemin avec espaces OK, mais préférez `C:\Dev\tfc-app` pour éviter des surprises avec `core.sshCommand`.

---

### 1. macOS (Homebrew)

```bash
# 1a. Homebrew si absent
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 1b. Node + git
brew install node git

# 1c. Vérifier versions
node --version   # → v20.10+ ou v22+
npm --version    # → 10+
git --version    # → 2.40+

# 1d. Installer les dépendances projet
cd tfc-app
npm install
```

---

### 2. Linux (Debian / Ubuntu)

```bash
# 2a. Paquets système
sudo apt-get update
sudo apt-get install -y build-essential git curl ca-certificates gnupg lsb-release

# 2b. NodeSource — Node 22 LTS (ou 20)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2c. Vérifier
node --version
npm --version
git --version

# 2d. Dépendances projet
cd tfc-app
npm install
```

> Fedora / RHEL : remplacer `apt` par `dnf` + `curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -`.

---

### 3. Windows (PowerShell + Winget)

**Ouvrez PowerShell en tant qu'Administrateur** (clic droit sur Démarrer → *Terminal (Admin)*).

```powershell
# 3a. Installer Git + Node.js LTS avec WinGet
winget install --id Git.Git             -e --accept-source-agreements --accept-package-agreements
winget install --id OpenJS.NodeJS.LTS   -e --accept-source-agreements --accept-package-agreements

# 3b. RE-OUVREZ PowerShell (les PATHs sont rechargés)
#     Puis vérifier :
node --version
npm --version
git --version

# 3c. Dépendances projet
cd tfc-app
npm install
```

> 💡 Si `winget` n'existe pas : installez **App Installer** depuis le Microsoft Store, puis réessayez. Alternative : téléchargez `node-v22-x64.msi` directement depuis [nodejs.org](https://nodejs.org/en/download).

* * *

## Configuration

### 4. Variables d'environnement `.env.local`

Copiez le modèle **en une commande** :

#### macOS / Linux
```bash
cd tfc-app
cp -n .env.local.example .env.local 2>/dev/null || true
# (Si vous n'avez pas le .example, le créez comme ci-dessous)
```

#### Windows PowerShell
```powershell
cd tfc-app
if (-not (Test-Path .env.local)) { New-Item .env.local -ItemType File | Out-Null }
```

Puis **éditez** [`.env.local`](.env.local) avec vos valeurs réelles :

```dotenv
# =================  SUPABASE  =================
# → Trouvable sur https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...XXXX...    # clé anon publique (project API keys → anon public)
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...YYYY...         # clé service_role (NE JAMAIS l'exposer côté navigateur !)

# =================  OPENROUTER  =================
# → https://openrouter.ai/keys  → Create Key
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx...

# Référent HTTP + titre requis par OpenRouter ToS
NEXT_PUBLIC_OPENROUTER_REFERRER=http://localhost:3000

# =================  ADMIN  =================
# Mot de passe unique pour accéder à /admin/parametres
# (pas de hash bcrypt nécessaire : single-user local)
ADMIN_PASSWORD=Choisissez_Un_Mot_De_Passe_SOLIDE_123!
```

> 🔐 **Règle d'or** : `SUPABASE_SERVICE_ROLE_KEY` et `OPENROUTER_API_KEY` n'existent **que dans `.env.local`**. Elles sont utilisées uniquement dans les Server Actions / `app/api/*`. `admin_settings.value` en base **n'accepte JAMAIS** de clés secrètes ; la table n'est que pour prompt JSONB + préférences UI.

---

### 5. Créer un projet Supabase + appliquer les migrations

#### Étape 5.1 — Créer le projet Supabase

1.  Ouvrez [https://supabase.com/dashboard/new](https://supabase.com/dashboard/new).
2.  Name → `TCF-Canada`. Region → proche de vous. Database Password → Générer & **CONSERVER** (nécessaire pour le CLI).
3.  Patientez 2 minutes.
4.  Aller dans **Project Settings → API** : copiez `Project URL` + `anon public` + `service_role` → collez-les dans `.env.local` (étape 4).

#### Étape 5.2 — Appliquer les 5 migrations SQL

Aller dans **SQL Editor → New Query** et exécutez les fichiers **dans l'ordre 001 → 005** :

-   [001_initial_schema.sql](supabase/migrations/001_initial_schema.sql) — tables `competences`, `admin_settings`, `essais_expression_ecrite`, `stats_conjugaison` + **RLS policies** (anon peut lire, seul `service_role` écrit `admin_settings`)
-   [002_seed_data.sql](supabase/migrations/002_seed_data.sql) — 4 compétences (EE/EO/CE/CO) + prompt default JSONB + 8 erreurs FestiVox seed
-   [003_exercices.sql](supabase/migrations/003_exercices.sql) — `exercices_expression_ecrite` + pool de sujets Tâche 1/2/3
-   [004_progression_tracking.sql](supabase/migrations/004_progression_tracking.sql) — colonnes `score_100`, `score_breakdown`, `progression_notes`, lien essai ↔ exercice
-   [005_suivi_erreurs.sql](supabase/migrations/005_suivi_erreurs.sql) — `erreurs_suivi` + SRS 1·3·7·14·30·60·90 jours

> 🛠 Alternative en CLI Supabase : `supabase db push` (après `supabase login` + `supabase link --project-id xvdqxssxziixlhvxgfrk`).

---

### 6. Clé API OpenRouter

1.  Connectez-vous sur [openrouter.ai](https://openrouter.ai/).
2.  **[OpenRouter · Keys](https://openrouter.ai/keys)** → **Create Key** → nom : `TCF Canada Local`.
3.  Ajoutez **au moins ~5 $** de crédits (ou commencez par le modèle `minimax-m3:free` sans paiement).
4.  Copiez la clé dans `.env.local` → `OPENROUTER_API_KEY`.
5.  **C'est IMPORTANT** : Top up de crédits est requis pour les prompts schéma JSON fermés qui utilisent `max_tokens: 2200` (résout la plupart des HTTP 502).

* * *

## Démarrer l'application

### Développement

```bash
# macOS / Linux / Windows PowerShell
npm run dev
```

Ouvrez [**http://localhost:3000/expression-ecrite**](http://localhost:3000/expression-ecrite).

Le layout utilise un arrière-plan **bureau-beige** (pour contraste WCAG AA) pour l'éditeur, et un thème **marine-foncé `#0E141B`** avec card verte/amber pour le résultat correction, conformément à la maquette de référence.

---

### Type-check strict

```bash
npm run typecheck
```

→ 0 erreur requise avant commit. La CI peut être greffée sur GitHub Actions (`npx tsc --noEmit`).

---

### Build & Production

```bash
# 1. Build SSR
npm run build
#   → Sortie attendue : 10 routes ○ static + 12 routes ƒ server "all green"

# 2. Démarrer en mode production (port 3000)
npm start
```

Sur un VPS (Ubuntu 24.04 recommandé) : encadrez le process par **PM2** + **Nginx reverse proxy** + certificat Let's Encrypt. Exemple :

```bash
sudo npm i -g pm2
pm2 start npm --name tcf -- start
pm2 save
pm2 startup systemd
```

* * *

## Cibles TCF — Barème & CECRL

Barème officiel **/20** utilisé dans le moteur de correction. Mappage **dur** (les LLM sont forcés, l'étiquette brute est ignorée en 6 endroits) :

| note/20 | **CECRL** (forcé, jamais de `+`) | **NCLC / CLB** | Interprétation badge Objectif |
|---|---|---|---|
| 0 – 3 | A1 | 1 – 3 | NCLC 1-3 |
| 4 – 6 | A2 | 4 | NCLC 4 en vue |
| 7 – 9 | B1 | 5 – 6 | NCLC 6 tenu, 7 en vue |
| **10 – 12** | **B2** | **7** | **NCLC 7 tenu, 8 en vue** ← cible étape |
| 13 – 15 | C1 | 8 – 9 | **NCLC 8 ✅** cible atteinte |
| 16 – 20 | C2 | 10 – 12 | NCLC 10+ · Excellent |

5 critères pondérés 4/20 chacun : `Grammaire & Syntaxe` · `Vocabulaire` · `Cohérence` · `Réalisation de la tâche` · `Registre / Style`.

---

## Architecture · 5 couches anti-dérive LLM

La correction est **indépendante du modèle LLM** (petits modèles comme `minimax-m3:free` peuvent être utilisés sans panneau blanc) :

| # | Couche | Où |
|---|---|---|
| 1 | **Prompt rules A15–A20** — schéma fermé 24 clés, blacklist FR interdites, non-null obligatoires, 11→B2 jamais `+` | [lib/llm/prompts.ts](lib/llm/prompts.ts) + synchro [app/admin/parametres/page.tsx](app/admin/parametres/page.tsx) |
| 2 | **OpenRouter `response_format: json_schema`** + retry silencieux si 400/422 (modèles qui ne supportent pas) | [lib/llm/openrouter.ts](lib/llm/openrouter.ts) |
| 3 | **D2** — mapping FR→EN + accents (`axes_amélioration` é/à) · **D3** — purge 19 clés canoniques · **D4** — padding 3 exemples distincts B1/B2/C1 | [app/api/corriger/route.ts](app/api/corriger/route.ts) |
| 4 | **G — Écrasement CECRL dur** : `o.cecrl = CECRL(round(note20))` en 6 localisations | Serveur + Client `normaliserClient` + essai viewer `essaiToResultat` + badges React |
| 5 | **Rendu placeholder** — toutes les sections s'affichent ; données manquantes → badge bord pointillé, Score Breakdown fond rayé 45° + bannière amber | [components/expression-ecrite/ResultatCorrection.tsx](components/expression-ecrite/ResultatCorrection.tsx) |

* * *

## Administration · Enregistrer le prompt dans Supabase

⚠ **ACTION OBLIGATOIRE APRÈS INSTALLATION**. La ligne `admin_settings.prompts_main` en base **prime sur le code local** ([route.ts](app/api/corriger/route.ts) charge `prompts_main` JSONB avant `lib/llm/prompts.ts`).

1.  Aller sur [http://localhost:3000/admin/parametres](http://localhost:3000/admin/parametres).
2.  Saisir `ADMIN_PASSWORD`. La session est conservée dans `localStorage.tcf_admin_token`.
3.  Vérifier le textarea *Prompt principal · Correction Expression Écrite* : les règles A15-A20 + `❌ Clés françaises interdites` + triple backtick échappé doivent être présentes.
4.  Cliquer **Enregistrer** (écrit en base).

Sans ce clic, un éventuel ancien prompt (pré-A15, sans schéma fermé) est renvoyé par la base et les protections 1/5 sont neutralisées.

* * *

## Dépannage · 3 OS

| Symptôme | Cause probable | Solution |
|---|---|---|
| **`npm install` — `node-gyp` ERR** sous Windows | Outils build C++ absents. | PowerShell Admin : `npm i -g windows-build-tools` *ou* installez **Desktop development with C++** depuis Visual Studio Installer. |
| **Port 3000 occupé** (`EADDRINUSE`) | Autre app écoute. | **macOS/Linux :** `lsof -ti:3000 \| xargs kill -9`. **Windows :** `netstat -ano \| findstr :3000` → `taskkill /F /PID <id>`. |
| **`POST /api/corriger` HTTP 502 Quota Exceeded** | OpenRouter crédits épuisés. | Top up OpenRouter > ~5 $. Ou changez temporairement le modèle en `minimax-m3:free` via `/admin/parametres`. |
| **`Permission denied (publickey)`** au `git push` | Deploy key absente de GitHub ou `Allow write access` non coché. | Ré-appliquez les étapes de deploy key fournies avec la génération. Vérifiez que le fichier `.github_deploy_keys/kev_tcf_deploy_ed25519` existe et mode `600`. |
| **TypeScript TS2345 dans `normaliserClient`** | Ancienne version Node < 20, TS 5.6 moins strict. | Mettez à jour Node (`nvm use 22`) + ré-exécutez `npm install`. |
| **Dashboard Score Breakdown vide** (`ℹ️ Aucune donnée…`) | Petit LLM n'a pas renvoyé `score_breakdown`. | C'est **normal** : placeholder rayé + bannière amber s'affichent. Changez de modèle vers `anthropic/claude-sonnet` ou `google/gemini-2.0-flash-exp:free` pour remplir les 5 barres. |
| **Carte correction reste beige / pas sombre** | Browser cache CSS. | Hard refresh : `⌘+Shift+R` (macOS) / `Ctrl+F5` (Win/Linux). |
| **Windows : `npm run dev` — chemin avec espaces** (ex: `C:\Users\John Doe\…`) | Ancien Next.js 15 beta path bug. | Déplacez le dépôt dans `C:\Dev\tfc-app` (sans espace). |
| **Supabase `new row violates row-level security policy` sur `admin_settings`** | Rôle `anon` essaye d'écrire. Seul `service_role` le peut. | Vérifiez `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local` est renseignée ET que vous passez bien par `/api/admin/*` Server Action. |
| **B1+ apparait encore sur un badge** (alors 11/20 → B2) | Une des 6 localisations n'a pas écrasé. | Exécutez `npm run typecheck` → 0 erreur. Videz le cache Supabase : `essais_expression_ecrite` → videz les lignes tests. |

* * *

## Dossier `.github_deploy_keys/` — sécurité

> Présent localement uniquement. **La ligne `/.github_deploy_keys/` est dans [.gitignore:L8](.gitignore#L8-L8)** et a été auditée indépendamment (0 entrées dans le cache git avant chaque push). **Rien de ce dossier n'existe sur GitHub**.

-   `kev_tcf_deploy_ed25519` — clé privée Ed25519 `chmod 600`. Seulement utilisée par le git-local `core.sshCommand` de ce repo.
-   `kev_tcf_deploy_ed25519.pub` — clé publique à copier dans GitHub → Settings → Deploy Keys → ✅ Allow write access.

Si vous déplacez/renommez le dossier, réinitialisez `core.sshCommand` pour pointer sur le **nouveau chemin absolu** :

```bash
cd tfc-app
git config core.sshCommand "ssh -i \"$PWD/.github_deploy_keys/kev_tcf_deploy_ed25519\" -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
```

* * *

## Licence

Code source et prompt : usage privé pour préparation au TCF Canada. Les migrations SQL [supabase/migrations/](supabase/migrations/) ainsi que les composants de correction [components/expression-ecrite/](components/expression-ecrite/) sont modifiables librement.
