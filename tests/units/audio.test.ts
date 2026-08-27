import { describe, expect, it } from "vitest";

import { audioHash, audioPathForText } from "@/shared/lib/audio";

describe("audioPathForText", () => {
  it("es determinista (mismo texto → misma ruta)", () => {
    expect(audioPathForText("Γεια σου")).toBe(audioPathForText("Γεια σου"));
  });

  it("sigue el patrón /audio/el/<hash>.mp3", () => {
    const path = audioPathForText("ψωμί");
    expect(path).toMatch(/^\/audio\/el\/[0-9a-f]{8}\.mp3$/);
  });

  it("cambia si cambia el texto", () => {
    expect(audioPathForText("ψωμί")).not.toBe(audioPathForText("νερό"));
  });

  it("el hash es estable y de 8 hex", () => {
    expect(audioHash("α")).toMatch(/^[0-9a-f]{8}$/);
  });
});
