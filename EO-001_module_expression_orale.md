# EO-001 — Módulo de Expresión Oral (TCF Canada)

**Documento de construcción para Claude Desktop / IDE**
Proyecto: `fuck-tcf` · Módulo: Speaking / Expression orale
Versión 1.0 · Autor del spec: Claude · Destinatario: agente de implementación

---

## 0. Cómo usar este documento

Este documento es la **fuente única de verdad** para construir el módulo completo de Expresión Oral. Está escrito para ser leído de arriba a abajo por un agente de codificación.

Reglas para el implementador:

1. **No inventes reglas del examen.** Todo lo que está en la §2 viene del *Manuel du candidat TCF* (versión L, abril 2025). Si algo no está aquí, márcalo como `TODO: verificar` en vez de improvisar.
2. **Reutiliza lo que ya existe.** El módulo Speaking ya tiene: listado de archetypes, filtros Quick Set / Full Coverage, sistema de créditos, cheat sheets, grabación con transcripción en vivo, y botón "AI conversation". Este documento **extiende** esa base, no la reemplaza.
3. **Todo texto mostrado al candidato durante una simulación va en francés.** El feedback va en francés + glosas en español (ver §7).
4. **Cada fase de la §12 debe quedar funcional y desplegable antes de pasar a la siguiente.**

### Brechas detectadas en el estado actual (a partir de las capturas)

| # | Brecha | Acción |
|---|--------|--------|
| G1 | La pantalla Speaking solo tiene filtros `Task 2` y `Task 3`. **No existe Tâche 1.** | Añadir 20 archetypes de Tâche 1 (§8.1) y el filtro correspondiente |
| G2 | No hay modo "examen completo" (3 tareas seguidas, 12 min) | Construir `SimulationRunner` (§4.2, modo `full_exam`) |
| G3 | No hay evaluación ni puntuación | Construir el motor de evaluación (§6) |
| G4 | No hay histórico de sesiones ni progresión | Modelo de datos `eo_sessions` + pantalla de historial (§4.3, §11.6) |
| G5 | Los timers mostrados son `3:30` para todo | Corregir por tarea: T1 = 2:00, T2 = 2:00 prep + 3:30, T3 = 4:30 (§2) |

---

## 1. Objetivo

Construir un simulador de la prueba de **Expresión Oral del TCF Canada** que permita a un candidato:

- practicar las **tres tareas** con un examinador IA que sostiene una conversación real (voz o texto);
- recibir un **feedback alineado a los criterios oficiales** del TCF;
- obtener una **nota estimada /20 y su equivalencia NCLC**, con la misma lógica y presentación que ya usa el módulo de Expresión Escrita;
- rastrear su progresión a lo largo del tiempo y contra un objetivo declarado (por defecto: **NCLC 7 = 10–11/20 = B2**).

**No-objetivos** (fuera de alcance v1): certificación oficial, corrección humana, análisis acústico fino de fonemas (solo se estima la prononciation a partir de la calidad de la transcripción y del juicio del modelo), práctica de comprensión oral.

---

## 2. Hechos oficiales del examen (no modificar)

Fuente: *Manuel du candidat TCF*, version L, avril 2025 — TCF Canada.

### 2.1 Estructura de la prueba

Prueba individual cara a cara con un examinador. **Duración total: 12 minutos. 3 tareas encadenadas, sin pausa entre ellas.**

| Tarea | Nombre oficial | Preparación | Duración del intercambio | Objetivo evaluado |
|---|---|---|---|---|
| **Tâche 1** | Entretien dirigé, **sans préparation** | 0 | **2 minutes** | Capacidad de intercambiar con una persona desconocida (el examinador) |
| **Tâche 2** | Exercice en interaction, **avec préparation** | **2 minutes** | **3 min 30** de diálogo | Capacidad de **obtener información** en una situación de la vida cotidiana. La consigna precisa el estatus del interlocutor y del candidato |
| **Tâche 3** | Expression d'un point de vue, **sans préparation** | 0 | **4 min 30** | Hablar de manera espontánea, continua y convincente respondiendo a una pregunta elegida por el examinador |

> Punto crítico de diseño: en la **Tâche 2 es el candidato quien pregunta** y el examinador quien responde. Es la inversión de roles respecto a T1 y T3. El motor de conversación debe tratarla como un modo distinto, no como "otra conversación más" (§5.4).

### 2.2 Capacidades evaluadas (según el manual)

- hablar de sí mismo, de su entorno familiar y profesional;
- formular preguntas adaptadas a la situación de comunicación propuesta;
- dar su opinión, explicar ventajas e inconvenientes de un proyecto, expresar acuerdo y desacuerdo;
- presentar una argumentación clara y estructurada en un estilo apropiado al contexto;
- presentar de forma detallada y estructurada temas complejos, desarrollarlos y concluir.

### 2.3 Criterios oficiales de evaluación

Los criterios de la prueba de expresión oral son de orden:

- **lingüístico** — extensión y dominio del léxico, corrección gramatical, soltura, pronunciación, fluidez global del discurso;
- **pragmático** — interacción, estructuración del discurso, coherencia y cohesión, desarrollo temático;
- **sociolingüístico** — adecuación a la situación de comunicación.

### 2.4 Cómo se califica realmente (a replicar)

- La prueba se evalúa **dos veces, de forma independiente y a doble ciego**: el examinador que conduce y graba la entrevista, y un corrector que recibe la grabación.
- Cada uno atribuye **a cada una de las 3 tareas un nivel**, desde "A1 non atteint" hasta "C2".
- Una **regla de cálculo sobre los 6 niveles** produce la nota final y el nivel final.
- Si hay una discrepancia grande entre correctores, se hace una tercera corrección.

> El módulo replica esta arquitectura con **dos evaluaciones IA independientes** (§6.3) y una tercera de desempate. Esto no es decoración: reduce la varianza y es lo que hace creíble la nota.

### 2.5 Tabla de conversión (nota /20 → nivel → NCLC)

Escala general del TCF:

| Nota /20 | Nivel CECR |
|---|---|
| 1/20 | A1 |
| 2–5 | A2 |
| 6–9 | B1 |
| 10–13 | B2 |
| 14–17 | C1 |
| 18–20 | C2 |

Equivalencia NCLC oficial para **Expression orale** del TCF Canada:

| NCLC | Nota Expression orale |
|---|---|
| **10 y más** | 16 – 20 (C1-C2) |
| **9** | 14 – 15 (C1) |
| **8** | 12 – 13 (B2) |
| **7** | 10 – 11 (B2) |

Las filas inferiores (NCLC 4–6) **no están confirmadas en la fuente de este proyecto**: impleméntalas detrás de una constante marcada `// TODO verificar con IRCC` y muestra en la UI "NCLC < 7 (estimación)" en lugar de un número exacto mientras no se verifique.

**Objetivo por defecto del usuario: NCLC 7 → 10–11/20 → B2.** La UI debe mostrar siempre la distancia al objetivo, igual que en Expression écrite.

---

## 3. Alcance funcional

El módulo entrega cinco modos de uso:

| Modo | Descripción | Créditos |
|---|---|---|
| `drill_text` | Practicar un archetype por escrito (sin voz). Útil para preparar contenido. | 0 |
| `drill_voice` | Grabación libre sobre un archetype, sin interlocutor. Transcripción + evaluación de la tarea aislada. | 1 (Standard) |
| `conversation` | **Conversación completa con el examinador IA** sobre un archetype, con turnos, relances y cronómetro real. Evaluación al final. | 3 (AI session) |
| `full_exam` | **Simulación completa de 12 minutos**: T1 → T2 (con 2 min de preparación) → T3, encadenadas, sin pausa, con reporte global y nota /20 + NCLC. | 6 |
| `review` | Revisión de una sesión pasada: transcripción anotada, reformulaciones, plan de trabajo. | 0 |

---

## 4. Arquitectura

### 4.1 Rutas y pantallas

```
/speaking                          → listado de archetypes (YA EXISTE, extender con Task 1)
/speaking/exam                     → NUEVO: lanzador de simulación completa (12 min)
/speaking/[promptId]               → detalle del archetype (YA EXISTE)
/speaking/[promptId]/session       → NUEVO: sala de conversación (modo conversation/drill_voice)
/speaking/session/[sessionId]      → NUEVO: reporte de evaluación
/speaking/history                  → NUEVO: historial + curva de progresión
```

### 4.2 Máquina de estados de la sesión

