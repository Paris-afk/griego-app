# Catálogo de ejercicios

> Ver [ARCHITECTURE.md](./ARCHITECTURE.md) §5 para el contrato técnico, [SCREENS.md](./SCREENS.md) para el sistema de diseño y [CURRICULUM.md](./CURRICULUM.md) §4 para la pedagogía contrastiva que justifica qué se entrena.

---

## 1. El problema que resuelve este documento

Duolingo tiene muchos tipos de ejercicio y aun así se siente vacío: **aprietas sin saber por qué**. Practicas veinte frases y nunca te dicen qué regla estabas practicando. Cuando fallas, no sabes si fue despiste o si no entendiste algo.

Eso no se arregla con más tipos de ejercicio. Se arregla con **estructura**: cada lección enseña una idea concreta, la práctica entrena esa idea, y la regla queda accesible mientras juegas.

Este documento define las dos cosas: **la estructura de la lección** (§2) y **el catálogo de tipos** (§3).

---

## 2. Estructura de una lección: Regla → Práctica → Consolidación

Toda lección tiene tres tiempos. **El primero no es un ejercicio.**

```
┌─────────────────────────────────────────┐
│  1. REGLA          ~30 s, no puntúa      │
│     Qué vas a aprender y por qué          │
│     Un solo tipo: `concept`               │
├─────────────────────────────────────────┤
│  2. PRÁCTICA       6-9 ejercicios         │
│     De reconocer → clasificar → producir  │
├─────────────────────────────────────────┤
│  3. CONSOLIDACIÓN  1-2 ejercicios         │
│     Juego que mezcla todo lo de la lección│
└─────────────────────────────────────────┘
```

**La regla sigue accesible durante toda la lección.** En la cabecera, junto a la barra de progreso, un botón **`¿por qué?`** reabre la tarjeta de concepto sin perder el progreso. Es la diferencia concreta con Duolingo: en cualquier momento puedes recordar qué estás practicando.

**Progresión de dificultad dentro de la práctica** — no es decorativa, es el orden en que se aprende:

| Nivel | Qué se te pide | Tipos |
|---|---|---|
| **Reconocer** | Elegir entre opciones dadas | `multiple_choice` · `listen_choose` · `match_pairs` |
| **Clasificar** | Aplicar una regla, no recordar una palabra | `gender_sort` · `case_pairs` |
| **Producir** | Generarlo tú | `autocomplete` · `letter_tiles` · `translation` · `dictation` |
| **Consolidar** | Recuperar bajo presión o de memoria | `memory_grid` · `speed_round` |

Una lección **no puede** ser solo de un nivel. Mínimo: reconocer + producir. Ideal: los cuatro.

---

## 3. Catálogo de tipos

Los ✅ ya existen. Los 🆕 son los que faltan. **Ninguno requiere contenido nuevo** — todos se alimentan de los CSV y los 236 audios que ya están en el repo.

### 3.1 REGLA

#### 🆕 `concept` — la tarjeta de regla
**Qué es:** una pantalla, no un ejercicio. No puntúa y no se puede fallar.
**Qué muestra:** el título de lo que vas a aprender, 2-3 frases explicándolo, y — cuando existe — **el puente contrastivo con el español**.

```
┌──────────────────────────────────┐
│  ANTES DE EMPEZAR                │
│                                  │
│  Tres letras, un solo sonido     │
│                                  │
│  η, ι y υ suenan las tres /i/.   │
│  Pronunciarlas es fácil; lo      │
│  difícil es recordar cuál lleva  │
│  cada palabra.                   │
│                                  │
│  ┌────────────────────────────┐  │
│  │ 🇪🇸 En español no te pasa   │  │
│  │ esto: cada letra suena de   │  │
│  │ una forma. Aquí hay que     │  │
│  │ memorizar la palabra entera.│  │
│  └────────────────────────────┘  │
│                                  │
│  [       Empezar        ]        │
└──────────────────────────────────┘
```

**De dónde salen los datos:** el bloque contrastivo es el campo `bridge_language` de [`content/contrastive-es-el.csv`](./content/contrastive-es-el.csv) — ya escrito, 13 notas. El texto principal viene de un campo nuevo por lección en el contenido.
**Móvil:** una tarjeta a pantalla completa, CTA abajo en la zona del pulgar.

---

### 3.2 RECONOCER

#### ✅ `multiple_choice`
Existe. Palabra ↔ traducción ↔ imagen. Se mantiene como está.

