import { describe, it, expect, beforeAll } from "vitest";
import { signPayload } from "../src/sign";
import { verifyBackup } from "../src/verify";
import { canonicalize } from "../src/canonicalize";
import { generateKeyPair } from "../src/keys";

describe("json-seal", () => {
  let privateKey: string;
  let publicKey: string;

  beforeAll(async () => {
    const keys = await generateKeyPair();
    privateKey = keys.privateKey;
    publicKey = keys.publicKey;
  });

  const payload = {
    id: 1,
    data: "test",
    nested: { score: 42, tags: ["a", "b", "c"] }
  };

  it("signs and verifies a valid payload", async () => {
    const backup = await signPayload(payload, privateKey, publicKey);
    const result = await verifyBackup(backup);
    expect(result.valid).toBe(true);
  });

  it("detects shallow tampering", async () => {
    const backup = await signPayload(payload, privateKey, publicKey);
    const tampered = {
      ...backup,
      payload: { ...(backup.payload as Record<string, any>), data: "hacked" }
    };
    expect((await verifyBackup(tampered)).valid).toBe(false);
  });

  it("detects deep tampering", async () => {
    const backup = await signPayload(payload, privateKey, publicKey);
    const tampered = structuredClone(backup);
    (tampered.payload as { nested: { score: number } }).nested.score = 999;
    expect((await verifyBackup(tampered)).valid).toBe(false);
  });

  it("fails when signature is missing", async () => {
    const backup = await signPayload(payload, privateKey, publicKey);
    const missing = structuredClone(backup);
    delete (missing as any).signature;
    await expect(() => verifyBackup(missing)).rejects.toThrow();
  });

  it("fails with wrong public key", async () => {
    const backup = await signPayload(payload, privateKey, publicKey);
    const wrong = await generateKeyPair();
    backup.signature.publicKey = wrong.publicKey;
    expect((await verifyBackup(backup)).valid).toBe(false);
  });

  it("fails with corrupted signature", async () => {
    const backup = await signPayload(payload, privateKey, publicKey);
    backup.signature.value = "AAAA" + backup.signature.value.slice(4);
    expect((await verifyBackup(backup)).valid).toBe(false);
  });

  it("canonicalization is stable", () => {
    const a = { b: 2, a: 1 };
    const b = { a: 1, b: 2 };
    expect(canonicalize(a)).toBe(canonicalize(b));
  });

  it("canonicalized JSON can be parsed back to the same structure", () => {
    const canonical = canonicalize(payload);
    const parsed = JSON.parse(canonical);
    expect(parsed).toEqual(payload);
  });

  it("supports number payloads", async () => {
    const backup = await signPayload(12345, privateKey, publicKey);
    expect((await verifyBackup(backup)).valid).toBe(true);
  });

  it("supports array payloads", async () => {
    const backup = await signPayload([1, 2, 3], privateKey, publicKey);
    expect((await verifyBackup(backup)).valid).toBe(true);
  });

  it("supports large payloads", async () => {
    const backup = await signPayload({ big: "x".repeat(50000) }, privateKey, publicKey);
    expect((await verifyBackup(backup)).valid).toBe(true);
  });

  it("RSA-PSS signatures are non-deterministic", async () => {
    const a = await signPayload(payload, privateKey, publicKey);
    const b = await signPayload(payload, privateKey, publicKey);
    expect(a.signature.value).not.toBe(b.signature.value);
  });
});