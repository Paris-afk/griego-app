# Griego App — aprender griego moderno desde el español

> App personal (no comercial) tipo Babbel para aprender **griego moderno** desde el **español**. Un solo código base: funciona como **PWA instalable** en el iPhone y como página web en escritorio.

## Documentación

| Documento | Contenido |
|---|---|
| **[PLAN.md](./PLAN.md)** | Roadmap por fases, pipeline de contenido, riesgos, **historial de decisiones** |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Stack, diagramas, modelo de datos, motor de ejercicios, capa de IA, **revisión crítica de la arquitectura** |
| **[CURRICULUM.md](./CURRICULUM.md)** | Los tres ejes del contenido (nivel/vertiente/tema), currículo A1 verificado contra manuales reales, **pedagogía contrastiva por par de idiomas** |
| **[SCREENS.md](./SCREENS.md)** | Inventario de pantallas, anatomía de las críticas, sistema de diseño — **dirección visual «Ánfora» elegida** |

---

## 1. Visión

Estudiar griego con actividades variadas (opción múltiple, completar, ordenar frases, traducir, escribir libre) y un **profesor de IA** que no solo dice "incorrecto", sino que **señala el error concreto, lo explica en español y conoce tu historial** — sabe que ya llevas tres veces olvidando el acento agudo esta semana.

El contenido (idiomas, cursos, módulos, ejercicios) es **siempre datos versionados**, nunca código: el mismo motor sirve para griego hoy y para cualquier otro par de idiomas mañana, sin tocar el código.

## 2. Alcance actual

- **Uso:** personal, un solo usuario. El modelo de datos ya soporta múltiples usuarios, así que abrirlo después no es un rediseño.
- **Plataformas:** PWA instalable en iOS (Safari → "Añadir a pantalla de inicio") y Android, más web en escritorio.
- **Costo:** $0 de infraestructura (corre local) + centavos al mes de DeepSeek.

## 3. Stack en una línea

**Next.js (App Router, full-stack) · Prisma · SQLite → PostgreSQL · TailwindCSS + shadcn/ui · Serwist (PWA) · DeepSeek (único proveedor de IA).**

### Las tres decisiones que definen el proyecto

1. **Un solo proyecto, un solo lenguaje.** Next.js hace de frontend y de backend (Server Actions). No hay un Django aparte, ni CORS, ni dos despliegues.
2. **La IA nunca decide si una respuesta es correcta.** Eso lo hace código determinista (normalización Unicode, `accept[]`, distancia de edición). DeepSeek **solo explica** — por eso la app es barata, rápida y reproducible, y no te reprueba una respuesta buena porque el modelo tuvo un mal día.
3. **DeepSeek es solo texto.** Consecuencia asumida: se escribe con **teclado griego en pantalla**, no con foto. La pronunciación por voz queda pendiente porque exigiría un segundo proveedor — ver [ARCHITECTURE.md](./ARCHITECTURE.md) §1.1.

## 4. Glosario

| Término | Significado |
|---|---|
| **Course** | Un par de idiomas: español → griego |
| **Level** | A1, A2, B1… dentro de un curso |
| **Module** | Bloque temático (Alfabeto, Saludos, Números…) |
| **Lesson** | 8-15 ejercicios dentro de un módulo |
| **Exercise** | Una actividad, definida por `type` + un JSON validado con Zod |
| **VocabularyEntry** | Una palabra del banco, reutilizable entre ejercicios |
| **errorTags** | Etiquetas del error cometido (`acento_faltante`, `sigma_final`…) — la memoria estructurada del profesor |
| **LearnerSnapshot** | Resumen compacto de tu avance que se inyecta al prompt de DeepSeek |
| **ReviewQueue** | Cola de repaso espaciado (algoritmo SM-2) |

## 5. Cómo correr el proyecto

*(se completa en la Fase 0)*

```bash
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

---

*Documentación viva: [PLAN.md](./PLAN.md) §0 lleva el historial de todas las decisiones.*
