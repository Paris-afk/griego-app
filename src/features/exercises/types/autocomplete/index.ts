import type { ExerciseModule } from "../module";
import { AutocompleteSchema } from "./schema";
import { AutocompleteRenderer } from "./renderer";
import { validateAutocomplete } from "./validate";

export const autocomplete: ExerciseModule<"autocomplete"> = {
  type: "autocomplete",
  schema: AutocompleteSchema,
  Renderer: AutocompleteRenderer,
  validate: validateAutocomplete,
};
