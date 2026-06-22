import { canonicalize } from "./canonicalize.js";
import { importPrivateKey, KeyAlgorithm } from "./keys.js";
import { signCanonical } from "./crypto-sign.js";
import { arrayBufferToBase64 } from "./base64.js";
import { isJsonValue } from "./isJsonValue.js";

const ALGORITHM_LABEL: Record<KeyAlgorithm, string> = {
  "RSA-PSS": "RSA-PSS-SHA256",
  "Ed25519": "Ed25519"
};

export async function signPayload(
  payload: any,
  privateKeyPem: string,
  publicKeyPem: string,
  options?: { algorithm?: KeyAlgorithm }
) {
  if (!isJsonValue(payload)) throw new Error("signPayload only accepts JSON-compatible values");

  const algorithm: KeyAlgorithm = options?.algorithm ?? "RSA-PSS";
  const canonical = canonicalize(payload);
  const privateKey = await importPrivateKey(privateKeyPem, algorithm);
  const signatureBytes = await signCanonical(canonical, privateKey);
  const signature = arrayBufferToBase64(signatureBytes);

  return {
    version: 1,
    timestamp: new Date().toISOString(),
    payload,
    signature: {
      algorithm: ALGORITHM_LABEL[algorithm],
      publicKey: publicKeyPem,
      value: signature
    }
  };
}