import { describe, it, expect } from "vitest";

// Verificamos que los tipos exportados desde shared son accesibles
describe("shared types", () => {
  it("should be importable", async () => {
    const mod = await import("../index.js");
    expect(mod).toBeDefined();
  });

  it("should have expected exports", async () => {
    const mod = await import("../index.js");
    // TokenResponse es uno de los tipos exportados
    // Verificamos que el módulo existe y es accesible
    expect(typeof mod).toBe("object");
  });
});
