# Plan — Roadmap por fases — Griego App

> Ver [README.md](./README.md) para la visión, [ARCHITECTURE.md](./ARCHITECTURE.md) para el stack técnico y [SCREENS.md](./SCREENS.md) para pantallas y diseño.
> **Estado:** v3 — arquitectura revisada y confirmada (Next.js full-stack, **DeepSeek como único proveedor de IA**). Pendiente iniciar Fase 0.

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
3. **Ejercicios:** generados desde el CSV por plantillas (una entrada de vocabulario produce automáticamente un `multiple_choice`, un `fill_blank` y un `translation`), validados con Zod al sembrar.
4. **Lecturas (Fase 7):** textos curados o generados con LLM + **revisión humana obligatoria**.
5. **QA:** checklist por módulo antes de `isActive = true`.

---

## 4. Roadmap por fases

> Estimaciones para 1 persona a tiempo parcial, aprendiendo Next.js sobre la marcha.

### Fase 0 — Fundación (2-3 días)
- [ ] Crear proyecto **Next.js** (App Router, TypeScript) + Tailwind + shadcn/ui.
- [ ] Montar la estructura de **arquitectura modular por features** (ARCHITECTURE.md §3.1): `src/app`, `src/features`, `src/shared`, con las carpetas de features vacías y su `index.ts`.
- [ ] Configurar la **regla de dependencias en ESLint** (`import/no-restricted-paths` o `eslint-plugin-boundaries`) para que las fronteras se impongan solas. Hacerlo ahora cuesta 5 minutos; con 40 archivos ya no.
- [ ] Configurar **Prisma** + SQLite. El esquema completo ya está preparado en [`prisma/schema.prisma`](./prisma/schema.prisma) — copiarlo dentro del proyecto y correr `npx prisma migrate dev`.
- [ ] Cargar el sistema de diseño «Ánfora»: [`design/tokens.css`](./design/tokens.css) → `app/globals.css`, [`design/tailwind.tokens.ts`](./design/tailwind.tokens.ts) → `theme.extend` de Tailwind.
- [ ] Definir los **schemas Zod** de ejercicios (§5.1 de ARCHITECTURE) — el contrato antes que el contenido.
- [ ] Configurar PWA: manifest + Serwist + íconos; instalarla en el iPhone desde Safari.
- [ ] Acceso desde el iPhone: **Tailscale** (o IP de red local).
- [ ] **Listo cuando:** `npx prisma migrate dev` corre, una página lista cursos desde la BD local con los estilos de Ánfora aplicados, y la PWA se instala en tu iPhone.

### Fase 1 — Datos y contenido base (3-5 días)
- [ ] Completar esquema Prisma: `VocabularyEntry`, `MediaAsset`, `UserProgress`, `UserAnswer`, `ReviewQueue`, `LearnerSnapshot`, `AiFeedbackCache`.
- [ ] Script `npm run seed`: CSV → validación Zod → base de datos (idempotente, reconstruible desde cero).
- [ ] Contenido semilla: Módulo 0 (alfabeto) + Módulo 1 (saludos).
- [ ] **Listo cuando:** borrar el `.sqlite` y correr el seed reconstruye todo el contenido sin intervención.

### Fase 2 — Flujo base de la app (4-6 días)
- [ ] Login mínimo (cookie de sesión), onboarding, layout con navegación (tabs en móvil / sidebar en escritorio).
- [ ] Pantallas: Hoy → Curso (mapa) → Módulo → Lección. Diseño mobile-first (ver [SCREENS.md](./SCREENS.md)).
- [ ] **Listo cuando:** el flujo completo es navegable con datos reales desde el iPhone.

### Fase 3 — Motor de ejercicios (5-7 días)
- [ ] `ExerciseRenderer` que despacha por `type`; renderers de `multiple_choice`, `fill_blank`, `order_words`, `translation`.
- [ ] **Validación determinista** en servidor: normalización NFD, `accept[]`, distancia de edición, y generación de `errorTags[]`.
- [ ] Feedback inmediato, puntos, barra de progreso, guardado de `UserAnswer`.
- [ ] **Listo cuando:** una lección completa se juega de principio a fin y el progreso persiste al recargar.

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
