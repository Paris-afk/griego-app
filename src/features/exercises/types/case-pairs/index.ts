import type { ExerciseModule } from "../module";
import { CasePairsSchema } from "./schema";
import { CasePairsRenderer } from "./renderer";
import { validateCasePairs } from "./validate";

export const casePairs: ExerciseModule<"case_pairs"> = {
  type: "case_pairs",
  schema: CasePairsSchema,
  Renderer: CasePairsRenderer,
  validate: validateCasePairs,
};
