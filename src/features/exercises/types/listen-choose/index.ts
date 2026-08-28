import type { ExerciseModule } from "../module";
import { ListenChooseSchema } from "./schema";
import { ListenChooseRenderer } from "./renderer";
import { validateListenChoose } from "./validate";

export const listenChoose: ExerciseModule<"listen_choose"> = {
  type: "listen_choose",
  schema: ListenChooseSchema,
  Renderer: ListenChooseRenderer,
  validate: validateListenChoose,
};
