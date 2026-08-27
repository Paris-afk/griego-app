# Plan — Roadmap por fases — Griego App

> Ver [README.md](./README.md) para la visión, [ARCHITECTURE.md](./ARCHITECTURE.md) para el stack técnico y [SCREENS.md](./SCREENS.md) para pantallas y diseño.
> **Estado:** v3 — arquitectura revisada y confirmada (Next.js full-stack, **DeepSeek como único proveedor de IA**). ~~Pendiente iniciar Fase 0~~ → **Fases 0–4.5 completadas (2026-08-27).**

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
| 2026-08-25 | **Fase 4 ejecutada (alfabeto y teclado griego).** Nuevo modelo **`AlphabetLetter`** en Prisma (migración `alphabet_letters`) + seed desde `a1-modulo0-alfabeto.csv` (24 letras con nombre, transcripción, IPA, equivalente, transferencia) + query `getAlphabet()`. **Teclado griego en pantalla** reutilizable (`shared/ui/greek-keyboard.tsx`): layout ΕΡΤΥΘΙΟΠ / ΑΣΔΦΓΗΞΚΛ / ΖΧΨΩΒΝΜ, con tecla de **acento como TECLA MUERTA** (acentúa la **siguiente** vocal — así se puede acentuar cualquier letra, ej. καλημέρα) y **ς final** siempre visible. Integrado en `alphabet_drill`, `translation`, `fill_blank` y `free_writing`. Lógica pura en `shared/lib/greek.ts` (testeable). **Pantalla de referencia del alfabeto** en `/alphabet` (tabla de 24 letras con mayús/minús, nombre, sonido 🔊 y ejemplo) — **composición inventada por mí** (SCREENS.md §5: no está diseñada; hay que avisar); enlazada desde el Módulo 0. `npm test` (34), `lint` y `next build` pasan. **Pendiente del usuario:** probar el teclado en el iPhone (el objetivo de la fase es escribir griego sin el teclado del sistema) |
| 2026-08-25 | **⭐ Hueco conocido del teclado: solo minúsculas.** El teclado griego inserta únicamente minúsculas (sin Shift). El validador normaliza (NFD + lower), así que **no bloquea** las respuestas, pero: (1) el Módulo 0 enseña las mayúsculas, y (2) buena parte del contenido va capitalizado (`Καλημέρα`, `Δευτέρα`, `Ιανουάριος`, nombres propios). **Queda pendiente decidir si se añade una tecla Shift** (alternancia mayús/minús en el teclado) tras probar el teclado en el iPhone. No se implementa aún por no saber si al escribir a mano se prefiere capitalizar o no |
| 2026-08-27 | **Fase 4.5 ejecutada (ritmo de la lección).** **Seed:** `El alfabeto` partido en 3 lecciones de 8 (`Las letras amigas`, `Sonidos que cuestan`, `Vocales que suenan igual`), `Numero` en 2 de 10, `Identidad` en 2; lecciones de 8-12 ejercicios. **Tipos intercalados** usando los 4 renderers: MC (significado), TR (escribir), y — como el contenido es de palabra suelta (no hay frases) — **OW = ordenar las LETRAS de la palabra** (spelling, entrena η/ι/υ y ο/ω) y **FB = completar con el artículo** (solo sustantivos). `interleaveLessonExercises` baraja de forma determinista y evita la misma palabra en dos ejercicios seguidos (helpers puros en `prisma/seed-helpers.ts`, testeados). **Reproductor:** panel "Comenzar" que desbloquea el audio (regla de autoplay es por elemento → **un único `<audio>` persistente** vía `shared/lib/sound.ts`, + un segundo para sfx); **acierto → auto-avance a ~600 ms** sin "Continuar" (sonido de acierto); **error → la hoja espera** (sonido distinto, botón "Seguir"); barra de progreso **animada**; **pantalla de fin con números reales** (aciertos, puntos, racha). `exerciseSpokenText` da la palabra a pronunciar por ejercicio. SFX generados (`public/sfx/correct.mp3`/`wrong.mp3`). **Limite conocido:** `Saludo` quedó en 14 ejercicios (la categoría tiene 7 palabras y no se puede partir en dos ≥4), un poco sobre el rango 8-12. `npm test` (42), `lint` y `next build` pasan. **Pendiente del usuario:** verificar el ritmo en el iPhone (tocar "Comenzar" y jugar una lección completa acertando todo, oyendo cada palabra, sin tocar "Continuar") |
| 2026-08-27 | **Fase 4.5 — refinamientos post-revisión.** (1) **Intercalar también por TIPO**: `interleaveLessonExercises` pasó a un algoritmo voraz con puntuación que evita tanto la misma palabra seguida como que un **tipo aparezca >2 veces seguidas** (ej. "Saludo" ya no tiene 5 TR o 3 MC concatenados). (2) **Variedad en el alfabeto**: dentro de cada lección de 8, se alterna `alphabet_drill` (escribir la letra) con `multiple_choice` (ver la letra → **elegir su sonido**, con audio; reutiliza el MC existente con la letra como prompt) — ya no son 8 idénticas. (3) **`Saludo` (7 palabras) partido en 2**: `chunkSizes` ahora permite lecciones de 3 en el caso límite → las 7 palabras dan 2 lecciones (8 y 6 ejercicios) en lugar de una de 14. (4) **Fix de claves en `order_words`**: el pool usaba `key={word}` y con letras repetidas colisionaba (React duplicaba/omitía) → ahora `key=` único por índice. `npm test` (43), `lint` y `next build` pasan. **Pendiente del usuario:** probar el ritmo en el iPhone |

