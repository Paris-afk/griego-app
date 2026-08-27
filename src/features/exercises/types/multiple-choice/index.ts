import type { ExerciseModule } from "../module";
import { MultipleChoiceSchema } from "./schema";
import { MultipleChoiceRenderer } from "./renderer";
import { validateMultipleChoice } from "./validate";

export const multipleChoice: ExerciseModule<"multiple_choice"> = {
  type: "multiple_choice",
  schema: MultipleChoiceSchema,
  Renderer: MultipleChoiceRenderer,
  validate: validateMultipleChoice,
};