Una sola máquina gobierna los cuatro modos. Implementarla como reducer puro y testeable, separada del transporte de audio.

```
IDLE
 → BRIEFING            (muestra la consigna; T2 también muestra la ficha de preparación)
 → PREPARING           (SOLO T2 · 2:00 · bloc de notas activo · micro desactivado)
 → EXAMINER_OPENING    (el examinador saluda / lanza la consigna en voz)
 → LISTENING           (el candidato habla · transcripción en vivo)
 → THINKING            (se genera el turno del examinador)
 → EXAMINER_TURN       (reproducción TTS del turno)
 → (loop LISTENING ↔ EXAMINER_TURN hasta que expira el timer de la tarea)
 → TASK_COMPLETE       (en full_exam: transición inmediata a la tarea siguiente)
 → EVALUATING          (llamadas de evaluación, ver §6.3)
 → REPORT
```

Reglas duras del cronómetro:

- El timer de la tarea corre **desde el primer turno del examinador**, no desde que se carga la página.
- El timer **no se pausa** mientras el candidato calla. El silencio cuesta tiempo, como en el examen real. Ese hecho alimenta el criterio *aisance*.
- A los 15 s del final: aviso visual discreto (barra ámbar). Sin sonido.
- Al expirar: el examinador **cierra con una fórmula** (`Merci, nous allons passer à la suite.`) y el estado avanza. Nunca se corta a mitad de palabra del candidato: se espera a que termine el turno en curso, con un margen máximo de 20 s que se registra en `overtimeSeconds` y se reporta.
- En `full_exam` **no hay pausa** entre tareas. Es parte de la dificultad real.

### 4.3 Modelo de datos

```ts
type TaskId = 1 | 2 | 3;

interface Archetype {
  id: string;              // "T2-LOG-03"
  task: TaskId;
  category: string;        // "Logement", "Community / Volunteering", ...
  set: 'quick' | 'full';   // Quick Set = 52 núcleo; Full Coverage = catálogo largo
  consigne: string;        // texto exacto en francés mostrado al candidato
  translationEs?: string;  // glosa española (ya existe el flujo "Translating prompt...")
  durationSec: number;     // 120 | 210 | 270
  prepSec: number;         // 0 | 120
  // Motor de conversación:
  examinerRole: string;    // quién es el examinador en esta escena
  candidateRole: string;   // quién es el candidato
  objective: string;       // qué debe lograr el candidato para "réussir la tâche"
  requiredMoves: string[]; // actos de habla esperados (§5)
  relances: string[];      // preguntas/objeciones de reserva del examinador
  lexicalField: string[];  // 12-20 palabras/expresiones clave B2 del tema
  cheatSheet: CheatSheet;  // estructura memorizable (ya existe el componente)
}

interface EoSession {
  id: string;
  userId: string;
  mode: 'drill_text' | 'drill_voice' | 'conversation' | 'full_exam';
  startedAt: string; endedAt: string;
  tasks: EoTaskRun[];
  evaluation?: EoEvaluation;   // §6.5
  creditsSpent: number;
}

interface EoTaskRun {
  task: TaskId;
  archetypeId: string;
  turns: Turn[];               // { role: 'examiner' | 'candidate', text, startMs, endMs, audioUrl? }
  metrics: SpeechMetrics;
  overtimeSeconds: number;
  prepNotes?: string;          // T2
}

interface SpeechMetrics {
  candidateSpeakingSec: number;
  silenceSec: number;          // silencios > 2 s acumulados
  longestSilenceSec: number;
  wordsPerMinute: number;
  turnCount: number;
  questionsAsked: number;      // decisivo en T2
  fillerCount: number;         // euh, este, eeeh, hum
  lexicalDiversity: number;    // type-token ratio sobre lemas
}
```

`SpeechMetrics` se calcula **en código, no por el LLM**. El LLM recibe estas métricas como entrada de contexto (§6.5). Esto evita que el modelo invente cifras.

---

## 5. Motor de conversación (examinador IA)

### 5.1 Reglas comunes a las tres tareas

El examinador es un **examinador TCF habilitado**, no un tutor. Reglas invariables, a incluir en todos los system prompts:

1. **Habla solo francés.** Nunca traduce, nunca explica gramática, nunca corrige durante la sesión.
2. **Turnos cortos.** Máximo 2 frases por turno (T1 y T3), máximo 3 en T2 cuando da una información factual.
3. **Nunca hace el trabajo del candidato.** No sugiere vocabulario, no completa frases, no rellena silencios con contenido.
4. **Tono neutro y cortés.** Ni cálido ni hostil. Vouvoiement salvo que la consigna instale el tuteo (varias consignas de T2 dicen "Je suis votre ami(e)" → ahí el tuteo es lo correcto y el registro se evalúa).
5. **Ante un silencio de más de 6 s**: una sola relance neutra (`Oui… je vous écoute.` / `Pouvez-vous préciser ?`). Si el silencio se repite, pasa a la siguiente pregunta. Nunca rescata al candidato dos veces seguidas.
6. **Ante una respuesta incomprensible**: pide aclaración una vez (`Excusez-moi, je n'ai pas bien saisi. Vous pouvez reformuler ?`), luego continúa.
7. **Nunca revela nivel, nota ni feedback durante la sesión.** Si el candidato lo pide: `Nous verrons cela à la fin.`
8. **Escalado de exigencia**: si las respuestas son sólidas y largas, sube el nivel de abstracción de las relances (pide ejemplos, matices, contraargumentos). Si son frágiles, no baja el nivel de la tarea, pero simplifica la formulación de la pregunta — igual que un examinador real.
9. Devuelve siempre JSON: `{ "speech": "...", "internalNote": "...", "shouldAdvance": false }`. `internalNote` **no se muestra** durante la sesión; se guarda y se pasa al evaluador como observación del examinador (réplica del doble juicio oficial, §2.4).

### 5.2 Tâche 1 — Entretien dirigé (2:00, sin preparación)

**Dinámica:** el examinador pregunta, el candidato responde. Entrevista de conocimiento mutuo. Empieza siempre con una fórmula de acogida y una pregunta abierta simple, y **sube progresivamente**: presente → pasado → proyectos/hipotético. En 2 minutos entran típicamente 5 a 8 preguntas.

```
SYSTEM — TÂCHE 1
Tu es examinateur habilité du TCF Canada. Tu fais passer la Tâche 1 : entretien dirigé, 2 minutes, sans préparation.
Thème de départ : {{category}}. Question d'ouverture : {{consigne}}.

Déroulé :
1. Accueille le candidat brièvement (« Bonjour, installez-vous. ») puis pose la question d'ouverture.
2. Enchaîne avec des questions de plus en plus exigeantes sur le même fil : d'abord des faits (présent),
   puis du récit (passé composé / imparfait), puis des projets ou une hypothèse (futur / conditionnel).
3. Rebondis TOUJOURS sur ce que le candidat vient de dire. Ne pose jamais une question déconnectée
   de sa réponse précédente, sauf si le fil est épuisé.
4. Si une réponse fait moins de 10 mots, relance sur le même point : « Pourquoi ? », « Racontez-moi. »
5. À {{remainingSec}} <= 10, conclus : « Merci. Nous passons à l'exercice suivant. » et mets shouldAdvance=true.

Contraintes : 1 à 2 phrases par tour. Vouvoiement. Jamais de correction, jamais de traduction,
jamais de vocabulaire offert. Réponds uniquement en JSON : {"speech","internalNote","shouldAdvance"}.
```

### 5.3 Tâche 3 — Expression d'un point de vue (4:30, sin preparación)

**Dinámica:** el examinador lanza **una sola pregunta de sociedad** y luego **habla muy poco**. El candidato debe sostener un discurso continuo, estructurado y argumentado. Este es el punto donde se separa un B1 de un B2.

