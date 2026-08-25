# Arquitectura — Griego App

> Ver [README.md](./README.md) para visión general, [PLAN.md](./PLAN.md) para el roadmap y [SCREENS.md](./SCREENS.md) para el inventario de pantallas y el sistema de diseño.

---

## 1. Stack técnico y por qué

| Pieza | Elección | Por qué |
|---|---|---|
| Frontend + backend | **Next.js 15+ (App Router)**, TypeScript | Full-stack en un solo proyecto: Server Actions / Route Handlers reemplazan un backend separado. Rutas por carpetas. Ya sabes React (componentes, hooks, JSX) — lo único nuevo es marcar `"use client"` en los componentes interactivos. |
| ORM / base de datos | **Prisma** → SQLite (local) → PostgreSQL (si se despliega) | Cambiar de motor es cambiar el `provider` y correr `prisma migrate`, no reescribir el dominio. **Prisma Studio** da una GUI básica para inspeccionar datos. |
| Validación de datos | **Zod** | Valida el `schemaJson` de cada ejercicio en *seed time* y en *runtime*. Sin esto, el "motor genérico" es un campo JSON sin garantías (ver §7). |
| Estilos / UI | **TailwindCSS + shadcn/ui** | Velocidad para una estética limpia tipo Apple sin escribir CSS desde cero. Componentes accesibles por defecto. |
| PWA | **Serwist** + Metadata API de Next.js | Instalable en iOS/Android vía "Añadir a pantalla de inicio". Sucesor mantenido de `next-pwa`. |
| **IA — único proveedor** | **DeepSeek API** (`deepseek-chat`) | Modelo de texto, muy barato por token, buen razonamiento en español. Actúa como **profesor** con prompt de sistema fijo + contexto del avance personal del estudiante (§6). |
| Media (imágenes, audio) | Sistema de archivos local → **Cloudflare R2** si se despliega | R2: 10GB gratis, sin costo de egress. |
| Hosting (si se hace público) | **Oracle Cloud Free Tier** ($0) o **Hetzner CPX11** (~$5/mes) | Ver changelog en [PLAN.md](./PLAN.md) §0. |
| Auth | Login mínimo propio (cookie de sesión) | Un solo usuario; migrable a `Auth.js` sin tocar el modelo de datos porque todo cuelga de `userId` (§4). |

### 1.1 Lo que DeepSeek **no** puede hacer (y qué implica)

DeepSeek acepta **solo texto**. Verificado en su documentación oficial (ago-2026): los modelos V4/V4-Flash declaran `input_modalities: ["text"]`. Consecuencias directas:

| Funcionalidad deseada | Estado | Camino |
|---|---|---|
| Validar respuestas escritas + explicar errores | ✅ **Sí, es el caso de uso central** | Texto → DeepSeek → feedback estructurado |
| Foto de escritura a mano | ❌ No con DeepSeek solo | Reemplazado por **teclado griego en pantalla** (`free_writing`). La foto queda como exploración futura con OCR en el navegador (Tesseract.js: aceptable con griego impreso, pobre con manuscrito) |
| Pronunciación (audio → texto) | ⏸️ **Decisión pendiente** | DeepSeek no procesa audio. Requiere un segundo proveedor (Whisper API) o Web Speech API del navegador (no existe en iOS Safari). Movido a Fase 8, opcional — ver [PLAN.md](./PLAN.md) |

**Regla de arquitectura:** mientras la app sea *DeepSeek-only*, todo ejercicio debe poder resolverse **con texto o con selección**. Cualquier modalidad nueva (audio, imagen) es una decisión explícita que agrega un proveedor y se documenta aquí antes de codearse.

---

## 2. Fase local — sin nube mientras sea uso personal

