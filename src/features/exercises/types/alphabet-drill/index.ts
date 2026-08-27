import type { ExerciseModule } from "../module";
import { AlphabetDrillSchema } from "./schema";
import { AlphabetDrillRenderer } from "./renderer";
import { validateAlphabetDrill } from "./validate";

export const alphabetDrill: ExerciseModule<"alphabet_drill"> = {
  type: "alphabet_drill",
  schema: AlphabetDrillSchema,
  Renderer: AlphabetDrillRenderer,
  validate: validateAlphabetDrill,
};