```
SYSTEM — TÂCHE 3
Tu es examinateur habilité du TCF Canada. Tâche 3 : expression d'un point de vue, 4 minutes 30, sans préparation.
Question imposée : {{consigne}}.

Déroulé :
1. Pose la question telle quelle, une seule fois, sans la reformuler ni l'expliquer.
2. Ensuite, INTERVIENS LE MOINS POSSIBLE. Le candidat doit occuper la parole.
3. N'interviens que dans ces quatre cas :
   a. silence > 6 secondes → « Oui ? » ou « Continuez. »
   b. le candidat a fini un développement et s'arrête → demande un approfondissement :
      un exemple concret, une nuance, ou la position adverse (« Et ceux qui pensent le contraire ? »)
   c. le candidat est hors sujet → « Revenons à la question : {{consigne}} »
   d. il reste 45 secondes et aucune conclusion n'a été amorcée → « Pour conclure, que retenez-vous ? »
4. Ne donne JAMAIS ton propre avis. Ne valide pas, n'approuve pas (« très bien », « intéressant » = interdits).
   Utilise des accusés de réception neutres : « D'accord. », « Je vous écoute. »
5. À {{remainingSec}} <= 10 : « Merci, l'épreuve est terminée. » et shouldAdvance=true.

Réponds uniquement en JSON : {"speech","internalNote","shouldAdvance"}.
```

### 5.4 Tâche 2 — Exercice en interaction (2:00 prep + 3:30)

**Dinámica invertida y crítica.** El candidato debe **obtener información haciendo preguntas**. El examinador encarna al personaje descrito en la consigna y **responde**, pero nunca ofrece información que no se le pidió.

Esta es la tarea donde más candidatos pierden puntos: se ponen a narrar en vez de preguntar.

```
SYSTEM — TÂCHE 2
Tu es examinateur habilité du TCF Canada. Tâche 2 : exercice en interaction, 3 minutes 30.
Tu JOUES UN RÔLE : {{examinerRole}}. Le candidat est : {{candidateRole}}.
Situation : {{consigne}}.

Règle centrale : C'EST LE CANDIDAT QUI DOIT POSER LES QUESTIONS. Tu réponds, tu n'interroges pas.

Déroulé :
1. Ouvre avec une phrase courte qui installe la scène et rend la parole :
   « Alors, tu voulais me poser des questions ? » (ou vouvoiement selon la consigne).
2. Réponds à chaque question de façon crédible, précise et BRÈVE (2-3 phrases maximum).
   Invente des détails cohérents et retiens-les : {{sceneFacts}}. Reste cohérent toute la session.
3. NE DONNE JAMAIS une information qu'on ne t'a pas demandée. Si le candidat pose une question vague,
   réponds de façon vague : « Ça dépend. » Il doit apprendre à préciser sa demande.
4. Si le candidat se met à raconter au lieu de questionner (plus de 2 tours sans question),
   relance UNE fois : « Tu as d'autres questions ? » Ensuite, laisse le silence s'installer.
   Ce silence est une donnée d'évaluation, pas un échec de ta part.
5. Introduis UNE complication à mi-parcours (vers 1:45) pour tester la capacité de réaction :
   {{complication}} — ex. un tarif plus élevé que prévu, une date qui ne convient pas, une condition inattendue.
6. À {{remainingSec}} <= 10 : clôture poliment. shouldAdvance=true.

Réponds uniquement en JSON : {"speech","internalNote","shouldAdvance"}.
```

Cada archetype de T2 debe traer en su ficha: `examinerRole`, `candidateRole`, `sceneFacts` (6–10 hechos inventados pero fijos: precios, horarios, condiciones), `complication`, y `requiredMoves` (las 5–7 informaciones que el candidato *debería* obtener). El evaluador usa `requiredMoves` para medir el cumplimiento de la tarea (§6.2, criterio *réalisation de la tâche*).

### 5.5 Fase de preparación de la Tâche 2

Durante los 2 minutos de `PREPARING`:

- micrófono **desactivado** (botón deshabilitado, no oculto);
- bloc de notas libre, monoespaciado, sin corrector ortográfico, sin IA;
- se muestra la consigna y **nada más**: ni cheat sheet, ni traducción, ni campo léxico. En el examen real no hay ayudas;
- las notas se guardan en `prepNotes` y se muestran en el reporte junto a lo que el candidato realmente dijo — el contraste entre plan y ejecución es material de feedback muy útil;
- al expirar, transición automática. Sin botón "necesito más tiempo".

> Fuera de sesión (en `/speaking/[promptId]`), el cheat sheet y el campo léxico **sí** están disponibles. La separación entre "modo estudio" y "modo examen" debe ser tajante y visible en la UI.

---

## 6. Motor de evaluación y puntuación NCLC

### 6.1 Los siete criterios

Los tres ejes oficiales (§2.3) se descomponen en siete criterios operativos. Cada uno se puntúa en una escala `0–6` con medios puntos.

| Eje | # | Criterio | Qué se juzga |
|---|---|---|---|
| Pragmático | P1 | **Réalisation de la tâche** | ¿Hizo lo que la consigna pedía? En T2: ¿obtuvo las informaciones de `requiredMoves`? |
| Pragmático | P2 | **Cohérence et cohésion** | Estructura del discurso, conectores, progresión temática, conclusión |
| Pragmático | P3 | **Interaction** | Toma de turno, relance, reacción a lo imprevisto, capacidad de preguntar (peso alto en T2) |
| Lingüístico | L1 | **Étendue et maîtrise du lexique** | Variedad, precisión, campo léxico del tema, ausencia de calcos |
| Lingüístico | L2 | **Correction grammaticale** | Tiempos, concordancias, preposiciones, estructuras complejas |
| Lingüístico | L3 | **Aisance et fluidité** | Ritmo, silencios, muletillas, autocorrecciones, longitud de los turnos |
| Sociolingüístico | S1 | **Adéquation sociolinguistique** | Registro (tu/vous), fórmulas de cortesía, adecuación al estatus del interlocutor |

**Escala de niveles** (mapeo fijo, usar la misma constante en todo el código):

```ts
const LEVELS = ['A1_non_atteint','A1','A2','B1','B2','C1','C2'] as const; // índices 0..6
```

### 6.2 Rúbrica — descriptores por nivel

El evaluador recibe estos descriptores en el prompt. Son el ancla que impide que el modelo puntúe "por sensación".

**P1 · Réalisation de la tâche**
- A2 (2) — responde parcialmente; en T2 obtiene ≤ 2 informaciones; deja la consigna a medias.
- B1 (3) — cumple lo esencial pero de forma incompleta o desequilibrada; en T2 obtiene 3–4 informaciones, preguntas simples.
- **B2 (4)** — cumple la tarea completa; en T2 obtiene 5+ informaciones con preguntas variadas y reacciona a la complicación; en T3 presenta ventajas, inconvenientes y posición propia.
- C1 (5) — cumple con margen: anticipa, matiza, integra objeciones.

**P2 · Cohérence et cohésion**
- A2 — yuxtaposición de frases, conectores limitados a *et / mais / parce que*.
- B1 — plan perceptible pero con rupturas; repeticiones; conclusión ausente o abrupta.
- **B2** — introducción, desarrollo organizado y conclusión explícita; conectores variados (*d'une part… d'autre part, en revanche, par ailleurs, en somme*); referencias pronominales claras.
- C1 — arquitectura fluida y jerarquizada, transiciones invisibles.

**P3 · Interaction**
- A2 — solo responde; no relanza; depende del examinador.
- B1 — mantiene el intercambio; preguntas mayoritariamente cerradas; reacciona con lentitud a lo imprevisto.
- **B2** — toma iniciativa, reformula, pide precisiones, gestiona la complicación sin bloquearse; alterna preguntas abiertas y cerradas.
- C1 — conduce el intercambio, negocia, se adapta al tono del interlocutor.

**L1 · Étendue et maîtrise du lexique**
- A2 — vocabulario elemental, repetitivo, apoyos en la L1.
- B1 — suficiente para el tema, con perífrasis frecuentes e imprecisiones.
- **B2** — buena extensión sobre el tema; términos precisos; algunos calcos o imprecisiones que **no** dificultan la comprensión.
- C1 — léxico rico, idiomático, control de matices y registro.

**L2 · Correction grammaticale**
- A2 — errores sistemáticos en estructuras básicas.
- B1 — control de estructuras simples; errores frecuentes en tiempos compuestos, preposiciones, pronombres.
- **B2** — buen control general; **errores ocasionales que no provocan malentendidos**; estructuras subordinadas presentes.
- C1 — control constante; errores raros y autocorregidos.

**L3 · Aisance et fluidité**
- A2 — discurso muy fragmentado, pausas largas y frecuentes.
- B1 — pausas perceptibles para buscar palabras; ritmo irregular; turnos cortos.
- **B2** — ritmo regular y sostenido; pausas naturales; **puede hablar 60–90 s seguidos sin quiebre en T3**; muletillas ocasionales.
- C1 — soltura casi natural, sin esfuerzo aparente.

