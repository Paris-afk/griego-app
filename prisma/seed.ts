import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client";
import { z } from "zod";

import { ExerciseSchema } from "../src/features/exercises/schemas";
import { audioPathForText } from "../src/shared/lib/audio";
import {
  chunkSizes,
  interleaveLessonExercises,
  type LessonExercise,
} from "./seed-helpers";

// ─────────────────────────────────────────────────────────────────────────────
// Seed del contenido — «contenido como datos, BD como proyección» (§3 de PLAN
// y principio 1 de ARCHITECTURE.md). Lee los CSV versionados de content/, los
// valida con Zod y reconstruye la jerarquía del curso. IDEMPOTENTE: borra lo
// que sembró en una corrida anterior y vuelve a crearlo, para que el estado
// final no dependa de cuántas veces se haya corrido.
//
// Esquema y validaciones obligatorias documentadas en content/README.md.
// En la Fase 1 se siembran los Módulos 0 (alfabeto) y 1 (saludos) — el resto
// de módulos se activa cuando su contenido/lecciones estén definidos.
// ─────────────────────────────────────────────────────────────────────────────

const CONTENT_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "content",
);

// Solo caracteres griegos (+ espacios y signos de puntuación griegos).
// \p{Script=Greek} cubre las letras griegas incluidas ς (sigma final).
const GREEK_ONLY = /^[\p{Script=Greek}\s;\u037E]+$/u;

const PART_OF_SPEECH = [
  "sustantivo",
  "verbo",
  "adjetivo",
  "adverbio",
  "numeral",
  "expresión",
  "partícula",
] as const;

const ARTICULOS = ["ο", "η", "το", "οι", "τα", ""] as const;

const VocabRow = z.object({
  griego: z
    .string()
    .trim()
    .min(1)
    .regex(
      GREEK_ONLY,
      'La columna `griego` debe contener solo caracteres griegos (content/README.md).',
    ),
  articulo: z
    .string()
    .optional()
    .transform((v) => (v ?? "").trim()),
  forma_base: z.string().optional(),
  transliteracion: z.string().trim().min(1),
  espanol: z.string().trim().min(1),
  categoria: z.string().trim().min(1),
  tipo_palabra: z.enum(PART_OF_SPEECH),
  nota: z.string().optional(),
}).superRefine((row, ctx) => {
  if (!ARTICULOS.includes(row.articulo as (typeof ARTICULOS)[number])) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["articulo"],
      message: `articulo debe ser uno de ${ARTICULOS.join(", ")} o vacío`,
    });
  }
  if (row.tipo_palabra === "sustantivo" && !row.articulo) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["articulo"],
      message: "todo sustantivo debe llevar su artículo (ο/η/το/οι/τα)",
    });
  }
});
type VocabRowOutput = z.infer<typeof VocabRow>;

const TRANSFERENCIA = ["POSITIVA", "NEGATIVA", "NEUTRA"] as const;

const AlphabetRow = z.object({
  orden: z.coerce.number().int().positive(),
  mayuscula: z.string().trim().min(1),
  minuscula: z.string().trim().min(1),
  nombre_gr: z.string().trim().min(1),
  nombre_translit: z.string().trim().min(1),
  sonido_ipa: z.string().trim().min(1),
  equivalente_es: z.string().trim().min(1),
  transferencia: z.enum(TRANSFERENCIA),
  nota: z.string().optional(),
});

const ContrastiveRow = z.object({
  feature: z.string().trim().min(1),
  error_tag: z.string().trim().min(1),
  transfer_type: z.enum(TRANSFERENCIA),
  note: z.string().trim().min(1),
  bridge_language: z.string().trim().min(1),
});

// ─────────────────────────────────────────────────────────────────────────────
// Parser de CSV (salta comentarios `#` y líneas vacías; usa el header como
// orden de columnas, así el orden del archivo no importa).
// ─────────────────────────────────────────────────────────────────────────────

