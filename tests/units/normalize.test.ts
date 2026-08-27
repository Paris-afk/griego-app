import { describe, expect, it } from "vitest";

import {
  compareText,
  countDiacritics,
  levenshtein,
  normalizeForComparison,
} from "@/features/exercises/normalize";

describe("normalizeForComparison", () => {
  it("elimina acentos y pone minúsculas", () => {
    expect(normalizeForComparison("ΨΩΜΊ")).toBe("ψωμί".normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
    expect(normalizeForComparison("δεντρο")).toBe(normalizeForComparison("δέντρο"));
  });

  it("normaliza a minúsculas", () => {
    expect(normalizeForComparison("ΓΕΙΑ")).toBe("γεια");
  });
});

describe("countDiacritics", () => {
  it("cuenta acentos griegos precompuestos (NFD)", () => {
    expect(countDiacritics("δέντρο")).toBe(1);
    expect(countDiacritics("δεντρο")).toBe(0);
  });
});

describe("levenshtein", () => {
  it("mide distancia de edición", () => {
    expect(levenshtein("hola", "hola")).toBe(0);
    expect(levenshtein("hola", "hoda")).toBe(1);
    expect(levenshtein("hola", "hla")).toBe(1);
    expect(levenshtein("", "abc")).toBe(3);
  });
});

describe("compareText", () => {
  it("acepta respuesta exacta", () => {
    const r = compareText("ψωμί", [], "ψωμί");
    expect(r.isCorrect).toBe(true);
    expect(r.errorTags).toEqual([]);
  });

  it("acepta sin acento y marca acento_faltante", () => {
    const r = compareText("ψωμί", [], "ψωμι");
    expect(r.isCorrect).toBe(true);
    expect(r.errorTags).toContain("acento_faltante");
  });

  it("acepta sigma final σ ↔ ς con tag sigma_final", () => {
    const r = compareText("Κύριος", [], "κυριοσ");
    expect(r.isCorrect).toBe(true);
    expect(r.errorTags).toContain("sigma_final");
  });

  it("acepta una variante de accept[]", () => {
    const r = compareText("δέντρο", ["δένδρο"], "δενδρο");
    expect(r.isCorrect).toBe(true);
  });

  it("detecta teclazo cercano como typo_aprox", () => {
    const r = compareText("Κύριος", [], "κουριος");
    expect(r.isCorrect).toBe(false);
    expect(r.errorTags).toContain("typo_aprox");
  });

  it("rechaza respuesta totalmente distinta", () => {
    const r = compareText("Κύριος", [], "παπα");
    expect(r.isCorrect).toBe(false);
    expect(r.errorTags).toEqual([]);
  });
});