**S1 · Adéquation sociolinguistique**
- A2 — registro único, fórmulas ausentes o inadecuadas.
- B1 — registro globalmente adecuado con deslizamientos (mezcla tu/vous, familiaridad inoportuna).
- **B2** — registro estable y adaptado al estatus del interlocutor durante toda la tarea; fórmulas de cortesía correctas.
- C1 — variación consciente del registro, implícitos culturales bien manejados.

### 6.3 Algoritmo de cálculo (nota /20 + NCLC)

Réplica del procedimiento oficial (§2.4): **dos evaluaciones independientes, tercera en caso de discrepancia**.

```ts
// 1. Dos llamadas INDEPENDIENTES al evaluador, sin que la segunda vea la primera.
//    Misma entrada, temperatura distinta (0.2 y 0.5), y persona distinta:
//    evaluatorA = "correcteur standard", evaluatorB = "correcteur sévère".
// 2. Cada llamada devuelve, POR TAREA, un nivel global (0..6) además de los 7 criterios.
// 3. Discrepancia: si |levelA(task) - levelB(task)| >= 1.5 para cualquier tarea → tercera llamada
//    (temperatura 0.3) y se descarta el valor más extremo.

const CRITERION_WEIGHTS: Record<TaskId, Record<Criterion, number>> = {
  1: { P1:.15, P2:.10, P3:.20, L1:.15, L2:.15, L3:.15, S1:.10 },
  2: { P1:.25, P2:.05, P3:.25, L1:.12, L2:.13, L3:.10, S1:.10 }, // interacción y tarea pesan
  3: { P1:.15, P2:.25, P3:.05, L1:.15, L2:.15, L3:.20, S1:.05 }, // estructura y fluidez pesan
};

const TASK_WEIGHTS: Record<TaskId, number> = { 1: 0.25, 2: 0.35, 3: 0.40 };
// NOTA: la ponderación entre tareas NO es publicada por France Éducation international.
// Estos pesos son una heurística del simulador. Deben estar en un archivo de config,
// documentados como tales, y la UI debe declararlo (§11.5).

function taskScore(c: Record<Criterion, number>, t: TaskId): number {
  return sum(CRITERION_WEIGHTS[t][k] * c[k]);            // 0..6
}

function globalScore(tasks): number {
  return sum(TASK_WEIGHTS[t] * taskScore(t));            // 0..6
}

// Anclas nivel → nota /20, tomadas del centro de cada banda oficial (§2.5)
const ANCHORS = [[0,0],[1,1],[2,3.5],[3,7.5],[4,11.5],[5,15.5],[6,19]];
function toNote20(level: number): number {
  return clamp(round(piecewiseLinear(ANCHORS, level)), 0, 20);
}

function toNclcEo(note: number) {
  if (note >= 16) return { nclc: '10+', cefr: 'C1-C2' };
  if (note >= 14) return { nclc: '9',   cefr: 'C1'   };
  if (note >= 12) return { nclc: '8',   cefr: 'B2'   };
  if (note >= 10) return { nclc: '7',   cefr: 'B2'   };
  return { nclc: '<7', cefr: note >= 6 ? 'B1' : note >= 2 ? 'A2' : 'A1' };
  // TODO verificar tabla IRCC para NCLC 4-6 antes de mostrar un número exacto.
}
```

### 6.4 Reglas de penalización dura

Se aplican **antes** del cálculo y truncan el nivel de la tarea:

| Condición | Efecto |
|---|---|
| Tarea no realizada (0 turnos del candidato) | `taskLevel = 0` (A1 non atteint) |
| Producción fuera de tema durante > 50 % del tiempo | `taskLevel ≤ 1` en esa tarea |
| El candidato solo lee/repite la consigna | `taskLevel ≤ 1` |
| T2 sin ninguna pregunta formulada | `P1 ≤ 1` y `P3 ≤ 1` |
| Tiempo de habla del candidato < 25 % de la duración de la tarea | `L3 ≤ 2` |
| Recurso a otra lengua por más de una palabra aislada | `S1 ≤ 2`, señalarlo explícitamente en el reporte |

### 6.5 Contrato del evaluador (entrada / salida)

**Entrada** (una sola llamada por evaluador, cubre las 3 tareas en `full_exam`):

```json
{
  "mode": "full_exam",
  "target": { "nclc": 7, "note": "10-11", "cefr": "B2" },
  "tasks": [{
    "task": 1,
    "consigne": "...",
    "objective": "...",
    "requiredMoves": ["..."],
    "durationSec": 120,
    "transcript": [{ "role": "examiner", "text": "...", "startMs": 0 }, { "role": "candidate", "text": "...", "startMs": 4200 }],
    "examinerNotes": ["..."],
    "metrics": { "candidateSpeakingSec": 71, "silenceSec": 18, "longestSilenceSec": 7, "wordsPerMinute": 96, "turnCount": 6, "questionsAsked": 0, "fillerCount": 9, "lexicalDiversity": 0.52 },
    "overtimeSeconds": 0
  }],
  "learnerProfile": { /* §7 */ }
}
```

**Salida** — JSON estricto, sin markdown, sin texto fuera del objeto:

```json
{
  "tasks": [{
    "task": 1,
    "criteria": {
      "P1": { "score": 4, "level": "B2", "evidence": "…citation exacte du candidat…", "comment": "…" },
      "P2": { "score": 3.5, "level": "B1", "evidence": "…", "comment": "…" },
      "P3": { "score": 4, "level": "B2", "evidence": "…", "comment": "…" },
      "L1": { "score": 4, "level": "B2", "evidence": "…", "comment": "…" },
      "L2": { "score": 3.5, "level": "B1", "evidence": "…", "comment": "…" },
      "L3": { "score": 3, "level": "B1", "evidence": "…", "comment": "…" },
      "S1": { "score": 4, "level": "B2", "evidence": "…", "comment": "…" }
    },
    "taskLevel": 3.8,
    "penalties": [],
    "errors": [{
      "type": "grammaire|lexique|registre|prononciation|calque|structure",
      "heard": "j'ai allé à la réunion",
      "correction": "je suis allé à la réunion",
      "rule": "Verbes de mouvement → auxiliaire être au passé composé",
      "es": "En español 'he ido' usa haber; en francés 'aller' exige être.",
      "cost": "L2",
      "priority": 1
    }],
    "upgrades": [{
      "said": "c'est bien pour les gens",
      "b2": "cela présente un avantage considérable pour la population",
      "why": "précision lexicale + registre"
    }]
  }],
  "global": {
    "levelScore": 3.9,
    "note20": 11,
    "cefr": "B2",
    "nclc": "7",
    "targetMet": true,
    "gapToTarget": "atteint de justesse — marge de 1 point"
  },
  "synthesis": {
    "strengths": ["…", "…"],
    "topThreeFixes": [{ "what": "…", "why": "…", "drill": "…" }],
    "nextSession": { "recommendedTask": 3, "recommendedCategory": "Environnement", "reason": "…" }
  }
}
```

Reglas para el prompt del evaluador:

- `evidence` **debe ser una cita literal de la transcripción**. Si el modelo no puede citar, baja la confianza y lo declara; nunca inventa.
- Máximo **8 `errors` por tarea**, ordenados por `priority` (1 = cuesta más puntos). Esto evita truncamiento de JSON — mismo problema ya resuelto en *L'Atelier de la copie*.
- Máximo **4 `upgrades` por tarea**.
- `comment` ≤ 220 caracteres.
- Si la transcripción está vacía o es ininteligible → aplicar §6.4 y devolver el JSON igualmente.
- **Reusar la arquitectura de dos llamadas + reparación de JSON** ya probada en el módulo escrito: una llamada para la evaluación (campos cortos, errores acotados) y otra para las reformulaciones B2 y la síntesis. Mantener las capas de fallback: reparación del JSON parcial, visualización en texto plano si es irrecuperable, botón de reintento independiente por llamada.

### 6.6 Advertencia obligatoria en la UI

Toda pantalla de nota debe incluir, discreta pero visible:

> Estimación no oficial. La corrección del TCF la realizan dos evaluadores habilitados por France Éducation international; este simulador reproduce el procedimiento con modelos de lenguaje. Úsalo para medir progresión, no para predecir tu resultado.

---

## 7. Perfil del candidato aplicado al oral

El módulo escrito ya trabaja con un perfil de errores documentado. El evaluador oral debe recibirlo en `learnerProfile` y **vigilarlo específicamente**, sin dejar de evaluar el resto.

