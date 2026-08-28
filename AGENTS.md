# Instrucciones para agentes de código

**Griego App** — PWA personal para aprender griego moderno desde español, con un profesor de IA que explica los errores.
Este archivo lo leen automáticamente OpenCode, Claude Code y similares. **Léelo completo antes de escribir código.**

Nada está construido todavía. El repo contiene **solo documentación y archivos de configuración preparados**. Empieza por la **Fase 0** de [PLAN.md](./PLAN.md) §4.

---

## 1. Qué es este proyecto, en 30 segundos

- **Usuario:** una sola persona, uso personal. Corre en local (SQLite, sin nube). Costo objetivo: $0 + centavos de DeepSeek.
- **Plataforma:** PWA instalable en iPhone, y web en escritorio. **Mobile-first**, siempre.
- **Contenido:** griego A1 completo, ya escrito, en `content/*.csv`.
- **IA:** DeepSeek, y **solo** DeepSeek. Texto e imagen (imagen solo con `deepseek-v4-flash-vision-exp`, ARCHITECTURE.md §1.1); **audio no**.
- **La IA se usa poco a propósito:** solo en escritura abierta y errores de dictado. Los ejercicios normales usan la columna `nota` de los CSV, escrita a mano. Ver PLAN.md Fase 5.
- **La idea que define la app:** la IA **nunca decide si una respuesta es correcta** — eso lo hace código determinista. DeepSeek solo *explica* un error ya detectado, con el contexto del historial del alumno.

---

## 2. Documentación — dónde está cada cosa

| Documento | Qué contiene | Cuándo lo necesitas |
|---|---|---|
| [PLAN.md](./PLAN.md) **§4** | **Las 9 fases, en orden**, con checkboxes y criterio de "Listo cuando:" | Siempre. Trabaja UNA fase a la vez |
| [PLAN.md](./PLAN.md) §0 | Historial de decisiones y por qué se tomaron | Antes de proponer cambiar algo |
| [ARCHITECTURE.md](./ARCHITECTURE.md) **§3.1** | **La arquitectura: modular por features** + regla de dependencias | Antes de crear cualquier carpeta |
| [ARCHITECTURE.md](./ARCHITECTURE.md) §3.2 | Los 4 patrones internos | Al tocar el motor de ejercicios o la IA |
| [ARCHITECTURE.md](./ARCHITECTURE.md) §4-5 | Modelo de datos y motor de ejercicios | Fases 0-3 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) §6 | Capa de tutoría (prompts, caché, LearnerSnapshot) | Fase 5 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) §7 | **Por qué las cosas son como son** | Antes de proponer cambios |
| [EXERCISES.md](./EXERCISES.md) | **Catálogo de los 11 tipos de ejercicio** + la estructura Regla→Práctica→Consolidación | Al construir cualquier ejercicio |
| [SCREENS.md](./SCREENS.md) | Pantallas, anatomía, sistema de diseño | Al construir UI |
| [CURRICULUM.md](./CURRICULUM.md) | Qué se enseña y en qué orden | Fases 1 y 4 |
| [content/README.md](./content/README.md) | Esquema de los CSV y validaciones obligatorias | Al escribir el seed |

---

## 3. Arquitectura: modular por features

Detalle completo en [ARCHITECTURE.md](./ARCHITECTURE.md) §3.1. Lo esencial:

```
src/
  app/                       rutas App Router — DELGADAS, sin lógica de negocio
  features/
    auth/  catalog/  lesson-player/  exercises/  tutor/  review/  progress/  vocabulary/
  shared/
    ui/                      componentes del sistema «Ánfora»
    lib/db.ts                cliente Prisma singleton
prisma/                      schema + migraciones + seed
content/                     CSV versionados (fuente de verdad del contenido)
design/                      tokens y mockups (ver §4)
tests/                       últimos de la app: unit en tests/units/ (Vitest); e2e (Playwright) cuando toque
```

**Regla de dependencias — una sola dirección:** `app/ → features/ → shared/`

1. `shared/` **nunca** importa de `features/` ni de `app/`.
2. Un feature importa de otro **solo por su `index.ts`**. Nunca alcances archivos internos ajenos.
3. `app/` compone features; no contiene lógica.
4. Sin ciclos entre features.

