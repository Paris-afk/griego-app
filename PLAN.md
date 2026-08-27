# Plan — Roadmap por fases — Griego App

> Ver [README.md](./README.md) para la visión, [ARCHITECTURE.md](./ARCHITECTURE.md) para el stack técnico y [SCREENS.md](./SCREENS.md) para pantallas y diseño.
> **Estado:** v3 — arquitectura revisada y confirmada (Next.js full-stack, **DeepSeek como único proveedor de IA**). ~~Pendiente iniciar Fase 0~~ → **Fases 0, 1, 2, 3 y 3.5 completadas (2026-08-25).**

---

## 0. Historial de decisiones (changelog)

| Fecha | Decisión |
|---|---|
| 2026-08-13 | v1: Flutter + Django + Postgres/Railway, multiplataforma con tiendas desde el inicio |
| 2026-08-20 | Redefinido como **uso personal** → se elimina la necesidad de tiendas y de nube desde el día 1 |
| 2026-08-20 | Frontend: Flutter → **PWA** mobile-first, instalable en Safari |
| 2026-08-20 | Backend: Firebase evaluado y **descartado** (mal encaje con un dominio relacional) |
| 2026-08-20 | Hosting: **Oracle Cloud Free Tier** / **Hetzner** como plan B — solo si algún día se hace público |
| 2026-08-20 | Pivote de backend: **Next.js full-stack** (Server Actions + Prisma) en vez de Django separado. Verificado que Prisma es un ORM maduro y que Next.js soporta PWA nativamente |
| 2026-08-20 | **IA: un solo proveedor, DeepSeek.** Se descartan Whisper y Gemini. Consecuencias: la foto de escritura a mano se reemplaza por **teclado griego en pantalla**; la pronunciación por voz queda **pendiente** (requeriría un segundo proveedor) |
| 2026-08-20 | **Revisión de arquitectura** (ver [ARCHITECTURE.md](./ARCHITECTURE.md) §7): validación determinista antes que IA, caché de feedback, `LearnerSnapshot` para el contexto del profesor, Zod para el contrato de ejercicios, contenido como archivos versionados |
| 2026-08-23 | **Dirección visual elegida: «Ánfora»** — cálida, editorial, terracota y oliva, serif Newsreader. Ver [SCREENS.md](./SCREENS.md) §4.2 |
| 2026-08-23 | Corrección de contenido: la palabra de ejemplo pasa a **δέντρο** (forma estándar del moderno); `δένδρο` queda como variante aceptada. Regla nueva: la respuesta incorrecta de un ejemplo debe diferir **solo** en el error que se explica |
| 2026-08-23 | **Currículo formalizado** — ver [CURRICULUM.md](./CURRICULUM.md): taxonomía de módulos por tipo (palabras/frases/gramática…) dentro de niveles MCER, y la **capa de pedagogía contrastiva** (`ContrastiveNote`) que hace que el orden de enseñanza dependa del par `origen→destino`, no solo del idioma destino |
| 2026-08-23 | Currículo A1 **verificado contra 5 manuales reales de griego** (ΚΛΙΚ/ΚΕΓ, Πατάκης, Δέλτος, ΑΠΘ, Ε.ΔΙΑ.Μ.ΜΕ.) — los cinco convergen en la misma secuencia. Se fusiona "Presentarse" dentro de "Saludos" (ningún manual real lo separa) y se reordena Familia/Números según esa convergencia |
| 2026-08-24 | **Verificado:** DeepSeek soporta `response_format: json_object`, pero no impone schema — Zod sigue siendo obligatorio sobre su respuesta (ARCHITECTURE.md §6.2). Prisma ≥6.2 soporta `enum` en SQLite |
| 2026-08-24 | Preparados los dos archivos mecánicos que faltaban antes de Fase 0: [`prisma/schema.prisma`](./prisma/schema.prisma) (esquema completo, listo para migrar) y [`design/tokens.css`](./design/tokens.css) + [`design/tailwind.tokens.ts`](./design/tailwind.tokens.ts) (tokens de «Ánfora» ya en CSS/Tailwind, no solo en prosa) |
| 2026-08-24 | **Currículo A1 completo escrito**: los 7 módulos (0-6) en [`content/`](./content/) — 24 letras + 212 entradas de vocabulario + 13 notas contrastivas. Esquema unificado y validado, documentado en [`content/README.md`](./content/README.md). Desbloquea las Fases 1 y 4 completas, no solo el arranque |
| 2026-08-24 | Añadidos [`AGENTS.md`](./AGENTS.md) (convenciones que leen OpenCode/Claude Code automáticamente) y [`.env.example`](./.env.example). **El proyecto queda listo para arrancar la Fase 0** |
| 2026-08-25 | **Patrones de diseño explicitados** en [ARCHITECTURE.md](./ARCHITECTURE.md) §3.2: cuatro patrones localizados (módulo por tipo de ejercicio · alcance en tres capas · contenido como proyección · puerto aislado). Hueco corregido: no estaba dicho que schema+renderer+validator de un tipo deben vivir juntos, lo que habría dispersado cada tipo en tres carpetas |
| 2026-08-25 | **Arquitectura formal adoptada: modular por features** ([ARCHITECTURE.md](./ARCHITECTURE.md) §3.1) — código organizado por capacidad del producto, tres capas (`app → features → shared`) con regla de dependencias unidireccional impuesta por ESLint, y cada feature con `index.ts` como única API pública. Reemplaza la organización por tipo técnico de archivo, que dispersaba cada capacidad en cinco carpetas |
| 2026-08-25 | **Corrección de arquitectura (patrón 1).** Un tipo de ejercicio pasa de "un archivo `.tsx`" a **una carpeta con `schema.ts` + `renderer.tsx` + `validate.ts` + `index.ts`**. Motivo detectado al ejecutar la Fase 0: el seed valida los CSV con los mismos schemas Zod y corre en Node — si el schema viviera dentro del `.tsx` del renderer, importarlo arrastraría React al seed. La co-locación se mantiene (una carpeta = un tipo) y además se respeta la frontera servidor/cliente |
| 2026-08-25 | **Fase 0 ejecutada.** Stack confirmado: Next.js 15.5 (App Router), React 19, TS 5, Tailwind v4 (`@theme` en `globals.css`), Prisma 6.19 (SQLite), Zod v4, Serwist 9.5 (PWA), shadcn/ui (components.json + alias listos; componentes al aparecer la UI). Schemas Zod de ejercicios en `src/features/exercises/schemas.ts` (contrato) — los renderers/validators se moverán a `types/<tipo>.tsx` en la Fase 3 según el patrón 1 de §3.2. Fronteras impuestas con `import/no-restricted-paths` (shared↛features/app · features↛app · cross-feature solo por `index.ts`). `prisma migrate dev` corre, `next build` pasa, lint pasa, y la regla rechaza un import prohibido de prueba. Pendiente de tareas del usuario: instalar la PWA en el iPhone y configurar Tailscale/IP local |
| 2026-08-25 | **Fase 1 ejecutada.** Seed `prisma/seed.ts` genérico, idempotente y reconstruible desde cero (borrar `dev.db` + `prisma migrate dev` = seed automático → 2 módulos, 5 lecciones, 86 ejercicios, 31 vocabulario, 24 letras, 13 notas). Decisiones tomadas y documentadas: se siembran solo los Módulos 0 y 1 (el resto se activa al definir sus lecciones); validación Zod obligatoria por fila de CSV (griego solo caracteres griegos, sustantivo→artículo obligatorio, `tipo_palabra`/`articulo`/`transferencia` en sus conjuntos); jerarquía Módulo→Lección agrupada por `categoria` (una lección por categoría); ejercicios generados por plantilla (alfabeto→`alphabet_drill`, vocabulario→`multiple_choice`+`translation`) validados contra `ExerciseSchema`. Módulo 0 con lección propia "El alfabeto". `npm run lint` y `next build` pasan. **Los renderers/validadores de esos ejercicios (`multiple_choice`, `translation`, `alphabet_drill`) se implementan en la Fase 3** |
| 2026-08-25 | **Fase 2 ejecutada.** Login mínimo con cookie de sesión firmada (HMAC + `SESSION_SECRET`, token puro en `features/auth/lib/token.ts`), contraseñas con scrypt (Node nativo, sin deps), y **el primer inicio de sesión crea la cuenta** (app personal de un usuario; reemplazable por Auth.js — ARCHITECTURE.md §1). Onboarding de meta diaria (crea `Profile`). Layout con navegación: tab bar inferior en móvil y sidebar en escritorio (mockup AnforaHoy). Pantallas: **Hoy** (fiel al mockup: anillo de meta, continuar, repaso pendiente, palabra del día), **Curso (mapa)**, **Módulo**, **Lección** (modo foco, sin navegación). **Pantallas NO diseñadas que compuse yo siguiendo el sistema «Ánfora»** (SCREENS.md §5: hay que avisar): Curso (mapa), Módulo, y la Lección es un **placeholder** hasta la Fase 3 (el reproductor real es Fase 3); Repaso y Perfil son **stubs** (Fase 6). `lint` + `next build` pasan y el flujo Hoy→Curso→Módulo→Lección fue verificado con contenido real (curl con token de sesión). **La URL `/` redirige según sesión/perfil** |
| 2026-08-25 | **Audio del vocabulario: se resuelve en el pipeline de contenido, no en runtime.** Causa raíz: al reescribir el plan el 2026-08-23 se perdió el paso "Audio: gTTS en lote" que sí estaba en la v1, y por eso el TTS reapareció como un problema de runtime. Decisión: **pre-generar los ~236 mp3 una sola vez** con edge-tts (voz `el-GR`) y servirlos estáticos (§3 paso 3, Fase 3.5). Se descartan **Edge TTS en runtime** (API de ingeniería inversa en la ruta crítica: no funciona offline, añade latencia y un proveedor que la regla §1.1 no permite) y **Web Speech API** (iOS tiene voz griega pero Safari no expone de forma fiable las voces del sistema). Ventaja clave: el audio pre-generado es **contenido, no un proveedor** — la regla "solo DeepSeek en runtime" queda intacta y funciona offline para la Fase 6 |
| 2026-08-25 | **⚠️ LOGIN DEMO TEMPORAL para pruebas** (`user` / `1234`). No hay fase de registro, así que dejé un perfil falso que **salta la verificación de contraseña**: si el campo "usuario o correo" vale `user`, entra directo y crea/reutiliza el usuario demo (`user@demo.app`) con perfil de 15 min/día. **Hay que QUITARLO cuando exista registro o auth real.** Localizado en `src/features/auth/actions.ts` (bloque `DEMO_LOGIN` + `ensureProfile`) y el hint en `src/app/login/page.tsx` (ambos marcados `TEMP`). Además: griego-app sirve en el **puerto 3001** porque el 3000 lo usa otro proyecto (`agregador-geopolitico`) |
| 2026-08-25 | **Fase 3 ejecutada.** Motor de ejercicios según el **patrón 1** (ARCHITECTURE.md §3.2): `features/exercises/types/<tipo>/{schema,renderer,validate,index}` + `registry.ts` como único índice + `validateExercise` (despacho discriminado). Renderers de `multiple_choice` (una columna, indicador radio), `fill_blank`, `order_words` (tokens) y `translation`; los tipos `alphabet_drill`, `free_writing`, `reading_comprehension` y `repeat_word` llevan schema+validate y un renderer placeholder (sus fases: 4, 5, 7, 8). **Validación determinista** en `normalize.ts`: NFD, `accept[]`, distancia de Levenshtein con umbral por longitud, y `errorTags[]` (`acento_faltante`, `sigma_final`, `typo_aprox`) — verificado con pruebas (corrección exacta, sin acento, σ↔ς final, teclazo). **Reproductor** en `features/lesson-player` (`LessonExperience` + `checkAnswer`/`completeLesson` Server Actions): feedback inmediato, puntos, barra de progreso, y guardado de `UserAnswer` + `UserProgress` (persistencia). Corregido `countDiacritics` para acentos griegos precompuestos (NFD antes de contar). Ajuste de la regla de fronteras: el plugin matchea `except` contra rutas absolutas, así que los globs de `index.ts` por feature ahora son absolutos (el import por `index` pasa; el deep-import de otro feature sigue rechazado). `lint` + `next build` pasan. **Nota honesta:** validé la lógica determinista y el render con datos reales; el flujo multi-click completo (jugar una lección de principio a fin) no está automatizado por CLI, por lo que conviene probarlo a mano (Señalar) |
| 2026-08-25 | **Ajustes de Fase 3 (post-revisión del usuario).** (1) El renderer de `multiple_choice` ahora muestra el **prompt** (la palabra griega a traducir) — antes solo aparecía la instrucción y las opciones. (2) **La lección no se da por completada salvo que se acierten TODOS los ejercicios**: si terminas con errores, muestra "Lección incompleta" con cuántos te faltaron y un botón de intentar de nuevo; `completeLesson` solo se llama si todo es correcto. Así no vuelve a pasar "completada con 0 pts". (3) **Puntos solo al primer intento correcto** (un retry vale 0; `checkAnswer` cuenta respuestas previas del usuario). (4) **Reanudación**: la posición se deriva de las respuestas correctas (`getLessonPlayback` devuelve qué ejercicios ya están acertados); al volver a entrar, el reproductor arranca en el primer ejercicio no acertado. (5) No se bloquea el avance en ejercicios de escribir (aún no hay teclado griego, Fase 4): se puede seguir y se corrige al final con la regla de "completar = acertar todo". `lint` + `build` + `npm test` pasan |
| 2026-08-25 | **Capa de TESTS añadida (última capa de la app).** Framework: **Vitest** (el estándar actual para Next.js + TypeScript; más simple y rápido que Jest, ESM nativo, integra con el alias `@/`). Tests en `tests/units/` de las funciones puras del dominio: normalización griega (`compareText`/`levenshtein`/NFD), validadores por tipo, contrato Zod de ejercicios (`ExerciseSchema`), token de sesión (firma/verificación/anti-manipulación) y hashing de contraseña (scrypt). `npm test` → 25 tests. **Queda pendiente (fuera del alcance de esta pasada):** tests de componentes React (requiere `jsdom` + Testing Library) y **e2e con Playwright** (el flujo completo en el navegador) — anotado como capa posterior |
| 2026-08-25 | **Fase 3.5 ejecutada (audio del vocabulario).** El TTS se resuelve en el **pipeline de contenido**, no en runtime (decisión del usuario, ver arriba). Script `npm run audio:generate`: parsea los CSV → `public/audio/el/<hash>.mp3`. **edge-tts devolvió 403 → se usó gTTS** (alternativa del plan) + ffmpeg a **48 kbps mono**; **236 archivos / 1.9 MB**. Rutas content-addressed: `shared/lib/audio.ts` (hash FNV-1a → `/audio/el/<hash>.mp3`), mismo hash en generador y UI. `VocabularyEntry.audioUrl` se rellena y cada audio se registra en `MediaAsset` (fuente `gtts`) **desde el seed** (proyección idempotente). 🔊 (`AudioButton`) en `multiple_choice`, `alphabet_drill`, feedback de traducción y "palabra del día" de Hoy. **Corregido un bug del seed**: el reset borraba `Language` antes que `User`, violando FK por el perfil del usuario demo — ahora `user` (cascade) va primero. `npm test` (29), `lint` y `next build` pasan. **Pendiente del usuario:** probar el 🔊 en el iPhone con modo avión (verificación física) |

