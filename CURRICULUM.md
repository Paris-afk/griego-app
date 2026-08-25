# Currículo — Griego App

> Ver [PLAN.md](./PLAN.md) para el roadmap y [ARCHITECTURE.md](./ARCHITECTURE.md) para el modelo de datos.
> Este documento responde una pregunta concreta: **cómo organizar el contenido "como Babbel" (palabras, frases, gramática...) dentro de una estructura de niveles A1/A2/B1, y qué cambia cuando el idioma de origen deja de ser español.**

---

## 1. Los tres ejes del contenido (y por qué se separan)

La pregunta original mezclaba tres cosas que Babbel mantiene deliberadamente separadas. Si se combinan en una sola jerarquía, "Comida" termina duplicado en cinco lugares sin poder relacionarse entre sí.

| Eje | Responde a | Valores | Ya existe en el modelo como |
|---|---|---|---|
| **Nivel** | ¿qué tan difícil? | A1, A2, B1… (MCER) | `Level` |
| **Vertiente** *(strand)* | ¿qué tipo de habilidad? | Vocabulario · Gramática · Escucha · Lectura · Cultura | `Lesson.kind` |
| **Tema** *(topic)* | ¿qué dominio de la vida? | Alfabeto, Saludos, Números, Familia, Comida… | `Module` |

**Una lección vive en la intersección de los tres:** *Nivel A1 → Módulo "Comida" → vertiente "Gramática"* es una lección distinta de *Nivel A1 → Módulo "Comida" → vertiente "Vocabulario"* — mismo tema, distinta habilidad, ambas necesarias. El modelo de Prisma (§4 de ARCHITECTURE.md) **ya tiene los tres campos**; lo que faltaba era usarlos con esta intención explícita en vez de dejar que `Lesson.kind` fuera un campo decorativo.

Esto es directamente el patrón real de Babbel: dentro de cada nivel (Newcomer → Beginner 1 → Beginner 2) corren pistas paralelas — *Words & Sentences*, *Grammar*, *Listening & Speaking*, *Culture & Idioms* — que comparten vocabulario pero enseñan una habilidad distinta cada una.

### Por qué no copiar a Duolingo ni a Memrise aquí

| App | Principio organizador | Tradeoff |
|---|---|---|
| **Duolingo** | Unidades temáticas lineales, gramática intercalada sin ser el eje | Enganchador, pero la gramática queda implícita — no sabes "qué regla estás practicando" |
| **Memrise** | Repetición espaciada como centro; gramática dispersa en lecciones cortas | Excelente retención léxica, pero se aprenden frases sin entender la regla detrás |
| **Busuu** | Capítulos explícitamente atados al MCER, cada uno integra gramática+vocabulario+lectura | Más rígido, pero más sistemático |
| **Babbel** | Vertientes paralelas dentro de cada nivel (la que adoptamos) | Requiere más contenido por módulo, pero cada pieza tiene un propósito declarado |

Elegimos el patrón de **Babbel/Busuu** (explícito y atado al MCER) porque es un estudiante autodidacta y solo — sin un profesor humano que rellene lo implícito, la estructura explícita hace más trabajo pedagógico.

---

## 2. Niveles MCER — qué significan en la práctica

Descriptores oficiales del Consejo de Europa (resumidos; la tabla completa de las 5 destrezas por nivel queda en el anexo si se necesita para redactar criterios de "listo" más finos):

| Nivel | Puede… (síntesis) |
|---|---|
| **A1** | Comunicarse de forma muy básica si el interlocutor colabora y habla despacio. Presentarse, rellenar formularios, escribir postales cortas. |
| **A2** | Manejar tareas simples y rutinarias (compras, indicaciones, información personal). Describir su entorno en términos sencillos. |
| **B1** | Desenvolverse en la mayoría de situaciones de viaje. Narrar experiencias, justificar opiniones brevemente, escribir textos sencillos y enlazados. |

