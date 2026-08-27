import type { ExerciseModule } from "../module";
import { RepeatWordSchema } from "./schema";
import { RepeatWordRenderer } from "./renderer";
import { validateRepeatWord } from "./validate";

export const repeatWord: ExerciseModule<"repeat_word"> = {
  type: "repeat_word",
  schema: RepeatWordSchema,
  Renderer: RepeatWordRenderer,
  validate: validateRepeatWord,
};
