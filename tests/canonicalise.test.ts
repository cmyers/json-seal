import { describe, test, expect } from "vitest";
import { canonicalize } from "../src/canonicalize";

describe("canonicalize()", () => {
    test("canonicalization is idempotent (via parse)", () => {
        const inputs = [
            null,
            true,
            false,
            0,
            1,
            -1,
            1.234,
            "",
            "hello",
            [],
            {},
            { a: 1, b: 2 },
            { b: 2, a: 1 },
            { nested: { z: 1, a: 2 } },
            ["a", { b: 1, a: 2 }, 3],
        ];
        const c1 = canonicalize(inputs);
        const c2 = canonicalize(JSON.parse(c1));
        expect(c2).toBe(c1);
    });

    //
    // 2. Key ordering
    //
    test("sorts object keys lexicographically", () => {
        const input = { z: 1, a: 2, m: 3 };
        const out = canonicalize(input);
        expect(out).toBe('{"a":2,"m":3,"z":1}');
    });

    //
    // 3. Nested structures
    //
    test("canonicalizes nested objects", () => {
        const input = { b: { z: 1, a: 2 }, a: 0 };
        const out = canonicalize(input);
        expect(out).toBe('{"a":0,"b":{"a":2,"z":1}}');
    });

    //
    // 4. Arrays
    //
    test("preserves array order and canonicalizes elements", () => {
        const input = [3, { b: 2, a: 1 }, [2, 1]];
        const out = canonicalize(input);
        expect(out).toBe('[3,{"a":1,"b":2},[2,1]]');
    });

    //
    // 5. String escaping
    //
    test("escapes strings consistently", () => {
        const input = {
            quote: '"',
            slash: "\\",
            newline: "\n",
            control: "\b",
        };

        const out = canonicalize(input);

        // Round-trip safety: canonical output must be valid JSON
        expect(JSON.parse(out)).toEqual(input);
    });

    //
    // 6. Numbers
    //
    test("canonicalizes numbers consistently", () => {
        const numbers = [0, -0, 1.0, 1.234, 1e3, 1e-3];

        for (const n of numbers) {
            const c1 = canonicalize(n);
            const parsed = JSON.parse(c1);
            const c2 = canonicalize(parsed);
            expect(c2).toBe(c1);
        }
    });

    //
    // 7. Weird keys
    //
    test("handles keys with special characters", () => {
        const input = {
            '"quoted"': 1,
            "line\nbreak": 2,
            "🔥": 3,
        };

        const out = canonicalize(input);

        // Round-trip safety
        expect(JSON.parse(out)).toEqual(input);
    });

    //
    // 8. Golden vectors (expand over time)
    //
    test("golden vector: simple object", () => {
        const input = { b: 2, a: 1 };
        const expected = '{"a":1,"b":2}';
        expect(canonicalize(input)).toBe(expected);
    });

    test("golden vector: nested", () => {
        const input = { z: { y: 2, x: 1 }, a: 0 };
        const expected = '{"a":0,"z":{"x":1,"y":2}}';
        expect(canonicalize(input)).toBe(expected);
    });
});