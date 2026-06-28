export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { readonly [key: string]: JsonValue | undefined };

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export function compactObject<T extends Record<string, unknown>>(value: T): T {
  // Dropping only undefined-valued keys preserves T's shape, so the assertion is safe.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}
