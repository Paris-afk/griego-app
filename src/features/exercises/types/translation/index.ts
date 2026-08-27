import type { ExerciseModule } from "../module";
import { TranslationSchema } from "./schema";
import { TranslationRenderer } from "./renderer";
import { validateTranslation } from "./validate";

export const translation: ExerciseModule<"translation"> = {
  type: "translation",
  schema: TranslationSchema,
  Renderer: TranslationRenderer,
  validate: validateTranslation,
};
