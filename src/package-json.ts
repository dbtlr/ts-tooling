export type PackageScriptProfile = "plain" | "vite-plus";

export function packageScripts(profile: PackageScriptProfile = "plain"): Record<string, string> {
  if (profile === "vite-plus") {
    return {
      build: "vp pack",
      check: "vp check",
      format: "vp format",
      lint: "vp lint",
      staged: "vp staged",
      test: "vp test",
    };
  }

  return {
    check: "pnpm run typecheck && pnpm run lint && pnpm run fmt:check && pnpm run test",
    fmt: "oxfmt --write .",
    "fmt:check": "oxfmt --check .",
    lint: "oxlint --max-warnings 0 .",
    test: "vitest run",
    typecheck: "tsc --noEmit",
  };
}

export function packageToolingDevDependencies(
  profile: PackageScriptProfile = "plain",
): Record<string, string> {
  const base = {
    typescript: "^5.9.0",
    vitest: "^4.0.0",
  };

  if (profile === "vite-plus") {
    return { ...base, "vite-plus": "^0.2.1" };
  }

  return { ...base, oxfmt: "^0.55.0", oxlint: "^1.70.0" };
}
