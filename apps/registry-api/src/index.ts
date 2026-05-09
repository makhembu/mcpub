import { handleSeed } from './seed.js';
import { handleScan as handleDeepScan } from './scan.js';
import type { MCPTool, MCPInstallConfig } from '@mcpub/shared';

function deriveInstallConfig(tool: any): MCPInstallConfig | undefined {
  if (tool.npm_package) {
    return { type: 'npx', command: 'npx', args: ['-y', tool.npm_package] };
  }
  if (tool.py_package) {
    return { type: 'uvx', command: 'uvx', args: [tool.py_package] };
  }
  if (tool.install_command && !tool.install_command.includes('mcpub install')) {
    const parts = tool.install_command.split(' ');
    const cmd = parts[0];
    const type = cmd === 'npx' ? 'npx' : cmd === 'uvx' ? 'uvx' : cmd === 'node' ? 'node' : cmd === 'python' ? 'python' : 'docker';
    return { type: type as MCPInstallConfig['type'], command: cmd, args: parts.slice(1) };
  }
  return { type: 'npx', command: 'npx', args: ['-y', tool.slug] };
}

export interface Env {
  DB: D1Database;
  SEARCH_INDEX: VectorizeIndex;
  AI: Ai;
}

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function cleanInstallCommand(row: any): string | null {
  const cmd = row.install_command;
  if (!cmd) return null;
  if (cmd.includes('mcpub install')) return null;
  return cmd;
}

function rowToTool(row: any): MCPTool {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    shortDescription: row.short_description,
    githubUrl: row.github_url,
    npmPackage: row.npm_package,
    pyPackage: row.py_package,
    homeUrl: row.home_url,
    author: row.author,
    stars: row.stars,
    license: row.license,
    createdAt: row.created_at,
    lastUpdated: row.last_updated,
    transports: JSON.parse(row.transports || '[]'),
    categories: JSON.parse(row.categories || '[]'),
    compatibility: JSON.parse(row.compatibility || '{}'),
    securityScore: row.security_score,
    installCommand: cleanInstallCommand(row),
    installConfig: deriveInstallConfig(row),
  };
}