- Todo corre en tu máquina: `npm run dev` levanta Next.js, Prisma apunta a un archivo `.sqlite` local. **Costo: $0** (salvo centavos de DeepSeek). **Energía: solo mientras la usas**, a diferencia de una VM encendida 24/7.
- **Acceso desde el iPhone:** misma red WiFi, o **Tailscale** (plan personal gratis) para usarla también fuera de casa sin exponer nada a internet público.
- **HTTPS obligatorio en local** si algún día se usa cámara/micrófono: los navegadores lo exigen fuera de `localhost`. Se resuelve con **mkcert**. *Mientras el stack sea solo texto, no es bloqueante.*
- **Cuándo migrar a la nube:** cuando quieras acceso sin depender de tu compu encendida, o abrir la app a más gente.

---

## 3. Diagrama de arquitectura

```
┌──────────────────────────────────────────────────────────┐
│                   Next.js (App Router)                    │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Cliente (React) — PWA instalable                     │ │
│  │  · Renderers de ejercicio (uno por type)              │ │
│  │  · Teclado griego en pantalla                         │ │
│  │  · Service worker (Serwist) — caché offline           │ │
│  └───────────────────────┬──────────────────────────────┘ │
│                          │ Server Actions                   │
│  ┌───────────────────────▼──────────────────────────────┐ │
│  │  Servidor                                             │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │ 1. Validación DETERMINISTA (siempre primero)     │ │ │
│  │  │    normalización NFD · accept[] · distancia edit │ │ │
│  │  │    → decide correcto/incorrecto SIN llamar IA    │ │ │
│  │  └───────────────────┬─────────────────────────────┘ │ │
│  │  ┌───────────────────▼─────────────────────────────┐ │ │
│  │  │ 2. Capa de tutoría IA (solo cuando aporta)       │ │ │
│  │  │    · caché por hash(ejercicio, respuesta)        │ │ │
│  │  │    · inyecta LearnerSnapshot en el prompt        │ │ │
│  │  └───────────────────┬─────────────────────────────┘ │ │
│  └──────────┬───────────┴──────────────────────────────┘ │
└─────────────┼──────────────────────┬─────────────────────┘
              │                      │
     ┌────────▼────────┐   ┌─────────▼──────────┐
     │   Prisma ORM    │   │   DeepSeek API      │
     │ SQLite/Postgres │   │  (único proveedor)  │
     └─────────────────┘   └────────────────────┘
```

**Los 3 principios que sostienen todo:**

1. **Contenido = datos versionados.** El contenido vive en archivos CSV/JSON dentro del repo (fuente de verdad, versionada en git); la base de datos es una **proyección** generada por el seed. Puedes borrar el `.sqlite` y reconstruirlo con un comando. Nada de griego/español hardcodeado en componentes.
2. **La IA nunca decide si algo es correcto.** La corrección la determina código determinista (§5.3). DeepSeek solo **explica y acompaña** (§6). Esto hace la app barata, rápida, reproducible y testeable — y evita que un modelo con mal día te repruebe una respuesta buena.
3. **Cada modalidad está aislada tras una interfaz.** Toda llamada a IA pasa por `lib/ai/tutor.ts` con un contrato tipado. Cambiar de proveedor toca un archivo, no el motor ni el frontend.

---

## 3.1 Arquitectura: **Modular por Features** (modular monolith)

La app sigue una **arquitectura modular por features**: el código se organiza por *capacidad del producto* (lección, repaso, tutor, progreso), no por *tipo técnico de archivo* (controllers, services, models). Cada feature es un módulo con frontera explícita y una API pública; el resto del sistema solo puede entrar por esa puerta.

Es la estructura estándar para apps Next.js que crecen, y es un **monolito modular**, no microservicios: todo corre en un proceso, pero las fronteras internas son reales y verificables.

### Por qué esta y no otra

| Alternativa | Por qué se descartó |
|---|---|
| **Por tipo técnico** (`controllers/`, `services/`, `models/`) | Es lo que sale por defecto. Una feature queda desparramada en 5 carpetas: para tocar "repaso" abres cinco lugares y ninguno te dice qué hace el sistema |
| **Clean Architecture / Hexagonal completa** | Cuatro capas y mapeo entre DTOs y entidades. Para un dominio que cabe en la cabeza, la ceremonia cuesta más de lo que resuelve. Sí tomamos **una** de sus ideas: la regla de dependencias (abajo) |
| **MVC clásico** | El App Router de Next.js ya no es MVC — Server Components mezclan vista y datos por diseño. Forzarlo pelea con el framework |

