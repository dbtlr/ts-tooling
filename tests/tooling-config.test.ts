import { mergeConfig } from 'vite';
import { describe, expect, it } from 'vite-plus/test';

import { toolingConfig } from '../src/tooling-config.js';

// A structural view of the resolved config the plugin produces — only the keys
// the contract asserts on. Slash-bearing rule keys stay as index access.
type Resolved = {
  fmt?: { singleQuote?: boolean; sortImports?: { ignoreCase?: boolean } };
  lint?: {
    options?: { denyWarnings?: boolean; typeAware?: boolean; typeCheck?: boolean };
    overrides?: readonly {
      files?: readonly string[];
      rules?: Readonly<Record<string, unknown>>;
    }[];
    plugins?: readonly string[];
    rules?: Readonly<Record<string, unknown>>;
  };
  pack?: { exports?: boolean };
  server?: { fs?: { allow?: readonly string[] } };
  staged?: unknown;
  test?: { environment?: string; setupFiles?: readonly string[] };
};

// The plugin's hooks are plain functions over the (vite-extended) config shape;
// view them through the structural type the tests drive.
type ToolingPlugin = {
  readonly config: (userConfig: Resolved) => Resolved | undefined;
  readonly configResolved: (config: Resolved) => void;
  readonly name: string;
};

const asToolingPlugin = (plugin: ReturnType<typeof toolingConfig>): ToolingPlugin =>
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  plugin as unknown as ToolingPlugin;

// Faithfully simulate Vite's pipeline for a single plugin: Vite merges the user
// config UNDER the plugin's `config()` return (plugin wins, arrays concat), then
// runs `configResolved`, where the plugin mutates the resolved object. We inspect
// the result the way `vp` (via vite's resolveConfig) does.
const resolveWith = (
  plugin: ReturnType<typeof toolingConfig>,
  userConfig: Resolved = {},
): Resolved => {
  const tooling = asToolingPlugin(plugin);
  const fromConfig = tooling.config(userConfig);
  const merged: Resolved = fromConfig ? mergeConfig(userConfig, fromConfig) : { ...userConfig };
  tooling.configResolved(merged);
  return merged;
};

describe('toolingConfig is a defer-to-user vite plugin', () => {
  it('returns a plugin object named for the package (req 7)', () => {
    expect(toolingConfig({ node: true }).name).toBe('@dbtlr/tooling');
  });

  it('req 1: applies the house lint/fmt/test/staged defaults', () => {
    const c = resolveWith(toolingConfig({ node: true }));
    expect(c.lint).toMatchObject({
      options: { denyWarnings: true, typeAware: true, typeCheck: true },
      rules: { 'import/no-nodejs-modules': 'off' },
    });
    expect(c.lint?.plugins ?? []).toContain('node');
    expect(c.fmt).toMatchObject({ singleQuote: true, sortImports: { ignoreCase: true } });
    expect(c.test).toMatchObject({ environment: 'node' });
    expect(c.staged).toStrictEqual({ '*': 'vp check --fix' });
  });

  it('req 2: user rules win per-key, house rules still present', () => {
    const c = resolveWith(toolingConfig({ node: true }), {
      lint: { rules: { 'unicorn/no-null': 'error' } },
    });
    const rules = c.lint?.rules ?? {};
    // user wins
    expect(rules['unicorn/no-null']).toBe('error');
    // house rules survive (per-key merge, not wholesale replacement)
    expect(rules['import/no-nodejs-modules']).toBe('off');
    expect(rules['no-magic-numbers']).toBe('off');
  });

  it('req 3: user scalar overrides win over house scalars', () => {
    const c = resolveWith(toolingConfig({ node: true }), {
      fmt: { singleQuote: false },
      lint: { options: { denyWarnings: false } },
    });
    expect(c.fmt?.singleQuote).toBe(false);
    expect(c.lint?.options?.denyWarnings).toBe(false);
    // untouched house scalars remain
    expect(c.lint?.options?.typeAware).toBe(true);
  });

  it('req 4: react intent contributes the dom setup file + fs allow + jsdom env', () => {
    const c = resolveWith(toolingConfig({ react: true }));
    expect(c.test).toMatchObject({ environment: 'jsdom' });
    expect(c.test?.setupFiles ?? []).toContain('@dbtlr/tooling/setup/dom');
    expect(c.server?.fs?.allow ?? []).not.toHaveLength(0);
  });

  it('req 4: node-only intent contributes NEITHER dom setup file NOR fs allow', () => {
    const c = resolveWith(toolingConfig({ node: true }));
    expect(c.test?.setupFiles).toBeUndefined();
    expect(c.server).toBeUndefined();
  });

  it('req 4: react + no user env defaults test.environment to jsdom', () => {
    const c = resolveWith(toolingConfig({ react: true }));
    expect(c.test?.environment).toBe('jsdom');
    expect(c.test?.setupFiles ?? []).toContain('@dbtlr/tooling/setup/dom');
    expect(c.server?.fs?.allow ?? []).not.toHaveLength(0);
  });

  it('req 4: user-supplied test.environment wins over jsdom default; dom setup still rides in', () => {
    const c = resolveWith(toolingConfig({ react: true }), { test: { environment: 'happy-dom' } });
    expect(c.test?.environment).toBe('happy-dom');
    expect(c.test?.setupFiles ?? []).toContain('@dbtlr/tooling/setup/dom');
    expect(c.server?.fs?.allow ?? []).not.toHaveLength(0);
  });

  it('req 5: user array entries merge with house entries — no dupes (setupFiles)', () => {
    const c = resolveWith(toolingConfig({ react: true }), { test: { setupFiles: ['./x.ts'] } });
    const setupFiles = c.test?.setupFiles ?? [];
    expect(setupFiles).toContain('@dbtlr/tooling/setup/dom');
    expect(setupFiles).toContain('./x.ts');
    expect(setupFiles).toHaveLength(2);
  });

  it('req 5: user array entries merge with house entries — no dupes (lint.plugins)', () => {
    const c = resolveWith(toolingConfig({ node: true }), {
      lint: { plugins: ['node', 'custom'] },
    });
    const plugins = c.lint?.plugins ?? [];
    // both the house "node" and the user "custom" present, each exactly once
    expect(plugins.filter((p) => p === 'node')).toHaveLength(1);
    expect(plugins.filter((p) => p === 'custom')).toHaveLength(1);
  });

  it('req 5: a user-supplied house entry is not duplicated (idempotent setupFiles)', () => {
    const c = resolveWith(toolingConfig({ react: true }), {
      test: { setupFiles: ['@dbtlr/tooling/setup/dom'] },
    });
    const setupFiles = c.test?.setupFiles ?? [];
    expect(setupFiles.filter((f) => f === '@dbtlr/tooling/setup/dom')).toHaveLength(1);
  });
});

