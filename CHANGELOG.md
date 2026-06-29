# Changelog

## [0.3.0](https://github.com/dbtlr/ts-tooling/compare/v0.2.0...v0.3.0) (2026-06-29)


### ⚠ BREAKING CHANGES

* vite >=8 is now the supported peer (was >=7). Consumers using the vite-touching surface (defineConfig / viteReactApp) on vite 7 must upgrade to vite 8. vite remains an optional peer.

### Features

* relax more over-opinionated lint rules from adoption findings ([de99834](https://github.com/dbtlr/ts-tooling/commit/de998349c869dae17d2e1378adbe3bd2d09a1f73))
* require vite 8 as the supported peer ([0a5109c](https://github.com/dbtlr/ts-tooling/commit/0a5109c59f60dea3604a4a18f040ab5dff21c8cd))
* tunable glob lint targets and typed lint.overrides ([940cf61](https://github.com/dbtlr/ts-tooling/commit/940cf6103372b6bd1c82a4e26fb89a8827f78931))
* widened defineConfig re-export for plugin-heavy configs ([e1b4d62](https://github.com/dbtlr/ts-tooling/commit/e1b4d629e57a4d9afd206e36e272143f4c597085))


### Bug Fixes

* bump minor (not major) for breaking changes while in 0.x ([#26](https://github.com/dbtlr/ts-tooling/issues/26)) ([15acdaa](https://github.com/dbtlr/ts-tooling/commit/15acdaaafeee30c6e96091b3eae49070ab8cafc3))

## [0.2.0](https://github.com/dbtlr/ts-tooling/compare/v0.1.1...v0.2.0) (2026-06-28)


### Features

* relax over-opinionated lint rules in house defaults ([a109f5b](https://github.com/dbtlr/ts-tooling/commit/a109f5b01d876c1d0c2aee3693cdf9c115532e2d))


### Bug Fixes

* drop baked-in node types from the monorepo tsconfig ([6a78917](https://github.com/dbtlr/ts-tooling/commit/6a789179e91daf6a2df0aedf3ac8d781f67ec83a))
* scope the react lint relaxations to the react plugin ([29acc7a](https://github.com/dbtlr/ts-tooling/commit/29acc7a5c5caad3fddbe6e627717b7b356001487))

## [0.1.1](https://github.com/dbtlr/ts-tooling/compare/v0.1.0...v0.1.1) (2026-06-28)


### Bug Fixes

* don't format the generated CHANGELOG ([0b7493a](https://github.com/dbtlr/ts-tooling/commit/0b7493ac1cef34567ffd8c641e76b616d41817a2))
* treat an empty glob target as off, not a monorepo root ([ce1a7e0](https://github.com/dbtlr/ts-tooling/commit/ce1a7e0ab1855c64aa56f966a8232de5de93f7cc))
