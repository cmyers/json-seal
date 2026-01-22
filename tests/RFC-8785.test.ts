import { describe, expect, it } from "vitest";
import { canonicalize } from "../src/canonicalize";

describe("RFC 8785 canonicalization", () => {
  /* ---------------------------------------------------------------------- */
  /* Numbers                                                                */
  /* ---------------------------------------------------------------------- */

  it("serializes -0 as 0", () => {
    expect(canonicalize(-0)).toBe("0");
  });

  it("rejects non-finite numbers", () => {
    expect(() => canonicalize(NaN)).toThrow();
    expect(() => canonicalize(Infinity)).toThrow();
    expect(() => canonicalize(-Infinity)).toThrow();
  });

  it("normalizes exponent form", () => {
    expect(canonicalize(1e1)).toBe("10");
    expect(canonicalize(1e-1)).toBe("0.1");
    expect(canonicalize(1e5)).toBe("100000");
    expect(canonicalize(1e-5)).toBe("0.00001");
  });

  it("removes leading zeros in exponent", () => {
    expect(canonicalize(1e+05)).toBe("100000");
    expect(canonicalize(1e-05)).toBe("0.00001");
  });

  /* ---------------------------------------------------------------------- */
  /* Strings                                                                */
  /* ---------------------------------------------------------------------- */

  it("does not escape forward slashes", () => {
    expect(canonicalize("a/b")).toBe("\"a/b\"");
  });

  it("escapes control characters", () => {
    expect(canonicalize("\u0001")).toBe("\"\\u0001\"");
  });

  it("preserves Unicode code units (no normalization)", () => {
    const composed = "é";        // U+00E9
    const decomposed = "e\u0301"; // U+0065 + U+0301
    expect(canonicalize(composed)).not.toBe(canonicalize(decomposed));
  });

  /* ---------------------------------------------------------------------- */
  /* Surrogate pairs (UTF‑16 correctness)                                   */
  /* ---------------------------------------------------------------------- */

  it("rejects isolated high surrogate", () => {
    expect(() => canonicalize("\uD800")).toThrow();
  });

  it("rejects isolated low surrogate", () => {
    expect(() => canonicalize("\uDC00")).toThrow();
  });

  it("rejects broken surrogate pair", () => {
    expect(() => canonicalize("\uD800a")).toThrow();
  });

  it("accepts valid surrogate pair", () => {
    expect(canonicalize("😃")).toBe("\"😃\"");
  });

  /* ---------------------------------------------------------------------- */
  /* Objects                                                                */
  /* ---------------------------------------------------------------------- */

  it("sorts keys by UTF‑16 code units", () => {
    const obj = { b: 1, "á": 2, a: 3 };
    expect(canonicalize(obj)).toBe("{\"a\":3,\"b\":1,\"á\":2}");
  });

  it("canonicalizes nested structures deterministically", () => {
    const x = { z: 1, a: { y: 2, x: 3 } };
    const y = { a: { x: 3, y: 2 }, z: 1 };
    expect(canonicalize(x)).toBe(canonicalize(y));
  });

  /* ---------------------------------------------------------------------- */
  /* Arrays                                                                 */
  /* ---------------------------------------------------------------------- */

  it("canonicalizes arrays element-by-element", () => {
    expect(canonicalize([3, 2, 1])).toBe("[3,2,1]");
  });

  it("canonicalizes nested arrays", () => {
    expect(canonicalize([1, [2, 3]])).toBe("[1,[2,3]]");
  });
});