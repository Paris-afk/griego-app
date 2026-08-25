import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";
import importPlugin from "eslint-plugin-import";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({ baseDirectory: __dirname });

// Frontedades de la arquitectura modular (ARCHITECTURE.md §3.1) impuestas por ESLint.
//   app/        → puede importar de features/ y shared/
//   features/   → puede importar de shared/ y de otros features SOLO por su index.ts
//   shared/     → NO importa de features/ ni de app/

// Genera una zona por feature para "solo se importa por index.ts".
const featuresDir = path.join(__dirname, "src", "features");
const featureNames = fs
  .readdirSync(featuresDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const crossFeatureZones = featureNames.map((name) => ({
  target: `./src/features/${name}/**`,
  from: featureNames
    .filter((other) => other !== name)
    .map((other) => `./src/features/${other}/**`),
  except: ["./src/features/**/index.ts"],
  message: `features/${name} solo puede importar de otros features por su index.ts (ARCHITECTURE.md §3.1)`,
}));

const eslintConfig = defineConfig([
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: { import: importPlugin },
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            // 1. shared/ nunca importa de features/ ni de app/.
            {
              target: "./src/shared/**",
              from: ["./src/features/**", "./src/app/**"],
              message:
                "shared/ no puede importar de features/ ni de app/ (ARCHITECTURE.md §3.1)",
            },
            // 3. features/ nunca importa de app/.
            {
              target: "./src/features/**",
              from: ["./src/app/**"],
              message:
                "features/ no puede importar de app/ (ARCHITECTURE.md §3.1)",
            },
            // 4. Un feature solo importa de otro feature por su index.ts.
            ...crossFeatureZones,
          ],
        },
      ],
    },
  },
  // Override de ignores por defecto de eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/sw.js",
    "public/swe-worker*",
  ]),
]);

export default eslintConfig;
