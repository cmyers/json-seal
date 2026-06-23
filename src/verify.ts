import { canonicalize } from "./canonicalize.js";
import { importPublicKey, KeyAlgorithm } from "./keys.js";
import { verifyCanonical } from "./crypto-verify.js";
import { base64ToArrayBuffer } from "./base64.js";

const LABEL_TO_ALGORITHM: Record<string, KeyAlgorithm> = {
  "RSA-PSS-SHA256": "RSA-PSS",
  "Ed25519": "Ed25519"
};

export async function verifyBackup(backup: any) {
  const { payload, signature } = backup;

  const algorithm = LABEL_TO_ALGORITHM[signature.algorithm];
  if (!algorithm) throw new Error(`Unsupported signature algorithm: ${signature.algorithm}`);

  const canonical = canonicalize(payload);
  const publicKey = await importPublicKey(signature.publicKey, algorithm);
  const signatureBytes = base64ToArrayBuffer(signature.value);

  const valid = await verifyCanonical(canonical, signatureBytes, publicKey);

  return {
    valid,
    payload: valid ? payload : undefined
  };
}