Lo que sí se toma de Clean Architecture es su idea más valiosa sin su burocracia: **las dependencias apuntan en una sola dirección**.

### Las tres capas y la regla de dependencias

```
        app/          ← rutas Next.js. Delgadas: componen features, no tienen lógica
          │  puede importar de ↓
     features/        ← toda la lógica de negocio, una carpeta por capacidad
          │  puede importar de ↓
      shared/         ← UI de diseño, utilidades, cliente de BD. NO conoce el negocio
```

**Reglas (verificables, no de buena voluntad):**

1. `shared/` **nunca** importa de `features/` ni de `app/`. Si algo en `shared/` necesita saber qué es una lección, está mal ubicado.
2. Un feature importa de otro **solo por su `index.ts`**, nunca alcanzando sus archivos internos. `features/review/index.ts` es su contrato; todo lo demás es privado.
3. `app/` no contiene lógica: una página resuelve datos y compone componentes del feature. Si una ruta crece más allá de eso, la lógica se muda al feature.
4. Sin ciclos entre features. Si A y B se necesitan mutuamente, lo compartido baja a `shared/` o se extrae un tercer feature.

Estas reglas se pueden imponer con `eslint-plugin-boundaries` o las reglas `import/no-restricted-paths` de ESLint — conviene configurarlo en la Fase 0, cuando cuesta cinco minutos, y no cuando ya hay 40 archivos.

### Estructura

```
src/
  app/                         rutas (App Router) — delgadas
  features/
    auth/                      login, sesión
    catalog/                   cursos → niveles → módulos → lecciones (navegación)
    lesson-player/             el reproductor en modo foco
    exercises/                 EL MOTOR (ver patrón 1 abajo)
      types/<tipo>.tsx           schema + renderer + validator, juntos
      registry.ts                Record<ExerciseType, ExerciseModule>
      normalize.ts               normalización NFD compartida
      index.ts                   API pública del feature
    tutor/                     DeepSeek + LearnerSnapshot + caché
    review/                    SM-2, cola de repaso diaria
    progress/                  racha, puntos, estadísticas
    vocabulary/                diccionario personal
  shared/
    ui/                        componentes del sistema «Ánfora»
    lib/db.ts                  cliente Prisma singleton
    lib/utils.ts
```

**Anatomía interna de un feature** (la misma en todos, para que no haya que adivinar):

```
features/review/
  index.ts          ← API pública: lo ÚNICO que otros features pueden importar
  actions.ts        ← Server Actions (mutaciones)
  queries.ts        ← lecturas de BD
  components/       ← UI propia del feature
  lib/              ← lógica interna (ej. el algoritmo SM-2)
```

**Cómo escala:** una capacidad nueva es una carpeta nueva. No se toca nada existente, y la frontera impide que se enrede con lo demás sin que alguien lo note.

---

## 3.2 Patrones dentro de la arquitectura

Cuatro patrones puntuales resuelven los ejes de cambio previsibles. Cada uno vive dentro de la estructura de arriba.

| Eje de cambio | Patrón | Costo si NO se hace |
|---|---|---|
| Tipos de ejercicio nuevos | **Unión discriminada + módulo por tipo** | Un `switch` gigante que crece en 4 archivos distintos |
| Pares de idiomas nuevos | **Alcance en tres capas** | Reescribir el curso entero para cada idioma origen |
| Volumen de contenido | **Contenido como datos, BD como proyección** | El contenido vive solo dentro de un `.sqlite` sin versionar |
| Proveedor de IA | **Puerto aislado** | Cambiar de proveedor toca el motor y el frontend |

### Patrón 1 — Un tipo de ejercicio = un módulo autocontenido *(el central)*

