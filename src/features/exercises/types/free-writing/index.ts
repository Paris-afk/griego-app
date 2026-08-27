import type { ExerciseModule } from "../module";
import { FreeWritingSchema } from "./schema";
import { FreeWritingRenderer } from "./renderer";
import { validateFreeWriting } from "./validate";

export const freeWriting: ExerciseModule<"free_writing"> = {
  type: "free_writing",
  schema: FreeWritingSchema,
  Renderer: FreeWritingRenderer,
  validate: validateFreeWriting,
};
