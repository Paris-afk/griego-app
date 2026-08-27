import type { ExerciseModule } from "../module";
import { OrderWordsSchema } from "./schema";
import { OrderWordsRenderer } from "./renderer";
import { validateOrderWords } from "./validate";

export const orderWords: ExerciseModule<"order_words"> = {
  type: "order_words",
  schema: OrderWordsSchema,
  Renderer: OrderWordsRenderer,
  validate: validateOrderWords,
};