Cada tipo de ejercicio tiene tres piezas: su **schema Zod**, su **renderer React** y su **validador determinista**. La regla es que las tres viven **juntas en un solo archivo por tipo**, y se registran en un único índice:

```
lib/exercises/
  types/
    multiple-choice.tsx     ← schema + renderer + validator, los tres juntos
    fill-blank.tsx
    order-words.tsx
    translation.tsx
    free-writing.tsx
    alphabet-drill.tsx
  registry.ts               ← el ÚNICO lugar que conoce la lista completa
  normalize.ts              ← normalización NFD compartida (§5.3)
```

Cada módulo exporta la misma forma:

```ts
export const multipleChoice: ExerciseModule<'multiple_choice'> = {
  type: 'multiple_choice',
  schema: MultipleChoiceSchema,           // Zod, valida el schemaJson
  Renderer: MultipleChoiceRenderer,        // componente React
  validate: (exercise, input) => ({        // corrección determinista
    isCorrect: boolean,
    errorTags: string[],                   // alimenta LearnerSnapshot (§6.3)
  }),
};
```

**Por qué así:** agregar un tipo de ejercicio nuevo es **crear un archivo y añadir una línea al registro**. No se toca el reproductor de lecciones, ni el motor de corrección, ni el modelo de datos. Es la operación que más veces se va a repetir en la vida del proyecto (el roadmap ya contempla 8 tipos, y la Fase 8 agrega otro), así que es la que merece la abstracción.

**La alternativa que se descartó:** schemas en `lib/schemas.ts`, renderers en `components/exercises/`, validadores en `lib/validation.ts`. Es lo que sale "natural" si nadie lo decide, y significa que agregar un tipo toca tres carpetas y es fácil olvidar una — típicamente el validador, que es justo el que no falla ruidosamente.

> El `type` de la BD es un `enum` de Prisma y el discriminante de la unión Zod. Son la misma lista en dos lugares: el registro debe tener una verificación en tiempo de compilación de que están completos (un `Record<ExerciseType, ExerciseModule>` basta — TypeScript falla si falta uno).

### Patrón 2 — Alcance en tres capas

Cada dato pertenece a exactamente uno de tres alcances, y esto determina en qué tabla vive:

| Alcance | Tabla ancla | Qué contiene | Se reutiliza al… |
|---|---|---|---|
| **Idioma** | `Language` | Alfabeto, vocabulario, gramática | …cambiar el idioma origen ✅ |
| **Par** | `Course` | Transliteración, `ContrastiveNote`, orden de enseñanza | …cambiar el idioma origen ❌ se reescribe |
| **Alumno** | `User` | `LearnerSnapshot`, progreso, cola de repaso | nunca, es personal |

**Por qué así:** es la respuesta a "¿qué cambia si mañana enseño inglés→griego?". Sin esta separación, la respuesta sería "medio proyecto". Con ella, es "el contenido de `Course` y sus notas contrastivas" — ver CURRICULUM.md §4. La prueba de que la separación es real: la transliteración `déntro` está escrita para un hispanohablante y **no sirve** para un angloparlante, aunque la palabra griega sea idéntica.

### Patrón 3 — Contenido como datos, BD como proyección

Los CSV de `content/` son la fuente de verdad; el seed los proyecta a la BD. Borrar `dev.db` + sembrar = todo vuelve.

**Por qué así:** el contenido se revisa como código (diffs, historial, revertir un error de traducción), y el seed es el punto donde la validación Zod **falla ruidosamente en tu terminal** en vez de romper una lección en tu iPhone.

### Patrón 4 — Puerto aislado para servicios externos

Toda llamada a DeepSeek pasa por `lib/ai/tutor.ts`, que expone una función tipada y no filtra nada del proveedor (ni el formato de mensajes, ni los códigos de error) al resto del código.

**Por qué así:** DeepSeek es la única dependencia externa del proyecto y la más probable de cambiar (precio, disponibilidad, o agregar STT en la Fase 8). Además, el aislamiento es lo que permite la regla de §6.1 — que la app funcione completa si la IA falla — porque hay un solo lugar donde poner el *fallback*.

