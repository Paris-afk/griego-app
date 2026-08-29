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
| 2026-08-28 | **Catálogo de ejercicios diseñado — [EXERCISES.md](./EXERCISES.md), Fase 4.6.** Disparador: la restricción de "máx. 2 seguidos" produjo alternancia perfecta (`TR MC TR MC`) en 4 de 10 lecciones, porque solo tienen 2 tipos disponibles. Se pasa de 5 a **11 tipos**, organizados en 4 niveles cognitivos (reconocer → clasificar → producir → consolidar). **Lo central no son los tipos sino la estructura**: cada lección abre con una tarjeta `concept` que dice qué regla vas a practicar, y un botón `¿por qué?` la reabre en cualquier momento — es la respuesta directa a "lo feo de Duolingo es que aprietas sin saber por qué". Cada tipo entrena algo que la investigación del par es→el identificó: `gender_sort` el neutro, `listen_choose`/`autocomplete` las confusiones η/ι/υ y ο/ω, `case_pairs` las mayúsculas que el teclado no permite entrenar. **Ningún tipo necesita contenido nuevo** — todo sale de los 102 sustantivos con artículo, las 204 palabras sin espacio y los 236 audios ya en el repo |
| 2026-08-28 | **Fase 4.6 implementada.** 8 tipos nuevos (`concept`, `match_pairs`, `gender_sort`, `listen_choose`, `autocomplete`, `case_pairs`, `memory_grid`, `speed_round`) → 16 en total. Estructura Regla→Práctica→Consolidación: toda primera lección abre con su tarjeta y el botón **¿por qué?** la reabre sin perder progreso. Contenido de las reglas en [`content/concepts-es-el.csv`](./content/concepts-es-el.csv) (20 tarjetas, con el `bridge_language` resuelto desde contrastive-es-el.csv y validado al sembrar). **Alfabeto: de `AD MC` alternado (2 tipos) a 5 tipos** con regla y memorama de mayúsculas — que es el único sitio donde se entrenan las mayúsculas. Resultado medido: mínimo 3 tipos por lección, racha máxima de un tipo = 2. 61/61 tests, lint y build en verde |
| 2026-08-28 | **Corrección de arquitectura: dos índices en el motor de ejercicios.** `registry.ts` importa los renderers `.tsx`, así que el servidor arrastraba React solo para corregir una respuesta (y los tests no podían importarlo). Se separa `validators.ts` — despacho de validación en TS puro — que usan el servidor y los tests; `registry.ts` queda para el cliente. Mismo motivo que hace `schema.ts` un archivo aparte. Detectado al implementar la Fase 4.6 |
| 2026-08-28 | **Tests: cobertura de los 16 tipos + guarda anti-olvido.** Faltaban `free_writing`, `reading_comprehension` y `case_pairs`. Se añaden tres pruebas transversales: un `Record<ExerciseType, …>` que **falla si se añade un tipo sin ejemplo** (ya cazó a `dictation` al implementarlo), que ningún validador lance con entrada basura, y que **solo `concept` apruebe con respuesta vacía** — un tipo puntuable que aprobara sin responder dejaría avanzar la lección sin hacer nada. Regla escrita en AGENTS.md |
| 2026-08-28 | **Fase 5 implementada.** Tipo `dictation` (oír → escribir con el teclado griego): corrección **determinista**, sin IA, porque la respuesta se conoce; etiqueta `confusion_i` y `confusion_omicron_omega`, que es justo lo que entrena. Feature `tutor/` con puerto a DeepSeek (timeout 8 s, un reintento, Zod obligatorio sobre la respuesta), caché por `hash(ejercicio, respuesta)` y **rate limiting** (20/min por usuario, ARCHITECTURE.md §8). La IA solo interviene en `free_writing` y `dictation`. **Los hechos contables los genera el código** (`progress-note.ts`) y el system prompt le prohíbe a la IA inventarlos. **Render en dos tiempos**: la corrección determinista se pinta al instante y la explicación llega después, sin hoja en blanco. Verificado con test: sin `DEEPSEEK_API_KEY` la app funciona entera. 98 tests |
| 2026-08-28 | **Optimización de la capa de tutoría.** (1) **Índices** en `UserAnswer` — `(userId, answeredAt)` y `(userId, exerciseId)`: sin ellos, tanto el tutor como el conteo de intentos previos escaneaban la tabla entera. (2) **`LearnerSnapshot` recalculado al cerrar lección** (`refreshLearnerSnapshot`), no en cada respuesta: da el contexto del prompt en una lectura por clave única. (3) **Conteos dirigidos**: la nota de progreso ya no trae todas las respuestas fallidas de la semana para agregarlas en JS, hace uno o dos `count` filtrados por los tags del turno. El conteo **sigue siendo fresco** — meterlo en el snapshot habría reintroducido el bug de la frase que envejece mal. (4) Lecturas de snapshot y perfil en paralelo |
| 2026-08-28 | **`errorTags` baja a `shared/lib`.** Lo producen los ejercicios y lo consume el tutor: es exactamente el caso de la regla 4 de §3.1. Además, dejarlo en `features/exercises` obligaba a importarlo por su `index.ts`, que arrastra los renderers — así que `buildSnapshot`, una función pura de servidor, acababa dependiendo de React. Añadido un test del **invariante crítico**: ninguna etiqueta puede ser subcadena de otra, porque `errorTags` es un CSV y los conteos usan `contains`; si una fuera prefijo de otra, la nota de progreso mentiría en silencio |
| 2026-08-28 | Arreglados 6 errores de tipos **preexistentes** en `validate-exercise.test.ts` (casts `as Exercise` que ocultaban un campo obligatorio ausente). **El proyecto compila ahora con cero errores de tipos**, tests incluidos — antes `next build` no los veía porque solo revisa lo alcanzable desde la app |
| 2026-08-28 | **Ajustes tras la primera prueba real.** (1) **Las frases ya no se piden enteras**: escribir «Πώς σε λένε;» con teclado en pantalla en la primera lección son 11 pulsaciones sin haber interiorizado el alfabeto. Tipo nuevo **`phrase_blank`** — la frase se ve completa y falta UNA palabra, con opciones cuando el vocabulario da para distractores. Verificado: 0 ejercicios de escribir frases enteras. (2) **Tolerancia a acentos**: `autocomplete` y `order_words` comparaban de forma exacta y fallaban una palabra entera por una tilde. Ahora usan la normalización del resto — se acepta y se señala. Test que recorre los 4 tipos donde se escribe |
| 2026-08-28 | **Contenido: el A1 completo activado** — de 2 módulos a **7**, de 10 lecciones a **51**, de 108 ejercicios a **487**, con las 212 entradas de vocabulario. Tres regresiones que solo aparecieron con el contenido completo, y su arreglo: **MC dominaba el 50%** (se generaba para cada entrada) y el intercalado acababa amontonando 4 seguidas → ahora va en una de cada dos; **categorías diminutas** producían "lecciones" de una palabra (`verbo-a` con `έχω`) → se absorben en la anterior; **lecciones de hasta 16 ejercicios** → máximo 5 entradas por lección. Resultado: racha máx 2, mínimo 3 tipos por lección, ninguna supera 12, media de 9,5 |
| 2026-08-28 | **Fase 6 replanteada: dificultad progresiva y palabras flojas son UNA feature, no dos.** Las une un **puntaje de dominio por palabra** que decide qué te toca y qué tan difícil te lo pregunta. Construir el repaso sin dificultad haría que repasar una palabra fallada muestre el mismo ejercicio que te venció, sin andamiaje; la dificultad sin repaso no tendría señal que la mueva. Constatado que `difficulty` ya se guarda en los 487 ejercicios y **nadie lo consume** — metadato muerto — y que `ReviewQueue` está vacía. Los ejemplos de Babbel (escribir la oración solo oyéndola, decir de qué trata un texto, señalar la frase mal) son **todos del extremo difícil**: añadirlos planos repetiría el error de pedir frases enteras en la primera lección. Escalera por tipo documentada en [EXERCISES.md](./EXERCISES.md) §5 |
| 2026-08-28 | **Examen de módulo añadido como Fase 7** (la lectura pasa a 8, pronunciación a 9, publicación a 10). Es donde la IA se paga sola: **7 exámenes por nivel** frente a cientos de ejercicios, así que lo caro (foto, escritura abierta, dictado de frase) cabe ahí sin mover el costo y no cabría en la práctica diaria. Se modela como `Lesson` con `kind: EXAMEN` — no hace falta modelo nuevo. **La regla de que la IA no decide sigue en pie**: lo corregido por IA vale ≤30%, con el 70% determinista aprobado el examen está aprobado, y sin `DEEPSEEK_API_KEY` se puede aprobar entero. La **foto ya no necesita un segundo proveedor** (DeepSeek acepta imágenes desde ago-2026), y el examen es el sitio donde el riesgo del OCR de manuscrito es asumible porque hay fallback a teclado. Diseño en [EXERCISES.md](./EXERCISES.md) §6 |
| 2026-08-28 | **Fase 6 — primera mitad implementada.** `shared/lib/mastery.ts`: dominio 0-5 por palabra, **calculado sobre el historial y no almacenado**, para que no pueda desincronizarse (mismo criterio que la nota de progreso del tutor). Dos decisiones con motivo: **un fallo pesa el doble que un acierto** —acertar 4 de 5 no es dominar, es reconocer a veces— y **lo viejo pesa menos**, que es lo que la repetición espaciada intenta medir. `features/review` con **SM-2** (`nextSm2`, con la calidad DERIVADA del resultado en vez de preguntársela al alumno, para no romper el ritmo de la Fase 4.5), la pantalla **«dónde fallas»** agrupada por `errorTag` con ejemplos concretos, y el primer peldaño de la escalera: `multiple_choice` muestra **2 opciones con dominio bajo y 4 con dominio alto**. 144 tests |
| 2026-08-28 | **Fase 6 completada.** Resto de la escalera: `dictation` muestra la traducción de entrada en fácil, tras un botón en medio y **nada en difícil** (solo el oído); `phrase_blank` pasa de elegir entre opciones a escribir con el teclado. Regla que los tests fijan: **la dificultad cambia el andamiaje, nunca el criterio de corrección**. Dashboard en `/profile` con dominadas/flojas/aciertos y los errores más frecuentes, todo **derivado de `UserAnswer`** en vez de contadores que puedan desincronizarse. Caché offline de los ~236 mp3 con `CacheFirst`, **a demanda y no de golpe**, para que instalar la PWA siga siendo ligero: sin esto, el audio y el dictado no funcionan sin red, que es medio sentido de que sea una PWA. 147 tests |
| 2026-08-28 | **Corregido un fallo de diseño grave: el seed borraba usuarios y progreso.** Era tolerable sin contenido real, pero con 51 lecciones y el sistema de dominio significaba **perder la cuenta y todo el avance en cada actualización de contenido** — y era la causa real de "se cierra la sesión sola". Ahora el seed reconstruye **solo contenido**, y los ids de módulo/lección/ejercicio se derivan de su **contenido** (`stableId`) en vez de ser aleatorios: lo que no cambia conserva su fila y las respuestas que apuntan a ella; lo que cambia se retira con sus respuestas, que es la semántica correcta. Verificado sembrando dos veces con progreso de por medio. Migración de una sola vez para las filas antiguas con ids `cuid` |
| 2026-08-29 | **Ilustraciones con degradación en cascada** (imagen web → emoji → nada). El **emoji es el primario**, no el respaldo: funciona sin red, no pesa, no tiene riesgo de licencia y es instantáneo — 113 de las 212 entradas lo llevan, y se deja vacío donde no aporta (verbos abstractos, números, días), porque un emoji genérico es ruido. La imagen web es mejora opcional: su URL se guarda **en el contenido versionado**, nunca se resuelve en runtime (misma razón que el audio). `navigator.onLine` solo evita pedir lo que seguro falla; quien decide de verdad es el `onError` |
| 2026-08-29 | **Sección nueva: vocabulario por grupos** (`/vocabulary`), vía **paralela** al curso. El curso tiene su orden y su ritmo, pero a veces solo quieres repasar los meses o la familia. Comparte vocabulario y **el mismo cálculo de dominio**: es otra puerta al mismo contenido, no contenido aparte, así que lo que practiques ahí cuenta en el curso |
| 2026-08-29 | **Bug corregido: el seed duplicaba el vocabulario.** Al dejar de borrar (para conservar el progreso), `vocabularyEntry` y `alphabetLetter` seguían usando `create`: se llegaron a **1272 entradas donde debía haber 212**. Ahora usan ids estables como el resto. Verificado sembrando dos veces: 212 vocabulario, 24 letras, 487 ejercicios, y las respuestas conservadas |
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

