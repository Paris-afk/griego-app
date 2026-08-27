import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/features/auth/lib/password";

describe("password hashing (scrypt)", () => {
  it("verifica la contraseña correcta", () => {
    const stored = hashPassword("1234");
    expect(verifyPassword("1234", stored)).toBe(true);
  });

  it("rechaza una contraseña incorrecta", () => {
    const stored = hashPassword("1234");
    expect(verifyPassword("12345", stored)).toBe(false);
  });

  it("genera hashes distintos (salt aleatorio)", () => {
    expect(hashPassword("1234")).not.toBe(hashPassword("1234"));
  });

  it("rechaza un stored malformado", () => {
    expect(verifyPassword("x", "malformado")).toBe(false);
  });
});