**Anatomía idéntica en todos los features:**
```
features/<nombre>/
  index.ts        ← API pública: lo único importable desde fuera
  actions.ts      ← Server Actions (mutaciones)
  queries.ts      ← lecturas de BD
  components/     ← UI propia
  lib/            ← lógica interna
```

**El motor de ejercicios** (`features/exercises/`): cada tipo vive en **su propia carpeta** `types/<tipo>/` con `schema.ts` + `renderer.tsx` + `validate.ts` + `index.ts`, y `registry.ts` es el único índice.

> `schema.ts` es **TS puro a propósito**: el seed lo importa desde Node y no debe arrastrar React. Por eso son archivos separados y no un solo `.tsx` (ARCHITECTURE.md §3.2, patrón 1).

- **Agregar un tipo de ejercicio:** una carpeta + una línea en `registry.ts`. Si acabas tocando el reproductor de lecciones o el motor de corrección, algo se salió del patrón.
- **Agregar una capacidad nueva:** una carpeta nueva en `features/`. No toques las existentes.

---

## 4. Sistema de diseño — dónde está todo

**Dirección elegida: «Ánfora»** (cálida, editorial: papiro, terracota y oliva). Definida en [SCREENS.md](./SCREENS.md) §4.2, que es la **fuente de verdad**.

| Qué | Dónde | Qué hacer |
|---|---|---|
| Tokens de color | [`design/tokens.css`](./design/tokens.css) | Pegar en `app/globals.css` |
| Tema de Tailwind | [`design/tailwind.tokens.ts`](./design/tailwind.tokens.ts) | Importar en `theme.extend` |
| **Mockups aprobados** | `design/AnforaHoy.dc.html`<br>`design/AnforaLeccion.dc.html`<br>`design/AnforaFeedback.dc.html` | **Léelos.** Son HTML con estilos en línea: la referencia exacta de estructura, espaciado y jerarquía |

> ⚠️ **No abras `design/griego-app-direcciones.html`** — pesa 2.2 MB (es el visor del canvas) y te llenará el contexto sin aportar nada. Los tres mockups de arriba tienen todo lo que necesitas.
> Los archivos `Egeo*` y `Nocturno*` son las direcciones **descartadas**. Ignóralos.

**Tipografía:**

| Rol | Fuente |
|---|---|
| Títulos, texto del profesor, opciones de ejercicio | **Newsreader** (serif editorial, Google Fonts) |
| UI, etiquetas, botones, metadatos | Stack del sistema (`-apple-system`) |
| **Todo el texto griego** | **Noto Sans** — incluido el griego suelto dentro de un párrafo |

**Mockups existentes: solo 3 de 14 pantallas** (Hoy, Lección, Feedback) — justo las de las Fases 0-3. Las demás (Curso, Módulo, Alfabeto, Fin de lección, Perfil…) **no están diseñadas**. Cuando llegues a ellas, sigue el sistema de diseño y **avisa** que estás inventando la composición; no la des por aprobada.

**Modo oscuro:** los tokens existen pero **no está diseñado**. No lo construyas todavía.

---

## 5. Reglas no negociables

Salen de decisiones ya tomadas y documentadas. Si crees que alguna está mal, **dilo antes de romperla**, no después.

1. **La IA nunca decide si una respuesta es correcta.** La corrección es código determinista (normalización NFD, `accept[]`, distancia de edición). DeepSeek solo *explica* un error ya detectado. Ver ARCHITECTURE.md §6.1.
2. **Todo lo que sale de DeepSeek se valida con Zod** antes de usarse. `response_format: json_object` garantiza JSON válido, no los campos correctos. Si falla: un reintento, luego caer al feedback fijo del contenido.
3. **La validación vive en el servidor.** El cliente nunca calcula puntaje ni decide si algo está bien.
4. **Claves de API solo en el servidor.** Nunca `NEXT_PUBLIC_*` para secretos.
5. **El contenido es archivos versionados**, la BD es una proyección. El seed debe ser idempotente: borrar `dev.db`, sembrar, y tener todo de vuelta.
6. **Nada de griego ni español hardcodeado en componentes.** El contenido viene de la BD; los textos de UI, de archivos de traducción.
7. **Solo los colores de [`design/tokens.css`](./design/tokens.css).** Nada de inventar un gris intermedio. Contraste mínimo 4.5:1 (3:1 si el texto es ≥24px).
8. **Áreas táctiles:** 44px mínimo para cualquier cosa tocable; 56px para opciones de ejercicio y CTA principal.
9. **Sin barra de estado de iOS falsa** ni teclado falso dibujado en la UI.
10. **Todo lo que se puede testear, se testea.** Ningún tipo de ejercicio, validador ni helper puro se da por terminado sin su test. `tests/units/exercise-coverage.test.ts` tiene una **guarda anti-olvido**: un `Record<ExerciseType, …>` que falla en compilación si añades un tipo y no añades su ejemplo. No la esquives — complétala.
11. **No inventes griego.** El contenido está en `content/`. Si falta algo, dilo; no lo improvises. Un error de griego enseña algo incorrecto.

