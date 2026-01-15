import { canonicalize } from "./canonicalize.js";
import { importPublicKey } from "./keys.js";
import { verifyCanonical } from "./crypto-verify.js";
import { base64ToArrayBuffer } from "./base64.js";

export async function verifyBackup(backup: any) {
  const { payload, signature } = backup;

  const canonical = canonicalize(payload);
  const publicKey = await importPublicKey(signature.publicKey);
  const signatureBytes = base64ToArrayBuffer(signature.value);

  const valid = await verifyCanonical(canonical, signatureBytes, publicKey);

  return {
    valid,
    payload: valid ? payload : undefined
  };
}