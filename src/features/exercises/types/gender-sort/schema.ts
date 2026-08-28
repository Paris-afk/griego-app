import { z } from "zod";
import { Base } from "../base";

// El género en tres botones (EXERCISES.md §3.3). Clasificar, no recordar:
// aplica la regla. El neutro (το) es lo único que no transfiere del español.
export const GenderSortSchema = Base.extend({
  type: z.literal("gender_sort"),
  items: z
    .array(
      z.object({
        word: z.string(),
        article: z.enum(["ο", "η", "το"]),
        /** `nota` del CSV — se muestra al fallar. */
        hint: z.string().optional(),
      }),
    )
    .min(4)
    .max(10),
});

export type GenderSort = z.infer<typeof GenderSortSchema>;
