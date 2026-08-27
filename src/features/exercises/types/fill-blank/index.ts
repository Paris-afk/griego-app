import type { ExerciseModule } from "../module";
import { FillBlankSchema } from "./schema";
import { FillBlankRenderer } from "./renderer";
import { validateFillBlank } from "./validate";

export const fillBlank: ExerciseModule<"fill_blank"> = {
  type: "fill_blank",
  schema: FillBlankSchema,
  Renderer: FillBlankRenderer,
  validate: validateFillBlank,
};
