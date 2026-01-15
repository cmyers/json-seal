import { describe, it, expect } from "vitest";
import { generateKeyPair, importPrivateKey, importPublicKey } from "../src/keys";
import { verifyBackup } from "../src/verify";
import { signPayload } from "../src/sign";

describe("PEM key handling", () => {
    it("imports private and public PEM keys into usable CryptoKeys", async () => {
        const { privateKey, publicKey } = await generateKeyPair();

        const keyPriv = await importPrivateKey(privateKey);
        const keyPub = await importPublicKey(publicKey);

        expect(keyPriv.type).toBe("private");
        expect(keyPub.type).toBe("public");
    });

    it("PEM-generated keys can sign and verify", async () => {
        const { privateKey, publicKey } = await generateKeyPair();
        const payload = { a: 1 };
        const backup = await signPayload(payload, privateKey, publicKey);
        const result = await verifyBackup(backup);
        expect(result.valid).toBe(true);
    });
});