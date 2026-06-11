import { describe, it, expect } from "vitest";

describe("health check", () => {
  it("should pass a basic sanity test", () => {
    expect(1 + 1).toBe(2);
  });

  it("should have NODE_ENV available", () => {
    // En CI se setea a "test" o "production"
    expect(process.env.NODE_ENV).toBeDefined();
  });
});