### Fase 4.6 — Variedad y estructura de la lección (4-5 días) ⭐

> Diseño completo en **[EXERCISES.md](./EXERCISES.md)**. Añadida el 2026-08-28 tras dos rondas de ajuste de ritmo: la restricción "máximo 2 del mismo tipo seguidos" se cumplió produciendo **alternancia perfecta** (`TR MC TR MC`, `AD MC AD MC`) en 4 de 10 lecciones — igual de predecible. La causa no es el algoritmo sino que esas lecciones **solo tienen 2 tipos disponibles**.
>
> Y el problema de fondo, que ningún tipo nuevo arregla por sí solo: **no sabes qué regla estás practicando**. Eso se resuelve con estructura, no con variedad.

**Estructura de la lección (lo más importante de la fase):**
- [x] Tipo `concept` — tarjeta de regla al inicio de cada lección. No puntúa, no se falla. Usa el `bridge_language` de `contrastive-es-el.csv`, que ya está escrito.
- [x] Botón **`¿por qué?`** en la cabecera de la lección: reabre la tarjeta sin perder el progreso.
- [x] Orden obligatorio: **Regla → Práctica (reconocer→clasificar→producir) → Consolidación**. Una lección no puede ser de un solo nivel.

**Tipos nuevos** (ninguno necesita contenido nuevo — todo sale de los CSV y los 236 audios):
- [x] `match_pairs` — unir 5 parejas griego↔español. **Tocar, no arrastrar.**
- [x] `listen_choose` — oír y elegir, con distractores que suenan igual (`νησί` vs `νισί`). Entrena η/ι/υ.
- [x] `gender_sort` — ο/η/το en tres botones grandes. **102 sustantivos** ya tienen artículo (το=41, η=30, ο=26).
- [x] `case_pairs` — unir Α↔α. Cubre el hueco de mayúsculas que el teclado no permite entrenar.
- [x] `autocomplete` — completar las letras que faltan, con los huecos puestos **a propósito** en η/ι/υ y ο/ω.
- [x] `memory_grid` — memorama de 6 parejas (3×4 en móvil: cartas de 110px). Variante con audio.
- [x] `speed_round` — 10 afirmaciones ✓/✗ con cronómetro. El tiempo presiona pero no castiga.
- [x] Mejorar `letter_tiles` (`order_words`): añadir **letras distractoras** confundibles, hoy se resuelve por descarte.