Traducción al oral de los patrones conocidos (hispanohablante, objetivo NCLC 7):

| # | Patrón escrito | Manifestación oral a vigilar |
|---|---|---|
| 1 | Calcos sintácticos del español | `content pour` → *content de* ; `venir à + inf.` ; preposiciones no repetidas en coordinaciones ; `pourtant` usado por *donc* |
| 2 | Determinantes ausentes o dobles | Omisión del artículo tras preposición (`en France` vs `dans le pays`), `de le` no contraído oralmente |
| 3 | Género | Concordancia oral de adjetivos y participios (se **oye**: *heureuse*, *grande*, *première*) |
| 4 | Anglicismos y formas híbridas | Inserción de términos ingleses del ámbito profesional (*meeting*, *deadline*, *update*) → exigir *réunion, échéance, mise à jour* |
| 5 | Mezcla tu/vous | Criterio **S1**. En T2 la consigna fija el registro: si dice "Je suis votre ami(e)", el tuteo es lo correcto y lo costoso es deslizarse al *vous* a mitad de conversación (o al revés) |
| 6 | Sub-desarrollo (escribe por debajo del mínimo) | Equivalente oral: **turnos demasiado cortos**. Vigilar `candidateSpeakingSec / durationSec`. En T3 un B2 debe sostener 60–90 s seguidos |

Patrones **específicos del oral** a añadir al perfil (no existían en el escrito):

| Fenómeno | Descripción | Criterio afectado |
|---|---|---|
| `u` / `ou` | *rue / roue*, *dessus / dessous* — contraste ausente en español | L1 (via transcripción errónea) |
| Vocales nasales | *an / on / in* — confusión frecuente | L1 |
| `r` uvular | Realización del /ʁ/ | reportar como observación, sin penalizar salvo pérdida de inteligibilidad |
| Acento tónico | Desplazamiento del acento a la penúltima sílaba (patrón español) | L3 |
| `e` caduco y liaisons | *les amis*, *vous avez* | L3 |
| Muletillas en español | *este…*, *o sea*, *bueno* | S1 + L3 |

> Limitación honesta a implementar: la pronunciación **no se mide acústicamente** en v1. Se infiere de (a) los errores de transcripción del STT, (b) el juicio del modelo sobre la transcripción, (c) las métricas de ritmo. El reporte debe decirlo así, en lugar de fingir un análisis fonético.

---

## 8. Catálogo de ejercicios a simular

Nomenclatura de IDs: `T{tarea}-{CAT}-{nn}` — ej. `T2-LOG-03`.
Los marcados **[QS]** forman el *Quick Set* (núcleo memorizable). El resto entra en *Full Coverage*.

### 8.1 Tâche 1 — Entretien dirigé (20 archetypes · 2:00 · sin preparación)

Formato de la consigna: una pregunta de apertura + cadena de relances. El examinador **no la lee entera**; la usa como guion.

| ID | Tema | Question d'ouverture | Cadena de relances (présent → passé → projet) |
|---|---|---|---|
| T1-IDE-01 **[QS]** | Présentation | Bonjour, présentez-vous en quelques mots. | D'où venez-vous ? · Depuis quand êtes-vous au Canada ? · Qu'est-ce qui a été le plus difficile à votre arrivée ? · Où vous voyez-vous dans cinq ans ? |
| T1-TRA-02 **[QS]** | Travail | Parlez-moi de votre travail actuel. | En quoi consiste une journée typique ? · Qu'est-ce qui vous plaît le moins ? · Racontez-moi un projet difficile · Aimeriez-vous changer de métier ? |
| T1-ETU-03 **[QS]** | Études / formation | Quelles études avez-vous faites ? | Pourquoi ce domaine ? · Qu'est-ce qui vous a marqué ? · Suivez-vous encore des formations ? · Conseilleriez-vous ce parcours ? |
| T1-LOG-04 **[QS]** | Logement | Où habitez-vous exactement ? | Décrivez votre quartier · Qu'est-ce qui vous manque là où vous vivez ? · Avez-vous déjà déménagé ? Racontez · Où aimeriez-vous vivre plus tard ? |
| T1-FAM-05 **[QS]** | Famille | Parlez-moi de votre famille. | Qui vous est le plus proche ? · Comment gardez-vous le contact ? · Une tradition familiale importante ? · Comment imaginez-vous votre famille dans dix ans ? |
| T1-LOI-06 **[QS]** | Loisirs | Que faites-vous de votre temps libre ? | Depuis quand ? · Racontez la dernière fois · Pourquoi cette activité et pas une autre ? · Y a-t-il un loisir que vous aimeriez commencer ? |
| T1-VOY-07 **[QS]** | Voyages | Aimez-vous voyager ? | Quel a été votre plus beau voyage ? · Un voyage qui a mal tourné ? · Préférez-vous partir seul ou accompagné ? · Prochaine destination ? |
| T1-ALI-08 | Alimentation | Qu'est-ce que vous aimez manger ? | Cuisinez-vous ? · Un plat de votre pays à me décrire · Vos habitudes ont-elles changé au Canada ? · Mangeriez-vous différemment si vous aviez plus de temps ? |
| T1-SPO-09 | Sport / santé | Faites-vous du sport ? | À quelle fréquence ? · Qu'est-ce qui vous empêche d'en faire plus ? · Racontez une blessure ou un abandon · Quel objectif physique aimeriez-vous atteindre ? |
| T1-VIL-10 | Ville / région | Décrivez la ville où vous vivez. | Les avantages ? Les inconvénients ? · Qu'est-ce qui a changé depuis votre arrivée ? · Comparez-la avec votre ville d'origine · Que faudrait-il améliorer ? |
| T1-TEC-11 | Technologies | Quel usage faites-vous d'Internet ? | Quelles applications au quotidien ? · Comment faisiez-vous avant ? · Y a-t-il des usages qui vous dérangent ? · Réduiriez-vous votre temps d'écran ? |
| T1-TRP-12 | Transports | Comment vous déplacez-vous ? | Combien de temps de trajet ? · Un incident de transport à raconter · Les transports ici vs chez vous · Achèteriez-vous une voiture électrique ? |
| T1-LAN-13 **[QS]** | Langues | Quelles langues parlez-vous ? | Comment avez-vous appris le français ? · Quel a été l'obstacle principal ? · Dans quelles situations vous sentez-vous bloqué ? · Quelle langue aimeriez-vous apprendre ? |
| T1-MET-14 | Saisons / climat | Comment trouvez-vous le climat d'ici ? | Votre saison préférée et pourquoi · Racontez votre premier hiver · Comment vous adaptez-vous ? · Déménageriez-vous pour le climat ? |
| T1-CUL-15 | Culture / lectures | Quel type de films ou de livres aimez-vous ? | Le dernier que vous avez vu ou lu ? · Racontez-en l'histoire brièvement · Qu'est-ce qui vous a plu ou déplu ? · Que recommanderiez-vous ? |
| T1-ARG-16 | Achats / argent | Comment faites-vous vos courses ? | En ligne ou en magasin ? Pourquoi ? · Un achat que vous regrettez · Avez-vous changé vos habitudes de consommation ? · Comment gérez-vous un budget ? |
| T1-AMI-17 | Amis / vie sociale | Parlez-moi de vos amis ici. | Comment les avez-vous rencontrés ? · Qu'est-ce qui est difficile pour se faire des amis dans un nouveau pays ? · Racontez une sortie récente · Que feriez-vous pour élargir votre cercle ? |
| T1-PRO-18 | Projets | Quels sont vos projets pour l'année prochaine ? | Pourquoi celui-là en priorité ? · Qu'avez-vous déjà entrepris ? · Quels obstacles prévoyez-vous ? · Et si cela ne marchait pas ? |
| T1-RUT-19 | Routine | Décrivez une journée typique. | Qu'est-ce qui vous prend le plus de temps ? · Comment était votre routine avant ? · Que changeriez-vous ? · Êtes-vous plutôt du matin ou du soir ? |
| T1-BEN-20 | Engagement / bénévolat | Avez-vous déjà fait du bénévolat ? | Qu'est-ce qui vous motiverait ? · Racontez une expérience d'entraide · Les gens s'entraident-ils assez ? · Vous engageriez-vous dans une association ? |

### 8.2 Tâche 2 — Exercice en interaction (24 archetypes · 2:00 prep + 3:30)

