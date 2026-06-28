import { createServer } from 'node:http';

const server = createServer((_request, response) => {
  response.end('hello from the @dbtlr/tooling node-server example');
});

export { server };
