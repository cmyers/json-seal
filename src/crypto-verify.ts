const encoder = new TextEncoder();

export async function verifyCanonical(
  canonical: string,
  signature: ArrayBuffer,
  publicKey: CryptoKey
): Promise<boolean> {
  const bytes = encoder.encode(canonical);

  return crypto.subtle.verify(
    {
      name: "RSA-PSS",
      saltLength: 32
    },
    publicKey,
    signature,
    bytes
  );
}