**Sobre vocabulario y horas por nivel:** no existe una cifra oficial única — el propio MCER no la fija. Las cifras más citadas (ALTE, Cambridge English Vocabulary Profile) convergen aproximadamente en:

| Nivel | Vocabulario receptivo | Horas de estudio guiado |
|---|---|---|
| A1 | 500–700 palabras | 60–100 h |
| A2 | 1.000–1.500 palabras | 160–200 h |
| B1 | 2.500–4.000 palabras | 350–400 h |

Cifras de terceros con metodologías distintas, no del Consejo de Europa — se usan aquí solo como orden de magnitud para dimensionar el MVP (A1 completo ≈ 500-700 palabras es una meta razonable), no como un contrato que el currículo deba cumplir al palabra.

---

## 3. El currículo real de griego A1 — verificado contra manuales oficiales

Antes de fijar el orden de nuestros módulos, se contrastó contra **cinco manuales reales de griego como lengua extranjera** (ΚΛΙΚ στα ελληνικά del Κέντρο Ελληνικής Γλώσσας — el manual oficial de certificación —, Ελληνικά Α΄ de la Univ. de Atenas/Πατάκης, Επικοινωνήστε ελληνικά de Δέλτος, Τα νέα ελληνικά για ξένους del ΑΠΘ, y Ελληνικά με την παρέα μου). Los cinco, **de forma independiente, convergen en la misma secuencia**:

### Lo que TODOS enseñan en las primeras 2-3 lecciones (sin excepción)
1. Alfabeto, pronunciación, acentuación
2. Verbo **είμαι** (ser/estar) + pronombres personales
3. Saludos + **presentarse** (nombre, origen, "de dónde eres") — *en el mismo bloque, nunca separado*
4. Números 1-10 → 1-100

### Progresión gramatical que comparten los cinco manuales (orden fijo)
```
είμαι + saludos/identidad
  → ενεστώτας (presente) tipo Α, luego Β1, luego Β2 — mientras se cubren temas (familia, rutina, comida)
    → πληθυντικός (plural) de sustantivos y adjetivos
      → αιτιατική (acusativo) — objeto directo
        → γενική (genitivo) — posesión, objeto indirecto
          → αόριστος (pasado) — ronda las unidades 9-12 en los cinco manuales
            → μέλλοντας (futuro simple)
              → υποτακτική simple (subjuntivo con να)
                → προστακτική (imperativo)
```

**Esto es un hallazgo importante para nuestro plan:** nuestro currículo (§2 en versiones previas de PLAN.md) tenía **"Presentarse" como Módulo 3**, separado de Saludos (Módulo 1). Los cinco manuales lo tratan como **una sola unidad** — presentarse *es* la continuación natural de saludar, no un tema aparte. Se corrige en §6.

### El currículo A1 completo de un manual real (ΚΛΙΚ Α1, referencia oficial de certificación)

| Unidad | Tema | Gramática que introduce |
|---|---|---|
| 0 | Alfabeto y sonidos | Pronunciación, acentuación, ortografía |
| 1 | Saludos | είμαι, pronombres, género/terminaciones, números 1-10 |
| 2 | ¿Dónde vives? | Presente tipo A, posesivos, adjetivos, números 11-100 |
| 3 | Mi familia | Presente tipo B1, πάω/λέω/ακούω, plural, números 100-1000 |
| 4 | Rutina diaria | Acusativo, objeto directo, τρώω |
| 5 | Preparo un viaje | Subjuntivo simple (να), verbos irregulares en subjuntivo |
| 6 | Mi casa | Concordancia de adjetivos, imperativo simple, futuro |
| 7 | Fiestas y compras | Demostrativos, pronombres átonos en acusativo |
| 8 | Del mercado al plato | Cuantificadores (πολύς), adverbios |
| 9 | ¿Estudias o trabajas? | **Aóristo** (pasado) regular e irregular |
| 10 | Que te mejores | Interrogativos declinados, objeto indirecto |
| 11 | Guarde su turno | Estilo directo, puntuación de diálogo |