- [x] **Listo cuando:** toda lección abre con su tarjeta de regla y el botón `¿por qué?` funciona; ninguna lección usa menos de 3 tipos; y las tres lecciones de alfabeto ya no son `AD MC` alternado.

### Fase 5 — Dictado y el profesor IA (4-6 días) ⭐

> **Alcance reducido el 2026-08-27.** La IA **no** interviene en los ejercicios normales (`multiple_choice`, `translation`, `alphabet_drill`). Motivo: los CSV ya traen una columna `nota` escrita a mano, y para contenido fijo una explicación humana gana a una generada — *"TRAMPA: suena casi como 'no' en español pero significa lo contrario"* es mejor que cualquier cosa que produzca un LLM, y es gratis.
>
> **La IA se reserva para donde no hay respuesta única que comparar:** escritura abierta y explicación de errores de dictado. Todo lo demás usa la `nota` del contenido.

**Dictado — el tipo de ejercicio nuevo (no necesita IA para corregir):**
- [x] Tipo `dictation`: suena el audio → el usuario escribe en griego con el teclado → **validación determinista** (la respuesta esperada se conoce).
- [x] Reutiliza lo que ya existe: los mp3 de la Fase 3.5 y el teclado griego de la Fase 4. No hay que construir infraestructura nueva.
- [x] Generarlo en el seed para el vocabulario ya sembrado.
- [x] **Por qué importa:** ataca el punto débil que ningún ejercicio actual entrena — oír `/i/` y decidir si se escribe **η, ι o υ** (las tres suenan igual), o `/o/` entre **ο y ω**. Es exactamente el `errorTag confusion_i` / `confusion_omicron_omega` de `contrastive-es-el.csv`.

