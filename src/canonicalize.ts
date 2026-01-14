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
  // RFC 8785 uses ECMAScript string escaping rules.
  let out = '"';
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);

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

  // Use JS number → string, then normalize exponent form
  let s = n.toString();

  // Normalize exponent to uppercase E
  if (s.includes("e")) {
    const [mantissa, exp] = s.split("e");
    const sign = exp.startsWith("-") ? "-" : "+";
    let digits = exp.replace(/^[+-]/, "");

    // Remove leading zeros in exponent
    digits = digits.replace(/^0+/, "");
    if (digits === "") digits = "0";

    // RFC 8785: exponent must not include "+"
    const normalized = `${mantissa}E${sign === "-" ? "-" : ""}${digits}`;
    return normalized;
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

  // Sort by UTF‑16 code units (JS default)
  keys.sort();

  const entries = keys.map(k => `${escapeString(k)}:${canonicalize(obj[k])}`);
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