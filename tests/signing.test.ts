import { describe, it, expect } from "vitest";
import { signPayload } from "../src/sign";
import { verifyBackup } from "../src/verify";
import { generateKeyPair } from "../src/sign";
import { canonicalize } from "../src/canonicalize";

describe("json-seal", () => {
  const { privateKey, publicKey } = generateKeyPair();

  const payload = {
    id: 1,
    data: "test",
    nested: { score: 42, tags: ["a", "b", "c"] }
  };

  it("signs and verifies a valid payload", () => {
    const backup = signPayload(payload, privateKey, publicKey);
    const result = verifyBackup(backup);
    expect(result.valid).toBe(true);
  });

  it("detects shallow tampering", () => {
    const backup = signPayload(payload, privateKey, publicKey);
    const tampered = { ...backup, payload: { ...backup.payload, data: "hacked" } };
    expect(verifyBackup(tampered).valid).toBe(false);
  });

  it("detects deep tampering", () => {
    const backup = signPayload(payload, privateKey, publicKey);
    const tampered = structuredClone(backup);
    tampered.payload.nested.score = 999;
    expect(verifyBackup(tampered).valid).toBe(false);
  });

  it("fails when signature is missing", () => {
    const backup = signPayload(payload, privateKey, publicKey);
    const missing = structuredClone(backup);
    delete (missing as any).signature;
    expect(() => verifyBackup(missing)).toThrow();
  });

  it("fails with wrong public key", () => {
    const backup = signPayload(payload, privateKey, publicKey);
    const wrong = generateKeyPair();
    backup.signature.publicKey = wrong.publicKey;
    expect(verifyBackup(backup).valid).toBe(false);
  });

  it("fails with corrupted signature", () => {
    const backup = signPayload(payload, privateKey, publicKey);
    backup.signature.value = "AAAA" + backup.signature.value.slice(4);
    expect(verifyBackup(backup).valid).toBe(false);
  });

  it("canonicalization is stable", () => {
    const a = { b: 2, a: 1 };
    const b = { a: 1, b: 2 };
    expect(canonicalize(a)).toBe(canonicalize(b));
  });

  it("supports number payloads", () => {
    const backup = signPayload(12345, privateKey, publicKey);
    expect(verifyBackup(backup).valid).toBe(true);
  });

  it("supports array payloads", () => {
    const backup = signPayload([1, 2, 3], privateKey, publicKey);
    expect(verifyBackup(backup).valid).toBe(true);
  });

  it("supports large payloads", () => {
    const backup = signPayload({ big: "x".repeat(50000) }, privateKey, publicKey);
    expect(verifyBackup(backup).valid).toBe(true);
  });

  it("RSA-PSS signatures are non-deterministic", () => {
    const a = signPayload(payload, privateKey, publicKey);
    const b = signPayload(payload, privateKey, publicKey);
    expect(a.signature.value).not.toBe(b.signature.value);
  });
});