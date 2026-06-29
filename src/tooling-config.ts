import type { Plugin, ResolvedConfig } from 'vite';
import { mergeConfig } from 'vite';

import { domSetup } from './dom-setup.js';
import { fmt } from './fmt.js';
import { targetGlobs } from './helpers.js';
import type { LintTarget } from './helpers.js';
import { lint } from './lint.js';
import type { LintOptions } from './lint.js';
import { pack as packConfig } from './pack.js';
import { staged as stagedConfig } from './staged.js';
import { compactObject } from './types.js';
import type { JsonObject } from './types.js';
import { testNode, testReact } from './vitest.js';

type ToolingConfigOptions = {
  readonly node?: LintTarget;
  readonly react?: LintTarget;
  readonly test?: 'node' | 'react' | false;
  readonly pack?: JsonObject;
  readonly lint?: Omit<LintOptions, 'node' | 'react'>;
  readonly fmt?: JsonObject;
  readonly staged?: JsonObject | false;
};

// A mutable view of the resolved config limited to the object-valued concern keys
// we read and write. The whole resolved config has other (non-object) keys, but
// we only ever touch these.
type MutableConcerns = Record<string, JsonObject | undefined>;

// A glob-scoped target marks a monorepo lint root: lint only, members own
// test/vite. `true` is the whole single project; an empty list is the target off.
const isScopedTarget = (target: LintTarget | undefined): boolean =>
  targetGlobs(target) !== undefined;

// Resolve the staged value: false → omit; object → pass through; else default.
const stagedValue = (staged: JsonObject | false | undefined): JsonObject | undefined => {
  if (staged === false) {
    return undefined;
  }
  if (typeof staged === 'object') {
    return staged;
  }
  return stagedConfig();
};

// Recursively de-duplicate every array in a value. Vite's `mergeConfig`
// concatenates arrays (deeply), so after merging the house defaults with the
// consumer's arrays each shared entry would appear twice; this collapses them
// back to one occurrence (first wins), keying objects by their JSON shape.
const dedupeArrays = <Value>(value: Value): Value => {
  if (Array.isArray(value)) {
    const seen = new Set<string>();
    const result: unknown[] = [];
    for (const entry of value) {
      const deduped = dedupeArrays(entry);
      const key = JSON.stringify(deduped);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(deduped);
      }
    }
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return result as Value;
  }
  if (value !== null && typeof value === 'object') {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, dedupeArrays(entry)]),
    ) as Value;
  }
  return value;
};

// Deep-merge a house default UNDER the consumer's resolved value so the consumer
// wins (objects per-key, scalars outright), then de-dup the concatenated arrays.
const deferMerge = (houseDefault: JsonObject, userValue: JsonObject | undefined): JsonObject =>
  // mergeConfig(base, override): override (the consumer) wins, arrays concat.
  dedupeArrays(mergeConfig(houseDefault, userValue ?? {}));

const toolingConfig = (options: ToolingConfigOptions = {}): Plugin => {
  const { node, react, test, pack, lint: lintOptions, fmt: fmtOptions, staged } = options;
  const scoped = isScopedTarget(node) || isScopedTarget(react);

  // Test env derives from intent unless overridden; monorepo roots and `test: false`
  // carry no test block (members own their own test config).
  const testBlock = ((): JsonObject | undefined => {
    if (scoped || test === false) {
      return undefined;
    }
    const env = test ?? (react ? 'react' : 'node');
    return env === 'react' ? testReact() : testNode();
  })();

  // The house defaults, equivalent to the value-form output of the old
  // toolingConfig. (viteReactApp only ever contributed an empty `plugins` array,
  // which is meaningless for a plugin-form config — the plugin itself lives in
  // `plugins` — so it is intentionally dropped here.)
  const houseDefaults = compactObject<Readonly<Record<string, JsonObject | undefined>>>({
    fmt: fmt(fmtOptions),
    lint: lint({ ...lintOptions, node, react }),
    pack: pack === undefined ? undefined : packConfig(pack),
    staged: stagedValue(staged),
    test: testBlock,
  });

  // A react/jsdom test env wants the jest-dom matchers + an fs allowance for the
  // setup module (under a link: install). Reuse domSetup's contribution verbatim;
  // it is additive (setupFiles + server.fs.allow), so it rides in via `config()`
  // the same way the standalone domSetup() plugin does — Vite concatenates it.
  // configResolved then de-dups, keeping it idempotent if the consumer lists it.
  const wantsDom = testBlock?.environment === 'jsdom';
  const domContribution = wantsDom ? domSetup().config() : undefined;

  return {
    config: () => domContribution,
    configResolved: (resolved: ResolvedConfig) => {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      const config = resolved as unknown as MutableConcerns;
      for (const [key, houseDefault] of Object.entries(houseDefaults)) {
        config[key] = deferMerge(houseDefault ?? {}, config[key]);
      }
      // The dom contribution rode in via config() (concatenated by Vite); collapse
      // any duplicate setupFiles / fs.allow the consumer may have also listed.
      if (wantsDom) {
        config.test = dedupeArrays(config.test);
        config.server = dedupeArrays(config.server);
      }
    },
    name: '@dbtlr/tooling',
  };
};

export { toolingConfig };
export type { ToolingConfigOptions };