**El profesor IA (alcance acotado):**
- [x] `features/tutor/`: puerto a DeepSeek con salida JSON forzada, timeout y manejo de errores.
- [x] System prompt del profesor + `LearnerSnapshot` como contexto **de tono y énfasis**.
- [x] Se invoca **solo** en: `free_writing` (respuesta abierta) y errores de `dictation`. Nunca en opción múltiple ni traducción.
- [x] **La IA nunca afirma hechos contables.** Los conteos, la racha y "lo agregué a tu repaso" los genera el código desde `errorTags`, frescos en cada render. Si la IA escribiera "es la 3ª vez esta semana" y eso se cacheara, en un mes seguiría diciéndolo y sería falso. El mockup `AnforaFeedback` ya los tiene como **dos bloques separados con iconos distintos** — respetar esa separación.
- [x] Validación Zod de la respuesta + un reintento + caída al feedback fijo del contenido. La app funciona completa sin IA.
- [x] `AiFeedbackCache` por `hash(ejercicio, respuesta normalizada)`.
- [x] **Rate limiting** en la Server Action que llama a DeepSeek (ARCHITECTURE.md §8) — no existe todavía.
- [x] **Render en dos tiempos:** la parte determinista de la hoja (escribiste / correcto / etiqueta del error) se pinta **al instante**; la explicación de la IA se rellena al llegar. Nada de dos segundos de hoja en blanco.
- [x] Recálculo del `LearnerSnapshot` al cerrar cada lección, a partir de `errorTags[]`.

