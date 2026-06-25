import { type JsonObject, type JsonValue } from "./types.js";

export type ViteReactAppOptions = {
  readonly plugins?: readonly JsonValue[];
  readonly alias?: JsonObject;
  readonly server?: JsonObject;
  readonly test?: JsonObject;
};

export function viteReactApp(options: ViteReactAppOptions = {}): JsonObject {
  return {
    plugins: options.plugins ? [...options.plugins] : [],
    resolve: options.alias ? { alias: options.alias } : undefined,
    server: options.server,
    test: options.test,
  };
}
