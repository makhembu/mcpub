import type { MCPTool } from '@mcpub/shared';

interface Env {
  DB: D1Database;
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

export async function handleToolDetail(request: Request, env: Env, ctx: ExecutionContext, params: { slug: string }): Promise<Response> {
  const { slug } = params;

  // Try slug first, then name
  let row = await env.DB.prepare('SELECT * FROM tools WHERE slug = ?').bind(slug).first();

  if (!row) {
    row = await env.DB.prepare('SELECT * FROM tools WHERE name = ?').bind(slug).first();
  }

  if (!row) {
    return new Response(JSON.stringify({ error: `Tool "${slug}" not found` }), {
      status: 404,
      headers: { 'content-type': 'application/json' }
    });
  }

  const tool = rowToTool(row);
  return new Response(JSON.stringify(tool), {
    headers: { 'content-type': 'application/json' }
  });
}