### Lo que deliberadamente NO se hace

| Patrón evitado | Por qué |
|---|---|
| **Repository sobre Prisma** | Prisma ya *es* la capa de datos. Envolverlo agrega indirección sin desacoplar nada real: nadie va a cambiar de ORM. Las fronteras ya las da el feature |
| **Capas de Clean Architecture completas** (entities/use-cases/adapters + DTOs) | Se toma su regla de dependencias (§3.1) sin su burocracia. Mapear entre DTOs y entidades en un dominio de 17 tablas es trabajo sin retorno |
| **Librería de estado global** | Server Components + Server Actions cubren el caso. El estado que sobra es local a una pantalla |
| **Capa de servicios entre rutas y Prisma** | `queries.ts` / `actions.ts` de cada feature ya son esa capa. Una más sería un pasamanos |
| **Microservicios / separar el backend** | Es un monolito modular a propósito: un proceso, fronteras internas reales. Separarlo se puede hacer *después* si algún feature lo pide, justamente porque las fronteras ya existen |

Todas estas decisiones son reversibles. Las de §3.1 y §3.2 lo son menos — por eso se toman ahora y estas se posponen.

### Resumen para quien programa

> **Arquitectura modular por features, en monolito.** Código organizado por capacidad del producto, no por tipo de archivo. Tres capas con dependencias en una sola dirección (`app → features → shared`). Cada feature expone un `index.ts` y esconde lo demás. Dentro, cuatro patrones puntuales para los ejes que cambian seguido: módulo por tipo de ejercicio, alcance en tres capas para el multi-idioma, contenido como proyección, y puerto aislado para la IA.

---

## 4. Modelo de datos (Prisma)

> **Los tres ejes del contenido** (nivel/vertiente/tema) se explican y justifican en [CURRICULUM.md](./CURRICULUM.md) §1. Mapeo a campos: `Level` = nivel MCER, `Module` = tema, `Lesson.kind` = vertiente (vocabulario/gramática/escucha/lectura/cultura).

| Modelo | Descripción |
|---|---|
| `User` | usuario (email, password hasheado) |
| `Profile` | `nativeLanguage`, `targetLanguage`, `dailyGoal`, `streak`, `points` |
| `Language` | `name`, `code` ISO 639-1 (`es`, `el`, `fr`…) — clave de la escalabilidad multi-idioma |
| `Course` | `title`, `sourceLanguageId`, `targetLanguageId`, `imageUrl`, `isActive` — **es el par**, no el idioma; ancla de `ContrastiveNote` |
| `Level` | `courseId`, `name` (A1, A2…), `order` — eje **nivel** |
| `Module` | `levelId`, `title`, `order` — eje **tema** (Alfabeto, Familia, Comida…) |
| `Lesson` | `moduleId`, `title`, `order`, `kind` — eje **vertiente** |
| `Exercise` | `lessonId`, `type`, `schemaJson` (validado con Zod, §5), `order` |
| `VocabularyEntry` | `term` (griego), `translation`, `transliteration`, `imageUrl`, `audioUrl`, `partOfSpeech`, `tags` |
| `TextReading` | `lessonId`, `title`, `content`, `questionsJson` |
| `MediaAsset` | `url`, `type`, `source`, `license`, `attribution` — trazabilidad de derechos |
| `UserProgress` | progreso por lección (`completed`, `score`, `completedAt`) |
| `UserAnswer` | `exerciseId`, `rawInput`, `isCorrect`, `errorTags[]`, `aiFeedbackJson`, `points`, `answeredAt` |
| `ReviewQueue` | SM-2: `vocabularyEntryId`, `dueDate`, `interval`, `easeFactor`, `repetitions` |
| `LearnerSnapshot` | resumen compacto y recalculado del avance: `weakLetters[]`, `recurringErrors[]`, `masteredCount`, `currentModule`, `summaryText`. **Es lo que se inyecta al prompt del profesor** (§6) |
| `AiFeedbackCache` | `inputHash` (hash de ejercicio+respuesta), `responseJson`, `createdAt` — evita repagar y re-esperar por el mismo error |
| **`ContrastiveNote`** 🆕 | `courseId`, `feature` (ej. `aspecto_verbal`), `transferType` (`positiva`/`negativa`/`neutra`), `note`, `bridgeLanguage` — pedagogía específica del **par**, no del idioma destino. Ver [CURRICULUM.md](./CURRICULUM.md) §4. `bridgeLanguage` se inyecta en el prompt del profesor cuando el `errorTag` correspondiente aparece — ej. para es→el, el error de género inyecta *"como en español, pero ahora hay un tercer género"* en vez de una explicación gramatical genérica |

