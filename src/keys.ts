import { pemToArrayBuffer, arrayBufferToPem } from "./pem.js";

export type KeyAlgorithm = "RSA-PSS" | "Ed25519";

export async function generateKeyPair(algorithm: KeyAlgorithm = "RSA-PSS") {
  const params: RsaHashedKeyGenParams | EcKeyGenParams =
    algorithm === "RSA-PSS"
      ? { name: "RSA-PSS", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }
      : { name: "Ed25519" } as EcKeyGenParams;

  const { publicKey, privateKey } = await crypto.subtle.generateKey(
    params,
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

export async function importPrivateKey(privateKeyPem: string, algorithm: KeyAlgorithm = "RSA-PSS"): Promise<CryptoKey> {
  const pkcs8 = pemToArrayBuffer(privateKeyPem);

  const params =
    algorithm === "RSA-PSS"
      ? { name: "RSA-PSS", hash: "SHA-256" }
      : { name: "Ed25519" };

  return crypto.subtle.importKey("pkcs8", pkcs8, params, false, ["sign"]);
}

export async function importPublicKey(publicKeyPem: string, algorithm: KeyAlgorithm = "RSA-PSS"): Promise<CryptoKey> {
  const spki = pemToArrayBuffer(publicKeyPem);

  const params =
    algorithm === "RSA-PSS"
      ? { name: "RSA-PSS", hash: "SHA-256" }
      : { name: "Ed25519" };

  return crypto.subtle.importKey("spki", spki, params, false, ["verify"]);
}