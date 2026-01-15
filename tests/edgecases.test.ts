import { describe, it, expect } from "vitest";
import { canonicalize } from "../src/canonicalize";
import { signPayload } from "../src/sign";
import { verifyBackup } from "../src/verify";
import { generateKeyPair } from "../src/sign";

describe("json-seal edge cases", () => {
    const { privateKey, publicKey } = generateKeyPair();

    // --- Unicode --------------------------------------------------------------

    it("handles emoji correctly", () => {
        const payload = { msg: "hello 🌍" };
        const c = canonicalize(payload);
        const parsed = JSON.parse(c);
        expect(parsed).toEqual(payload);
    });

    it("handles surrogate pairs and combining marks", () => {
        const payload = { text: "e\u0301 café 🇬🇧" }; // é as combining mark + flag emoji
        const c = canonicalize(payload);
        const parsed = JSON.parse(c);
        expect(parsed).toEqual(payload);
    });

    // --- Numbers --------------------------------------------------------------

    it("handles large integers safely", () => {
        const payload = { big: 9007199254740991 }; // MAX_SAFE_INTEGER
        const c = canonicalize(payload);
        const parsed = JSON.parse(c);
        expect(parsed).toEqual(payload);
    });

    it("handles decimals and exponent notation", () => {
        const payload = { a: 1.2345, b: 1e6, c: -1e-6 };
        const c = canonicalize(payload);
        const parsed = JSON.parse(c);
        expect(parsed).toEqual(payload);
    });

    it("normalizes negative zero to positive zero", () => {
        const payload = { value: -0 };
        const c = canonicalize(payload);
        const parsed = JSON.parse(c);

        expect(parsed.value).toBe(0);
        expect(Object.is(parsed.value, -0)).toBe(false);
    });


    // --- Empty structures -----------------------------------------------------

    it("handles empty object", () => {
        const payload = {};
        const c = canonicalize(payload);
        expect(JSON.parse(c)).toEqual(payload);
    });

    it("handles empty array", () => {
        const payload: any[] = [];
        const c = canonicalize(payload);
        expect(JSON.parse(c)).toEqual(payload);
    });

    it("handles null", () => {
        const payload = null;
        const c = canonicalize(payload);
        expect(JSON.parse(c)).toBe(null);
    });

    it("handles empty string", () => {
        const payload = "";
        const c = canonicalize(payload);
        expect(JSON.parse(c)).toBe("");
    });

    // --- Strings --------------------------------------------------------------

    it("handles escaped characters", () => {
        const payload = { s: "line1\nline2\t\"quoted\"" };
        const c = canonicalize(payload);
        const parsed = JSON.parse(c);
        expect(parsed).toEqual(payload);
    });

    it("handles backslashes", () => {
        const payload = { path: "C:\\Users\\Chris" };
        const c = canonicalize(payload);
        const parsed = JSON.parse(c);
        expect(parsed).toEqual(payload);
    });

    // --- Nested oddities ------------------------------------------------------

    it("handles deeply nested structures", () => {
        const payload = { a: { b: { c: { d: { e: 1 } } } } };
        const c = canonicalize(payload);
        expect(JSON.parse(c)).toEqual(payload);
    });

    it("handles arrays of mixed types", () => {
        const payload = [1, "two", null, { x: 3 }, [4, 5]];
        const c = canonicalize(payload);
        expect(JSON.parse(c)).toEqual(payload);
    });

    // --- Signing round-trip ---------------------------------------------------

    it("signs and verifies edge-case payloads", () => {
        const payload = {
            emoji: "🔥",
            weird: "e\u0301",
            nums: [0, -0, 1e10, -1e-10],
            empty: {},
            nested: [{}, [], null, "x"]
        };

        const backup = signPayload(payload, privateKey, publicKey);
        const result = verifyBackup(backup);

        expect(result.valid).toBe(true);
    });
});