**Por qué escala:** agregar "francés → español" = insertar filas en `Language`/`Course` y correr el seed con otro CSV. Cero cambios de código. Todo cuelga de `userId`, así que pasar de 1 usuario a N no es un rediseño.

---

## 5. Motor de ejercicios

### 5.1 Contrato tipado (Zod + unión discriminada por `type`)

Cada tipo de ejercicio tiene su propio schema Zod. El seed **falla ruidosamente** si un CSV genera un ejercicio inválido, y el runtime valida antes de renderizar. Esto es lo que convierte `schemaJson` de "un blob JSON impredecible" en un contrato real.

```ts
// lib/exercises/schemas.ts (esquema conceptual)
const Base = z.object({
  instruction: z.string(),
  points: z.number().default(10),
  difficulty: z.enum(["easy", "medium", "hard"]).default("easy"),
});

const MultipleChoice = Base.extend({
  type: z.literal("multiple_choice"),
  prompt: z.object({ text: z.string().optional(), image: z.string().optional() }),
  options: z.array(z.object({ text: z.string(), image: z.string().optional() })).min(2),
  answer: z.string(),
});

const FreeWriting = Base.extend({
  type: z.literal("free_writing"),
  prompt: z.object({ text: z.string() }),
  answer: z.string(),
  accept: z.array(z.string()).default([]),
  aiTutor: z.boolean().default(true),   // pide explicación a DeepSeek si falla
});

export const ExerciseSchema = z.discriminatedUnion("type", [
  MultipleChoice, FillBlank, OrderWords, Translation, FreeWriting, ReadingComprehension,
]);
export type Exercise = z.infer<typeof ExerciseSchema>;
```

### 5.2 Tipos de actividad

| Tipo | Descripción | Corrección | ¿Usa DeepSeek? |
|---|---|---|---|
| `multiple_choice` | palabra ↔ traducción ↔ imagen | determinista | solo para explicar el error |
| `fill_blank` | completar palabra/frase (cloze) | determinista + NFD | solo para explicar |
| `order_words` | ordenar palabras de una frase | determinista (secuencia) | solo para explicar |
| `translation` | escribir la traducción | determinista + distancia de edición | solo para explicar |
| `free_writing` 🆕 | escribir en griego con **teclado griego en pantalla** (respuesta abierta) | determinista si hay `answer`; **DeepSeek si es abierta** | ✅ sí, corrige y explica |
| `reading_comprehension` | leer texto → responder preguntas | determinista (opción múltiple) o IA (abierta) | según la pregunta |
| `alphabet_drill` 🆕 | reconocer/escribir letras del alfabeto | determinista | no (feedback fijo) |
| `repeat_word` | pronunciación hablada | — | ⏸️ pendiente, requiere STT (§1.1) |

### 5.3 Normalización de respuestas (crítico para griego)

`minúsculas → NFD Unicode (separa diacríticos) → eliminar diacríticos → trim → comparar`. Así `δέντρο` escrito sin acento (`δεντρο`) se acepta, y las transliteraciones declaradas en `accept[]` (ej. `dentro`) también. Para `translation` se añade distancia de Levenshtein con umbral por longitud.

> **Sobre las variantes léxicas:** `δέντρο` es la forma estándar del griego moderno; `δένδρο` es la culta/antigua y **también** es correcta. Va en `accept[]`. Esa es exactamente la razón de existir del campo: la respuesta canónica es una, las aceptables son varias.

