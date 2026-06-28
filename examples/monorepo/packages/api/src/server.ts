import { createServer } from 'node:http';

// `node:http` is a Node builtin — allowed only because the root config's
// `packages/api/**` override enables the `node` plugin and turns off
// `import/no-nodejs-modules`.
const server = createServer((_request, response) => {
  response.end('hello from the @dbtlr/tooling monorepo api package');
});

export { server };
