import type { UserConfig } from 'vite-plus';

import type { JsonObject } from './types.js';

// The house ignore list — keeps oxfmt off generated/output files, notably
// CHANGELOG.md (release-please owns and reformats it every release PR). Exported
// so consumers can see (and, if they must, re-derive) the defaults; they should
// rarely need to, since `fmt({ ignores })` appends to this list.
const DEFAULT_FMT_IGNORES = [
  'pnpm-lock.yaml',
  'bun.lock',
  'CHANGELOG.md',
  'dist/**',
  'build/**',
  'node_modules/**',
  'coverage/**',
  '.turbo/**',
  '.vite/**',
] as const;

// Typed oxfmt options, derived from vite-plus's public config type so it stays in
// lockstep with the toolchain. `ignorePatterns` is forbidden (typed `never`):
// passing it would replace the house ignores wholesale (the footgun that drove
// consumers to a separate ignore file). Use `ignores` instead — it APPENDS to
// DEFAULT_FMT_IGNORES. Every other oxfmt option passes through and overrides the
// house default (e.g. `singleQuote`, `sortImports`).
type FmtOptions = Omit<NonNullable<UserConfig['fmt']>, 'ignorePatterns'> & {
  readonly ignores?: readonly string[];
  /** Forbidden — use `ignores` (which appends). Set directly it would clobber the house list. */
  readonly ignorePatterns?: never;
};

// The shared formatter config (oxfmt via vite-plus). House style: single quotes +
// sorted imports. Caller options spread first so they override the scalar
// defaults; `ignorePatterns` is computed LAST from the house list + the caller's
// `ignores`, so it can never be replaced wholesale (belt-and-suspenders to the
// `never` type, in case an untyped JS caller passes `ignorePatterns`).
const fmt = ({ ignores, ...rest }: FmtOptions = {}): JsonObject => ({
  singleQuote: true,
  sortImports: { ignoreCase: true },
  ...rest,
  ignorePatterns: [...DEFAULT_FMT_IGNORES, ...(ignores ?? [])],
});

export { DEFAULT_FMT_IGNORES, fmt };
export type { FmtOptions };