---

## 1. Definición de MVP

Curso de griego **nivel A1** jugable de principio a fin (alfabeto + 3 módulos temáticos), con 5 tipos de ejercicio, feedback del profesor IA con contexto de tu avance, progreso persistido, corriendo local y accesible desde tu iPhone como PWA instalada.

---

## 2. Currículo de contenido

> **Ver [CURRICULUM.md](./CURRICULUM.md) para la justificación completa**: los tres ejes del contenido (nivel/vertiente/tema), la verificación contra 5 manuales reales de griego, la capa de pedagogía contrastiva del par es→el, y los descriptores MCER. Aquí solo el resumen operativo para la Fase 4.

**Principio pedagógico:** el hispanohablante tiene ventaja en vocales, aspecto verbal y orden de palabras (transferencia positiva verificada, [CURRICULUM.md](./CURRICULUM.md) §4), pero **el alfabeto griego es la primera barrera** — por eso es el Módulo 0 y no se salta.

**Estructura:** `Curso es→el` → `Niveles (A1, A2, B1)` → `Módulos temáticos` → `Lecciones (8-15 ejercicios, una vertiente cada una)`.

**Nivel A1 (MVP) — revisado contra 5 manuales reales, ver [CURRICULUM.md](./CURRICULUM.md) §3 y §5:**
- **Módulo 0 — Alfabeto y sonidos:** 24 letras, mayúsculas/minúsculas, vocales (transferencia positiva, sin drill extenso), acentos (οξεία, διαλυτικά), sigma final, escribir tu nombre en griego.
- Módulo 1 — Saludos y presentarse: Γεια σου, Καλημέρα, είμαι, ονομάζομαι, από πού είσαι, números 1-100. *(fusiona lo que antes eran los módulos "Saludos" y "Presentarse" — ningún manual real los separa)*
- Módulo 2 — Familia: μητέρα, πατέρας, αδελφός… + neutro gramatical (único género sin transferencia del español).
- Módulo 3 — Rutina y comida: ψωμί, νερό, καφές… + acusativo (objeto directo).
- Módulo 4 — Números, fechas y compras + genitivo (posesión).
- Módulo 5 — Viajes y planes: ξενοδοχείο, αεροδρόμιο, πόσο κοστίζει + subjuntivo simple (να), con puente contrastivo a "quiero que leas".
- Módulo 6 — Del pasado al futuro: aóristo + futuro simple, con puente contrastivo directo a pretérito/imperfecto español.

