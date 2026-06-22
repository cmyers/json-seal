const encoder = new TextEncoder();

export async function signCanonical(canonical: string, privateKey: CryptoKey): Promise<ArrayBuffer> {
  const bytes = encoder.encode(canonical);
  const algName = privateKey.algorithm.name;

  if (algName === "RSA-PSS") {
    return crypto.subtle.sign({ name: "RSA-PSS", saltLength: 32 }, privateKey, bytes);
  }
  if (algName === "Ed25519") {
    return crypto.subtle.sign({ name: "Ed25519" }, privateKey, bytes);
  }
  throw new Error(`Unsupported signing algorithm: ${algName}`);
}