Esta es la referencia de facto para nuestro Módulo 0 + Módulos 1-6 del plan — no hay que inventar la secuencia, hay que **adaptarla al par español→griego** (siguiente sección), que es donde sí hay trabajo original que hacer.

---

## 4. La capa contrastiva — por qué el `Course` debe llevar pedagogía del par, no solo vocabulario

Esto es lo que motivó tu pregunta original: **el orden y el énfasis correctos no dependen solo del griego — dependen del par español→griego**, y cambian si mañana el par es inglés→griego.

### Tabla contrastiva: qué es fácil/difícil, y por qué, según el idioma de origen

| Rasgo | Ejemplo griego | Hispanohablante | Angloparlante |
|---|---|---|---|
| **Vocales** | 5 vocales puras α ε ι ο υ | ✅ **Fácil** — el español ya tiene exactamente esas 5 vocales estables, sin reducción | ❌ Difícil — el inglés reduce vocales átonas a *schwa*; debe aprender a no hacerlo |
| **Alfabeto** | Α Β Γ Δ… | ❌ Difícil — cero transferencia del latino | ❌ Igual de difícil — misma barrera, sin ventaja de ningún lado |
| **Género gramatical** | 3 géneros (masc./fem./neutro) | ⚠️ Parcial — el concepto de concordancia ya existe (2 géneros); falta el neutro | ❌ Difícil — el inglés no tiene género gramatical: debe adquirir el *concepto* y los 3 valores a la vez |
| **Casos (nom./gen./ac./voc.)** | ο άνθρωπος / του ανθρώπου / τον άνθρωπο | ❌ Difícil — el español no declina sustantivos | ❌ Igual de difícil — el inglés tampoco declina; ambos parten de cero |
| **Aspecto verbal** | διαβάζω (imperfectivo) vs. διάβασα (perfectivo) | ✅ **Fácil relativamente** — el español ya opone pretérito/imperfecto obligatoriamente | ❌ Difícil — el inglés no tiene esta oposición obligatoria; debe construir la categoría desde cero |
| **Sin infinitivo** | θέλω να διαβάσω (lit. "quiero que lea") | ⚠️ Parcial — el español ya usa subjuntivo tras verbos volitivos ("quiero que leas"), da andamiaje | ❌ Difícil, sin andamiaje — el inglés usa infinitivo y su subjuntivo es marginal |
| **Orden de palabras** | Flexible, señalado por el caso | ✅ **Fácil** — el español también tolera orden flexible vía clíticos | ❌ Difícil — el inglés depende del orden fijo SVO; le falla la muleta cuando el griego antepone el objeto |

**Síntesis:** el hispanohablante llega con ventaja real en vocales, aspecto verbal y orden flexible — tres cosas que **no hace falta enseñar desde cero**, solo señalar la equivalencia. Comparte con el angloparlante la misma dificultad en alfabeto y casos — ahí no hay atajo, para nadie. Y el angloparlante carga una penalización extra en género e infinitivo que el hispanohablante no tiene.

### Consecuencia concreta en el modelo de datos

Se agrega una tabla nueva, `ContrastiveNote`, colgada de `Course` (que ya es *el par*, no el idioma):

| Campo | Ejemplo |
|---|---|
| `courseId` | es→el |
| `feature` | `aspecto_verbal` |
| `transferType` | `positiva` (ya lo tienes) / `negativa` (interferencia) / `neutra` (dificultad universal) |
| `note` | "El español ya distingue pretérito/imperfecto — dile al alumno que es la misma idea, extendida a más tiempos" |
| `bridgeLanguage` | Texto listo para inyectar en el prompt del profesor cuando el `errorTag` correspondiente aparezca |