#### 🆕 `listen_choose` — oír y elegir
**Qué entrena:** discriminación auditiva. Es el primer tipo que usa el audio para *evaluar*, no solo para acompañar.
**Cómo funciona:** suena el audio (sin texto), se eligen 4 opciones escritas.
**Por qué importa para ti:** las opciones se generan **con distractores que suenan igual**. Si la respuesta es `νησί`, las opciones incluyen `νισί` y `νηση`. Eso obliga a decidir entre η/ι/υ, que es tu error nº1 según [`contrastive-es-el.csv`](./content/contrastive-es-el.csv) (`confusion_i`).
**Datos:** los 236 mp3 + el vocabulario.
**Móvil:** botón grande de reproducir arriba (rejugable), 4 opciones de 56px abajo.

#### 🆕 `match_pairs` — unir parejas
**Qué entrena:** asociación rápida. Es el tipo más satisfactorio de jugar y el más barato de construir.
**Cómo funciona:** dos columnas de 5 tarjetas — griego a la izquierda, español a la derecha, desordenadas. Tocas una de cada lado; si coinciden, desaparecen con un sonido; si no, parpadean y vuelven.
**Móvil — importante:** **se toca, no se arrastra.** El drag-and-drop es incómodo con el pulgar y se pelea con el scroll. Tocar-tocar es preciso y funciona con una mano.
**Datos:** cualquier grupo de 5 entradas del mismo `categoria`.
**Validación:** determinista, sin ambigüedad.

---

### 3.3 CLASIFICAR *(el nivel que Duolingo casi no tiene)*

Aquí no recuerdas una palabra: **aplicas una regla**. Es donde se nota que entendiste.

#### 🆕 `gender_sort` — el género en tres botones
**Qué entrena:** el género gramatical, que es el punto nº1 de la gramática griega y la mitad del [CURRICULUM.md](./CURRICULUM.md) §4 para un hispanohablante: ya sabes concordar, **la novedad es el neutro**.
**Cómo funciona:** aparece una palabra sin artículo; eliges entre tres botones grandes: **ο · η · το**. Siguiente palabra. 8-10 seguidas, rápido.
**Móvil:** tres botones al ancho completo en la zona del pulgar. **Nada de arrastrar a columnas** — tres columnas en 390px dan celdas de 110px, incómodas y pequeñas para leer griego.
**Datos:** **102 sustantivos con artículo** ya en los CSV (το=41, η=30, ο=26 — bien repartido, sin sesgo).
**Detalle pedagógico:** cuando falles, el feedback debe usar la `nota` de la entrada. Varias ya lo anticipan: *"το πρόβλημα termina en -α pero es neutro, no femenino"*.

#### 🆕 `case_pairs` — mayúsculas y minúsculas
**Qué entrena:** la mitad del alfabeto que hoy **no se puede practicar**. El teclado en pantalla solo produce minúsculas (limitación anotada en la Fase 4), así que las mayúsculas no se entrenan en ningún sitio — pese a que el Módulo 0 las enseña y buena parte del contenido va capitalizado (`Καλημέρα`, `Δευτέρα`, `Ιανουάριος`).
**Cómo funciona:** una variante de `match_pairs` — unir **Α↔α**, **Γ↔γ**, **Λ↔λ**. 6 parejas.
**Por qué no es trivial:** varias mayúsculas griegas no se parecen a su minúscula (Γ/γ, Δ/δ, Λ/λ, Ξ/ξ, Π/π, Σ/σ, Φ/φ, Ψ/ψ). Son las difíciles y deben aparecer más.
**Datos:** columnas `mayuscula` y `minuscula` de [`a1-modulo0-alfabeto.csv`](./content/a1-modulo0-alfabeto.csv).

---

### 3.4 PRODUCIR

#### 🆕 `autocomplete` — completar las letras que faltan
**Qué entrena:** exactamente tus dos confusiones ortográficas. No es un cloze genérico: **los huecos se colocan a propósito** en las letras ambiguas.
**Cómo funciona:** aparece `δ_ντρ_` con la traducción debajo, y se rellena con el teclado griego. Los huecos caen en η/ι/υ o en ο/ω siempre que la palabra los tenga.

```
   δ [_] ν τ ρ [_]
      árbol
```

**Por qué es mejor que `fill_blank`:** hoy `fill_blank` completa el *artículo*. Esto completa *letras dentro de la palabra*, que es donde de verdad fallas.
**Datos:** cualquier palabra que contenga η/ι/υ/ο/ω — la inmensa mayoría.
**Móvil:** teclado griego ya existente; huecos grandes y tocables para elegir cuál rellenar.