| 2026-08-27 | **Añadida la Fase 4.5 — Ritmo de la lección, antes del profesor IA.** Al probar la app funciona pero aburre. Hueco de planificación propio: todas las fases eran de *capacidad*, ninguna de *cómo se siente aprender*. Medido sobre el contenido real: `El alfabeto` = 24 drills idénticos seguidos, `Numero` = 20 ejercicios alternando `MC TR` mecánicamente. Tres causas separadas: lecciones demasiado largas (seed), sin variedad de tipos (seed — `fill_blank` y `order_words` ya existen sin usar), y sin ritmo (reproductor: sin autoplay, y hay que tocar "Continuar" incluso al acertar). Dato técnico que condiciona la solución: **la restricción de autoplay es por elemento** — hay que reutilizar un único `<audio>` desbloqueado en el gesto de "Comenzar", no crear uno por palabra |
| 2026-08-27 | **Corregido: DeepSeek SÍ acepta imágenes.** ARCHITECTURE.md §1.1 afirmaba que era solo texto — cierto al verificarlo el 24-ago, pero DeepSeek publicó `deepseek-v4-flash-vision-exp` el **21-ago-2026** y la nota quedó obsoleta en días. Consecuencia: la foto ya **no requiere un segundo proveedor** ni el pipeline OCR+validación de dos pasos que se diseñó al principio. Solo ese modelo acepta imágenes (otros devuelven 400), es experimental y factura hasta 384 tokens por imagen |
| 2026-08-27 | **Fase 5 con alcance reducido: la IA sale de los ejercicios normales.** No interviene en `multiple_choice`, `translation` ni `alphabet_drill` — los CSV ya traen la columna `nota` escrita a mano, y para contenido fijo una explicación humana gana a una generada (y es gratis). La IA se reserva para donde no hay respuesta única: escritura abierta y errores de dictado. Se añade el tipo **`dictation`**, que corrige de forma determinista y reutiliza el audio de la Fase 3.5 + el teclado de la Fase 4; ataca η/ι/υ y ο/ω, que ningún ejercicio actual entrena. Regla nueva: **la IA nunca afirma hechos contables** (conteos, racha) — los genera el código, porque cachear "es la 3ª vez esta semana" lo volvería falso con el tiempo |
| 2026-08-27 | **Foto de escritura a mano: fuera de alcance por producto, no por técnica.** Ya es posible con un solo proveedor, pero el OCR de manuscrito en griego es poco fiable y marcar errores inexistentes frustraría al alumno. Se reevalúa cuando el dictado esté en uso real |
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
- [x] Pantalla del alfabeto (tabla interactiva de 24 letras con nombre, sonido y ejemplo).
- [x] `alphabet_drill` + **teclado griego en pantalla** reutilizable (con acentos y ς final).
- [x] **Listo cuando:** puedes escribir cualquier palabra griega desde el iPhone sin cambiar el teclado del sistema.

### Fase 4.5 — Ritmo de la lección (2-3 días) ⭐ *va ANTES del profesor IA*

> Añadida el 2026-08-27, tras probar la app: **funciona pero aburre**. Hueco de planificación propio — todas las fases anteriores son de *capacidad*, ninguna de *cómo se siente aprender*. El feedback del profesor (Fase 5) va a aparecer dentro de este flujo, así que el flujo tiene que estar bien antes.
>
> Diagnóstico medido sobre el contenido real: `El alfabeto` son **24 `alphabet_drill` idénticos seguidos** (la primera lección que ve un usuario nuevo); `Numero` son **20 ejercicios alternando `MC TR MC TR`** mecánicamente, con la misma palabra dos veces seguidas.

**Contenido (seed):**
- [x] **Lecciones de 8-12 ejercicios.** Partir las largas: `El alfabeto` en 3 lecciones de 8 (agrupadas por dificultad de transferencia: primero las POSITIVA, luego β/ζ/θ, luego las confusiones η/ι/υ y ο/ω), `Numero` en 2 de 10.
- [x] **Intercalar tipos, no alternar.** Usar los 4 renderers que ya existen (`fill_blank` y `order_words` están construidos y sin usar). Evitar que la misma palabra aparezca en dos ejercicios seguidos.

