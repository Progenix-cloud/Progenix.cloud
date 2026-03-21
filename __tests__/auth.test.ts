import { hashPassword, verifyPassword } from "@/lib/auth";
import { describe, it, expect, beforeAll } from "vitest";

describe("Auth Functions", () => {
  const password = "testpass123";
  let hashed: string;

  beforeAll(async () => {
    hashed = await hashPassword(password);
  });

  it("should hash password", async () => {
    const hash = await hashPassword(password);
    expect(hash).toBeTypeOf("string");
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(50);
  });

  it("should verify correct password", async () => {
    const valid = await verifyPassword(password, hashed);
    expect(valid).toBe(true);
  });

  it("should reject wrong password", async () => {
    const invalid = await verifyPassword("wrongpass", hashed);
    expect(invalid).toBe(false);
  });
});
