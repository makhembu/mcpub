import { handleSeed } from './seed.js';
import type { MCPTool, MCPInstallConfig } from '@mcpub/shared';

function deriveInstallConfig(tool: any): MCPInstallConfig | undefined {
  if (tool.npm_package) {
    return { type: 'npx', command: 'npx', args: ['-y', tool.npm_package] };
  }
  if (tool.py_package) {
    return { type: 'uvx', command: 'uvx', args: [tool.py_package] };
  }
  if (tool.install_command) {
    const parts = tool.install_command.split(' ');
    const cmd = parts[0];
    const type = cmd === 'npx' ? 'npx' : cmd === 'uvx' ? 'uvx' : cmd === 'node' ? 'node' : cmd === 'python' ? 'python' : 'docker';
    return { type: type as MCPInstallConfig['type'], command: cmd, args: parts.slice(1) };
  }
  return undefined;
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
    installCommand: row.install_command,
    installConfig: deriveInstallConfig(row),
  };
}

async function handleSearch(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '10', 10), 50);
  const categoryFilter = url.searchParams.get('category');
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);
  const startTime = Date.now();

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

  const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
  const countResult = await env.DB.prepare(countSql).bind(...params).first<{ total: number }>();
  const total = countResult?.total || 0;

  sql += ' ORDER BY stars DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const { results } = await env.DB.prepare(sql).bind(...params).all();
  const tools = (results || []).map(rowToTool);
  const took = Date.now() - startTime;

  return json({ tools, total, query, limit, offset, took });
}

async function handleToolDetail(request: Request, env: Env, slug: string): Promise<Response> {
  const tool = await env.DB.prepare('SELECT * FROM tools WHERE slug = ?').bind(slug).first();
  if (!tool) return json({ error: 'Tool not found' }, 404);
  return json(rowToTool(tool));
}

async function handleScan(request: Request, env: Env, slug: string): Promise<Response> {
  const tool = await env.DB.prepare('SELECT * FROM tools WHERE slug = ?').bind(slug).first<any>();
  if (!tool) return json({ error: 'Tool not found' }, 404);

  const patterns = [
    { id: 'pi-001', category: 'prompt-injection', name: 'Instruction Override', severity: 'high', description: 'Tool may allow instruction override from untrusted input' },
    { id: 'pi-002', category: 'prompt-injection', name: 'Role Manipulation', severity: 'medium', description: 'Tool accepts role/persona definitions from external input' },
    { id: 'de-001', category: 'data-exfiltration', name: 'Prompt Extraction', severity: 'critical', description: 'Tool exposes raw prompts or system messages' },
    { id: 'de-002', category: 'data-exfiltration', name: 'Credential Harvesting', severity: 'critical', description: 'Tool requests or transmits credentials' },
    { id: 'tp-001', category: 'tool-poisoning', name: 'Unsafe Command Execution', severity: 'high', description: 'Tool executes shell commands from parameters' },
    { id: 'tp-002', category: 'tool-poisoning', name: 'Dynamic Code Execution', severity: 'high', description: 'Tool uses eval or dynamic code execution' },
    { id: 'sc-001', category: 'supply-chain', name: 'Remote Code Fetch', severity: 'medium', description: 'Tool fetches and executes remote code' },
    { id: 'mc-001', category: 'misconfiguration', name: 'Broad Filesystem Access', severity: 'medium', description: 'Tool has unrestricted filesystem access' },
  ];

  const issues = patterns.filter(p => {
    const text = `${tool.name} ${tool.description} ${tool.install_command || ''}`.toLowerCase();
    return text.includes(p.name.toLowerCase().split(' ')[0]);
  });

  const score = Math.max(0, 100 - issues.length * 12);

  return json({
    slug: tool.slug,
    name: tool.name,
    score,
    severity: score >= 80 ? 'low' : score >= 50 ? 'medium' : 'high',
    issues,
    summary: issues.length > 0
      ? `Found ${issues.length} potential security concerns`
      : 'No significant security issues detected',
  });
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

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
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

      if (method === 'GET') {
        const badgeMatch = path.match(/^\/badge\/(.+)\.svg$/);
        if (badgeMatch) {
          return handleBadge(request, env, badgeMatch[1]);
        }
      }

      if (path.startsWith('/api/tools/') && method === 'GET') {
        const slug = path.replace('/api/tools/', '');
        return handleToolDetail(request, env, slug);
      }

      if (path === '/api/scan' && method === 'GET') {
        const slug = url.searchParams.get('slug') || '';
        if (!slug) return json({ error: 'slug parameter required' }, 400);
        return handleScan(request, env, slug);
      }

      if (path === '/api/seed' && method === 'POST') {
        return handleSeed(request, env);
      }

      return json({ error: 'Not found' }, 404);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal error';
      return json({ error: message }, 500);
    }
  },
};