Cada ficha necesita: rol del examinador, rol del candidato, `sceneFacts`, `complication` y `requiredMoves`. Abajo van la consigna y las informaciones que el candidato debe obtener; los `sceneFacts` los genera el implementador siguiendo el patrón del ejemplo desarrollado.

| ID | Categoría | Consigne | requiredMoves (a obtener) |
|---|---|---|---|
| T2-BEN-01 **[QS]** | Community / Volunteering | Je suis votre ami(e). Je travaille dans une association canadienne qui aide les personnes âgées. Vous êtes intéressé(e). Vous me posez des questions (actions, adhérents, financements, etc.). | actions concrètes · profil des bénévoles · horaires · formation requise · financement · comment s'inscrire |
| T2-CUL-02 **[QS]** | Culture / Lecture | Je suis un(e) ami(e) francophone. Vous devez écrire un article pour présenter un livre dans la revue de votre association littéraire. Vous cherchez des idées. Vous m'interrogez sur mes lectures récentes. | titre et auteur · genre · intrigue · pourquoi ça m'a plu · public visé · disponibilité |
| T2-LOG-03 **[QS]** | Logement | Je suis propriétaire d'un appartement à louer. Vous cherchez un logement. Vous me posez des questions pour décider. | loyer et charges · superficie · quartier et transports · durée du bail · meublé ou non · conditions de visite |
| T2-EMP-04 **[QS]** | Emploi | Je suis un(e) collègue qui travaille dans l'entreprise qui vous intéresse. Vous voulez postuler. Vous m'interrogez. | poste et missions · équipe · horaires · télétravail · salaire approximatif · processus de candidature |
| T2-FOR-05 **[QS]** | Formation | Je suis conseiller(ère) dans un centre de formation. Vous voulez suivre un cours de français. Vous vous renseignez. | niveaux proposés · horaires · durée · tarif · certification · prérequis |
| T2-SAN-06 | Santé / services | Je travaille à l'accueil d'une clinique. Vous venez d'arriver dans la ville et cherchez un médecin de famille. | inscription · délais · documents requis · couverture · urgences · services offerts |
| T2-ADM-07 | Démarches administratives | Je suis agent(e) d'un service municipal. Vous devez faire une demande de permis. Vous vous informez sur la procédure. | formulaires · pièces à fournir · délai · coût · lieu de dépôt · recours en cas de refus |
| T2-SPO-08 | Sport / loisirs | Je suis responsable d'un centre sportif. Vous voulez vous inscrire. Vous posez vos questions. | activités · abonnements et tarifs · horaires · matériel fourni · essai gratuit · résiliation |
| T2-VOY-09 **[QS]** | Voyage | Je suis agent(e) de voyages. Vous préparez un séjour d'une semaine. Vous vous renseignez. | destinations possibles · prix · transport inclus · hébergement · assurance · annulation |
| T2-TRA-10 | Transport | Je travaille pour la société de transport de la ville. Vous venez d'emménager. Vous m'interrogez sur les abonnements. | lignes · fréquence · tarifs et abonnements · rabais étudiants ou aînés · application · service de nuit |
| T2-ECO-11 | Commerce / achat | Je suis vendeur(se) dans un magasin d'électroménager. Vous voulez acheter un appareil. Vous m'interrogez avant de décider. | modèles · prix · garantie · livraison · installation · retour |
| T2-RES-12 | Restauration | Je suis gérant(e) d'un restaurant. Vous voulez y organiser un repas de groupe. Vous vous renseignez. | capacité · menus · prix par personne · réservation · options alimentaires · salle privée |
| T2-VOI-13 | Voisinage | Je suis votre nouveau/nouvelle voisin(e). Vous venez d'emménager dans l'immeuble. Vous me posez des questions sur le quartier. | commerces · transports · sécurité · règles de l'immeuble · vie de quartier · services utiles |
| T2-ENF-14 | Famille / enfants | Je travaille dans une garderie. Vous cherchez une place pour votre enfant. Vous vous informez. | places disponibles · horaires · tarifs · programme éducatif · repas · liste d'attente |
| T2-ENV-15 | Environnement | Je suis membre d'un collectif écologiste local. Vous voulez participer à une action. Vous m'interrogez. | actions menées · fréquence des réunions · engagement demandé · résultats obtenus · financement · comment rejoindre |
| T2-TEC-16 | Technologie / service | Je travaille au service client d'un fournisseur Internet. Vous voulez souscrire un abonnement. | forfaits · débit · prix et frais d'installation · durée d'engagement · équipement · assistance |
| T2-BAN-17 | Services financiers | Je suis conseiller(ère) dans une institution financière. Vous venez ouvrir un compte. Vous vous renseignez. | types de comptes · frais · documents requis · accès en ligne · dépôt minimum · délais |
| T2-EVE-18 | Événement | Je suis organisateur(trice) d'un festival local. Vous voulez y tenir un stand. Vous m'interrogez. | dates · coût du stand · public attendu · installation · règles · inscription |
| T2-COL-19 **[QS]** | Travail / collègue | Je suis votre collègue. Vous devez me remplacer pendant mes vacances. Vous me posez des questions pour reprendre mes dossiers. | dossiers en cours · priorités · contacts · outils · échéances · qui contacter en cas de problème |
| T2-ETU-20 | Études | Je suis étudiant(e) dans l'université qui vous intéresse. Vous envisagez de vous y inscrire. | programmes · charge de travail · coût · logement étudiant · vie sur le campus · admission |
| T2-BEN-21 | Entraide | Je suis votre ami(e). J'ai déménagé récemment. Vous voulez m'aider et vous vous informez sur ce dont j'ai besoin. | ce qui reste à faire · date · matériel · nombre de personnes · horaires · ce que je ne veux pas déléguer |
| T2-ASS-22 | Assurance | Je suis courtier(ère) en assurances. Vous cherchez une assurance habitation. Vous vous renseignez. | couvertures · prix · franchise · exclusions · déclaration de sinistre · réductions |
| T2-EMP-23 | Entretien inversé | Je suis recruteur(se). L'entretien est terminé et c'est à vous de poser vos questions. | rôle exact · équipe · évaluation de la performance · évolution · culture d'entreprise · prochaines étapes |
| T2-LOI-24 | Cours / atelier | Je donne un atelier de cuisine. Vous voulez vous inscrire avec un(e) ami(e). | contenu · niveau requis · dates · tarif de groupe · matériel fourni · annulation |

**Ejemplo desarrollado — `T2-LOG-03`** (usar como plantilla para las 23 restantes):

```json
{
  "id": "T2-LOG-03",
  "examinerRole": "Propriétaire d'un 4½ à louer à Cornwall, ton courtois mais pressé",
  "candidateRole": "Personne à la recherche d'un logement pour le 1er du mois prochain",
  "sceneFacts": [
    "Loyer : 1 250 $ par mois, chauffage et eau chaude inclus, électricité à part",
    "4½ au deuxième étage, environ 75 m², deux chambres",
    "Quartier calme, arrêt d'autobus à 200 mètres, épicerie à 10 minutes à pied",
    "Bail de 12 mois, début le 1er du mois prochain",
    "Non meublé, électroménagers fournis (cuisinière et réfrigérateur)",
    "Stationnement extérieur : 40 $ de plus par mois",
    "Animaux : chats acceptés, chiens non",
    "Visites possibles en soirée seulement, en semaine"
  ],
  "complication": "À mi-parcours, préciser qu'une autre personne a déjà visité et doit répondre sous 48 heures — obliger le candidat à réagir, à négocier ou à se positionner rapidement.",
  "requiredMoves": ["loyer et charges incluses", "superficie et nombre de pièces", "quartier et transports", "durée du bail et date d'entrée", "meublé / électroménagers", "conditions de visite"],
  "lexicalField": ["le bail", "les charges", "un dépôt de garantie", "meublé", "les électroménagers", "la superficie", "un préavis", "le stationnement", "emménager", "visiter le logement", "le voisinage", "les frais"]
}
```

### 8.3 Tâche 3 — Expression d'un point de vue (28 archetypes · 4:30 · sin preparación)

Todas se formulan como **una pregunta cerrada de opinión** que obliga a pros, contras y posición personal.

