import { canonicalize } from "./canonicalize.js";
import { importPrivateKey } from "./keys.js";
import { signCanonical } from "./crypto-sign.js";
import { arrayBufferToBase64 } from "./base64.js";
import { isJsonValue } from "./isJsonValue.js";

export async function signPayload(payload: any, privateKeyPem: string, publicKeyPem: string) {
  if ( !isJsonValue(payload) ) throw new Error("signPayload only accepts JSON-compatible values");

  const canonical = canonicalize(payload);
  const privateKey = await importPrivateKey(privateKeyPem);
  const signatureBytes = await signCanonical(canonical, privateKey);
  const signature = arrayBufferToBase64(signatureBytes);

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