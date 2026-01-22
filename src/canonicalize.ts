/**
 * RFC 8785 Canonical JSON implementation
 * Deterministic, strict, and cross‑runtime stable.
 */

export function canonicalize(value: any): string {
  switch (typeof value) {
    case "string":
      return escapeString(value);
    case "number":
      return serializeNumber(value);
    case "boolean":
      return value ? "true" : "false";
    case "object":
      if (value === null) return "null";
      if (Array.isArray(value)) return serializeArray(value);
      return serializeObject(value);
    default:
      throw new Error(`Unsupported type in canonical JSON: ${typeof value}`);
  }
}

/* -------------------------------------------------------------------------- */
/*  Strings                                                                    */
/* -------------------------------------------------------------------------- */

function escapeString(str: string): string {
  // RFC 8785 defines canonicalization in terms of ECMAScript strings (UTF‑16),
  // but the final canonical form must be encoded as UTF‑8 when serialized.
  // Therefore we validate UTF‑16 correctness (surrogate pairs) here.
  let out = '"';
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);

    // Surrogate handling (UTF‑16 correctness)
    if (c >= 0xd800 && c <= 0xdbff) {
      // High surrogate: must be followed by a low surrogate
      if (i + 1 >= str.length) {
        throw new Error("Invalid UTF‑16: isolated high surrogate");
      }
      const d = str.charCodeAt(i + 1);
      if (d < 0xdc00 || d > 0xdfff) {
        throw new Error("Invalid UTF‑16: high surrogate not followed by low surrogate");
      }
      // Valid surrogate pair → append both as-is
      out += str[i] + str[i + 1];
      i++; // skip the low surrogate
      continue;
    } else if (c >= 0xdc00 && c <= 0xdfff) {
      // Low surrogate without preceding high surrogate
      throw new Error("Invalid UTF‑16: isolated low surrogate");
    }

    switch (c) {
      case 0x22: out += '\\"'; break; // "
      case 0x5C: out += '\\\\'; break; // \
      case 0x08: out += '\\b'; break;
      case 0x0C: out += '\\f'; break;
      case 0x0A: out += '\\n'; break;
      case 0x0D: out += '\\r'; break;
      case 0x09: out += '\\t'; break;

      default:
        if (c < 0x20) {
          // Control characters → \u00XX
          out += "\\u" + hex4(c);
        } else {
          out += str[i];
        }
    }
  }
  return out + '"';
}

function hex4(n: number): string {
  return n.toString(16).padStart(4, "0");
}

/* -------------------------------------------------------------------------- */
/*  Numbers                                                                    */
/* -------------------------------------------------------------------------- */

function serializeNumber(n: number): string {
  if (!Number.isFinite(n)) {
    throw new Error("Non‑finite numbers are not permitted in canonical JSON");
  }

  // RFC 8785: -0 must be serialized as 0
  if (Object.is(n, -0)) return "0";

  // Use JS number → string, then normalize exponent form if present.
  // JS already produces minimal mantissa/decimal representation.
  let s = n.toString();

  // Normalize exponent to RFC 8785 rules
  const eIndex = s.indexOf("e");
  if (eIndex !== -1) {
    const mantissa = s.slice(0, eIndex);
    let exp = s.slice(eIndex + 1); // after 'e'

    const negative = exp.startsWith("-");
    exp = exp.replace(/^[+-]/, "");

    // Remove leading zeros in exponent
    exp = exp.replace(/^0+/, "");
    if (exp === "") exp = "0";

    // RFC 8785: exponent must not include "+"
    s = `${mantissa}E${negative ? "-" : ""}${exp}`;
  }

  return s;
}

/* -------------------------------------------------------------------------- */
/*  Arrays                                                                     */
/* -------------------------------------------------------------------------- */

function serializeArray(arr: any[]): string {
  const items = arr.map(canonicalize);
  return `[${items.join(",")}]`;
}

/* -------------------------------------------------------------------------- */
/*  Objects                                                                    */
/* -------------------------------------------------------------------------- */

function serializeObject(obj: Record<string, any>): string {
  const keys = Object.keys(obj);

  // RFC 8785: duplicate keys MUST be rejected
  detectDuplicateKeys(keys);

  // Sort by UTF‑16 code units (JS default), as required by RFC 8785
  keys.sort();

  const entries = keys.map(
    (k) => `${escapeString(k)}:${canonicalize(obj[k])}`
  );
  return `{${entries.join(",")}}`;
}

function detectDuplicateKeys(keys: string[]): void {
  const seen = new Set<string>();
  for (const k of keys) {
    if (seen.has(k)) {
      throw new Error(`Duplicate key in object: ${k}`);
    }
    seen.add(k);
  }
}