| ID | Familia | Question |
|---|---|---|
| T3-TEC-01 **[QS]** | Technologie | Les réseaux sociaux rapprochent-ils vraiment les gens ? |
| T3-TEC-02 | Technologie | Faut-il limiter le temps d'écran des enfants ? Pourquoi ? |
| T3-TEC-03 | Technologie | L'intelligence artificielle va-t-elle détruire plus d'emplois qu'elle n'en crée ? |
| T3-TRA-04 **[QS]** | Travail | Le télétravail est-il une bonne chose pour les employés et pour les entreprises ? |
| T3-TRA-05 | Travail | Faut-il travailler quatre jours par semaine ? |
| T3-TRA-06 | Travail | Est-il préférable de faire carrière dans une seule entreprise ou de changer souvent ? |
| T3-ENV-07 **[QS]** | Environnement | Est-ce aux citoyens ou aux gouvernements de résoudre la crise climatique ? |
| T3-ENV-08 | Environnement | Faut-il interdire les vols intérieurs courts quand le train existe ? |
| T3-ENV-09 **[QS]** | Consommation | Pensez-vous que les gens achètent trop aujourd'hui ? Pourquoi ? |
| T3-ENV-10 | Consommation | Les achats en ligne sont-ils une bonne chose pour les villes ? |
| T3-EDU-11 **[QS]** | Éducation | Les examens sont-ils un bon moyen d'évaluer les élèves ? |
| T3-EDU-12 | Éducation | Faut-il rendre l'apprentissage d'une deuxième langue obligatoire ? |
| T3-EDU-13 | Éducation | Les études universitaires garantissent-elles un bon emploi ? |
| T3-SAN-14 | Santé | Faut-il taxer davantage les produits sucrés pour protéger la santé publique ? |
| T3-SAN-15 | Santé | Le sport devrait-il être obligatoire sur le lieu de travail ? |
| T3-IMM-16 **[QS]** | Immigration / société | L'immigration est-elle une chance pour un pays comme le Canada ? |
| T3-IMM-17 | Immigration / société | Faut-il exiger la maîtrise de la langue avant l'arrivée des nouveaux arrivants ? |
| T3-VIL-18 | Ville / logement | Faut-il limiter la construction de tours d'habitation dans les villes ? |
| T3-VIL-19 | Ville / transport | La voiture individuelle a-t-elle encore sa place en ville ? |
| T3-FAM-20 **[QS]** | Famille | Est-il préférable d'élever ses enfants en ville ou à la campagne ? |
| T3-FAM-21 | Famille | Les grands-parents devraient-ils s'occuper des petits-enfants ? |
| T3-CUL-22 | Culture | Les musées et les spectacles devraient-ils être gratuits ? |
| T3-CUL-23 | Culture | La lecture est-elle en train de disparaître ? |
| T3-MED-24 **[QS]** | Médias | Peut-on encore faire confiance à l'information aujourd'hui ? |
| T3-MED-25 | Médias | Faut-il réglementer la publicité destinée aux enfants ? |
| T3-ARG-26 | Argent / société | Faut-il un revenu minimum garanti pour tous ? |
| T3-LOI-27 | Loisirs / société | Le bénévolat devrait-il être encouragé par des avantages fiscaux ? |
| T3-TRA-28 | Société | Les gens sont-ils moins solidaires qu'avant ? |

Cada ficha de T3 debe incluir además, para el modo estudio (nunca durante la simulación):
`argumentsPour` (3), `argumentsContre` (3), `exemplesConcrets` (2), `connecteurs` (6 del banco §14.1), `plan` (esquema en 4 tiempos).

---

## 9. Pipeline de audio

Interfaces abstractas, implementación intercambiable. Nada del código del módulo debe depender de un proveedor concreto.

```ts
interface SttProvider {
  startStreaming(onPartial: (t: string) => void): Promise<void>;
  stop(): Promise<{ finalText: string; audioBlob: Blob; wordTimings?: WordTiming[] }>;
}
interface TtsProvider {
  speak(text: string, opts: { lang: 'fr-CA' | 'fr-FR'; rate: number }): Promise<void>;
  cancel(): void;
}
```

Requisitos:

- **Transcripción en vivo durante la grabación, refinada al detener** — este comportamiento ya existe y debe conservarse. La transcripción parcial alimenta la UI; la final alimenta la evaluación.
- **Voz del examinador en francés**. Ofrecer `fr-CA` por defecto (es el examen canadiense) con opción `fr-FR`. Velocidad 1.0; no ralentizar: el candidato debe entrenarse al ritmo real.
- **Barge-in**: si el candidato empieza a hablar mientras el examinador habla, cortar el TTS. Es lo que pasa en una conversación real y su gestión forma parte de P3.
- **Detección de fin de turno**: silencio de 1.8 s → se cierra el turno del candidato. Configurable; no bajar de 1.5 s (un B1 hace pausas largas legítimas y cortarlo falsea la medida).
- **Latencia objetivo entre fin del turno del candidato e inicio del TTS del examinador: < 1.5 s.** Por encima de 2.5 s la conversación deja de sentirse real. Estrategias: streaming del turno del examinador, TTS por frases, prefetch de las relances estáticas.
- **Audio persistido** por turno (`audioUrl`) para permitir la reescucha en el reporte. Es la función de estudio más valiosa: oírse a uno mismo.
- Degradación: si el STT falla, el modo `conversation` pasa a entrada de texto y lo anuncia; la sesión no se pierde ni se cobran créditos de IA.

---

## 10. Créditos

Coherente con el esquema ya visible (`1 crédit = 1 Standard session · 3 crédits = 1 AI session`):

| Modo | Costo | Regla |
|---|---|---|
| `drill_text` | 0 | libre |
| `drill_voice` | 1 | se descuenta al iniciar la grabación |
| `conversation` | 3 | se descuenta al primer turno del examinador |
| `full_exam` | 6 | descuento único al inicio; reembolso íntegro si la sesión falla antes de la Tâche 2 |
| `review` | 0 | ilimitado |
| Re-evaluación de una sesión existente | 1 | máximo 2 por sesión |

Antes de un `full_exam`, mostrar una confirmación con: duración (12 min sin pausa), costo, y aviso de que no se puede pausar.

---

## 11. Especificación de UI

### 11.1 `/speaking` (existente — extender)

- Añadir la pestaña **Task 1** junto a All / Task 2 / Task 3; la línea de conteo pasa a `72 archetypes · 20 Task 1 · 24 Task 2 · 28 Task 3`.
- Añadir un botón primario destacado: **« Simulation complète · 12 min »** → `/speaking/exam`.
- En cada tarjeta, mostrar la duración correcta por tarea (2:00 / 3:30 / 4:30) y, si existe una sesión previa, el último nivel obtenido como chip (`B1+`, `B2`).
- El filtro `Done / Not done` debe basarse en sesiones evaluadas, no en visitas.

### 11.2 `/speaking/[promptId]` (existente — extender)

Modo estudio. Conservar consigna, traducción y cheat sheet. Añadir:
- `lexicalField` en fichas desplegables;
- para T3: el plan en 4 tiempos y los argumentos pour/contre;
- para T2: la lista de `requiredMoves` visible **antes** de empezar (en estudio sí; en examen no);
- tres botones de lanzamiento: *S'entraîner à l'écrit* (0), *Enregistrement libre* (1), *Conversation avec l'examinateur* (3).

### 11.3 Sala de conversación `/speaking/[promptId]/session`

Layout sobrio, una sola columna, sin distracciones:

- arriba: chip de tarea, **cronómetro regresivo grande**, barra de progreso de la tarea;
- centro: transcripción en curso en dos colores (examinador / candidato), auto-scroll;
- estado del examinador visible: `écoute` · `réfléchit` · `parle`;
- botón único de micrófono, grande, al centro inferior;
- durante `PREPARING` (T2): reemplazar todo por la consigna + bloc de notas + cronómetro de 2:00;
- **nada de feedback en vivo**: ni colores de error, ni sugerencias, ni contadores de palabras. Introduce un comportamiento que no existe en el examen.
- botón `Abandonner` siempre disponible, con confirmación; la sesión abandonada se guarda y se evalúa igual, marcada como incompleta.

### 11.4 Reporte `/speaking/session/[sessionId]`

Orden de lectura, de arriba a abajo:

