// Cross‑runtime base64 helpers (browser + Node 18+)

const _atob =
  typeof atob === "function"
    ? atob
    : (b64: string) => Buffer.from(b64, "base64").toString("binary");

const _btoa =
  typeof btoa === "function"
    ? btoa
    : (bin: string) => Buffer.from(bin, "binary").toString("base64");

export function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return _btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = _atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}