**Aviso importante sobre la normalización:** quitar diacríticos hace que la comparación *acepte* la palabra sin acento — pero el ejercicio igual debe **señalar** que faltó el acento. Es decir: `δεντρο` se marca como correcto-con-observación, no como fallo, y genera el `errorTag` `acento_faltante` que alimenta el `LearnerSnapshot`. Tratarlo como error duro frustraría; ignorarlo del todo no enseñaría.

**Además, la corrección devuelve `errorTags[]`** (`acento_faltante`, `sigma_final`, `confusion_omicron_omega`, `genero_incorrecto`…). Estas etiquetas alimentan el `LearnerSnapshot` y son **la memoria estructurada del profesor** — mucho más útiles y baratas que mandarle a DeepSeek todo el historial.

---

## 6. La capa de tutoría (DeepSeek como profesor)

### 6.1 Cuándo se llama (y cuándo no)

```
respuesta del usuario
  → validación determinista
      ├─ correcta   → feedback fijo del contenido, SIN llamada a IA  (0 costo, 0 latencia)
      └─ incorrecta → ¿hay caché para hash(ejercicio, respuesta)?
                        ├─ sí → devolver caché              (0 costo)
                        └─ no → DeepSeek → guardar en caché  (~1-2 s)
  → excepción: `free_writing` abierto SIEMPRE llama a DeepSeek (no hay respuesta única)
```

Esto mantiene el costo en centavos al mes y hace que el 80% de las interacciones sean instantáneas.

### 6.2 Composición del prompt

**System prompt (fijo, el "personaje" del profesor):** profesor de griego moderno para hispanohablantes, tono cálido y alentador, explicaciones breves (2-3 frases), siempre en español, siempre señalando el error concreto antes de dar la corrección, sin sermones.

**Contexto del avance personal (inyectado, es lo que pediste):** el `LearnerSnapshot` compacto — no el historial crudo:

```
Nivel actual: A1 · Módulo 2 (Números)
Palabras dominadas: 84 · Racha: 6 días
Errores recurrentes: omite el acento agudo (14 veces), confunde ο/ω (9), olvida ς final (5)
Letras débiles: ξ, ψ, θ
Vio por última vez este vocabulario: hace 3 días
```

**Turno actual:** el ejercicio, la respuesta esperada, lo que escribió el usuario, y los `errorTags[]` que ya detectó el validador determinista.

**Puente contrastivo (inyectado condicionalmente):** si alguno de los `errorTags[]` del turno tiene una `ContrastiveNote` para el `Course` activo, se agrega su `bridgeLanguage` al prompt — ej. el tag `aspecto_incorrecto` en es→el inyecta *"el español ya distingue pretérito/imperfecto — es la misma idea, extendida a más tiempos"*. Es lo que hace que la explicación no sea gramática genérica, sino la de un profesor que sabe de dónde viene el alumno (ver [CURRICULUM.md](./CURRICULUM.md) §4).

**Salida forzada en JSON** (`isCorrect`, `errors[]`, `explanation`, `encouragement`, `tip`) para que el frontend la renderice estructurada y no como un muro de texto.

**Verificado (ago-2026) en la documentación oficial de DeepSeek:** la API soporta `response_format: {"type": "json_object"}`, pero **solo garantiza JSON sintácticamente válido — no un schema**. Tres cosas que exige su propia documentación y que `lib/ai/tutor.ts` debe implementar:
1. La palabra "json" y un ejemplo del formato deseado deben ir en el prompt (system o user) — sin esto el modelo puede generar solo espacios en blanco hasta el límite de tokens.
2. `max_tokens` debe fijarse con margen suficiente para no truncar el JSON a la mitad.
3. La respuesta **siempre se valida con el mismo `ExerciseSchema`-style Zod** del motor de ejercicios (§5.1) antes de confiar en ella — DeepSeek no impone campos obligatorios, tipos ni enums. Si la validación falla, se reintenta una vez; si vuelve a fallar, se cae al feedback fijo del contenido (§6.1 ya cubre este camino: la app nunca depende de que la IA responda).

