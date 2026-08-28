import type { ExerciseModule } from "../module";
import { PhraseBlankSchema } from "./schema";
import { PhraseBlankRenderer } from "./renderer";
import { validatePhraseBlank } from "./validate";

export const phraseBlank: ExerciseModule<"phrase_blank"> = {
  type: "phrase_blank",
  schema: PhraseBlankSchema,
  Renderer: PhraseBlankRenderer,
  validate: validatePhraseBlank,
};
