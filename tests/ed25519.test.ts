import { describe, it, expect, beforeAll } from "vitest";
import { generateKeyPair, importPrivateKey, importPublicKey } from "../src/keys";
import { signPayload } from "../src/sign";
import { verifyBackup } from "../src/verify";

describe("Ed25519 key support", () => {
  let privateKey: string;
  let publicKey: string;

  const payload = { id: 42, data: "hello", tags: ["x", "y"] };

  beforeAll(async () => {
    const keys = await generateKeyPair("Ed25519");
    privateKey = keys.privateKey;
    publicKey = keys.publicKey;
  });

  it("generates Ed25519 PEM key pairs", async () => {
    expect(privateKey).toMatch(/-----BEGIN PRIVATE KEY-----/);
    expect(publicKey).toMatch(/-----BEGIN PUBLIC KEY-----/);
  });

  it("imports Ed25519 PEM keys into correct CryptoKey types", async () => {
    const keyPriv = await importPrivateKey(privateKey, "Ed25519");
    const keyPub = await importPublicKey(publicKey, "Ed25519");
    expect(keyPriv.type).toBe("private");
    expect(keyPub.type).toBe("public");
    expect(keyPriv.algorithm.name).toBe("Ed25519");
    expect(keyPub.algorithm.name).toBe("Ed25519");
  });

  it("signs and verifies a payload with Ed25519", async () => {
    const backup = await signPayload(payload, privateKey, publicKey, { algorithm: "Ed25519" });
    expect(backup.signature.algorithm).toBe("Ed25519");
    const result = await verifyBackup(backup);
    expect(result.valid).toBe(true);
    expect(result.payload).toEqual(payload);
  });

  it("detects shallow tampering", async () => {
    const backup = await signPayload(payload, privateKey, publicKey, { algorithm: "Ed25519" });
    const tampered = { ...backup, payload: { ...(backup.payload as Record<string, any>), data: "hacked" } };
    expect((await verifyBackup(tampered)).valid).toBe(false);
  });

  it("detects deep tampering", async () => {
    const backup = await signPayload(payload, privateKey, publicKey, { algorithm: "Ed25519" });
    const tampered = structuredClone(backup);
    (tampered.payload as { id: number }).id = 999;
    expect((await verifyBackup(tampered)).valid).toBe(false);
  });

  it("fails with wrong public key", async () => {
    const backup = await signPayload(payload, privateKey, publicKey, { algorithm: "Ed25519" });
    const other = await generateKeyPair("Ed25519");
    backup.signature.publicKey = other.publicKey;
    expect((await verifyBackup(backup)).valid).toBe(false);
  });

  it("fails with corrupted signature", async () => {
    const backup = await signPayload(payload, privateKey, publicKey, { algorithm: "Ed25519" });
    backup.signature.value = "AAAA" + backup.signature.value.slice(4);
    expect((await verifyBackup(backup)).valid).toBe(false);
  });

  it("Ed25519 signatures are deterministic", async () => {
    const a = await signPayload(payload, privateKey, publicKey, { algorithm: "Ed25519" });
    const b = await signPayload(payload, privateKey, publicKey, { algorithm: "Ed25519" });
    expect(a.signature.value).toBe(b.signature.value);
  });

  it("throws on unknown algorithm label in verifyBackup", async () => {
    const backup = await signPayload(payload, privateKey, publicKey, { algorithm: "Ed25519" });
    backup.signature.algorithm = "UNKNOWN-ALG";
    await expect(() => verifyBackup(backup)).rejects.toThrow("Unsupported signature algorithm");
  });

  it("rejects an RSA-PSS backup verified with an Ed25519 key substituted in", async () => {
    const rsaKeys = await generateKeyPair("RSA-PSS");
    const rsaBackup = await signPayload(payload, rsaKeys.privateKey, rsaKeys.publicKey);
    rsaBackup.signature.publicKey = publicKey;
    rsaBackup.signature.algorithm = "Ed25519";
    expect((await verifyBackup(rsaBackup)).valid).toBe(false);
  });

  it("supports various payload types", async () => {
    for (const p of [42, "hello", [1, 2, 3], null, true]) {
      const backup = await signPayload(p, privateKey, publicKey, { algorithm: "Ed25519" });
      expect((await verifyBackup(backup)).valid).toBe(true);
    }
  });
});
