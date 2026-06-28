# node-server example

A backend HTTP service that runs on Node.js.

- **Helper:** `vitePlusBase({ lint: { node: true } })` — `node: true` enables the
  oxlint `node` plugin and permits Node builtin imports (`node:http`).
- **tsconfig:** `@dbtlr/tooling/tsconfig/node.json` (NodeNext, Node types).
- **Tests:** `vitestNode()` (Node environment).

Acts as a test case: `vp check` + `vp test` confirm the Node lint target accepts
builtin imports and type-checks against Node APIs.
