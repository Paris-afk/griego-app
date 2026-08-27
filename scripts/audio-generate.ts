import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { audioHash } from "../src/shared/lib/audio";

// Generador de audio del vocabulario (Fase 3.5 / §3 paso 3).
// Pre-genera un .mp3 por entrada y por letra y lo sirve estático desde
// /audio/el/. Idempotente: el nombre del archivo deriva de un hash del texto
// griego, así que si el texto no cambió, el archivo ya existe y se salta.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(PROJECT_ROOT, "content");
const OUT_DIR = path.join(PROJECT_ROOT, "public", "audio", "el");
const PYTHON_SCRIPT = path.join(__dirname, "gtts_batch.py");

// splitCsvLine maneja campos entre comillas (basado en el parser del seed).
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

// Devuelve las filas de un CSV (salta `#` y vacías), mapeadas por header.
function readRows(fileName: string): Record<string, string>[] {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, fileName), "utf8");
  const lines = raw.split(/\r?\n/).filter((l) => {
    const t = l.trim();
    return t.length > 0 && !t.startsWith("#");
  });
  const header = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    return Object.fromEntries(header.map((h, i) => [h, cells[i]]));
  });
}

const VOCAB_FILES = [
  "a1-modulo1-saludos.csv",
  "a1-modulo2-familia.csv",
  "a1-modulo3-rutina-comida.csv",
  "a1-modulo4-numeros-compras.csv",
  "a1-modulo5-viajes-planes.csv",
  "a1-modulo6-pasado-futuro.csv",
];

function collectTexts(): string[] {
  const texts: string[] = [];
  // Letras del alfabeto (la minúscula estándar).
  for (const row of readRows("a1-modulo0-alfabeto.csv")) {
    const letter = (row.minuscula ?? "").split(/\s+/)[0];
    if (letter) texts.push(letter);
  }
  // Palabras/frases de vocabulario (columna `griego`).
  for (const file of VOCAB_FILES) {
    for (const row of readRows(file)) {
      const text = (row.griego ?? "").trim();
      if (text) texts.push(text);
    }
  }
  return texts;
}

function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const texts = [...new Set(collectTexts())];
  const missing: { text: string; file: string }[] = [];

  for (const text of texts) {
    const file = path.join(OUT_DIR, `${audioHash(text)}.mp3`);
    if (!fs.existsSync(file)) missing.push({ text, file });
  }

  console.log(`Textos únicos: ${texts.length} · archivos a generar: ${missing.length}`);

  if (missing.length === 0) {
    console.log("Audio al día — nada que regenerar (idempotente).");
    return;
  }

  const manifestPath = path.join(PROJECT_ROOT, ".audio-manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(missing));

  // Falta edge-tts (403 hoy) → usamos gTTS como alternativa (§3 paso 3).
  const result = spawnSync("python3", [PYTHON_SCRIPT, manifestPath], {
    stdio: "inherit",
    cwd: PROJECT_ROOT,
  });
  fs.rmSync(manifestPath, { force: true });

  if (result.error) {
    throw new Error(`No se pudo ejecutar python3: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`El generador de audio falló (status ${result.status}).`);
  }
  console.log("Audio generado en public/audio/el/.");
}

main();