#### ✅ `letter_tiles` *(mejora de `order_words`)*
**Qué falta:** hoy solo baraja las letras correctas, así que se resuelve por descarte. **Añadir 2-3 letras distractoras** — y que sean las confundibles: si la palabra lleva `η`, meter `ι` y `υ` como señuelos.
**Restricción ya aplicada:** solo palabras sin espacio (204 de 212).

#### ✅ `translation` · 🆕 `dictation`
`translation` existe. `dictation` (oír → escribir) está en la Fase 5 y es el tipo más exigente: sin texto de apoyo, obliga a decidir la ortografía solo con el oído.

---

### 3.5 CONSOLIDAR *(el juego)*

#### 🆕 `memory_grid` — memorama
**Qué entrena:** memoria de trabajo y recuperación. Es el tipo puramente divertido, y va al final de la lección como recompensa.
**Cómo funciona:** 12 cartas boca abajo (**6 parejas**). Volteas dos; si casan, se quedan; si no, se voltean. Dos variantes:
- **Griego ↔ español** (la clásica)
- **Griego ↔ audio** 🔊 — una carta suena al voltearla. Más difícil y más útil.

**Móvil — el cálculo importa:** en 390px con 20px de margen quedan 350px. Con 3 columnas y 10px de hueco → **cartas de 110px**, cómodas y con sitio para leer griego. Con 4 columnas serían 80px: cabe, pero el griego queda apretado. **3×4, no 4×4.**
**Datos:** 6 entradas del mismo `categoria`.

#### 🆕 `speed_round` — ronda rápida
**Qué entrena:** automatismo. No sirve de nada saber una palabra si tardas cinco segundos en reconocerla.
**Cómo funciona:** 10 afirmaciones seguidas con cronómetro: **«δέντρο = árbol»** → ✓ o ✗. Unos 4 segundos cada una. Al final, aciertos y tiempo.
**Móvil:** dos botones enormes abajo, uno por pulgar. Es el ejercicio más físicamente cómodo de todos.
**Cuidado:** el cronómetro debe **presionar sin castigar**. Si se acaba el tiempo, cuenta como fallo y sigue — nunca se pierde la lección entera.

---

## 4. Resumen: 11 tipos, 4 niveles

| Tipo | Nivel | Estado | Entrena específicamente |
|---|---|---|---|
| `concept` | Regla | 🆕 | *Saber qué estás aprendiendo* |
| `multiple_choice` | Reconocer | ✅ | Significado |
| `listen_choose` | Reconocer | 🆕 | η/ι/υ de oído |
| `match_pairs` | Reconocer | 🆕 | Asociación rápida |
| `gender_sort` | Clasificar | 🆕 | **El neutro** (ο/η/το) |
| `case_pairs` | Clasificar | 🆕 | Mayúsculas *(hueco actual)* |
| `autocomplete` | Producir | 🆕 | η/ι/υ y ο/ω por escrito |
| `letter_tiles` | Producir | ✅ mejorar | Ortografía (falta distractores) |
| `translation` | Producir | ✅ | Producción libre |
| `dictation` | Producir | 🆕 Fase 5 | Ortografía solo de oído |
| `memory_grid` | Consolidar | 🆕 | Memoria — **el juego** |
| `speed_round` | Consolidar | 🆕 | Automatismo |

**Cada tipo entrena algo que la investigación del par es→el identificó.** No son variedad por variedad: `gender_sort` existe porque el neutro es lo único del género que no transfiere del español; `listen_choose` y `autocomplete` existen porque η/ι/υ y ο/ω son las confusiones reales; `case_pairs` existe porque detectamos que las mayúsculas no se entrenan en ningún sitio.

---

## 5. Dificultad progresiva y dominio *(diseño — Fase 6)*

### El problema

Hoy `difficulty` se guarda en los 487 ejercicios (347 fácil / 79 medio / 61 difícil) y **nadie lo consume**: es metadato muerto. Y todo alumno ve lo mismo, sepa la palabra o la esté viendo por primera vez.

Babbel resuelve esto con actividades que solo aparecen cuando ya puedes con ellas: escribir la oración entera solo oyéndola, leer un texto y decir de qué trata, ver frases y señalar cuál está mal. **Las tres son del extremo difícil.** Añadirlas planas repetiría el error de pedir frases enteras en la primera lección.

