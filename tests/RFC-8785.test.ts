import { describe, expect, it } from "vitest";
import { canonicalize } from "../src/canonicalize";

describe("RFC 8785 canonicalization", () => {
  it("serializes -0 as 0", () => {
    expect(canonicalize(-0)).toBe("0");
  });

  it("normalizes exponent form", () => {
    expect(canonicalize(1e1)).toBe("10");     // JS → "10"
    expect(canonicalize(1e-01)).toBe("0.1");  // JS → "0.1"
  });

  it("does not escape forward slashes", () => {
    expect(canonicalize("a/b")).toBe("\"a/b\"");
  });

  it("escapes control characters", () => {
    expect(canonicalize("\u0001")).toBe("\"\\u0001\"");
  });

  it("preserves Unicode code units", () => {
    const composed = "é";       // U+00E9
    const decomposed = "e\u0301"; // U+0065 + U+0301
    expect(canonicalize(composed)).not.toBe(canonicalize(decomposed));
  });

  it("canonicalizes nested structures deterministically", () => {
    const x = { z: 1, a: { y: 2, x: 3 } };
    const y = { a: { x: 3, y: 2 }, z: 1 };
    expect(canonicalize(x)).toBe(canonicalize(y));
  });
});