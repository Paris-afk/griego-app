import type { ExerciseModule } from "../module";
import { ConceptSchema } from "./schema";
import { ConceptRenderer } from "./renderer";
import { validateConcept } from "./validate";

export const concept: ExerciseModule<"concept"> = {
  type: "concept",
  schema: ConceptSchema,
  Renderer: ConceptRenderer,
  validate: validateConcept,
  // No puntúa y no se puede fallar: enseña antes de ejercitar (EXERCISES.md §2).
  isInformational: true,
};
