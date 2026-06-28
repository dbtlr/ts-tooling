# node-server example

A backend HTTP service that runs on Node.js.

- **Config:** `toolingConfig({ node: true })` — `node` enables the oxlint `node`
  plugin (permits builtin imports like `node:http`) and selects the Node test env.
- **tsconfig:** `@dbtlr/tooling/tsconfig/node.json` (NodeNext, Node types).

Acts as a test case: `vp check` + `vp test` confirm the Node lint target accepts
builtin imports and type-checks against Node APIs.
