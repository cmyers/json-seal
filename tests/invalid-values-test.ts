import { describe, test, expect, beforeAll } from "vitest";
import { signPayload } from "../src/sign";
import { generateKeyPair } from "../src/keys";

describe("signPayload rejects invalid JSON values", () => {
  let privateKey: string;
  let publicKey: string;

  beforeAll(async () => {
    const keys = await generateKeyPair();
    privateKey = keys.privateKey;
    publicKey = keys.publicKey;
  });

  const invalidValues = [
    undefined,
    () => {},
    Symbol("x"),
    BigInt(10),
    new Date(),
    new Map(),
    new Set(),
    Buffer.from("hi"),
    class Foo {},
    { x: undefined },
    { f: () => {} },
    { nested: { bad: new Date() } },
  ];

  // Add circular reference
  const circular: any = { a: 1 };
  circular.self = circular;
  invalidValues.push(circular);

  for (const value of invalidValues) {
  test(`rejects invalid value: ${String(value)}`, async () => {
    await expect(
      signPayload(value as any, privateKey, publicKey)
    ).rejects.toThrow();
  });
}
});