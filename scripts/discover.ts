import { writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface ToolEntry {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  githubUrl: string;
  npmPackage: string | null;
  pyPackage: string | null;
  homeUrl: string | null;
  author: string;
  stars: number;
  license: string | null;
  transports: string[];
  categories: string[];
  compatibility: { openai: string; anthropic: string; langchain: string; cursor: string };
  securityScore: null;
  installCommand: string;
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GH_HEADERS: Record<string, string> = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'mcpub-discover/1.0',
};
if (GITHUB_TOKEN) GH_HEADERS['Authorization'] = `Bearer ${GITHUB_TOKEN}`;

const SEEN_URLS = new Set<string>();
const SEEN_SLUGS = new Set<string>();
const URL_TO_INDEX = new Map<string, number>();
const TOOLS: ToolEntry[] = [];

function slugify(s: string): string {
  return s.toLowerCase().replace(/@/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function makeSlugUnique(base: string): string {
  let slug = base;
  let i = 1;
  while (SEEN_SLUGS.has(slug)) {
    slug = `${base}-${i}`;
    i++;
  }
  return slug;
}

function detectTransports(name: string, desc: string, topics: string[]): string[] {
  const t: string[] = ['stdio'];
  const text = `${name} ${desc} ${topics.join(' ')}`.toLowerCase();
  if (/(?:^|\s)sse(?:\s|$)/.test(text) || text.includes('server-sent')) t.push('sse');
  if (text.includes('streamable') || text.includes('websocket')) t.push('streamable-http');
  if (text.includes('http') && !text.includes('http is not')) t.push('http');
  return [...new Set(t)];
}

function detectCategories(name: string, desc: string, topics: string[]): string[] {
  const c: string[] = [];
  const text = `${name} ${desc} ${topics.join(' ')}`.toLowerCase();
  const checks: [string, string[]][] = [
    ['database', ['database', 'sql', 'postgres', 'mysql', 'sqlite', 'redis', 'mongodb', 'dynamodb', 'bigquery', 'snowflake', 'clickhouse', 'supavisor']],
    ['ai', ['llm', 'openai', 'anthropic', 'claude', 'gpt', 'langchain', 'assistant']],
    ['developer-tools', ['developer-tools', 'devtools', 'git', 'github', 'gitlab', 'ide', 'code']],
    ['browser-automation', ['browser', 'automation', 'playwright', 'puppeteer', 'chrome', 'headless']],
    ['infrastructure', ['infrastructure', 'devops', 'kubernetes', 'kubectl', 'docker', 'terraform', 'pulumi']],
    ['cloud', ['cloud', 'aws', 'gcp', 'azure', 'vercel', 'cloudflare']],
    ['web', ['web', 'search', 'crawl', 'scrape', 'fetch']],
    ['security', ['security', 'scan', 'audit', 'vulnerability', 'threat']],
    ['communication', ['communication', 'slack', 'discord', 'teams']],
    ['productivity', ['productivity', 'calendar', 'email', 'gmail', 'notion', 'linear', 'jira']],
    ['design', ['design', 'figma']],
    ['framework', ['framework', 'sdk', 'toolkit']],
    ['filesystem', ['filesystem', 'file', 'storage', 's3']],
    ['monitoring', ['monitoring', 'observability', 'grafana', 'datadog', 'sentry']],
    ['finance', ['finance', 'payment', 'stripe']],
    ['crm', ['crm', 'sales', 'hubspot', 'salesforce']],
    ['analytics', ['analytics', 'data']],
    ['testing', ['test', 'qa']],
    ['memory', ['memory', 'knowledge-graph', 'knowledge']],
  ];
  for (const [cat, keywords] of checks) {
    if (keywords.some(kw => text.includes(kw))) c.push(cat);
  }
  return [...new Set(c)].slice(0, 4);
}

function cleanName(raw: string): string {
  return raw.replace(/^@[^/]+\//, '');
}

function makeTool(name: string, desc: string, githubUrl: string, npmPkg: string | null, pyPkg: string | null, author: string, stars: number, license: string | null, topics: string[], homepage: string | null): ToolEntry {
  const shortName = cleanName(name);
  const baseSlug = slugify(shortName);
  const slug = makeSlugUnique(baseSlug || slugify(name));
  const shortDescription = desc.length > 100 ? desc.slice(0, 97) + '...' : desc;

  SEEN_URLS.add(githubUrl);
  SEEN_SLUGS.add(slug);
  URL_TO_INDEX.set(githubUrl, TOOLS.length);

  return {
    slug,
    name: shortName,
    shortDescription,
    description: desc,
    githubUrl,
    npmPackage: npmPkg,
    pyPackage: pyPkg,
    homeUrl: homepage,
    author: author || 'unknown',
    stars,
    license,
    transports: detectTransports(name, desc, topics),
    categories: detectCategories(name, desc, topics),
    compatibility: { openai: 'unknown', anthropic: 'native', langchain: 'unknown', cursor: 'unknown' },
    securityScore: null,
    installCommand: npmPkg ? `npx -y ${npmPkg}` : pyPkg ? `pip install ${pyPkg}` : `npx mcpub install ${slug}`,
  };
}

function githubUrlFromNpm(repoUrl: string): string {
  return repoUrl.replace(/^git\+/, '').replace(/\.git$/, '').replace(/^git:/, 'https:');
}

async function fetchJson(url: string, headers: Record<string, string>): Promise<any> {
  const res = await fetch(url, { headers });
  if (!res.ok) return null;
  return res.json();
}

async function discoverFromGitHub() {
  console.error('\n=== Discovering from GitHub ===');

  const queries = [
    'topic:mcp-server',
    'topic:mcp-servers',
  ];

  let count = 0;

  for (const query of queries) {
    console.error(`\n--- GitHub: ${query} ---`);
    for (let page = 1; page <= 10; page++) {
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=100&page=${page}`;
      const data = await fetchJson(url, GH_HEADERS);
      if (!data) {
        console.error(`  GitHub query stopped (rate limit or error)`);
        break;
      }

      console.error(`  page ${page}: ${data.items.length} results (total: ${data.total_count})`);

      for (const repo of data.items) {
        if (SEEN_URLS.has(repo.html_url)) continue;

        const name = repo.name;
        const desc = repo.description || '';
        const stars = repo.stargazers_count || 0;
        const topics: string[] = repo.topics || [];

        // Skip mega-repos that happen to have the topic but aren't MCP servers themselves
        if (stars > 50000 && !desc.toLowerCase().includes('mcp')) continue;

        const tool = makeTool(name, desc, repo.html_url, null, null, repo.owner?.login || 'unknown', stars, repo.license?.spdx_id || null, topics, repo.homepage || null);
        TOOLS.push(tool);
        count++;
      }

      if (data.items.length < 100) break;
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  console.error(`\nDiscovered ${count} tools from GitHub`);
}

async function discoverFromNpm() {
  console.error('\n=== Cross-referencing & supplementing from npm ===');

  let npmNew = 0;
  let npmEnriched = 0;

  for (let offset = 0; offset < 750; offset += 250) {
    const url = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent('keywords:mcp-server')}&size=250&from=${offset}`;
    const data = await fetchJson(url, { Accept: 'application/json' });
    if (!data || !data.objects) break;

    console.error(`  npm offset=${offset}: ${data.objects.length} results`);

    for (const obj of data.objects) {
      const pkg = obj.package;
      const rawRepoUrl = pkg.links?.repository || '';
      const githubUrl = githubUrlFromNpm(rawRepoUrl);
      const name = pkg.name;
      const desc = pkg.description || '';
      const author = pkg.publisher?.username || pkg.author?.name || 'unknown';

      if (SEEN_URLS.has(githubUrl)) {
        // Enrich existing tool with npm package info
        const idx = URL_TO_INDEX.get(githubUrl);
        if (idx !== undefined && !TOOLS[idx].npmPackage) {
          TOOLS[idx].npmPackage = name;
          TOOLS[idx].installCommand = `npx -y ${name}`;
          npmEnriched++;
        }
        continue;
      }

      if (githubUrl && !githubUrl.startsWith('https://github.com')) {
        // Skip entries with no valid GitHub URL
        continue;
      }

      const homepage = pkg.links?.homepage || null;
      const topics = pkg.keywords || [];
      const stars = 0;
      const license = pkg.license || null;

      const tool = makeTool(name, desc, githubUrl, name, null, author, stars, license, topics, homepage);
      TOOLS.push(tool);
      npmNew++;
    }

    if (data.objects.length < 250) break;
    await new Promise(r => setTimeout(r, 500));
  }

  console.error(`\n  ${npmNew} new tools from npm, ${npmEnriched} existing tools enriched with npm package info`);
}

async function main() {
  const seedPath = resolve(__dirname, '../apps/registry-api/src/seed.ts');
  const seedText = readFileSync(seedPath, 'utf-8');

  const urlRegex = /githubUrl:\s*'([^']+)'/g;
  let m: RegExpExecArray | null;
  let existingCount = 0;
  while ((m = urlRegex.exec(seedText)) !== null) {
    SEEN_URLS.add(m[1]);
    existingCount++;
  }
  const slugRegex = /slug:\s*'([^']+)'/g;
  while ((m = slugRegex.exec(seedText)) !== null) {
    SEEN_SLUGS.add(m[1]);
  }
  console.error(`Pre-loaded ${existingCount} existing tools to skip`);

  await discoverFromGitHub();
  await discoverFromNpm();

  console.error(`\n=== Final: ${TOOLS.length} unique tools discovered ===`);

  const outputPath = resolve(__dirname, '../apps/registry-api/src/generated-seed.json');
  writeFileSync(outputPath, JSON.stringify(TOOLS, null, 2), 'utf-8');
  console.error(`Written to: ${outputPath}`);
  console.log(JSON.stringify({ total: TOOLS.length }));
}

main().catch(err => { console.error(err); process.exit(1); });
