import { describe, expect, it } from "vitest";

import { createSessionToken, verifySessionToken } from "@/features/auth/lib/token";

const USER_ID = "user123";

describe("session token", () => {
  it("firma y verifica un token válido", () => {
    const token = createSessionToken(USER_ID);
    expect(verifySessionToken(token)).toBe(USER_ID);
  });

  it("rechaza un token manipulado", () => {
    const token = createSessionToken(USER_ID);
    const tampered = token.slice(0, -2) + "xx";
    expect(verifySessionToken(tampered)).toBeNull();
  });

  it("rechaza un token con firma incorrecta", () => {
    const payload = Buffer.from(JSON.stringify({ sub: USER_ID, exp: Date.now() + 100000 })).toString("base64url");
    const fake = `${payload}.firmaInvalida`;
    expect(verifySessionToken(fake)).toBeNull();
  });

  it("rechaza formato inválido", () => {
    expect(verifySessionToken("solo-una-parte")).toBeNull();
    expect(verifySessionToken("")).toBeNull();
  });
});