function parseCsv(fileName: string): Record<string, string>[] {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, fileName), "utf8");
  const lines = raw.split(/\r?\n/).filter((l) => {
    const t = l.trim();
    return t.length > 0 && !t.startsWith("#");
  });
  const header = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    // Delimitar con csv.parse: maneja comillas y campos con comas.
    const cells = splitCsvLine(line);
    if (cells.length !== header.length) {
      throw new Error(
        `${fileName}: la fila tiene ${cells.length} columnas, se esperaban ${header.length}: "${line}"`,
      );
    }
    return Object.fromEntries(header.map((h, i) => [h, cells[i]]));
  });
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      cells.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells.map((c) => c.trim());
}

// ─────────────────────────────────────────────────────────────────────────────
// Metadatos de la jerarquía del curso — el mapeo del contenido al modelo de
// datos (Course → Level → Module → Lesson → Exercise).
// ─────────────────────────────────────────────────────────────────────────────

const COURSE_TITLE = "Griego A1";
const LEVEL_NAME = "A1";

// Módulos sembrados en esta fase, con su número (orden) y título.
const SEED_MODULES = [
  { file: "a1-modulo0-alfabeto.csv", number: 0, title: "Alfabeto y sonidos" },
  { file: "a1-modulo1-saludos.csv", number: 1, title: "Saludos y presentarse" },
] as const;

// El alfabeto se parte en 3 lecciones de 8 (orden de la letra en el CSV), por
// dificultad de transferencia: primero las directas, luego las que cuestan
// (β/ζ/θ), luego las confusiones η/ι/υ y ο/ω (las que más cuestan a un
// hispanohablante).
const ALPHABET_GROUPS = [
  { title: "Las letras amigas", orders: [1, 4, 5, 10, 11, 12, 13, 16] },
  { title: "Sonidos que cuestan", orders: [2, 3, 6, 8, 14, 17, 18, 22] },
  { title: "Vocales que suenan igual", orders: [7, 9, 15, 19, 20, 21, 23, 24] },
] as const;

