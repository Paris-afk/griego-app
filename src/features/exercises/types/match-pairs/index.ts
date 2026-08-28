import type { ExerciseModule } from "../module";
import { MatchPairsSchema } from "./schema";
import { MatchPairsRenderer } from "./renderer";
import { validateMatchPairs } from "./validate";

export const matchPairs: ExerciseModule<"match_pairs"> = {
  type: "match_pairs",
  schema: MatchPairsSchema,
  Renderer: MatchPairsRenderer,
  validate: validateMatchPairs,
};
