import type { ExerciseModule } from "../module";
import { ReadingComprehensionSchema } from "./schema";
import { ReadingComprehensionRenderer } from "./renderer";
import { validateReadingComprehension } from "./validate";

export const readingComprehension: ExerciseModule<"reading_comprehension"> = {
  type: "reading_comprehension",
  schema: ReadingComprehensionSchema,
  Renderer: ReadingComprehensionRenderer,
  validate: validateReadingComprehension,
};
