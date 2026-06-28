import { createServer } from 'node:http';

import { renderPage } from './render.js';

const server = createServer((_request, response) => {
  response.setHeader('content-type', 'text/html');
  response.end(renderPage());
});

export { server };
