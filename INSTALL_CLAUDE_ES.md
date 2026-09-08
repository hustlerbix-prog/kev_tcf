# Guía de instalación · Español — **Usando Claude (Anthropic) como LLM por defecto**

> Repositorio `hustlerbix-prog/kev_tcf` · TCF Canadá · B2 / NCLC 8 · Next.js 15 + Supabase + **OpenRouter → Claude**
>
> Versión **2026-09-08**. Tiempo estimado de instalación: 20-25 minutos.

* * *

## Índice

1.  [Resumen rápido (2 min) · ¿qué instala esta guía?](#1-resumen-rápido-2-min--qué-instala-esta-guía)
2.  [Paso 0 — Prerrequisitos · según tu S.O.](#2-paso-0--prerrequisitos--según-tu-so)
    -   macOS
    -   Linux (Debian / Ubuntu)
    -   Windows 10 / 11
3.  [Paso 1 — Clonar el repo e instalar dependencias](#3-paso-1--clonar-el-repo-e-instalar-dependencias)
4.  [Paso 2 — Crear el proyecto Supabase (gratis) + aplicar 5 migraciones SQL](#4-paso-2--crear-el-proyecto-supabase-gratis--aplicar-5-migraciones-sql)
5.  [Paso 3 — Obtener 3 claves y rellenar `.env.local`](#5-paso-3--obtener-3-claves-y-rellenar-envlocal)
    -   3.1 Claves Supabase (URL · anon · service_role)
    -   3.2 Clave OpenRouter (permite usar **Claude**)
    -   3.3 Copiar plantilla `.env.local`
6.  [Paso 4 — **Configurar Claude** como modelo por defecto](#6-paso-4--configurar-claude-como-modelo-por-defecto)
    -   4.1 Rellenar saldo en OpenRouter (muy importante)
    -   4.2 Arrancar la app
    -   4.3 Iniciar sesión en `/admin/parametres`
    -   4.4 Seleccionar `anthropic/claude-sonnet` en el selector
    -   4.5 **PASO OBLIGATORIO**: click en **Guardar prompt principal** (graba en Supabase `admin_settings`)
7.  [Paso 5 — Verificación: corrección con Claude + dashboard 5 barras](#7-paso-5--verificación-corrección-con-claude--dashboard-5-barras)
    -   5.1 Ir a Expression Écrite → Tâche 1
    -   5.2 Pegar texto de ejemplo 120 palabras
    -   5.3 Resultado esperado después de ~10 segundos
8.  [Paso 6 — Build & producción (opcional, VPS)](#8-paso-6--build--producción-opcional-vps)
9.  [Tabla de modelos Claude recomendados](#9-tabla-de-modelos-claude-recomendados)
10. [Resolución de problemas · 12 errores comunes](#10-resolución-de-problemas--12-errores-comunes)
11. [Security notice (ES) — `.github_deploy_keys/` nunca se sube](#11-security-notice-es--github_deploy_keys-nunca-se-sube)

* * *

## 1. Resumen rápido (2 min) · ¿qué instala esta guía?

```
🖥️        App Next.js 15 :3000 (tu portátil / VPS)
├─ 🗄️ Supabase — tablas: competencias / admin_settings / essais_expression_ecrite
│                                    / progression_notes / erreurs_suivi (SRS 1-3-7-14-30-60-90)
│                                    + 8 errores FestiVox pre-cargados
│                                    + prompt A15-A20 con blacklist FR 24 claves JSON
├─ 🧠 OpenRouter (API KEY 1 sola) → 🔥 ANTHROPIC / CLAUDE-SONNET 🔥
│      (recomendado)    o claude-haiku-3.5  (más barato, 0.06 $/1M tokens)
│                        o claude-opus-4    (más preciso, caro, ~15 $/1M)
│      ▶ NO usamos la API de Anthropic directamente; todo por OpenRouter
│        (permite switch 1 clic a otros modelos sin tocar código)
└─ 🎨 UI — paleta bureau-foncé #0E141B + card verde CorrectedVersion/Strengths
          + card ámbar AreasForImprovement + 5 KPI header + ScoreBreakdown 5 barras
```

Esta guía **selecciona Claude como modelo por defecto y fuerza que el prompt cerrado A15-A20 se guarde en Supabase** (obligatorio para que `admin_settings.prompts_main` en DB no use el código antiguo pre-A15).

* * *

## 2. Paso 0 — Prerrequisitos · según tu S.O.

### macOS (Homebrew)

```bash
# Abre Terminal
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"  # si no tienes brew
brew install node git
node --version   # ← mínimo 20.10. Recomendado 22 LTS / 24
npm --version    # ← mínimo 10
git --version    # ← mínimo 2.40
```

### Linux (Debian / Ubuntu 22.04+)

```bash
sudo apt-get update && sudo apt-get install -y build-essential git curl ca-certificates gnupg lsb-release
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version && npm --version && git --version
```

### Windows 10 / 11

1.  **Abre PowerShell como Administrador** (Derecha en menú Inicio → Terminal Admin).
2.  Ejecuta:

```powershell
winget install --id Git.Git           -e --accept-source-agreements --accept-package-agreements
winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
```

3.  **Cierra PowerShell y vuelve a abrirlo** (recarga PATHs).
4.  Comprueba:

```powershell
node --version
npm --version
git --version
```

> ❗ Si `winget` no existe: instala **App Installer** desde la Microsoft Store y vuelve a intentarlo. Alternativa: descarga `node-v22-x64.msi` desde [nodejs.org](https://nodejs.org/en/download).

* * *

## 3. Paso 1 — Clonar el repo e instalar dependencias

**TODOS LOS SISTEMAS OPERATIVOS** · Terminal / PowerShell:

```bash
# --- 1a. Clonar repo ------------------------------------------------------------
git clone git@github.com:hustlerbix-prog/kev_tcf.git tcf-app
cd tfc-app

# HTTPS alternativa (necesitas GitHub Personal Access Token para hacer push):
# git clone https://github.com/hustlerbix-prog/kev_tcf.git tfc-app
# cd tcf-app

# --- 1b. Instalar 8 paquetes del package.json -----------------------------------
npm install
#   → Next.js 15 · React 19 RC · Tailwind v4-beta · Supabase SSR · OpenRouter
```

⏳ Tarda ~2 min (descarga ~80 MB).

* * *

## 4. Paso 2 — Crear el proyecto Supabase (gratis) + aplicar 5 migraciones SQL

> Supabase aloja la base de datos PostgreSQL, RLS policies (anon vs service_role) y el prompt JSONB guardado en `admin_settings`. El plan **Free** alcanza de sobra para un single-user.

### 2a. Crear proyecto en <https://supabase.com/dashboard/new>

1.  **Name:** `TCF-Canada-Claude`
2.  **Region:** escoge la más cercana (UE: Frankfurt · US: North Virginia).
3.  **Database Password:** pulsa **Generate a password** · 👉 COPIALO A UN BLOC DE NOTAS AHORA (lo necesitas si usas CLI). Haz clic en **Create new project**.
4.  Espera ~2 minutos. Cuando aparezca el panel de inicio con tablas, sigue.

### 2b. Aplicar 5 migraciones — **orden 001 → 005 ¡IMPORTANTE!**

Abre la pestaña **SQL Editor** → **New query**. En cada query copia TODO el contenido de un archivo SQL del directorio [supabase/migrations/](supabase/migrations/) y haz clic en **RUN** (botón ▶️ abajo-dcha).

| # | Archivo | ¿Qué crea? |
|---|---|---|
| 001 | [001_initial_schema.sql](supabase/migrations/001_initial_schema.sql) | `competences`, `admin_settings`, `essais_expression_ecrite`, `stats_conjugaison` + **RLS policies** (anon lee, `service_role` escribe `admin_settings`) |
| 002 | [002_seed_data.sql](supabase/migrations/002_seed_data.sql) | 4 competencias EE/EO/CE/CO + 8 errores FestiVox SRS + `prompts_main` default pre-A15 en `admin_settings` (lo **sobreescribimos luego con 1 clic en Admin UI**). |
| 003 | [003_exercices.sql](supabase/migrations/003_exercices.sql) | `exercices_expression_ecrite` pool de sujetos Tâche 1/2/3 listos para usar. |
| 004 | [004_progression_tracking.sql](supabase/migrations/004_progression_tracking.sql) | `score_100` + `score_breakdown` + `progression_notes` para el dashboard KPI. |
| 005 | [005_suivi_erreurs.sql](supabase/migrations/005_suivi_erreurs.sql) | `erreurs_suivi` · SRS 1·3·7·14·30·60·90 días. |

✅ Después de cada uno: _"Success. No rows returned"_ o _"N rows affected"_. Si devuelve error por tabla ya existente — no pasa nada; el `CREATE IF NOT EXISTS` es idempotente.

* * *

## 5. Paso 3 — Obtener 3 claves y rellenar `.env.local`

### 3.1 Claves Supabase

1.  Abre **Project Settings** (icono rueda abajo-izq) → **API**.
2.  Copia 3 valores:

| Nombre en `.env.local` | Valor real a copiar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Project URL** · empieza por `https://XXXX.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **anon public** · empieza por `eyJhbG…` (🔓 pública, segura para navegador) |
| `SUPABASE_SERVICE_ROLE_KEY` | **service_role** · empieza por `eyJhbG…` (🔒 PRIVADA — sólo API route, nunca navegador) |

### 3.2 Clave OpenRouter (🔥 para Claude · Anthropic)

1.  Ve a [https://openrouter.ai](https://openrouter.ai) · haz login con GitHub / Google.
2.  Ve a [https://openrouter.ai/keys](https://openrouter.ai/keys) → **Create Key**.
3.  Label: `TCF Canada Claude · Local` · **Create Key**.
4.  **COPIA LA CLAVE** · es `sk-or-v1-xxxxxx…`. Guárdala; no la verás más.
5.  → **TOP UP · RELLENAR SALDO AHORA** (se explica en Paso 4.1 — sin saldo, Claude devuelve `502 Quota Exceeded`).

Guárdala también en la tabla siguiente:

| Nombre en `.env.local` | Valor |
|---|---|
| `OPENROUTER_API_KEY` | `sk-or-v1-xxxx…` (del paso anterior) |
| `NEXT_PUBLIC_OPENROUTER_REFERRER` | `http://localhost:3000` |
| `ADMIN_PASSWORD` | **Inventa un password fuerte** — lo usas para entrar a `/admin/parametres`. Ejemplo: `Claude_B2_TCF_2026_Supabase!` (¡NO uses este!) |

### 3.3 Copiar plantilla `.env.local`

#### macOS / Linux (Bash / Zsh)
```bash
cd tfc-app
# Copia si no existe (sin sobreescribir)
if [ ! -f .env.local ]; then cat > .env.local <<'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...XXXX
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...YYYY
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxx...
NEXT_PUBLIC_OPENROUTER_REFERRER=http://localhost:3000
ADMIN_PASSWORD=InventaTuPasswordFuerte123!
EOF
fi
ls -la .env.local
# → Ahora edítalo con Visual Code: code .env.local, y pega los VALORES REALES del paso 3.1-3.2.
```

#### Windows PowerShell (Admin no necesario aquí)
```powershell
cd tfc-app
if (-not (Test-Path .env.local)) {
@'
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...XXXX
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...YYYY
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxx...
NEXT_PUBLIC_OPENROUTER_REFERRER=http://localhost:3000
ADMIN_PASSWORD=InventaTuPasswordFuerte123!
'@ | Set-Content -Path .env.local -Encoding UTF8
}
Get-Item .env.local | Select-Object Name,Length
# Ahora edita .env.local con Bloc de notas / VS Code: introduce los VALORES REALES.
```

> 🔐 Check rápido seguridad: `SUPABASE_SERVICE_ROLE_KEY` y `OPENROUTER_API_KEY` **sólo existen en este archivo**. Nunca van al repo ni a `admin_settings`. Línea [.gitignore:L4](.gitignore#L4-L4) ya tiene `.env*.local` incluído.

* * *

## 6. Paso 4 — **Configurar Claude** como modelo por defecto

### 4.1 🚨 TOP UP SALDO EN OPENROUTER (ANTES DE SEGUIR) · 5-10 $

1.  Abre [https://openrouter.ai/credits](https://openrouter.ai/credits).
2.  Elige método de pago · carga **5 USD mínimo** (recomendado 10$ para 200 copias sin sobresaltos).
3.  Confirma que **Available credits** sea mayor que ~0.5 $ en verde.

> 🧾 Por qué: **Claude Sonnet 3.7 ≈ 3 $/1M tokens entrada · 15 $/1M salida**. Cada corrección con prompt schema cerrado usa ~1500-2200 tokens. El coste medio por copia ≈ **0.03 $**. Así que con 5 $ tienes ~150 copias.
>
> 💡 Alternativa barata (cuesta 1/30) para empezar: `claude-haiku-3.5-latest` (0.10 $/1M entrada · 0.40 $/1M salida). Luego cambias en 1 clic a Sonnet cuando quieras.

### 4.2 Arrancar la app en modo desarrollo

```bash
# macOS / Linux / Windows PowerShell
cd tfc-app
npm run dev
```

✅ Espera el mensaje: `Ready in ~800ms on http://localhost:3000`

Abre [http://localhost:3000/expression-ecrite](http://localhost:3000/expression-ecrite). Verás:
-   Tâches 1/2/3 selector arriba
-   Consigna textarea
-   Editor Seyes rouge en directo
-   Bouton **Corriger ma copie** (lo usamos en el Paso 5)
-   Marge du correcteur 6 puntos

### 4.3 Iniciar sesión en `⚙ Admin / Paramètres`

1.  Abre [http://localhost:3000/admin/parametres](http://localhost:3000/admin/parametres)
2.  Aparece **Mot de passe administrateur**. Escribe el valor que pusiste en `ADMIN_PASSWORD`.
3.  Haz clic en **Valider** · ya tienes acceso.

### 4.4 🔥 Seleccionar Claude en el selector Modelo LLM

En la fila **Modèle LLM par défaut** (arriba):

-   Haz clic en el **menú selector / combobox** (estilo Combobox override libre).
-   Escribe **`anthropic/claude`**.
-   Elige una de las 3 opciones:

| Recomendación | Model ID (cómo sale en OpenRouter) | Coste 2026 / 1M tok in/out | Tamaño contexto |
|---|---|---|---|
| ⭐ **RECOMENDADO** | **`anthropic/claude-sonnet-3.7`** | 3.00 $ / 15.00 $ | 200k · **ideal para prompts cerrados A15-A20 + schema JSON 24 claves** |
| 💸 Más barato | `anthropic/claude-haiku-3.5-latest` | 0.10 $ / 0.40 $ | 200k · bueno para testing rápido 1000 copias |
| 🎯 Máxima precisión | `anthropic/claude-opus-4.1` | 15 $ / 75 $ | 1M · para evaluación final de textos |

-   Una vez seleccionado, **NO pulses todavía Corriger** — primero hay que Guardar el prompt (obligatorio, paso siguiente).

### 4.5 ⚠ PASO OBLIGATORIO · botón **Enregistrer · Guardar prompt principal**

En el textarea grande **Prompt principal · Correction Expression Écrite** (justo debajo del selector):

1.  Lee 2 líneas hacia arriba — deben verse los **micro-reglas A15 A16 A17 A18 A19 A20** (24 claves obligatorias, blacklist ❌ de keys FR como `axes_amélioration`, CECRL 11→B2 sin `+`, arrays 3 ejemplos, JSON sin trailing comma).
2.  También debe verse la **tabla CECRL oficial del 0-3 A1 / 10-12 B2 / 16-20 C2** con anotación _NOTE recalculé côté serveur_.
3.  👉 **HAZ CLIC EN `[ Enregistrer · Guardar prompt principal ]`** (botón verde inline al lado del título textarea).

✅ Espera **Toast vert · Enregistré ✓** 1-2 segundos.

> 💼 ¿Por qué obligatorio? En [app/api/corriger/route.ts](app/api/corriger/route.ts) el servidor lee **PRIMERO** `admin_settings.prompts_main` de Supabase JSONB, y sólo si la clave no existe cae al código en `lib/llm/prompts.ts`. Como la migración 002 creó un valor **pre-A15** en la tabla (sólo A1-A14, sin 24 claves obligatorias), el clic **sobrescribe** esta fila con el prompt nuevo cerrado. Sin el clic, Claude no recibe las reglas A15-A20 y el Score Breakdown sale vacío / CECRL sale B1+ / con `+`.

* * *

## 7. Paso 5 — Verificación: corrección con Claude + dashboard 5 barras

### 5.1 · Volver a L'Atelier · `expression-ecrite`

Abre [http://localhost:3000/expression-ecrite](http://localhost:3000/expression-ecrite).

### 5.2 · Escribe una copie · Tâche 1 (60-120 mots)

Pega este texto **FRANCÉS AUTÉNTICO** (98 mots, objetif B1 · esperamos 11/20 B2 al corregir — verás el 5-layer Defense funcionar cuando ignore cualquier eventual B1+ de Claude y fuerce B2):

```
Salut Bernard,
Quelle bonne nouvelle ! J'ai hâte que tu emménages dans le coin.
Pour tes courses, je te recommande vivement le marché Sami Fruits, à cinq minutes à pied de chez moi. C'est un marché spécialisé dans les fruits et les légumes : tout est frais, local en saison, et les prix restent très abordables. Il est ouvert du mardi au dimanche, de 9 h à 21 h.
Ce que j'aime surtout, c'est l'ambiance : les vendeurs te conseillent et on finit toujours par discuter. J'y vais chaque semaine et je n'ai jamais été déçu.
Dis-moi quand tu arrives et je t'y emmène !
À tantôt,
Kevin
```

Asegúrate:

-   **Tâche 1** seleccionada arriba (60-120 mots).
-   Cuenta palabras → 105 mots (dentro de la cible 60-120).
-   Pulsa **Corriger ma copie**.

### 5.3 Resultado esperado después de ~8 segundos

✅ **Orden de ventanas (top → abajo)** es exactamente el de la maqueta ref:

1.  **Ventana 1 — Exercise view** (arriba del todo · la del editor Seyes / tâches / chrono)
2.  **Ventana 2 — Analysis Dashboard** (dentro del block correction · bajo el título Correction · Tâche 1):
    -   17/20 (si usaste Sonnet con prompt A15) o 11/20 si Claude detectó errores pequeños.
    -   **5 KPI badges en fila**: Sur 100 · CECRL · NCLC/CLB · Longueur (2-ligne avec `cible 60-120`) · Objectif `NCLC 7 tenu, 8 en vue`
    -   **Score Breakdown card** fondo `#18222E` + **5 barras verdes gradiente `#2FA671 → #3CCF91`** (Grammaire / Vocabulaire / Cohérence / Tâche / Style).
3.  **Ventana 3 — Resto**: Feedback → Your Response (red wavy underline sur `local en saison`) → Corrected Version (fond **vert sombre #14261F header vert #3CCF91**) → Strengths (verte ✓) · Areas for Improvement (fond **ambar-marron #2A2115 header ↗ ambar #E8A83C**) · Critères · Examples B1·B2·C1 (3 tarjetas nivel C verde) · Gap NCLC 7 · Gap NCLC 8 última tarjeta verde.

✅ **Verificación CECRL** (la prueba de fuego): si Claude puso `note20 = 11` en el JSON devuelto, el badge CECRL dice **B2** · **nunca B1+** (se sobreescribe en 6 sitios incluyendo el render React — punto 4 de la defensa). Si se ve rojo dashed border alrededor CECRL es que el valor LLM no concordaba con la tabla oficial y el JSX lo corrigió.

✅ **Verificación barras** (la prueba anti-minimax): Si con Claude-sonnet hay 5 barras llenas (todas green), el A15-A20 prompt cerrado está ok.

✅ **Verificación 3 ejemplos** (D4 padding): Tarjetas NIVEAU B1 / B2 / C1 hay exactamente 3 y C muestra subordination (`bien que`), B2 connectors (`en outre`) y B1 texte simple. Nunca aparecen niveles `+` porque D4 los elimina.

* * *

## 8. Paso 6 — Build & producción (opcional, VPS)

Cuando quieras subir la app a Ubuntu 24.04 VPS (mínimo 1 vCPU · 1 GB RAM):

```bash
# 8.1 Build SSR
npm run build
# Espera: 10 static ○ + 12 dynamic ƒ green

# 8.2 Arranca con PM2
sudo npm i -g pm2
pm2 start npm --name tcf-canada -- start
pm2 save && pm2 startup systemd

# 8.3 Nginx reverse proxy + certbot
sudo apt install -y nginx certbot python3-certbot-nginx
sudo certbot --nginx -d tcf.example.com
```

En `/etc/nginx/sites-available/tcf.conf` pon:
```nginx
server {
  server_name tcf.example.com;
  location / { proxy_pass http://127.0.0.1:3000;
               proxy_set_header Host $host;
               proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; }
}
```

* * *

## 9. Tabla de modelos Claude recomendados

| Model ID OpenRouter | Selección UI Admin | Coste aprox 1 corrección (2200 tok) | Precisión Score Breakdown 5 barras | Recomendado |
|---|---|---|---|---|
| `anthropic/claude-sonnet-3.7` | 🔥 DEFAULT **Claude Sonnet 3.7** | ~0.030 $ | 100 % 5/5 barras llenas | ✅ Daily |
| `anthropic/claude-haiku-3.5-latest` | Claude Haiku 3.5 | ~0.001 $ | ~92 % (a veces 4/5, placeholder en 1) | ✅ Testing masivo · 1000+ copies |
| `anthropic/claude-opus-4.1` | Claude Opus 4.1 | ~0.30 $ | 100 % + comentarios + detallados | Evaluación final de nivel |

> 💡 Truco: Si más adelante quieres GPT-4o, Gemini 2.5, DeepSeek etc. **no tienes que tocar código**, desde la misma `/admin/parametres` seleccionas otro ID modelo y guardas. El OpenRouter gestiona auth 1 sola clave API.

* * *

## 10. Resolución de problemas · 12 errores comunes

| # | Síntoma | Causa típica | Arreglo 1 clic |
|---|---|---|---|
| E01 | `npm run dev` → `Error: Cannot find module next` | `npm install` no se ejecutó | `cd tcf-app && npm install` |
| E02 | Pantalla **beige** · corrección NO aparece en fons fosc #0E141B | Browser cache Tailwind v4 beta | Hard refresh: `⌘+Shift+R` (macOS) · `Ctrl+F5` (Win/Linux) |
| E03 | **HTTP 502 Quota Exceeded** al hacer Corriger | OpenRouter créditos = 0 | Paso 4.1 · Top up ≥ 5 $ USD · espera 1 min |
| E04 | `EADDRINUSE port 3000` ocupado | Otra app (Laragon/XAMPP, dev anterior) usa 3000 | **macOS/Linux:** `lsof -ti:3000 \| xargs kill -9`. **Win:** `netstat -ano \| findstr :3000` → `taskkill /F /PID <id>` |
| E05 | **Score Breakdown** sale banner amber rayado 45° + `Aucune donnée…` | Prompt A15-A20 no fue guardado en Supabase | **Paso 4.5** — Vuelve a Admin y haz clic 1 vez ENREGISTRAR. Verifica en Toast verde "Enregistré". |
| E06 | Badge CECRL sale **B1+** (nota 11) · prohibido | El LLM contestó B1+, una de las 6 capas G no sobreescribió | `npm run typecheck` → 0 errores. Luego admin guardar prompt (E05 fix). |
| E07 | `Error: Column score_100 does not exist` | Migración 004 olvidada | SQL Editor Supabase · ejecuta contenido de 004_progression_tracking.sql |
| E08 | Acceso Admin denegado aunque password correcto | `.env.local` no se cargó (línea en blanco ADMIN_PASSWORD) | Edítalo y **restart `npm run dev`** |
| E09 | `new row violates row-level security policy` al guardar prompt | `SUPABASE_SERVICE_ROLE_KEY` NO está en .env | Copiar desde Project Settings · API · service_role. Restart dev. |
| E10 | **3 ejemplos** 1 tarjeta solo aparece (B2) o con `+` | D4 padding no funciona | Tipe-check + admin volver a guardar prompt cerrado A19 arrays length 3 |
| E11 | Windows · `npm run dev` + carpeta espacios `C:\Users\Juan Pérez\…` | Bug Next 15 beta paths | Mueve repo a `C:\Dev\tfc-app` (sin espacios) |
| E12 | Claude contesta en inglés pese a prompt FR | Valor de `consigne` no fue detectado como FR | Escribe 2-3 frases más en la consigna antes de Corriger. O ajusta prompt local A17 `Valeurs des champs clés FRANÇAIS SAUF les 24 clés JSON qui sont ANGLAIS`. |

* * *

## 11. Security notice (ES) — `.github_deploy_keys/` **nunca se sube**

En tu máquina local, el directorio [`.github_deploy_keys/`](.github_deploy_keys/) contiene la clave Ed25519 privada para hacer push al repo.

-   Está en **línea L8 del `.gitignore`**: `.github_deploy_keys/`.
-   Se hizo auditoría independiente (count `git diff --cached --name-only | grep .github_deploy_keys | wc -l` = **0**) en todos los pushes.
-   NUNCA subirás a GitHub la clave privada. Queda 100% local, permisos `chmod 600`.
-   Si mueves la carpeta de sitio, reconfigura `core.sshCommand` (ver README.md sección 10).

* * *

🏁 **Fin de la guía**. Si todo salió bien, habrás completado:
✅ 5 migraciones Supabase
✅ 6 variables `.env.local` con valores reales
✅ 5 USD OpenRouter top up (para Claude Sonnet)
✅ 1 click Admin Enregistrer prompt cerrado A15-A20
✅ 1 corrección de prueba + dashboard 5 barras verdes
