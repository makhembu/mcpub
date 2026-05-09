import type { MCPTool, SearchResult } from '@mcpub/shared';

interface Env {
  DB: D1Database;
  SEARCH_INDEX: VectorizeIndex;
  AI: Ai;
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
  };
}

export async function handleSearch(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '10', 10), 50);
  const categoryFilter = url.searchParams.get('category');
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);

  const startTime = performance.now();

  let sql = 'SELECT * FROM tools WHERE 1=1';
  const params: any[] = [];

  if (query) {
    sql += ' AND (name LIKE ?1 OR short_description LIKE ?1 OR slug LIKE ?1)';
    params.push(`%${query}%`);
  }

  if (categoryFilter) {
    sql += ' AND categories LIKE ?';
    params.push(`%${categoryFilter}%`);
  }

  // Count total
  const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
  const countResult = await env.DB.prepare(countSql).bind(...params).first<{ total: number }>();
  const total = countResult?.total || 0;

  // Fetch page
  sql += ' ORDER BY stars DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const { results } = await env.DB.prepare(sql).bind(...params).all();
  const tools = (results || []).map(rowToTool);

  const took = Math.round(performance.now() - startTime);

  const result: SearchResult = { tools, total, query, took };

  return new Response(JSON.stringify(result), {
    headers: { 'content-type': 'application/json' }
  });
}
