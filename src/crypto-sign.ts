const encoder = new TextEncoder();

export async function signCanonical(canonical: string, privateKey: CryptoKey): Promise<ArrayBuffer> {
  const bytes = encoder.encode(canonical);

  return crypto.subtle.sign(
    {
      name: "RSA-PSS",
      saltLength: 32
    },
    privateKey,
    bytes
  );
}