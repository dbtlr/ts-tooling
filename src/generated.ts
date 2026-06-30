// Paths emitted by code generators — TanStack Router's `routeTree.gen.ts`,
// GraphQL/codegen output, and the like. Generated files follow their generator's
// own style and are rewritten on every regen, so holding them to the house lint
// and format rules is pure noise (and churns the diff). Both `lint` and `fmt`
// ignore these by default, sourced from this one array so the two stay in
// lockstep. The `.gen.{js,ts}` convention is the common marker; consumers extend
// per-project via `lint({ ignores })` / `fmt({ ignores })`, which append.
const GENERATED_PATHS = ['**/*.gen.{js,ts}'] as const;

export { GENERATED_PATHS };