// Verbo del módulo temático: alfabeto → una lección; temático → una lección
// por categoría (cada categoría agrupa una vertiente de vocabulario afín).
function titleCase(input: string): string {
  return input
    .split(/\s+/)
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

// Genera de forma determinista n distractores que difieren del correcto.
function pickDistractors(pool: string[], correct: string, count: number): string[] {
  const unique = [...new Set(pool.filter((v) => v !== correct))];
  const out: string[] = [];
  for (let i = 0; i < unique.length && out.length < count; i++) {
    out.push(unique[i]);
  }
  return out;
}

function lessonTitle(base: string, lessonOrder: number, totalParts: number): string {
  return totalParts > 1 ? `${base} · ${lessonOrder + 1}/${totalParts}` : base;
}

// Construye los ejercicios de una lección a partir de sus entradas: MC (significado)
// + un ejercicio secundario que rota entre TR (escribir), OW (ordenar letras, ortografía)
// y FB (artículo — solo sustantivos). Luego intercala para no repetir palabra seguida.
function buildLessonExercises(
  entries: VocabRowOutput[],
  seedKey: string,
): LessonExercise[] {
  const spanPool = entries.map((e) => e.espanol);
  const items: LessonExercise[] = [];
  entries.forEach((entry, i) => {
    const distractors = pickDistractors(spanPool, entry.espanol, 3);
    if (distractors.length >= 1) {
      items.push({
        word: entry.griego,
        type: "MULTIPLE_CHOICE",
        schemaJson: makeMultipleChoice(entry.griego, entry.espanol, distractors),
      });
    }

    const rotation = i % 3;
    if (rotation === 1 && !/\s/.test(entry.griego) && Array.from(entry.griego).length >= 2) {
      items.push({
        word: entry.griego,
        type: "ORDER_WORDS",
        schemaJson: makeOrderWords(entry.espanol, entry.griego),
      });
    } else if (rotation === 2 && entry.articulo) {
      items.push({
        word: entry.griego,
        type: "FILL_BLANK",
        schemaJson: makeFillBlankArticle(entry.articulo, entry.griego),
      });
    } else {
      items.push({
        word: entry.griego,
        type: "TRANSLATION",
        schemaJson: makeTranslation(entry.espanol, entry.griego),
      });
    }
  });
  return interleaveLessonExercises(items, seedKey);
}

// ─────────────────────────────────────────────────────────────────────────────
// Construcción de exercises por tipo (plantillas del pipeline, §3 de PLAN).
// Cada schemaJson se valida contra el contrato ExerciseSchema antes de guardar.
// ─────────────────────────────────────────────────────────────────────────────

function makeMultipleChoice(
  prompt: string,
  correct: string,
  distractors: string[],
) {
  const schema = {
    type: "multiple_choice",
    instruction: "¿Qué significa esta palabra?",
    points: 10,
    difficulty: "easy",
    prompt: { text: prompt, image: undefined },
    options: [
      { text: correct, image: undefined },
      ...distractors.map((text) => ({ text, image: undefined })),
    ],
    answer: correct,
  } as const;
  return assertExercise(schema);
}

function makeTranslation(spanish: string, greek: string) {
  const schema = {
    type: "translation",
    instruction: "Escribe la palabra en griego:",
    points: 10,
    difficulty: "easy",
    prompt: { text: spanish },
    answer: greek,
    accept: [],
  } as const;
  return assertExercise(schema);
}

function makeAlphabetDrill(letter: string, concept: string, accept: string[]) {
  const schema = {
    type: "alphabet_drill",
    instruction: "Escribe la letra:",
    points: 10,
    difficulty: "easy",
    prompt: { text: concept },
    letter,
    answer: letter,
    accept,
  } as const;
  return assertExercise(schema);
}

function assertExercise(schema: unknown) {
  const parsed = ExerciseSchema.safeParse(schema);
  if (!parsed.success) {
    throw new Error(
      `schemaJson de ejercicio inválido: ${JSON.stringify(schema)}\n${parsed.error.message}`,
    );
  }
  return parsed.data;
}

// Ordenar las LETRAS de la palabra (spelling). Como el contenido es de una sola
// palabra (no hay frases), order_words se usa a nivel de letras: entrena la
// ortografía — justo el punto débil η/ι/υ y ο/ω.
function makeOrderWords(spanish: string, greek: string) {
  const letters = Array.from(greek);
  const schema = {
    type: "order_words",
    instruction: "Ordena las letras:",
    points: 10,
    difficulty: "easy",
    prompt: { text: `Ordena las letras de: ${spanish}` },
    orderType: "word",
    words: letters,
    answer: letters,
  } as const;
  return assertExercise(schema);
}

// Completar con el artículo (género) — solo para sustantivos con artículo.
function makeFillBlankArticle(articulo: string, greek: string) {
  const schema = {
    type: "fill_blank",
    instruction: "Completa:",
    points: 10,
    difficulty: "easy",
    prompt: { text: `Escribe el artículo de: ${greek}` },
    answer: articulo,
    accept: [articulo],
  } as const;
  return assertExercise(schema);
}

// Ver la letra y elegir su sonido (multiple_choice con la letra como prompt;
// el audio de la letra se reproduce con el autoplay del reproductor).
function makeAlphabetChoiceMC(letter: string, correctSound: string, distractors: string[]) {
  const schema = {
    type: "multiple_choice",
    instruction: "Elige cómo suena esta letra:",
    points: 10,
    difficulty: "easy",
    prompt: { text: letter, image: undefined },
    options: [
      { text: correctSound, image: undefined },
      ...distractors.map((text) => ({ text, image: undefined })),
    ],
    answer: correctSound,
  } as const;
  return assertExercise(schema);
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed
// ─────────────────────────────────────────────────────────────────────────────

const prisma = new PrismaClient();

async function main() {
  // Borrar lo sembrado antes (dependencias: hijos primero). El contenido que
  // apunta a usuarios se limpia para reconstruir el curso desde cero.
  // `user` PRIMERO: su cascade borra perfiles/respuestas, y los perfiles
  // referencian `Language` — si borráramos Language antes, violaría la FK.
  await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.userAnswer.deleteMany(),
    prisma.userProgress.deleteMany(),
    prisma.reviewQueue.deleteMany(),
    prisma.learnerSnapshot.deleteMany(),
    prisma.aiFeedbackCache.deleteMany(),
    prisma.exercise.deleteMany(),
    prisma.textReading.deleteMany(),
    prisma.vocabularyEntry.deleteMany(),
    prisma.mediaAsset.deleteMany(),
    prisma.alphabetLetter.deleteMany(),
    prisma.contrastiveNote.deleteMany(),
    prisma.lesson.deleteMany(),
    prisma.module.deleteMany(),
    prisma.level.deleteMany(),
    prisma.course.deleteMany(),
    prisma.language.deleteMany(),
  ]);

  // Idiomas y curso (el "par" es→el — CURRICULUM.md §4).
  const es = await prisma.language.upsert({
    where: { code: "es" },
    update: {},
    create: { name: "Español", code: "es" },
  });
  const el = await prisma.language.upsert({
    where: { code: "el" },
    update: {},
    create: { name: "Griego moderno", code: "el" },
  });

  const course = await prisma.course.upsert({
    where: { sourceLanguageId_targetLanguageId: { sourceLanguageId: es.id, targetLanguageId: el.id } },
    update: {},
    create: {
      title: COURSE_TITLE,
      sourceLanguageId: es.id,
      targetLanguageId: el.id,
      isActive: true,
    },
  });

  const level = await prisma.level.upsert({
    where: { courseId_order: { courseId: course.id, order: 1 } },
    update: {},
    create: { courseId: course.id, name: LEVEL_NAME, order: 1 },
  });

  const stats = { modules: 0, lessons: 0, exercises: 0, vocabulary: 0, letters: 0, notes: 0 };

  // ── Módulo 1 — temático (vocabulario) ────────────────────────────────────
  for (const mod of SEED_MODULES) {
    if (mod.number !== 1) continue;

    const rows = parseCsv(mod.file).map((r) => VocabRow.parse(r));
    const prismaModule = await prisma.module.create({
      data: { levelId: level.id, title: mod.title, order: mod.number },
    });
    stats.modules++;

    // VocabularyEntry + MediaAsset una vez por entrada (independiente de la
    // partición en lecciones).
    for (const entry of rows) {
      await prisma.vocabularyEntry.create({
        data: {
          languageId: el.id,
          term: entry.griego,
          translation: entry.espanol,
          transliteration: entry.transliteracion,
          partOfSpeech: entry.tipo_palabra,
          tags: entry.categoria,
          audioUrl: audioPathForText(entry.griego),
        },
      });
      stats.vocabulary++;
      await prisma.mediaAsset.create({
        data: {
          url: audioPathForText(entry.griego),
          type: "AUDIO",
          source: "gtts",
          license: "personal",
          attribution: "gTTS (Google) · voz griega (el-GR)",
        },
      });
    }

    // Lecciones por categoría, partidas en 4-6 entradas (→ 8-12 ejercicios),
    // con tipos intercalados (MC + TR/OW/FB rotando) sin repetir palabra seguida.
    const byCategory = groupBy(rows, (r) => r.categoria);
    let lessonOrder = 0;
    for (const [categoria, entries] of byCategory) {
      const sizes = chunkSizes(entries.length);
      let offset = 0;
      let partIndex = 0;
      for (const size of sizes) {
        const chunk = entries.slice(offset, offset + size);
        offset += size;
        const title = lessonTitle(titleCase(categoria), partIndex, sizes.length);
        partIndex++;
        const lesson = await prisma.lesson.create({
          data: {
            moduleId: prismaModule.id,
            title,
            order: lessonOrder++,
            kind: "VOCABULARIO",
          },
        });
        stats.lessons++;

        const items = buildLessonExercises(chunk, `${categoria}-${offset}`);
        let exerciseOrder = 0;
        for (const ex of items) {
          await prisma.exercise.create({
            data: {
              lessonId: lesson.id,
              type: ex.type,
              schemaJson: ex.schemaJson,
              order: exerciseOrder++,
            },
          });
          stats.exercises++;
        }
      }
    }
  }

  // ── Módulo 0 — alfabeto (esquema propio) ─────────────────────────────────
  for (const mod of SEED_MODULES) {
    if (mod.number !== 0) continue;

    const rows = parseCsv(mod.file).map((r) => AlphabetRow.parse(r));
    const prismaModule = await prisma.module.create({
      data: { levelId: level.id, title: mod.title, order: mod.number },
    });
    stats.modules++;

    // Letra de referencia una vez por letra (pantalla del alfabeto, Fase 4).
    for (const letter of rows) {
      await prisma.alphabetLetter.create({
        data: {
          languageId: el.id,
          order: letter.orden,
          uppercase: letter.mayuscula,
          lowercase: letter.minuscula,
          nameGreek: letter.nombre_gr,
          nameTranslit: letter.nombre_translit,
          ipa: letter.sonido_ipa,
          equivalentEs: letter.equivalente_es,
          transferencia: letter.transferencia,
          note: letter.nota,
        },
      });
    }

    // 3 lecciones de 8 (partir las 24 seguidas, que aburrían). Dentro de cada
    // una, alterno alphabet_drill (escribir) y multiple_choice (ver la letra →
    // elegir su sonido) para que no sean 8 idénticas.
    const soundPool = rows.map((r) => r.equivalente_es);
    const byId = new Map(rows.map((r) => [r.orden, r]));
    let lessonOrder = 0;
    for (const group of ALPHABET_GROUPS) {
      const lesson = await prisma.lesson.create({
        data: {
          moduleId: prismaModule.id,
          title: group.title,
          order: lessonOrder++,
          kind: "VOCABULARIO",
        },
      });
      stats.lessons++;

      let exerciseOrder = 0;
      for (const [i, orden] of group.orders.entries()) {
        const letter = byId.get(orden);
        if (!letter) continue;
        const minuscules = letter.minuscula.split(/\s+/).filter(Boolean);
        const lowercase = minuscules[0];
        const concept = `${letter.nombre_gr} (${letter.nombre_translit}): suena como "${letter.equivalente_es}"`;

        // Impares → escribir la letra; pares → reconocer su sonido.
        if (i % 2 === 0) {
          const accept = [...new Set([lowercase, letter.mayuscula, ...minuscules])];
          await prisma.exercise.create({
            data: {
              lessonId: lesson.id,
              type: "ALPHABET_DRILL",
              schemaJson: makeAlphabetDrill(lowercase, concept, accept),
              order: exerciseOrder++,
            },
          });
          stats.exercises++;
          stats.letters++;
        } else {
          const distractors = pickDistractors(soundPool, letter.equivalente_es, 3);
          if (distractors.length >= 1) {
            await prisma.exercise.create({
              data: {
                lessonId: lesson.id,
                type: "MULTIPLE_CHOICE",
                schemaJson: makeAlphabetChoiceMC(lowercase, letter.equivalente_es, distractors),
                order: exerciseOrder++,
              },
            });
            stats.exercises++;
          } else {
            const accept = [...new Set([lowercase, letter.mayuscula, ...minuscules])];
            await prisma.exercise.create({
              data: {
                lessonId: lesson.id,
                type: "ALPHABET_DRILL",
                schemaJson: makeAlphabetDrill(lowercase, concept, accept),
                order: exerciseOrder++,
              },
            });
            stats.exercises++;
            stats.letters++;
          }
        }
      }
    }
  }

  // ── Notas contrastivas (contrastive-es-el.csv) ────────────────────────────
  const contrastiveRows = parseCsv("contrastive-es-el.csv").map((r) =>
    ContrastiveRow.parse(r),
  );
  for (const note of contrastiveRows) {
    await prisma.contrastiveNote.create({
      data: {
        courseId: course.id,
        feature: note.feature,
        transferType: note.transfer_type,
        note: note.note,
        bridgeLanguage: note.bridge_language,
      },
    });
    stats.notes++;
  }

  console.log("Seed completado:", stats);
}

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    const list = map.get(k) ?? [];
    list.push(item);
    map.set(k, list);
  }
  return map;
}

main()
  .catch((e) => {
    console.error("Fallo el seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
