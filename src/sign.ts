import {
  generateKeyPairSync,
  createSign,
  constants
} from "crypto";
import { canonicalize } from "./canonicalize.js";

export function generateKeyPair() {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048
  });

  return {
    privateKey: privateKey.export({ type: "pkcs1", format: "pem" }),
    publicKey: publicKey.export({ type: "spki", format: "pem" })
  };
}

export function signPayload(payload: any, privateKeyPem: string, publicKeyPem: string) {
  const canonical = canonicalize(payload);
  const bytes = Buffer.from(canonical, "utf8");

  const signer = createSign("RSA-SHA256");
  signer.update(bytes);
  signer.end();

  const signature = signer.sign({
    key: privateKeyPem,
    padding: constants.RSA_PKCS1_PSS_PADDING,
    saltLength: 32
  }).toString("base64");

  return {
    version: 1,
    timestamp: new Date().toISOString(),
    payload,
    signature: {
      algorithm: "RSA-PSS-SHA256",
      publicKey: publicKeyPem,
      value: signature
    }
  };
}