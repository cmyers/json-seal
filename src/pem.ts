import { arrayBufferToBase64, base64ToArrayBuffer } from "./base64.js";

// strip header/footer + whitespace
function pemBody(pem: string): string {
  return pem
    .replace(/-----BEGIN [^-]+-----/, "")
    .replace(/-----END [^-]+-----/, "")
    .replace(/\s+/g, "");
}

export function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pemBody(pem);
  return base64ToArrayBuffer(base64);
}

export function arrayBufferToPem(buf: ArrayBuffer, type: "private" | "public"): string {
  const base64 = arrayBufferToBase64(buf);

  if (type === "private") {
    return `-----BEGIN PRIVATE KEY-----\n${base64}\n-----END PRIVATE KEY-----`;
  }

  return `-----BEGIN PUBLIC KEY-----\n${base64}\n-----END PUBLIC KEY-----`;
}