describe('toolingConfig topology (req 6)', () => {
  it('a glob (monorepo-lint-root) target emits lint only — no test', () => {
    const c = resolveWith(toolingConfig({ node: ['packages/api/**'] }));
    expect(c.test).toBeUndefined();
    expect(c.lint).toMatchObject({
      overrides: expect.arrayContaining([expect.objectContaining({ files: ['packages/api/**'] })]),
    });
  });

  it('test: false omits the test block', () => {
    expect(resolveWith(toolingConfig({ node: true, test: false })).test).toBeUndefined();
  });

  it('test env derives from intent; test:"node" forces node on a react target', () => {
    expect(resolveWith(toolingConfig({ react: true })).test).toMatchObject({
      environment: 'jsdom',
    });
    expect(resolveWith(toolingConfig({ react: true, test: 'node' })).test).toMatchObject({
      environment: 'node',
    });
  });

  it('pack block only when the pack option is provided', () => {
    expect(resolveWith(toolingConfig({ node: true })).pack).toBeUndefined();
    expect(resolveWith(toolingConfig({ node: true, pack: {} })).pack).toMatchObject({
      exports: true,
    });
  });

  it('staged: false omits the staged block', () => {
    expect(resolveWith(toolingConfig({ node: true, staged: false })).staged).toBeUndefined();
  });

  it('an empty glob target is "off", not a monorepo root, so the test block stays', () => {
    expect(resolveWith(toolingConfig({ node: [] })).test).toMatchObject({ environment: 'node' });
  });

  it('object-form glob target is a scoped monorepo root: scoped override, no test block', () => {
    const c = resolveWith(
      toolingConfig({
        react: { files: ['packages/web/**'], rules: { 'react/jsx-max-depth': 'warn' } },
      }),
    );
    expect(c.lint).toMatchObject({
      overrides: expect.arrayContaining([
        expect.objectContaining({
          files: ['packages/web/**'],
          rules: expect.objectContaining({ 'react/jsx-max-depth': 'warn' }),
        }),
      ]),
    });
    expect(c.test).toBeUndefined();
  });

  it('isomorphic (node + react): both lint targets, jsdom test', () => {
    const c = resolveWith(toolingConfig({ node: true, react: true }));
    expect(c.lint).toMatchObject({ plugins: expect.arrayContaining(['node', 'react']) });
    expect(c.test).toMatchObject({ environment: 'jsdom' });
  });
});
