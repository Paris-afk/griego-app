import { z } from "zod";

// Campos base de todos los ejercicios (ARCHITECTURE.md §5.1).
export const Base = z.object({
  instruction: z.string(),
  points: z.number().int().positive().default(10),
  difficulty: z.enum(["easy", "medium", "hard"]).default("easy"),
});
