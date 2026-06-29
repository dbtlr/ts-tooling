import { defineConfig, fmt, lint } from '@dbtlr/tooling';

// Composition path: à la carte PARTIAL adoption for an existing codebase.
// Phase 1 is formatting-only (`fmt()`); here we've reached phase 2 — the house
// lint rules are on but LENIENT (`denyWarnings: false`, `typeAware: false`) so
// violations report as warnings instead of blocking the build while the codebase
// is brought up to standard. No test/pack block — those concerns aren't adopted
// yet. Tighten by dropping the lenient flags once clean.
export default defineConfig({
  fmt: fmt(),
  lint: lint({ denyWarnings: false, typeAware: false }),
});
