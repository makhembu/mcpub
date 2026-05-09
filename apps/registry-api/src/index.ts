import { Router } from 'itty-router';
import { handleSearch } from './search.js';
import { handleToolDetail } from './tools.js';
import { handleScan } from './scan.js';
import { handleSeed } from './seed.js';

export interface Env {
  DB: D1Database;
  SEARCH_INDEX: VectorizeIndex;
  AI: Ai;
}

const router = Router();

// API v1 routes
router.get('/api/search', handleSearch);
router.get('/api/tools/:slug', handleToolDetail);
router.get('/api/scan/:slug', handleScan);
router.get('/api/health', () => new Response(JSON.stringify({ status: 'ok', version: '0.0.1' }), {
  headers: { 'content-type': 'application/json' }
}));

// Seed endpoint (protected)
router.post('/api/seed', handleSeed);

// Landing page
router.get('/', () => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MCPHub Registry</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 720px; margin: 80px auto; padding: 0 24px; line-height: 1.6; color: #333; }
    h1 { font-size: 2.5rem; margin-bottom: 8px; }
    .subtitle { color: #666; font-size: 1.1rem; margin-bottom: 40px; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-size: 0.9rem; }
    .endpoints { list-style: none; padding: 0; }
    .endpoints li { padding: 8px 0; border-bottom: 1px solid #eee; }
    .endpoints li:last-child { border-bottom: none; }
    .endpoint { color: #0066cc; font-weight: 600; }
  </style>
</head>
<body>
  <h1>⚡ MCPHub Registry API</h1>
  <div class="subtitle">The npm for AI Tools — Registry backend</div>
  <ul class="endpoints">
    <li><span class="endpoint">GET /api/search?q=&lt;query&gt;</span> — Search MCP tools</li>
    <li><span class="endpoint">GET /api/tools/:slug</span> — Get tool details</li>
    <li><span class="endpoint">GET /api/scan/:slug</span> — Security scan a tool</li>
    <li><span class="endpoint">GET /api/health</span> — Health check</li>
  </ul>
  <p style="margin-top: 40px; color: #888; font-size: 0.9rem;">
    Use the CLI: <code>npx mcpub search &lt;query&gt;</code>
  </p>
</body>
</html>`;
  return new Response(html, { headers: { 'content-type': 'text/html;charset=UTF-8' } });
});

// 404
router.all('*', () => new Response(JSON.stringify({ error: 'Not found' }), {
  status: 404,
  headers: { 'content-type': 'application/json' }
}));

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const response = await router.handle(request, env, ctx);
      if (!response) {
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: { 'content-type': 'application/json' }
        });
      }
      return addCors(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal error';
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }
  }
};

function addCors(response: Response): Response {
  const newHeaders = new Headers(response.headers);
  newHeaders.set('Access-Control-Allow-Origin', '*');
  newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  newHeaders.set('Access-Control-Allow-Headers', 'Content-Type');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}
