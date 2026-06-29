#!/usr/bin/env bash
# Verify every example app by running `vp check` + `vp test` from its own path.
# Most are standalone single-package vite-plus projects; `monorepo` is a
# pnpm-workspace with its own member packages. `vp check`/`vp test` run from the
# example root cover either shape, so the loop treats them uniformly.
# Prints a red/green line per example and exits non-zero if any fail.
set -uo pipefail

cd "$(dirname "$0")/.." || exit 1

green=$'\033[32m'
red=$'\033[31m'
dim=$'\033[2m'
reset=$'\033[0m'

# Examples resolve `@dbtlr/tooling` via `link:../..`, so its dist must exist.
echo "${dim}Building @dbtlr/tooling so examples can resolve it...${reset}"
pnpm run build >/dev/null 2>&1 || { echo "${red}✗ package build failed${reset}"; exit 1; }

examples=(node-server cli library react-spa react-fullstack monorepo adopting)
failed=()

for ex in "${examples[@]}"; do
  dir="examples/$ex"
  log="$(mktemp)"
  if (cd "$dir" \
      && pnpm install --silent \
      && pnpm exec vp check \
      && pnpm exec vp test) >"$log" 2>&1; then
    echo "${green}✓ ${ex}${reset}"
  else
    echo "${red}✗ ${ex}${reset}"
    sed 's/^/    /' "$log"
    failed+=("$ex")
  fi
  rm -f "$log"
done

echo
if [ ${#failed[@]} -eq 0 ]; then
  echo "${green}All ${#examples[@]} examples passed.${reset}"
else
  echo "${red}${#failed[@]} failed: ${failed[*]}${reset}"
  exit 1
fi
