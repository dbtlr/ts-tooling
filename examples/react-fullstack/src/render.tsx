import { renderToString } from 'react-dom/server';

import { App } from './App.js';

const renderPage = (): string => `<!doctype html><div id="root">${renderToString(<App />)}</div>`;

export { renderPage };
