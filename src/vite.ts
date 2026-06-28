import type { JsonObject, JsonValue } from "./types.js";

type ViteReactAppOptions = {
  readonly plugins?: readonly JsonValue[];
  readonly alias?: JsonObject;
  readonly server?: JsonObject;
  readonly test?: JsonObject;
};

const viteReactApp = (options: ViteReactAppOptions = {}): JsonObject => ({
  plugins: options.plugins ? [...options.plugins] : [],
  resolve: options.alias ? { alias: options.alias } : undefined,
  server: options.server,
  test: options.test,
});

export { viteReactApp };
export type { ViteReactAppOptions };
