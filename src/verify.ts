import {
  createVerify,
  constants
} from "crypto";
import { canonicalize } from "./canonicalize.js";

export function verifyBackup(backup: any) {
  const { payload, signature } = backup;

  const canonical = canonicalize(payload);
  const bytes = Buffer.from(canonical, "utf8");

  const verifier = createVerify("RSA-SHA256");
  verifier.update(bytes);
  verifier.end();

  const valid = verifier.verify(
    {
      key: signature.publicKey,
      padding: constants.RSA_PKCS1_PSS_PADDING,
      saltLength: 32
    },
    Buffer.from(signature.value, "base64")
  );

  return {
    valid,
    payload: valid ? payload : undefined
  };
}