Sources: [DeepSeek API Docs — JSON Output](https://api-docs.deepseek.com/guides/json_mode/)

### 6.3 Por qué `LearnerSnapshot` y no "mandarle todo el historial"

Mandar cientos de respuestas en cada prompt sería caro, lento y ruidoso — y el modelo se perdería. El snapshot se recalcula con un job barato (al cerrar cada lección) a partir de los `errorTags[]` acumulados, y ocupa ~80 tokens. **Es la diferencia entre un tutor que "te conoce" y uno que solo ve la última respuesta**, sin pagar por ello.

---

## 7. Revisión crítica de la arquitectura (qué cambió y por qué)

Esta sección documenta la revisión pedida y deja constancia de los problemas encontrados en la v1 de la arquitectura.

| # | Problema detectado en la v1 | Corrección aplicada |
|---|---|---|
| 1 | **`schemaJson` sin contrato.** Un campo JSON libre en la BD no garantiza nada; un CSV mal formado rompería la lección en tiempo de ejecución, en el móvil, sin diagnóstico. | **Zod** con unión discriminada por `type`, validado en seed y en runtime (§5.1). El seed falla ruidosamente en tu terminal, no en tu iPhone. |
| 2 | **La IA decidía la corrección.** Delegar "¿está bien?" a un LLM lo hace no determinista, lento (1-3 s por respuesta), caro y no testeable. | **Validación determinista primero, siempre** (§6.1). La IA solo explica. El 80% de las interacciones ya no llaman a la API. |
| 3 | **Sin caché de IA.** El mismo error típico ("δεντρο" sin acento) se pagaría y se esperaría cientos de veces. | `AiFeedbackCache` por `hash(ejercicio, respuesta)` (§4). |
| 4 | **El "contexto de avance" era vago.** Sin un mecanismo concreto, la única opción habría sido volcar el historial en el prompt: caro y poco efectivo. | `LearnerSnapshot` + `errorTags[]` estructurados (§6.2-6.3). |
| 5 | **La BD como fuente de verdad del contenido.** Con Prisma Studio como único editor, tu contenido viviría solo dentro de un archivo `.sqlite` sin versionar — frágil y no revisable. | **Contenido = archivos CSV/JSON versionados en git**; la BD es una proyección regenerable (§3, principio 1). |
| 6 | **Dependencia de 3 proveedores de IA** (Whisper + Gemini + DeepSeek) para un proyecto personal: 3 cuentas, 3 claves, 3 formas de fallar. | **Un solo proveedor: DeepSeek.** Las modalidades no-texto se posponen como decisiones explícitas (§1.1). |
| 7 | **Supuesto de un solo usuario filtrándose al modelo.** Fácil de "simplificar" ahora y pagarlo con un rediseño después. | Todo cuelga de `userId` desde el día 1 (§4). Pasar a multiusuario es cambiar la capa de auth, no el esquema. |

**Lo que se conserva de la v1 y por qué era correcto:** contenido como datos (no código), el par `source→target` como modelo de la escalabilidad multi-idioma, normalización NFD para el griego, `MediaAsset` con licencia/atribución, y el arranque local con SQLite antes que cualquier nube.

---

## 8. Seguridad y costos

- Las claves de API viven en variables de entorno del servidor; **nunca** se exponen al cliente ni se llaman desde componentes `"use client"`.
- Toda validación ocurre en el servidor; el cliente nunca decide puntaje.
- **Rate limiting** en las Server Actions que llaman a DeepSeek — protege contra bucles accidentales que gasten crédito.
- **Costo estimado:** con validación determinista + caché, el uso personal ronda **centavos al mes** en DeepSeek. Cero en infraestructura mientras corra local.

---

*Documento vivo — se actualiza junto con [PLAN.md](./PLAN.md) cuando se toman nuevas decisiones técnicas.*
