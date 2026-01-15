import { pemToArrayBuffer, arrayBufferToPem } from "./pem.js";

export async function generateKeyPair() {
  const { publicKey, privateKey } = await crypto.subtle.generateKey(
    {
      name: "RSA-PSS",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    true,
    ["sign", "verify"]
  );

  const pkcs8 = await crypto.subtle.exportKey("pkcs8", privateKey);
  const spki = await crypto.subtle.exportKey("spki", publicKey);

  return {
    privateKey: arrayBufferToPem(pkcs8, "private"),
    publicKey: arrayBufferToPem(spki, "public")
  };
}

export async function importPrivateKey(privateKeyPem: string): Promise<CryptoKey> {
  const pkcs8 = pemToArrayBuffer(privateKeyPem);

  return crypto.subtle.importKey(
    "pkcs8",
    pkcs8,
    {
      name: "RSA-PSS",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );
}

export async function importPublicKey(publicKeyPem: string): Promise<CryptoKey> {
  const spki = pemToArrayBuffer(publicKeyPem);

  return crypto.subtle.importKey(
    "spki",
    spki,
    {
      name: "RSA-PSS",
      hash: "SHA-256"
    },
    false,
    ["verify"]
  );
}