### La idea: un solo puntaje de dominio lo gobierna todo

`ReviewQueue` ya tiene la forma de SM-2 (`interval`, `easeFactor`, `repetitions`) y está vacía. Se le añade un **dominio de 0 a 5 por entrada de vocabulario**, derivado del historial de `UserAnswer`:

```
dominio ↓  →  ejercicio MÁS FÁCIL   (andamiaje: fallar no debe repetir el mismo muro)
dominio ↑  →  ejercicio MÁS DIFÍCIL (progresión: acertar debe subir el listón)
```

Ese único número decide **qué** te toca (la cola de repaso) y **qué tan difícil** te lo pregunta (la escalera). Son la misma feature.

### La escalera, por tipo

Cada tipo ya existe; lo que se añade es que su schema admita variantes y que el generador elija según el dominio.

| Tipo | Fácil | Medio | Difícil |
|---|---|---|---|
| `multiple_choice` | 2 opciones | 4 opciones | 4, con distractores que suenan igual |
| `phrase_blank` | con opciones | con teclado | hueco en la palabra clave |
| `dictation` | palabra, traducción visible | palabra, sin traducción | **frase entera** ← lo de Babbel |
| `translation` | palabra corta | palabra larga | frase |
| `autocomplete` | 1 hueco | 2 huecos | todas las letras ambiguas |
| `listen_choose` | distractores distintos | distractores homófonos | sin traducción de apoyo |
| `gender_sort` | 4 palabras | 8 palabras | incluye engañosas (`το πρόβλημα`) |
| `memory_grid` | 4 parejas, texto | 6 parejas | 6 parejas con audio |
| `speed_round` | 6 s por ítem | 5 s | 3 s |

### La sección de palabras flojas

Es la otra cara del mismo dato. Una pantalla que ordena por **dónde más fallas**, no por qué toca hoy:

- Palabras con dominio bajo, ordenadas por fallos recientes
- Agrupadas por `errorTag` — *"12 fallos por acento"* es más accionable que doce palabras sueltas
- Entrar practica solo eso, en el nivel de dificultad que corresponde

Los `errorTags` ya se guardan en cada `UserAnswer`, así que el dato está desde la Fase 3. Solo falta agregarlo y mostrarlo.

### Tipos nuevos que esto habilita *(no antes)*

- **`spot_the_error`** — tres frases, una mal. Requiere dominio alto: sin él, no distingues el error del desconocimiento.
- **`dictation` de frase** — la cima de la escalera, no un tipo aparte.
- **`reading_comprehension`** — ya existe como placeholder (Fase 7).

---

## 6. Reglas transversales

1. **Ningún tipo se salta la validación determinista.** Todos tienen respuesta conocida. La IA no interviene (ver PLAN.md Fase 5).
2. **Todos generan `errorTags`** para alimentar el `LearnerSnapshot`: `gender_sort` → `genero_neutro`, `autocomplete` → `confusion_i` / `confusion_omicron_omega`, `case_pairs` → `mayuscula_desconocida`.
3. **Se toca, no se arrastra.** Ningún tipo usa drag-and-drop: en móvil compite con el scroll y falla con el pulgar.
4. **Áreas táctiles:** 56px las opciones y el CTA; 44px mínimo todo lo demás (SCREENS.md §4.1).
5. **Un tipo nuevo = una carpeta** en `features/exercises/types/<tipo>/` + una línea en `registry.ts` **y otra en `validators.ts`** (ARCHITECTURE.md §3.2, patrón 1).
   > Hay **dos índices a propósito**: `validators.ts` es TS puro (lo usan el servidor y los tests) y `registry.ts` añade los renderers (solo cliente). Sin la separación, corregir una respuesta en el servidor arrastraría React — el mismo motivo por el que `schema.ts` va aparte. TypeScript verifica que ambos estén completos.
6. **Un tipo nuevo no está terminado sin test.** Añadir un tipo obliga a añadir su ejemplo en `tests/units/exercise-coverage.test.ts`; el `Record<ExerciseType, …>` falla si falta. Además, todo validador debe soportar entrada basura sin lanzar (corre en el servidor con lo que mande el cliente) y **ningún tipo puntuable puede aprobar con la respuesta vacía** — hay un test que lo comprueba para los 16.
7. **El color nunca es la única señal** de acierto/error: siempre icono y texto también.

---

*Documento vivo — al añadir un tipo, añadirlo aquí con su propósito pedagógico, no solo su mecánica.*