async function textSearch(env: Env, query: string, categoryFilter: string | null, transportFilter: string | null, minStars: number, minScore: number, sort: string, limit: number, offset: number): Promise<{ tools: MCPTool[]; total: number }> {
  let sql = 'SELECT * FROM tools WHERE 1=1';
  const params: any[] = [];

  if (query) {
    sql += ' AND (name LIKE ? OR short_description LIKE ? OR slug LIKE ?)';
    params.push(`%${query}%`, `%${query}%`, `%${query}%`);
  }
  if (categoryFilter) {
    sql += ' AND categories LIKE ?';
    params.push(`%${categoryFilter}%`);
  }
  if (transportFilter) {
    sql += ' AND transports LIKE ?';
    params.push(`%${transportFilter}%`);
  }
  if (minStars > 0) {
    sql += ' AND stars >= ?';
    params.push(minStars);
  }
  if (minScore > 0) {
    sql += ' AND security_score >= ?';
    params.push(minScore);
  }

  const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
  const countResult = await env.DB.prepare(countSql).bind(...params).first<{ total: number }>();
  const total = countResult?.total || 0;

  const sortField = sort === 'name' ? 'name' : sort === 'score' ? 'security_score' : 'stars';
  const sortDir = sort === 'name' ? 'ASC' : 'DESC';
  sql += ` ORDER BY ${sortField} ${sortDir} LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const { results } = await env.DB.prepare(sql).bind(...params).all();
  const tools = (results || []).map(rowToTool);
  return { tools, total };
}

async function semanticSearch(env: Env, query: string, limit: number): Promise<MCPTool[] | null> {
  try {
    const embeddingRes = await env.AI.run('@cf/baai/bge-small-en-v1.5', { text: [query] });
    const vector = embeddingRes.data[0];

    const vectorQuery = await env.SEARCH_INDEX.query(vector, { topK: limit, returnMetadata: true });
    if (!vectorQuery.matches || vectorQuery.matches.length === 0) return null;

    const slugs = vectorQuery.matches
      .filter(m => m.score > 0.3)
      .map(m => m.metadata?.slug as string)
      .filter(Boolean);

    if (slugs.length === 0) return null;

    const placeholders = slugs.map(() => '?').join(',');
    const { results } = await env.DB.prepare(
      `SELECT * FROM tools WHERE slug IN (${placeholders})`
    ).bind(...slugs).all();
    const tools = (results || []).map(rowToTool);

    const slugOrder = new Map(slugs.map((s, i) => [s, i]));
    tools.sort((a, b) => (slugOrder.get(a.slug) ?? 999) - (slugOrder.get(b.slug) ?? 999));

    return tools;
  } catch {
    return null;
  }
}

async function handleSearch(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '10', 10), 2000);
  const categoryFilter = url.searchParams.get('category');
  const transportFilter = url.searchParams.get('transport');
  const minStars = parseInt(url.searchParams.get('min_stars') || '0', 10);
  const minScore = parseInt(url.searchParams.get('min_score') || '0', 10);
  const sort = url.searchParams.get('sort') || 'stars';
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);
  const semantic = url.searchParams.get('semantic') !== 'false';
  const startTime = Date.now();

  let tools: MCPTool[];
  let total: number;
  let searchMethod = 'text';

  if (query.length >= 4 && semantic && !categoryFilter && !transportFilter && sort === 'stars' && minStars === 0 && minScore === 0) {
    const semanticResults = await semanticSearch(env, query, limit);
    if (semanticResults) {
      tools = semanticResults;
      total = tools.length;
      searchMethod = 'semantic';
    } else {
      const result = await textSearch(env, query, categoryFilter, transportFilter, minStars, minScore, sort, limit, offset);
      tools = result.tools;
      total = result.total;
    }
  } else {
    const result = await textSearch(env, query, categoryFilter, transportFilter, minStars, minScore, sort, limit, offset);
    tools = result.tools;
    total = result.total;
  }

  const took = Date.now() - startTime;

  return json({ tools, total, query, limit, offset, took, category: categoryFilter, transport: transportFilter, min_stars: minStars, min_score: minScore, sort, search_method: searchMethod });
}

async function handleToolDetail(request: Request, env: Env, slug: string): Promise<Response> {
  const tool = await env.DB.prepare('SELECT * FROM tools WHERE slug = ?').bind(slug).first();
  if (!tool) return json({ error: 'Tool not found' }, 404);
  return json(rowToTool(tool));
}

async function handleScan(request: Request, env: Env, slug: string): Promise<Response> {
  const fakeCtx = { waitUntil: (p: Promise<any>) => { p.catch(() => {}); }, passThroughOnException: () => {} } as unknown as ExecutionContext;
  return handleDeepScan(request, env, fakeCtx, { slug });
}

function renderBadge(
  label: string,
  message: string,
  color: string,
): string {
  const labelWidth = label.length * 7 + 16;
  const messageWidth = message.length * 7 + 16;
  const totalWidth = labelWidth + messageWidth;
  const labelEnd = labelWidth;
  const borderRadius = 3;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${totalWidth}" height="20" role="img" aria-label="${label}: ${message}">
  <title>${label}: ${message}</title>
  <g shape-rendering="crispEdges">
    <rect x="0" y="0" width="${labelEnd}" height="20" fill="#555"/>
    <rect x="${labelEnd}" y="0" width="${messageWidth}" height="20" fill="${color}"/>
    <rect x="0" y="0" width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <defs>
    <linearGradient id="s" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".07"/>
      <stop offset="1" stop-color="#fff" stop-opacity=".0"/>
    </linearGradient>
  </defs>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="${labelEnd / 2}" y="14">${escapeXml(label)}</text>
    <text x="${labelEnd + messageWidth / 2}" y="14">${escapeXml(message)}</text>
  </g>
</svg>`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function svg(data: string, status = 200): Response {
  return new Response(data, {
    status,
    headers: {
      'content-type': 'image/svg+xml',
      'cache-control': 'max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

async function handleBadge(request: Request, env: Env, slug: string): Promise<Response> {
  const tool = await env.DB.prepare('SELECT * FROM tools WHERE slug = ?').bind(slug).first<any>();
  if (!tool) {
    return svg(renderBadge('MCPub', 'not found', '#e05d44'), 404);
  }

  const stars = tool.stars || 0;
  const score = tool.security_score;
  const rightText = score !== null && score !== undefined
    ? `⭐ ${formatStars(stars)} · ${score}/100`
    : `⭐ ${formatStars(stars)}`;

  let color = '#4c1';
  if (score !== null && score !== undefined) {
    if (score >= 80) color = '#4c1';
    else if (score >= 50) color = '#dfb317';
    else color = '#e05d44';
  }

  return svg(renderBadge('MCPub', rightText, color));
}

async function handleScanUpdate(request: Request, env: Env, slug: string): Promise<Response> {
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== 'dev-seed-key') {
    return json({ error: 'Unauthorized' }, 401);
  }

  const tool = await env.DB.prepare('SELECT * FROM tools WHERE slug = ?').bind(slug).first<any>();
  if (!tool) return json({ error: 'Tool not found' }, 404);

  const body = await request.json().catch(() => ({})) as { securityScore?: number; findings?: any[]; scannedAt?: string };

  if (body.securityScore === undefined || body.securityScore === null) {
    return json({ error: 'securityScore is required' }, 400);
  }

  const score = Math.max(0, Math.min(100, body.securityScore));
  await env.DB.prepare('UPDATE tools SET security_score = ? WHERE slug = ?').bind(score, slug).run();

  return json({ slug, securityScore: score, updated: true });
}

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

async function handleEmbed(request: Request, env: Env): Promise<Response> {
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== 'dev-seed-key') {
    return json({ error: 'Unauthorized' }, 401);
  }

  const { results } = await env.DB.prepare('SELECT slug, name, description, short_description, categories FROM tools').all();
  if (!results || results.length === 0) return json({ error: 'No tools found' }, 404);

  const batchSize = 50;
  let total = 0;

  for (let i = 0; i < results.length; i += batchSize) {
    const batch = results.slice(i, i + batchSize) as any[];
    const texts = batch.map(t => `${t.name}: ${t.short_description || t.description || ''}`.slice(0, 512));

    try {
      const embeddingRes = await env.AI.run('@cf/baai/bge-small-en-v1.5', { text: texts });
      const vectors: { id: string; values: number[]; metadata: Record<string, string> }[] = [];

      for (let j = 0; j < batch.length; j++) {
        const tool = batch[j];
        vectors.push({
          id: tool.slug,
          values: embeddingRes.data[j],
          metadata: {
            slug: tool.slug,
            name: tool.name,
            description: (tool.short_description || tool.description || '').slice(0, 200),
          },
        });
      }

      await env.SEARCH_INDEX.upsert(vectors);
      total += batch.length;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Embedding error';
      return json({ error: msg, at: total }, 500);
    }
  }

  return json({ indexed: total, status: 'ok' });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    try {
      if (path === '/api/health' || path === '/') {
        return json({ status: 'ok', version: '0.0.1', name: 'MCPHub Registry API' });
      }

      if (path === '/api/search' && method === 'GET') {
        return handleSearch(request, env);
      }

      if (path === '/api/suggest' && method === 'GET') {
        const q = url.searchParams.get('q') || '';
        if (q.length < 2) return json({ suggestions: [] });
        const { results } = await env.DB.prepare(
          "SELECT DISTINCT name FROM tools WHERE name LIKE ? ORDER BY stars DESC LIMIT 8"
        ).bind(`%${q}%`).all();
        const suggestions = (results || []).map((r: any) => r.name);
        return json({ suggestions });
      }

      if (method === 'GET') {
        const badgeMatch = path.match(/^\/badge\/(.+)\.svg$/);
        if (badgeMatch) {
          return handleBadge(request, env, badgeMatch[1]);
        }
      }

      if (path.startsWith('/api/tools/') && path.endsWith('/scan') && method === 'POST') {
        const slug = path.replace('/api/tools/', '').replace('/scan', '');
        return handleScanUpdate(request, env, slug);
      }

      if (path === '/api/random-tool' && method === 'GET') {
        const { results } = await env.DB.prepare('SELECT slug FROM tools ORDER BY RANDOM() LIMIT 1').all();
        const rows = results || [];
        if (rows.length === 0) return json({ error: 'No tools found' }, 404);
        return json({ slug: (rows[0] as any).slug });
      }

      if (path.startsWith('/api/tools/') && method === 'GET') {
        const slug = path.replace('/api/tools/', '');
        return handleToolDetail(request, env, slug);
      }

      if (path === '/api/slugs' && method === 'GET') {
        const { results } = await env.DB.prepare('SELECT slug FROM tools ORDER BY slug').all();
        const slugs = (results || []).map((r: any) => r.slug);
        return json(slugs);
      }

      if (path === '/api/categories' && method === 'GET') {
        const { results } = await env.DB.prepare("SELECT DISTINCT categories FROM tools WHERE categories != '[]'").all();
        const catSet = new Set<string>();
        for (const row of results || []) {
          const cats = JSON.parse((row as any).categories || '[]');
          for (const c of cats) catSet.add(c);
        }
        const categories = [...catSet].sort();
        return json(categories);
      }

      if (path === '/api/scan' && method === 'GET') {
        const slug = url.searchParams.get('slug') || '';
        if (!slug) return json({ error: 'slug parameter required' }, 400);
        return handleScan(request, env, slug);
      }

      if (path === '/api/seed' && method === 'POST') {
        return handleSeed(request, env);
      }

      if (path === '/api/embed' && method === 'POST') {
        return handleEmbed(request, env);
      }

      return json({ error: 'Not found' }, 404);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal error';
      return json({ error: message }, 500);
    }
  },
};
