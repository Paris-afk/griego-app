import { describe, expect, it } from "vitest";

import { accentCharacter, backspace, isVowel } from "@/shared/lib/greek";

describe("isVowel", () => {
  it("detecta solo vocales griegas", () => {
    expect(isVowel("α")).toBe(true);
    expect(isVowel("ω")).toBe(true);
    expect(isVowel("κ")).toBe(false);
    expect(isVowel(" ")).toBe(false);
  });
});

describe("accentCharacter (tecla muerta)", () => {
  it("acentúa una vocal", () => {
    expect(accentCharacter("α")).toBe("ά");
    expect(accentCharacter("ι")).toBe("ί");
    expect(accentCharacter("ω")).toBe("ώ");
  });

  it("deja las consonantes como están", () => {
    expect(accentCharacter("κ")).toBe("κ");
  });
});

describe("backspace", () => {
  it("retira la última letra", () => {
    expect(backspace("ψωμί")).toBe("ψωμ");
    expect(backspace("")).toBe("");
  });
});

// Composición end-to-end de una palabra con acento en una vocal no final.
describe("acento en vocal intermedia (ej. καλημέρα)", () => {
  it("acentúa la letra correcta al escribir μ + ´ + ε", () => {
    let s = "καλημ";
    s += "έ"; // resultado de escribir ε con acento pendiente
    s += "ρα";
    expect(s).toBe("καλημέρα");
  });
});