---

## 6. Convenciones técnicas

- **Next.js App Router + TypeScript.** Server Components por defecto; `"use client"` solo donde hace falta interactividad.
- **Server Actions** para mutaciones; Route Handlers solo si se necesita un endpoint HTTP real.
- **Prisma** para todo acceso a datos. Nada de SQL crudo sin explicar por qué.
- **Zod** para todo dato que cruce una frontera: `schemaJson` de ejercicios, filas del CSV al sembrar, y respuestas de DeepSeek.
- **Tests:** **Vitest** en `tests/units/` (unit de la lógica del dominio), comando `npm test`. Los tests son **la última capa del app** — el código debe poder verificarse sin el navegador. Componentes React (`jsdom`) y **e2e con Playwright** se añaden cuando la fase lo requiera.
- **Idioma:** identificadores y comentarios en inglés; texto de cara al usuario en español.
- **Commits:** en español, imperativo, una unidad de trabajo por commit.
- **Dependencias:** no instales nada pesado sin decir para qué. Esto corre en una laptop.

---

## 7. Verificar rutas protegidas

Casi todas las rutas exigen sesión, así que un `curl` pelado devuelve 307 y no
prueba nada. Para comprobarlas de verdad:

```bash
npx tsx scripts/dev-session.ts   # crea el usuario de prueba y escupe el token
```

Luego se manda como cookie `griego_session=<token>`. Útil saber:

- **`npm run db:seed` YA NO borra usuarios ni progreso** (corregido el 2026-08-28).
  Reconstruye solo el contenido, y los ids de módulos/lecciones/ejercicios se
  derivan de su contenido (`stableId`), así que lo que no cambia conserva su fila
  y las respuestas que apuntan a ella. El log dice cuántas respuestas se
  conservaron y cuánto contenido huérfano se retiró.
- Tras cambiar `prisma/schema.prisma` o correr `prisma generate`, **reinicia el
  servidor de desarrollo**. El hot-reload no recoge un cliente de Prisma
  regenerado y da errores minificados del tipo `a[d] is not a function`, que no
  apuntan a la causa real.

---

## 8. Cómo trabajar

- **Una fase a la vez.** No adelantes trabajo de fases posteriores aunque parezca fácil.
- **Antes de escribir código en una fase nueva**, resume en pocas líneas qué vas a hacer.
- **Cada fase crea SUS tests.** Añade tests (Vitest en `tests/units/`) para la lógica nueva de la fase: validadores, normalización, schemas, token de sesión, seed, etc. El código debe ser verificable sin abrir el navegador.
- **Al terminar, en verde:** antes de dar una fase por terminada corre `npm run lint`, `npm test` y `next build` (o `npm run dev` para smoke) y deja los tres en verde. Luego marca la fase `[x]` en PLAN.md.
- **Distingue lo que puedes verificar de lo que no.** Algunas tareas requieren el teléfono del usuario o su red (instalar la PWA, Tailscale). Déjalas listas, **avisa que quedan pendientes** y no las marques como hechas.
- **Si tomas una decisión técnica no documentada**, agrégala al changelog de PLAN.md §0.
- **Si la documentación resulta estar mal o incompleta**, corrige el documento en el mismo commit. Los documentos son la fuente de verdad; no los dejes desactualizados.
- **Reporta con honestidad.** Si algo no compila, si saltaste un paso, o si no pudiste verificar algo, dilo con la salida real. No declares terminado lo que no comprobaste.
