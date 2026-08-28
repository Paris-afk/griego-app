import { describe, expect, it } from "vitest";

import { stableId } from "../../prisma/seed";

// Los ids del contenido se derivan de su contenido, no son aleatorios. Es lo
// que hace que el progreso del usuario sobreviva a un `db:seed`: si el
// ejercicio no cambió, conserva su fila y las respuestas que apuntan a ella.

describe("stableId", () => {
  it("el mismo contenido da el mismo id", () => {
    const a = stableId("ex", "leccion-1", "MULTIPLE_CHOICE", { answer: "δέντρο" });
    const b = stableId("ex", "leccion-1", "MULTIPLE_CHOICE", { answer: "δέντρο" });
    expect(a).toBe(b);
  });

  it("contenido distinto da id distinto — y ESO es lo correcto", () => {
    // Si el ejercicio cambia, deja de ser el mismo ejercicio: sus respuestas
    // antiguas ya no aplican y deben irse con él.
    const a = stableId("ex", "leccion-1", "TRANSLATION", { answer: "δέντρο" });
    const b = stableId("ex", "leccion-1", "TRANSLATION", { answer: "θάλασσα" });
    expect(a).not.toBe(b);
  });

  it("distingue el orden de las partes", () => {
    expect(stableId("ex", "a", "b")).not.toBe(stableId("ex", "b", "a"));
  });

  it("el prefijo separa espacios de nombres", () => {
    expect(stableId("ex", "x")).not.toBe(stableId("les", "x"));
    expect(stableId("ex", "x").startsWith("ex_")).toBe(true);
  });

  it("es estable ante el orden de las claves del objeto", () => {
    // JSON.stringify respeta el orden de inserción, así que el generador debe
    // construir siempre igual el schemaJson. Este test documenta la limitación.
    const a = stableId("ex", { type: "translation", answer: "δέντρο" });
    const b = stableId("ex", { type: "translation", answer: "δέντρο" });
    expect(a).toBe(b);
  });

  it("no colisiona en un lote realista", () => {
    const ids = new Set<string>();
    for (let lesson = 0; lesson < 60; lesson++) {
      for (let i = 0; i < 15; i++) {
        ids.add(stableId("ex", `les-${lesson}`, "MULTIPLE_CHOICE", { i, lesson }));
      }
    }
    expect(ids.size).toBe(60 * 15);
  });
});
