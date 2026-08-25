# Instrucciones para agentes de código

Proyecto: **Griego App** — PWA personal para aprender griego moderno desde español.
Este archivo lo leen automáticamente OpenCode, Claude Code y herramientas similares. Léelo completo antes de escribir código.

---

## Lee esto primero

| Documento | Para qué |
|---|---|
| [PLAN.md](./PLAN.md) §4 | **Las fases, en orden.** Trabaja UNA fase a la vez. Cada una tiene su criterio de "Listo cuando:" |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Stack, modelo de datos, motor de ejercicios, capa de IA. **§3.1 son los patrones de diseño a seguir** (y los que NO). **§7 explica por qué las cosas son como son** — lee ambas antes de proponer cambios |
| [CURRICULUM.md](./CURRICULUM.md) | Qué se enseña y en qué orden; los tres ejes del contenido |
| [SCREENS.md](./SCREENS.md) | Pantallas y sistema de diseño |

---

## Archivos ya preparados — NO los reinventes

| Archivo | Qué hacer con él |
|---|---|
| [`prisma/schema.prisma`](./prisma/schema.prisma) | Esquema completo, listo. Copiarlo y correr `npx prisma migrate dev`. No rediseñar los modelos |
| [`design/tokens.css`](./design/tokens.css) | Pegar en `app/globals.css`. Es la paleta «Ánfora» ya elegida |
| [`design/tailwind.tokens.ts`](./design/tailwind.tokens.ts) | Importar en `theme.extend` de `tailwind.config.ts` |
| [`design/Anfora*.dc.html`](./design/) | Mockups aprobados de Hoy, Lección y Feedback. **Son la referencia visual** — replica su estructura y espaciado |
| [`content/*.csv`](./content/) | **Currículo A1 completo** (7 módulos, 212 entradas). El seed los lee. **No inventes vocabulario griego** — si falta algo, dilo en vez de improvisarlo. Esquema y validaciones obligatorias en [`content/README.md`](./content/README.md) |
| [`.env.example`](./.env.example) | Copiar a `.env.local` |

---

## Reglas del proyecto (no negociables)

Estas salen de decisiones ya tomadas y documentadas. Si crees que alguna está mal, **dilo antes de romperla**, no después.

1. **La IA nunca decide si una respuesta es correcta.** La corrección es código determinista (normalización NFD, `accept[]`, distancia de edición). DeepSeek solo *explica* un error ya detectado. Ver ARCHITECTURE.md §6.1.
2. **Todo lo que sale de DeepSeek se valida con Zod** antes de usarse. `response_format: json_object` garantiza JSON válido, no los campos correctos. Si falla la validación: un reintento, luego caer al feedback fijo del contenido.
3. **La validación vive en el servidor.** El cliente nunca calcula puntaje ni decide si algo está bien.
4. **Las claves de API solo en el servidor.** Nunca `NEXT_PUBLIC_*` para secretos.
5. **El contenido es archivos versionados**, la BD es una proyección. El seed debe ser idempotente: borrar `dev.db`, correr seed, y tener todo de vuelta.
6. **Nada de griego ni español hardcodeado en componentes.** Los textos de contenido vienen de la BD; los de UI, de archivos de traducción.
7. **Solo los colores de [`design/tokens.css`](./design/tokens.css).** Nada de inventar un gris intermedio. Contraste mínimo 4.5:1 (3:1 si el texto es ≥24px).
8. **Áreas táctiles:** 44px mínimo para cualquier cosa tocable, 56px para opciones de ejercicio y CTA principal.
9. **El griego siempre en la fuente `--font-greek`** (Noto Sans), incluido el griego suelto dentro de un párrafo. Es restricción pedagógica: distingue ο/σ y ξ/ζ.
10. **Sin barra de estado de iOS falsa** ni teclado falso en la UI.

---

## Convenciones técnicas

- **Next.js App Router + TypeScript.** Server Components por defecto; `"use client"` solo donde hace falta interactividad.
- **Server Actions** para mutaciones; Route Handlers solo si hace falta un endpoint HTTP real.
- **Prisma** para todo acceso a datos. Nada de SQL crudo sin una razón explicada.
### Arquitectura: modular por features (ARCHITECTURE.md §3.1 — no la reorganices)

```
src/
  app/                       rutas App Router — DELGADAS, sin lógica de negocio
  features/
    auth/  catalog/  lesson-player/  exercises/  tutor/  review/  progress/  vocabulary/
  shared/
    ui/                      componentes del sistema «Ánfora»
    lib/db.ts                cliente Prisma singleton
prisma/                      schema + migraciones + seed
content/                     CSV versionados (ver content/README.md)
```

**Regla de dependencias — en una sola dirección:** `app/ → features/ → shared/`

1. `shared/` **nunca** importa de `features/` ni de `app/`.
2. Un feature importa de otro **solo por su `index.ts`**. Nunca alcances archivos internos de otro feature.
3. `app/` compone features; no contiene lógica.
4. Sin ciclos entre features.

**Cada feature tiene la misma anatomía:**
```
features/<nombre>/
  index.ts        ← API pública: lo único importable desde fuera
  actions.ts      ← Server Actions (mutaciones)
  queries.ts      ← lecturas de BD
  components/     ← UI propia
  lib/            ← lógica interna
```

**El motor de ejercicios** (`features/exercises/`) sigue el patrón de módulo por tipo: `types/<tipo>.tsx` lleva **schema Zod + renderer + validator juntos**, y `registry.ts` es el único índice.

- **Al agregar un tipo de ejercicio:** un archivo en `features/exercises/types/` + una línea en `registry.ts`. Nada más. Si acabas tocando el reproductor de lecciones o el motor de corrección, algo se salió del patrón.
- **Al agregar una capacidad nueva:** una carpeta nueva en `features/`. No toques las existentes.
- **Idioma del código:** identificadores y comentarios en inglés; texto de cara al usuario en español.
- **Commits:** mensajes en español, imperativo, una unidad de trabajo por commit.

---

## Cómo trabajar

- **Una fase a la vez.** No adelantes trabajo de fases posteriores aunque parezca fácil.
- **Al terminar una fase**, verifica su criterio de "Listo cuando:" y márcala `[x]` en PLAN.md.
- **Si tomas una decisión técnica no documentada**, agrégala al changelog de PLAN.md §0.
- **Si algo de la documentación resulta estar mal o incompleto**, corrige el documento en el mismo commit. Los documentos son la fuente de verdad; no los dejes desactualizados.
- **No instales dependencias pesadas** sin decir para qué. El proyecto corre local en una laptop.

---

## Estado actual

Nada construido todavía. **Empieza por la Fase 0** de [PLAN.md](./PLAN.md) §4.