**Esto se conecta directo con el profesor IA (§6 de ARCHITECTURE.md):** cuando el `LearnerSnapshot` reporta un error de género, el prompt de DeepSeek recibe el `bridgeLanguage` de esa `ContrastiveNote` — así el profesor puede decir *"como en español, pero ahora hay un tercer género"* en vez de una explicación gramatical genérica. Es gratis (no cuesta tokens extra relevantes) y es exactamente el tipo de personalización que un profesor humano bueno haría.

**Y explica el efecto práctico en el temario:** el módulo de aspecto verbal puede ser **más corto** para es→el que para en→el (transferencia positiva); el módulo de género necesita **un empujón extra** en es→el explicando solo el neutro, mientras que en en→el necesita construirse desde cero. El *contenido* del griego es el mismo; el *ritmo y el énfasis* cambian con el par — que es exactamente tu observación original.

---

## 5. Currículo A1 revisado para el MVP

Ajustando el plan original (PLAN.md §2) con la convergencia de los cinco manuales (§3) y aplicando la capa contrastiva (§4):

| Módulo | Tema | Gramática que ancla | Nota contrastiva (es→el) |
|---|---|---|---|
| **0** | Alfabeto y sonidos | Pronunciación, acentuación | Vocales: **transferencia positiva total** — no necesita drill extenso, solo mapeo directo |
| **1** | Saludos y presentarse *(fusiona el antiguo Módulo 3)* | είμαι, pronombres, ονομάζομαι/από πού είσαι, números 1-100 | — |
| **2** | Familia | Presente tipo B1, plural | Género: reforzar el neutro específicamente (lo demás ya transfiere) |
| **3** | Rutina y comida | Acusativo (objeto directo) | — |
| **4** | Números, fechas y compras | Genitivo (posesión) | — |
| **5** | Viajes y planes | Subjuntivo simple (να) | Andamiaje: "como *quiero que leas*, no *quiero leer*" |
| **6** | Del pasado al futuro | Aóristo + futuro simple | Aspecto verbal: **transferencia positiva** — puente directo a pretérito/imperfecto |

El **Módulo 0 sigue siendo intocable primero** (los cinco manuales y nuestro propio plan coinciden), y el antiguo Módulo 3 "Presentarse" se fusiona con Saludos porque **ningún manual real lo trata como tema aparte**.

---

## Anexo: descriptores MCER completos (las 5 destrezas, A1-B1)

<details>
<summary>Tabla completa (clic para expandir) — se usa al redactar criterios de "listo" más finos en fases avanzadas</summary>

| Nivel | Comprensión auditiva | Comprensión de lectura | Interacción oral | Expresión oral | Expresión escrita |
|---|---|---|---|---|---|
| **A1** | Reconoce palabras y expresiones muy básicas sobre sí mismo y su entorno inmediato, habladas despacio y con claridad | Comprende palabras y frases muy sencillas (letreros, catálogos) | Participa de forma sencilla si el interlocutor coopera y repite | Usa frases sencillas para describir su lugar de residencia y gente que conoce | Escribe postales cortas y formularios con datos personales |
| **A2** | Comprende frases y vocabulario habitual sobre temas de interés personal directo | Lee textos breves y encuentra información específica en anuncios, menús, horarios | Intercambia información simple y directa en tareas rutinarias | Describe en términos sencillos a su familia, su trabajo y su entorno | Escribe notas breves y cartas personales muy sencillas |
| **B1** | Comprende ideas principales en discurso claro sobre asuntos cotidianos | Comprende textos de uso habitual y descripciones de sentimientos en cartas | Se desenvuelve en la mayoría de situaciones de viaje | Narra experiencias, justifica opiniones brevemente | Escribe textos sencillos y enlazados sobre temas conocidos |

</details>

---

*Documento vivo — se actualiza si cambia el par de idiomas (§4) o si se agregan niveles superiores.*
