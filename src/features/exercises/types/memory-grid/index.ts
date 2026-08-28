import type { ExerciseModule } from "../module";
import { MemoryGridSchema } from "./schema";
import { MemoryGridRenderer } from "./renderer";
import { validateMemoryGrid } from "./validate";

export const memoryGrid: ExerciseModule<"memory_grid"> = {
  type: "memory_grid",
  schema: MemoryGridSchema,
  Renderer: MemoryGridRenderer,
  validate: validateMemoryGrid,
};
