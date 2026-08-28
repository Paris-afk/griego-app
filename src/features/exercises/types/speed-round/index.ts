import type { ExerciseModule } from "../module";
import { SpeedRoundSchema } from "./schema";
import { SpeedRoundRenderer } from "./renderer";
import { validateSpeedRound } from "./validate";

export const speedRound: ExerciseModule<"speed_round"> = {
  type: "speed_round",
  schema: SpeedRoundSchema,
  Renderer: SpeedRoundRenderer,
  validate: validateSpeedRound,
};
