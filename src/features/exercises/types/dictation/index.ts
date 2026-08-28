import type { ExerciseModule } from "../module";
import { DictationSchema } from "./schema";
import { DictationRenderer } from "./renderer";
import { validateDictation } from "./validate";

export const dictation: ExerciseModule<"dictation"> = {
  type: "dictation",
  schema: DictationSchema,
  Renderer: DictationRenderer,
  validate: validateDictation,
};