**A2:** rutina diaria, compras, direcciones, pasado básico (αόριστος), preposiciones.
**B1:** lecturas cortas + comprensión, opiniones, subjuntivo básico.

> Cada lección combina 2-3 tipos de ejercicio de la **misma vertiente**. El vocabulario se reutiliza entre lecciones vía `VocabularyEntry` (repaso intercalado).

---

## 3. Pipeline de contenido

**Objetivo: 1 módulo por semana** una vez montado.

1. **Vocabulario:** CSV versionado en git (`content/vocab-a1.csv`) con columnas `griego | transliteración | español | imagen | categoría | nivel | notas`. → `npm run seed` → Prisma → SQLite.
2. **Imágenes:** solo licencia abierta — **Wikimedia Commons** (filtrado CC), **OpenMoji**/**Twemoji**. Cada una registrada en `MediaAsset` con fuente, licencia y atribución.
3. **Audio (TTS):** se genera **en lote, una sola vez, fuera del runtime** — `npm run audio:generate` recorre los CSV, sintetiza un `.mp3` por entrada y por letra, los guarda en `public/audio/el/`, rellena `VocabularyEntry.audioUrl` y registra cada uno en `MediaAsset`. Herramienta sugerida: **edge-tts** (voces `el-GR` de buena calidad, gratis) o `gTTS` como alternativa.
   - **Es un paso de contenido, no una dependencia de runtime.** La app solo sirve archivos estáticos: cero latencia, funciona offline (necesario para la Fase 6) y **no añade un proveedor** — la regla "solo DeepSeek en runtime" (ARCHITECTURE.md §1.1) queda intacta.
   - **Advertencia honesta:** edge-tts es una API *de ingeniería inversa* del "Leer en voz alta" de Edge, no oficial. Como herramienta de generación offline el riesgo es bajo (si Microsoft la rompe, el audio ya generado sigue sirviendo y solo se cambia el generador). **Como dependencia de runtime sería inaceptable** por fiabilidad y por términos de uso.
   - **Descartado — Web Speech API del navegador:** iOS tiene voz griega (Melina), pero Safari [no expone de forma fiable todas las voces del sistema](https://developer.apple.com/forums/thread/723503) vía `getVoices()`. No es de fiar como camino principal. Sirve, como mucho, de último recurso para texto dinámico en el futuro.
   - Volumen real: ~236 archivos (212 palabras + 24 letras), unos pocos MB. Se versionan o se regeneran con el comando; el seed debe ser idempotente igual que el resto.
4. **Ejercicios:** generados desde el CSV por plantillas (una entrada de vocabulario produce automáticamente un `multiple_choice`, un `fill_blank` y un `translation`), validados con Zod al sembrar.
5. **Lecturas (Fase 7):** textos curados o generados con LLM + **revisión humana obligatoria**.
6. **QA:** checklist por módulo antes de `isActive = true`.

---

## 4. Roadmap por fases

> Estimaciones para 1 persona a tiempo parcial, aprendiendo Next.js sobre la marcha.

### Fase 0 — Fundación (2-3 días)
- [x] Crear proyecto **Next.js** (App Router, TypeScript) + Tailwind + shadcn/ui.
- [x] Montar la estructura de **arquitectura modular por features** (ARCHITECTURE.md §3.1): `src/app`, `src/features`, `src/shared`, con las carpetas de features vacías y su `index.ts`.
- [x] Configurar la **regla de dependencias en ESLint** (`import/no-restricted-paths` o `eslint-plugin-boundaries`) para que las fronteras se impongan solas. Hacerlo ahora cuesta 5 minutos; con 40 archivos ya no.
- [x] Configurar **Prisma** + SQLite. El esquema completo ya está preparado en [`prisma/schema.prisma`](./prisma/schema.prisma) — copiarlo dentro del proyecto y correr `npx prisma migrate dev`.
- [x] Cargar el sistema de diseño «Ánfora»: [`design/tokens.css`](./design/tokens.css) → `app/globals.css`, [`design/tailwind.tokens.ts`](./design/tailwind.tokens.ts) → `theme.extend` de Tailwind.
- [x] Definir los **schemas Zod** de ejercicios (§5.1 de ARCHITECTURE) — el contrato antes que el contenido.
- [x] Configurar PWA: manifest (Metadata API) + Serwist + íconos.
- [x] **Listo cuando** (verificable por el agente): `npx prisma migrate dev` corre sin error; `npm run dev` levanta; una página consulta `Course` con Prisma y renderiza con los estilos de Ánfora — **la BD está vacía en esta fase, así que mostrar el estado vacío es el resultado correcto** (el seed es Fase 1, no inventes datos); `npm run lint` pasa y la regla de fronteras rechaza un import prohibido de prueba.

> **Tareas de esta fase que hace el usuario, no el agente** (requieren su teléfono y su red):
> - Instalar la PWA en el iPhone desde Safari y confirmar que abre.
> - Configurar **Tailscale** (o anotar la IP de red local) para llegar al servidor desde el teléfono.
>
> El agente deja el manifest y el service worker listos y **avisa** que estos dos pasos quedan pendientes; no los marca como hechos.

### Fase 1 — Datos y contenido base (3-5 días)
- [x] Completar esquema Prisma: `VocabularyEntry`, `MediaAsset`, `UserProgress`, `UserAnswer`, `ReviewQueue`, `LearnerSnapshot`, `AiFeedbackCache`.
- [x] Script `npm run seed`: CSV → validación Zod → base de datos (idempotente, reconstruible desde cero).
- [x] Contenido semilla: Módulo 0 (alfabeto) + Módulo 1 (saludos).
- [x] **Listo cuando:** borrar el `.sqlite` y correr el seed reconstruye todo el contenido sin intervención.

### Fase 2 — Flujo base de la app (4-6 días)
- [x] Login mínimo (cookie de sesión), onboarding, layout con navegación (tabs en móvil / sidebar en escritorio).
- [x] Pantallas: Hoy → Curso (mapa) → Módulo → Lección. Diseño mobile-first (ver [SCREENS.md](./SCREENS.md)).
- [x] **Listo cuando:** el flujo completo es navegable con datos reales desde el iPhone.

### Fase 3 — Motor de ejercicios (5-7 días)
- [x] **Migrar `features/exercises/schemas.ts` a la estructura del patrón 1** (ARCHITECTURE.md §3.2): una carpeta por tipo en `types/<tipo>/` con `schema.ts` + `renderer.tsx` + `validate.ts` + `index.ts`, y `registry.ts` como único índice. Se dejó como archivo único en la Fase 0 porque aún no existían renderers ni validadores.
- [x] `ExerciseRenderer` que despacha por `type` leyendo del `registry`; renderers de `multiple_choice`, `fill_blank`, `order_words`, `translation`.
- [x] **Validación determinista** en servidor: normalización NFD, `accept[]`, distancia de edición, y generación de `errorTags[]`.
- [x] Feedback inmediato, puntos, barra de progreso, guardado de `UserAnswer`.
- [x] **Listo cuando:** una lección completa se juega de principio a fin y el progreso persiste al recargar.

### Fase 3.5 — Audio del vocabulario (1 día)
> Añadida el 2026-08-25: el mockup de Lección tiene un botón 🔊 junto al término griego, pero el audio nunca se generó. El paso estaba en el pipeline de la v1 del plan y se perdió al reescribirlo el 2026-08-23.
- [x] Script `npm run audio:generate` (§3, paso 3): recorre los CSV → sintetiza un `.mp3` por entrada y por letra con **edge-tts** (voz `el-GR`) → `public/audio/el/`.
  - **Nota de ejecución (2026-08-25):** edge-tts devolvió **403** al probarlo (API de ingeniería inversa ya no disponía). Se usó la alternativa del propio plan: **gTTS** (`lang='el'`) en `scripts/gtts_batch.py`, re-encodeado con **ffmpeg** a MP3 mono **48 kbps**. Generados **236 archivos (1.9 MB)** por el hash del texto.
  - **Formato MP3 mono a 48 kbps:** correcto (verificado con `ffprobe`: 24000 Hz, mono, 48 kbps).
  - **Idempotencia real:** el archivo se nombra con un hash del texto griego (`shared/lib/audio.ts`, FNV-1a) → si el texto no cambió, el archivo ya existe y se salta.
  - Los `.mp3` **se versionan en git** (no se ignora `public/audio/el/`): si el generador desaparece, el audio sobrevive.
- [x] Rellenar `VocabularyEntry.audioUrl` y registrar cada archivo en `MediaAsset` (fuente `gtts`, voz en `attribution`) — se hace **en el seed** (proyección del contenido, idempotente y consistente con el `dev.db borrado+sembrado`).
- [x] Botón de reproducción en el reproductor de lección y en la tarjeta "palabra del día" — `<audio>`/`AudioButton` sobre archivo estático (`/audio/el/<hash>.mp3`), sin llamadas de red. Añadido en `multiple_choice` (bajo el término), `alphabet_drill` (letra), feedback de traducción (respuesta correcta) y "palabra del día" de Hoy.
- [x] **Listo cuando** (verificado en local): el `.mp3` se sirve como estático (`HTTP 200 audio/mpeg`) y el botón 🔊 aparece en la lección y en Hoy. **La prueba física en el iPhone con el modo avión activado queda pendiente del usuario** (no puedo verificar el teléfono); el mecanismo es estático, así que debería sonar sin red.

### Fase 4 — Alfabeto y teclado griego (3-4 días)
- [ ] Pantalla del alfabeto (tabla interactiva de 24 letras con nombre, sonido y ejemplo).
- [ ] `alphabet_drill` + **teclado griego en pantalla** reutilizable (con acentos y ς final).
- [ ] **Listo cuando:** puedes escribir cualquier palabra griega desde el iPhone sin cambiar el teclado del sistema.

### Fase 5 — El profesor IA (4-6 días) ⭐
- [ ] `lib/ai/tutor.ts`: cliente de DeepSeek con salida JSON forzada y manejo de errores/timeout.
- [ ] System prompt del profesor + inyección del `LearnerSnapshot`.
- [ ] `AiFeedbackCache` por `hash(ejercicio, respuesta)`.
- [ ] Recálculo del `LearnerSnapshot` al cerrar cada lección, a partir de `errorTags[]`.
- [ ] Tipo `free_writing` (respuesta abierta corregida por DeepSeek).
- [ ] UI de feedback estructurado (error señalado → corrección → explicación → ánimo).
- [ ] **Listo cuando:** al fallar un ejercicio recibes una explicación pertinente en <2 s, que **hace referencia a tus errores recurrentes reales**, y repetir el mismo error no genera una segunda llamada a la API.

### Fase 6 — Retención y stats (3-5 días)
- [ ] Repetición espaciada (SM-2): cola de repaso diaria.
- [ ] Dashboard: racha, puntos, meta diaria, palabras dominadas, errores frecuentes.
- [ ] Offline: caché de la lección en curso vía service worker.
- [ ] **Listo cuando:** existe una "sesión diaria" (repaso + lección nueva) con datos persistidos.

### Fase 7 — Lectura y comprensión (3-5 días)
- [ ] `TextReading` + UI de lectura con vocabulario tocable y preguntas.
- [ ] **Listo cuando:** una lección de lectura se juega completa.

### Fase 8 — Pronunciación (opcional, decisión pendiente — 4-6 días)
> **Bloqueada por una decisión, no por trabajo:** DeepSeek no procesa audio. Requiere agregar un segundo proveedor (Whisper API, ~$0.006/min) o aceptar que solo funcione fuera de iOS (Web Speech API). Retomar solo si el resto de la app ya está en uso diario.

### Fase 9 — Publicación (opcional)
> No es necesaria mientras el uso sea personal: la PWA instalada ya cubre el iPhone.
- [ ] Migrar Prisma de SQLite a PostgreSQL y desplegar (Oracle Free Tier / Hetzner).
- [ ] Android: empaquetar como TWA (Bubblewrap/PWABuilder) + Play Store (~$25 único).
- [ ] iOS: empaquetar con Capacitor + cuenta de desarrollador ($99/año) + App Store.

---

## 5. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| **Contenido = cuello de botella** | Alto | Pipeline CSV→BD con ejercicios generados por plantilla; objetivo 1 módulo/semana |
| **Imágenes con copyright** | Alto | Solo Commons CC + OpenMoji; `MediaAsset` registra fuente/licencia/atribución |
| **Feedback de IA genérico o inútil** | Alto | `LearnerSnapshot` con errores reales + `errorTags[]` deterministas + salida JSON estructurada; el prompt se itera como se itera el código |
| **DeepSeek caído o lento** | Medio | La corrección **no depende de la IA** (es determinista): si falla, se muestra el feedback fijo del contenido y la lección continúa |
| **Acentos griegos al comparar** | Medio | Normalización NFD + eliminación de diacríticos en toda validación |
| **Sin pronunciación hablada** | Medio | Aceptado conscientemente en el MVP; Fase 8 lo retoma si se decide agregar un segundo proveedor |
| **Costos de IA** | Bajo | Determinista primero + caché → centavos al mes; rate limiting contra bucles accidentales |
| **Alcance infinito** | Medio | Toda feature nueva pasa por este documento antes de codearse |

---

## 6. Próximos pasos

1. ✅ Documentación base: [README.md](./README.md), [ARCHITECTURE.md](./ARCHITECTURE.md), [PLAN.md](./PLAN.md), [SCREENS.md](./SCREENS.md).
2. Elegir la dirección visual entre las variantes propuestas (ver [SCREENS.md](./SCREENS.md) §4).
3. Ejecutar **Fase 0**.
4. En paralelo, empezar el CSV del Módulo 0 (alfabeto) y Módulo 1 (saludos).

---

*Documento vivo — ver §0 para el historial de decisiones.*
