import type { JsonObject } from './types.js';

// A lint target — `node` or `react` — is the set of files the target applies to.
// `true` means the whole project (config emitted at the top level); a list of
// globs means just those files (config emitted as a scoped `overrides` fragment),
// which is how a mixed-target monorepo's centralized root config addresses each
// package. `false`/omitted/`[]` means the target is off.
//
// The object form `{ files, rules }` is a glob target that also carries consumer
// rules; those rules are merged into the target's OWN scoped override (after the
// target defaults), so a consumer can tune or disable a target rule for the same
// globs. They win because they share one override — not a later one a host
// toolchain might reorder. Whole-project targets don't need this: their rules are
// tunable via `lint.rules` (spread last into the base rules).
type ScopedTarget = { readonly files: readonly string[]; readonly rules?: JsonObject };
type LintTarget = boolean | readonly string[] | ScopedTarget;

// A target is "whole project" only when explicitly `true`.
const isWholeProject = (target: LintTarget | undefined): boolean => target === true;

// The `{ files, rules }` object form (not a boolean, not a glob array). A type
// predicate is needed because Array.isArray does not narrow `readonly string[]`
// out of the union on its own.
const isScopedObject = (target: LintTarget | undefined): target is ScopedTarget =>
  typeof target === 'object' && !Array.isArray(target);

// Non-empty glob list (bare array or the object form's `files`) → the target is
// scoped to those files; otherwise undefined.
const targetGlobs = (target: LintTarget | undefined): readonly string[] | undefined => {
  const globs = isScopedObject(target) ? target.files : target;
  return Array.isArray(globs) && globs.length > 0 ? globs : undefined;
};

// Consumer rules carried by the object form, merged into the scoped override.
const targetRules = (target: LintTarget | undefined): JsonObject | undefined =>
  isScopedObject(target) ? target.rules : undefined;

export { isScopedObject, isWholeProject, targetGlobs, targetRules };
export type { LintTarget, ScopedTarget };