- [x] **Listo cuando:** un dictado se corrige al instante sin llamar a la IA; al fallarlo, la explicación llega en <2 s **sin** que la hoja se quede vacía mientras tanto; repetir el mismo error no genera una segunda llamada; y con `DEEPSEEK_API_KEY` vacía la app sigue funcionando entera con el feedback del contenido.

> **Fuera de alcance por ahora:** la foto de escritura a mano. **Ya es técnicamente posible con DeepSeek solo** (`deepseek-v4-flash-vision-exp`, ago-2026 — ver ARCHITECTURE.md §1.1), así que no requiere un segundo proveedor. Se deja fuera por producto: el OCR de manuscrito en griego es poco fiable y marcar errores inexistentes frustraría. Se reevalúa cuando el dictado esté en uso real.

### Fase 6 — Dominio, dificultad progresiva y repaso (5-7 días) ⭐

> Diseño completo en **[EXERCISES.md](./EXERCISES.md) §5**. Ampliada el 2026-08-28: la dificultad progresiva y la sección de palabras flojas **no son dos features, son una**. Las une un puntaje de dominio por palabra que decide *qué* te toca y *qué tan difícil* te lo pregunta.
>
> Construir el repaso sin dificultad haría que repasar una palabra fallada te muestre **el mismo ejercicio que te venció**, sin andamiaje. Y la dificultad sin repaso no tendría señal que la mueva.

**1. El dominio (la columna vertebral — va primero):**
- [x] Puntaje 0-5 por `VocabularyEntry`, derivado de `UserAnswer` (aciertos, fallos, recencia).
- [x] Recalcularlo al cerrar lección, junto al `LearnerSnapshot` que ya se recalcula ahí.

