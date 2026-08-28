import { z } from "zod";
import { Base } from "../base";

// Ronda rápida ✓/✗ (EXERCISES.md §3.5). Entrena automatismo. El cronómetro
// presiona pero NO castiga: si se acaba cuenta como fallo y sigue.
export const SpeedRoundSchema = Base.extend({
  type: z.literal("speed_round"),
  claims: z
    .array(z.object({ greek: z.string(), spanish: z.string(), isTrue: z.boolean() }))
    .min(4)
    .max(12),
  secondsPerClaim: z.number().int().positive().default(5),
});

export type SpeedRound = z.infer<typeof SpeedRoundSchema>;
