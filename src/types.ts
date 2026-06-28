type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { readonly [key: string]: JsonValue | undefined };

type DeepPartial<Type> = {
  [Key in keyof Type]?: Type[Key] extends object ? DeepPartial<Type[Key]> : Type[Key];
};

// Dropping only undefined-valued keys preserves Type's shape, so the assertion is safe.
const compactObject = <Type extends Record<string, unknown>>(value: Type): Type =>
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as Type;

export { compactObject };
export type { DeepPartial, JsonObject, JsonPrimitive, JsonValue };