**2. La escalera de dificultad (consume el dominio):**
- [x] Que los schemas admitan variantes por nivel (ver la tabla de EXERCISES.md §5).
- [x] Que el generador elija la variante según el dominio: **fallas → más fácil; aciertas → más difícil.**
- [x] Empezar por `multiple_choice` (2↔4 opciones), `dictation` (traducción visible↔oculta) y `phrase_blank` (opciones↔teclado): son los de mayor efecto y menor coste.
- [x] `difficulty` deja de ser metadato muerto: hoy está en los 487 ejercicios y **nadie lo lee**.

**3. Repaso y palabras flojas (la otra cara del mismo dato):**
- [x] Cola SM-2 diaria sobre `ReviewQueue` (ya tiene `interval`, `easeFactor`, `repetitions`; está vacía).
- [x] **Sección "dónde fallas"**: palabras de dominio bajo agrupadas por `errorTag` — *"12 fallos por acento"* es más accionable que doce palabras sueltas. Los `errorTags` se guardan desde la Fase 3.
- [x] Dashboard: racha, puntos, meta diaria, palabras dominadas, errores frecuentes.
- [x] Offline: caché de la lección en curso vía service worker.

- [x] **Listo cuando:** fallar una palabra hace que vuelva **más fácil**, y acertarla varias veces hace que vuelva **más difícil**; la sección de palabras flojas muestra agrupado por tipo de error; y existe una sesión diaria (repaso + lección nueva) con datos persistidos.

> **Tipos que esto habilita, y no antes:** `spot_the_error` (tres frases, una mal — sin dominio alto no distingues el error del desconocimiento) y `dictation` de **frase entera**, que es la cima de la escalera y no un tipo aparte.

### Fase 7 — Examen de módulo (4-5 días) ⭐

> Diseño en **[EXERCISES.md](./EXERCISES.md) §6**. Es donde la IA se paga sola: **7 exámenes por nivel** frente a cientos de ejercicios, así que las actividades caras (abiertas, con foto, corregidas por DeepSeek) caben aquí sin mover el costo — y no cabrían en la práctica diaria.
>
> **Depende de la Fase 6**: sin el puntaje de dominio, el examen sería una lección más con otro nombre — no sabría qué preguntar ni a qué nivel.

- [ ] `LessonKind.EXAMEN` — no es un modelo nuevo, es una `Lesson` al final del módulo. Reutiliza reproductor, motor y progreso.
- [ ] Comportamiento propio: sin auto-avance, sin celebración por acierto, el feedback **al final**, y nota con aprobado/suspenso al 70%.
- [ ] Contenido **acumulativo** del módulo, elegido por dominio (los puntos flojos pesan más).
- [ ] **Foto de escritura a mano** (A1): escribes 3-4 palabras en papel → `deepseek-v4-flash-vision-exp`. Ya es posible **con un solo proveedor** (ARCHITECTURE.md §1.1). **Fallback obligatorio**: si el OCR falla o no está disponible, se ofrece escribirlo con el teclado y no se pierde el examen.
- [ ] Dictado de **frase entera** y escritura libre corta.
- [ ] **La IA no decide si apruebas**: lo corregido por IA vale como máximo el **30%**; con el 70% determinista aprobado, el examen está aprobado; el juicio se muestra para poder discrepar; y si DeepSeek no responde, esas actividades puntúan como correctas y se avisa.
- [ ] **Listo cuando:** al terminar un módulo hay un examen que mezcla su contenido, da nota, y **se puede aprobar entero con `DEEPSEEK_API_KEY` vacía**.

### Fase 8 — Lectura y comprensión (3-5 días)
- [ ] `TextReading` + UI de lectura con vocabulario tocable y preguntas.
- [ ] **Listo cuando:** una lección de lectura se juega completa.

### Fase 9 — Pronunciación (opcional, decisión pendiente — 4-6 días)
> **Bloqueada por una decisión, no por trabajo:** DeepSeek no procesa audio. Requiere agregar un segundo proveedor (Whisper API, ~$0.006/min) o aceptar que solo funcione fuera de iOS (Web Speech API). Retomar solo si el resto de la app ya está en uso diario.

### Fase 10 — Publicación (opcional)
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