1. **Nota global**: `11/20 · B2 · NCLC 7` con el objetivo al lado y la distancia (`objectif atteint` / `il manque 2 points`). Mismo componente visual que Expression écrite.
2. **Radar de los 7 criterios** con la línea del umbral B2 superpuesta.
3. **Por tarea**: nivel, tiempo de habla del candidato vs. total, número de preguntas (T2), silencio más largo.
4. **Transcripción anotada**: el texto del candidato con los errores marcados en el margen (reutilizar el patrón de anotaciones al margen de *L'Atelier de la copie*), cada uno con regla + glosa en español, y reproductor de audio por turno.
5. **Reformulaciones B2** (`upgrades`): lo que dijo → cómo lo diría un B2 → por qué.
6. **Les trois choses à corriger** — exactamente tres, priorizadas, cada una con un ejercicio concreto.
7. **Próxima sesión recomendada** con botón directo al archetype sugerido.

### 11.5 Transparencia

En el reporte, un bloque plegable **« Comment cette note est calculée »** que exponga: los 7 criterios, los pesos por tarea, los pesos entre tareas, el hecho de que la ponderación entre tareas es una heurística del simulador y no un dato publicado, y el texto de la §6.6.

### 11.6 Historial `/speaking/history`

Tabla de sesiones (fecha, modo, tarea(s), nota, NCLC) + gráfico de evolución de `note20` con la línea de objetivo en 10. Bajo el gráfico, la evolución por criterio para detectar cuál está frenando la nota.

---

## 12. Plan de implementación por fases

Cada fase termina en un estado desplegable y probado.

**Fase 1 — Datos y contenido** (sin IA)
Esquema `Archetype` extendido · seed de los 20 archetypes de T1 · enriquecimiento de los 24 de T2 con `examinerRole`, `candidateRole`, `sceneFacts`, `complication`, `requiredMoves` · enriquecimiento de los 28 de T3 con plan y argumentos · corrección de las duraciones · filtro Task 1 en la UI.
*Terminado cuando:* los 72 archetypes se listan y filtran correctamente con sus duraciones reales.

**Fase 2 — Máquina de estados y cronómetros**
Reducer de sesión · fase `PREPARING` de T2 con bloc de notas · cronómetros por tarea · encadenamiento `full_exam` · persistencia de `EoSession` y `EoTaskRun`. Sin IA todavía: el examinador reproduce turnos estáticos desde `relances`.
*Terminado cuando:* se puede correr un examen completo de 12 min de principio a fin con un examinador guionado, y la sesión queda guardada.

**Fase 3 — Examinador IA**
Los tres system prompts (§5.2–5.4) · gestión de turnos, silencios y barge-in · `internalNote` persistida · límites de longitud de turno.
*Terminado cuando:* una conversación de T2 completa produce un diálogo coherente donde el examinador nunca regala información ni corrige.

**Fase 4 — Evaluación y puntuación**
`SpeechMetrics` calculadas en código · doble evaluación independiente + desempate · algoritmo `toNote20` / `toNclcEo` con tests unitarios sobre casos anclados · penalizaciones duras · reparación de JSON y fallbacks.
*Terminado cuando:* los tests de anclaje (§13) pasan y una transcripción vacía produce un reporte válido en lugar de un error.

**Fase 5 — Reporte y progresión**
Pantalla de reporte completa · transcripción anotada con audio por turno · historial y curvas · bloque de transparencia.

**Fase 6 — Pulido**
Latencia < 1.5 s · voz `fr-CA` · atajos de teclado · accesibilidad (la sala debe ser utilizable solo con teclado) · estados de error legibles.

---

## 13. Criterios de aceptación y QA

**Tests unitarios del cálculo** (obligatorios, valores anclados):

| Caso | Entrada | Salida esperada |
|---|---|---|
| Todos los criterios en B2 (4.0) | `levelScore = 4.0` | `note20 = 11`, `B2`, `NCLC 7` |
| Todos en B1 (3.0) | `levelScore = 3.0` | `note20 = 8`, `B1`, `NCLC < 7` |
| Todos en C1 (5.0) | `levelScore = 5.0` | `note20 = 15`, `C1`, `NCLC 9` |
| Tarea 2 no realizada | `taskLevel(2) = 0` | nota global baja al menos 1.4 puntos de nivel ponderado |
| Transcripción vacía | sin turnos del candidato | reporte válido, `A1 non atteint`, sin excepción no capturada |

**Tests de comportamiento del examinador** (revisión manual sobre 5 sesiones grabadas por tarea):

- T1: nunca hace dos preguntas en el mismo turno; siempre rebota sobre la respuesta anterior.
- T2: no entrega ninguna información de `sceneFacts` que no haya sido preguntada; introduce la complicación entre 1:30 y 2:00.
- T3: habla menos del 15 % del tiempo total de la tarea.
- Las tres: cero correcciones lingüísticas, cero traducciones, cero español.

**Tests de fiabilidad de la nota:** correr la misma transcripción 5 veces por el evaluador. **Desviación estándar de `note20` ≤ 1.0.** Si es mayor, bajar la temperatura y reforzar los descriptores de la rúbrica antes de seguir.

**Test de coherencia entre módulos:** un texto escrito evaluado en 11/20 por *L'Atelier de la copie* y una prestación oral equivalente deben caer en la misma banda. Si divergen sistemáticamente, están mal calibradas las anclas.

---

## 14. Anexos

### 14.1 Banco de conectores y fórmulas (para cheat sheets y campo léxico)

**Structurer (T3)** — D'abord / Tout d'abord · Ensuite · Par ailleurs · De plus · En revanche · Cependant · D'une part… d'autre part · Néanmoins · En somme · Pour conclure · En définitive

**Nuancer** — Il est vrai que… mais · Dans une certaine mesure · Cela dépend largement de · Il ne faut pas généraliser · À première vue… en réalité

**Donner son avis** — À mon sens · Selon moi · J'ai tendance à penser que · Je suis convaincu(e) que · Je ne partage pas cet avis · Il me semble que

**Illustrer** — Prenons l'exemple de · Je pense notamment à · Concrètement · C'est le cas de · Pour illustrer mon propos

**Poser des questions (T2)** — Pourriez-vous me préciser…? · J'aimerais savoir si… · Qu'en est-il de…? · Est-ce qu'il serait possible de…? · Auriez-vous un exemple? · Comment cela fonctionne-t-il exactement? · Et dans le cas où…?

**Gagner du temps sans silence** — C'est une bonne question · Si je comprends bien votre question… · Laissez-moi réfléchir un instant · Ce que je peux dire, c'est que…

**Reprendre / recentrer** — Pour en revenir à ce que je disais · J'aimerais ajouter un mot sur… · Si je peux me permettre · Revenons à la question

**Réagir à une complication (T2)** — Ah, je ne m'attendais pas à cela · Dans ce cas, est-ce qu'il serait envisageable de…? · Cela pose un problème pour moi, parce que… · Y aurait-il une autre solution?

### 14.2 Plan en cuatro tiempos de la Tâche 3 (a memorizar)

1. **Reformulation + annonce** (~20 s) — « La question de X se pose de plus en plus aujourd'hui. Je vais d'abord présenter les avantages, puis les limites, avant de donner mon opinion. »
2. **Arguments POUR** (~90 s) — 2 argumentos, cada uno con ejemplo concreto.
3. **Arguments CONTRE** (~90 s) — 2 argumentos, cada uno con ejemplo concreto.
4. **Position personnelle + conclusion** (~60 s) — posición clara, matizada, sin repetir.

Regla de oro para el candidato: **un argumento sin ejemplo concreto vale B1; con ejemplo concreto vale B2.**

### 14.3 Estructura de la Tâche 2 (a memorizar)

1. **Ouverture** (15 s) — saludo + anuncio del objetivo: « Bonjour, je viens me renseigner au sujet de… »
2. **Questions factuelles** (60 s) — 3 preguntas cerradas rápidas para fijar el marco (precio, horario, condiciones).
3. **Questions d'approfondissement** (60 s) — 2 preguntas abiertas (« Comment cela se passe-t-il concrètement ? »).
4. **Gestion de la complication** (45 s) — reaccionar, negociar, proponer alternativa.
5. **Récapitulation + clôture** (30 s) — « Si je résume : … C'est bien cela ? Je vous remercie. »

**Contar las preguntas es el reflejo a instalar: menos de 6 preguntas en 3 min 30 = tarea no cumplida.**

### 14.4 Errores fatales a señalar siempre en el reporte

- Responder en T2 en lugar de preguntar.
- Salirse del tema en T3 (hablar de un tema vecino pero no de la pregunta).
- Recitar un discurso memorizado que no responde a la relance del examinador.
- Cambiar de registro a mitad de tarea.
- Terminar T3 sin conclusión explícita.
- Hablar menos del 25 % del tiempo disponible.
