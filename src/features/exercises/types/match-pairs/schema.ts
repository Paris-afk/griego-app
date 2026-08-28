import { z } from "zod";
import { Base } from "../base";

// Unir parejas griego↔español (EXERCISES.md §3.2). Se TOCA, no se arrastra.
export const MatchPairsSchema = Base.extend({
  type: z.literal("match_pairs"),
  pairs: z
    .array(z.object({ left: z.string(), right: z.string() }))
    .min(3)
    .max(6),
  /** `audio` reproduce el término griego al tocarlo (variante de escucha). */
  withAudio: z.boolean().default(false),
});

export type MatchPairs = z.infer<typeof MatchPairsSchema>;
