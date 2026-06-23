const encoder = new TextEncoder();

export async function verifyCanonical(
  canonical: string,
  signature: ArrayBuffer,
  publicKey: CryptoKey
): Promise<boolean> {
  const bytes = encoder.encode(canonical);
  const algName = publicKey.algorithm.name;

  if (algName === "RSA-PSS") {
    return crypto.subtle.verify({ name: "RSA-PSS", saltLength: 32 }, publicKey, signature, bytes);
  }
  if (algName === "Ed25519") {
    return crypto.subtle.verify({ name: "Ed25519" }, publicKey, signature, bytes);
  }
  throw new Error(`Unsupported verification algorithm: ${algName}`);
}