**Reproductor:**
- [x] **Autoplay del audio.** Un **único** elemento `<audio>` persistente, desbloqueado con el gesto de "Comenzar", al que se le cambia el `src` por palabra. La restricción de autoplay es **por elemento**: crear uno nuevo por palabra lo vuelve a bloquear ([MDN](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)). Un segundo elemento, desbloqueado en el mismo gesto, para los sonidos de acierto/error.
- [x] **Acierto: avanzar solo.** Sonido corto + auto-avance a los ~600 ms, **sin tocar "Continuar"**. Tocar dos veces por respuesta correcta es lo que más mata el ritmo.
- [x] **Error: la hoja espera.** Sonido distinto y el feedback se queda hasta que el usuario lo cierre — ahí sí hay que leer.
- [x] Barra de progreso animada entre ejercicios, en lugar de saltar.

**Cierre:**
- [x] Pantalla de fin de lección con números reales: aciertos, palabras nuevas, racha. Hoy la lección simplemente termina.

- [x] **Listo cuando (verificado en local):** una lección de 10 ejercicios se juega **de principio a fin sin tocar "Continuar" ni una vez** al acertar todo, con el audio sonando solo en cada palabra. **La verificación física en el iPhone queda pendiente del usuario** (no automatizable por CLI): tocar "Comenzar" y jugar una lección completa acertando todo, oyendo cada palabra y sin tocar "Continuar".

### Fase 5 — Dictado y el profesor IA (4-6 días) ⭐

> **Alcance reducido el 2026-08-27.** La IA **no** interviene en los ejercicios normales (`multiple_choice`, `translation`, `alphabet_drill`). Motivo: los CSV ya traen una columna `nota` escrita a mano, y para contenido fijo una explicación humana gana a una generada — *"TRAMPA: suena casi como 'no' en español pero significa lo contrario"* es mejor que cualquier cosa que produzca un LLM, y es gratis.
>
> **La IA se reserva para donde no hay respuesta única que comparar:** escritura abierta y explicación de errores de dictado. Todo lo demás usa la `nota` del contenido.

**Dictado — el tipo de ejercicio nuevo (no necesita IA para corregir):**
- [ ] Tipo `dictation`: suena el audio → el usuario escribe en griego con el teclado → **validación determinista** (la respuesta esperada se conoce).
- [ ] Reutiliza lo que ya existe: los mp3 de la Fase 3.5 y el teclado griego de la Fase 4. No hay que construir infraestructura nueva.
- [ ] Generarlo en el seed para el vocabulario ya sembrado.
- [ ] **Por qué importa:** ataca el punto débil que ningún ejercicio actual entrena — oír `/i/` y decidir si se escribe **η, ι o υ** (las tres suenan igual), o `/o/` entre **ο y ω**. Es exactamente el `errorTag confusion_i` / `confusion_omicron_omega` de `contrastive-es-el.csv`.

**El profesor IA (alcance acotado):**
- [ ] `features/tutor/`: puerto a DeepSeek con salida JSON forzada, timeout y manejo de errores.
- [ ] System prompt del profesor + `LearnerSnapshot` como contexto **de tono y énfasis**.
- [ ] Se invoca **solo** en: `free_writing` (respuesta abierta) y errores de `dictation`. Nunca en opción múltiple ni traducción.
- [ ] **La IA nunca afirma hechos contables.** Los conteos, la racha y "lo agregué a tu repaso" los genera el código desde `errorTags`, frescos en cada render. Si la IA escribiera "es la 3ª vez esta semana" y eso se cacheara, en un mes seguiría diciéndolo y sería falso. El mockup `AnforaFeedback` ya los tiene como **dos bloques separados con iconos distintos** — respetar esa separación.
- [ ] Validación Zod de la respuesta + un reintento + caída al feedback fijo del contenido. La app funciona completa sin IA.
- [ ] `AiFeedbackCache` por `hash(ejercicio, respuesta normalizada)`.
- [ ] **Rate limiting** en la Server Action que llama a DeepSeek (ARCHITECTURE.md §8) — no existe todavía.
- [ ] **Render en dos tiempos:** la parte determinista de la hoja (escribiste / correcto / etiqueta del error) se pinta **al instante**; la explicación de la IA se rellena al llegar. Nada de dos segundos de hoja en blanco.
- [ ] Recálculo del `LearnerSnapshot` al cerrar cada lección, a partir de `errorTags[]`.

- [ ] **Listo cuando:** un dictado se corrige al instante sin llamar a la IA; al fallarlo, la explicación llega en <2 s **sin** que la hoja se quede vacía mientras tanto; repetir el mismo error no genera una segunda llamada; y con `DEEPSEEK_API_KEY` vacía la app sigue funcionando entera con el feedback del contenido.

> **Fuera de alcance por ahora:** la foto de escritura a mano. **Ya es técnicamente posible con DeepSeek solo** (`deepseek-v4-flash-vision-exp`, ago-2026 — ver ARCHITECTURE.md §1.1), así que no requiere un segundo proveedor. Se deja fuera por producto: el OCR de manuscrito en griego es poco fiable y marcar errores inexistentes frustraría. Se reevalúa cuando el dictado esté en uso real.

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
