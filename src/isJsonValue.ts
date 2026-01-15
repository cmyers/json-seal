export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export function isJsonValue(value: unknown): value is JsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }

  // Objects (but not class instances, Dates, Maps, Sets, etc.)
  if (typeof value === "object") {
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) {
      return false;
    }

    for (const key of Object.keys(value as Record<string, unknown>)) {
      if (!isJsonValue((value as Record<string, unknown>)[key])) {
        return false;
      }
    }

    return true;
  }

  return false;
}