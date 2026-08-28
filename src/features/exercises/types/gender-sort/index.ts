import type { ExerciseModule } from "../module";
import { GenderSortSchema } from "./schema";
import { GenderSortRenderer } from "./renderer";
import { validateGenderSort } from "./validate";

export const genderSort: ExerciseModule<"gender_sort"> = {
  type: "gender_sort",
  schema: GenderSortSchema,
  Renderer: GenderSortRenderer,
  validate: validateGenderSort,
};
