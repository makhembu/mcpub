import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const NPM_BATCH_SIZE = 50;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

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
  compatibility: Record<string, string>;
  securityScore: null;
  installCommand: string;
}

interface ValidationResult {
  tool: ToolEntry;
  mcpScore: number;
  signals: string[];
  reasons: string[];
  npmDepFound: boolean | null;
  fileCheckFound: boolean | null;
}

// Repos that are NOT MCP servers but got included
const KNOWN_NON_MCP: Record<string, string> = {
  'nuclear': 'Desktop music streaming player, no MCP',
  'nginx-ui': 'Nginx web UI, not an MCP server',
  'omega': 'AI knowledge base, not MCP',
  'upsonic': 'AI agent framework, not MCP',
  'gofire': 'AI agent framework, not MCP',
  'pipedream': 'Workflow automation, not MCP',
  'sourcegraph': 'Code search, not MCP',
  'meltano': 'Data integration, not MCP',
  'pulumi': 'Infrastructure as code, not MCP',
  'chatwise': 'Chat UI, not MCP',
  'trendradar': 'Trend monitoring tool, mentions MCP as feature only',
  'scrapling': 'Web scraping framework, not MCP',
  'ruflo': 'Orchestration platform, not MCP server',
  'gpt-researcher': 'Research agent, not MCP server',
  'openmetadata': 'Metadata platform, not MCP',
  'context-mode': 'Context window optimization, not MCP',
  'skill-seekers': 'Doc scraping tool, not MCP',
  'xhs-downloader': 'RedNote content downloader, not MCP',
  'trigger-dev': 'Workflow platform, not MCP server',
  'activepieces': 'Workflow automation with MCP support, not MCP server',
  'maxkb': 'Enterprise knowledge base, not MCP server',
  'ui-tars-desktop': 'UI agent testing stack, not MCP server',
};

// Strong signal: repo name contains mcp
function nameContainsMCP(name: string): boolean {
  return name.toLowerCase().includes('mcp');
}

// Description mentions "MCP Server" explicitly or "Model Context Protocol"
function isExplicitMCPServer(desc: string): boolean {
  const lower = desc.toLowerCase();
  const strongSignals = [
    'mcp server', 'mcpserver', 'model context protocol',
    '@modelcontextprotocol', 'mcp protocol',
  ];
  return strongSignals.some(s => lower.includes(s));
}

// Description mentions MCP as a primary identity, not just a feature
function isMCPPrimary(desc: string): boolean {
  const lower = desc.toLowerCase();
  if (isExplicitMCPServer(desc)) return true;
  // "mcp for X" or "X mcp" pattern — tool IS the MCP server
  if (/^mcp/i.test(desc.trim()) || /[-\s]mcp\s/i.test(lower)) return true;
  return false;
}

// Known non-MCP patterns — tools that mention MCP as a feature but aren't MCP servers
const NON_MCP_PATTERNS = [
  'opinion & trend', 'trend monitor', 'web scraping', 'music player',
  'nginx web ui', 'data integration', 'orchestration platform',
  'streaming music', 'crm', 'e-commerce', 'ecommerce',
  'online store', 'point of sale', 'cmdb', 'data catalog',
  'enterprise agent platform', 'ai agent platform',
  'desktop music', '转写工具', 'transcription tool',
  '下载器', 'downloader', 'remnote',
  'ai agents & mcps &', 'workflow automation',
  'enterprise-grade agents', 'knowledge base',
  'multimodal ai agent', 'deep research',
  'context window optimization',
  'unified metadata platform',
  'documentation websites',
  '链接提取', '作品采集',
];

// Weak MCP mentions — "supports MCP" vs "is an MCP server"
function isWeakMCPMention(desc: string): boolean {
  const lower = desc.toLowerCase();
  if (!lower.includes('mcp')) return true;
  // Name pattern: "X & MCPs & Y" means MCP is one of many features
  if (/.*\s+&\s+mcps?\s+&/.test(lower)) return true;
  // Chinese: "支持接入" = "supports integration"
  if (/支持接入.*mcp/i.test(desc)) return true;
  if (/支持.*mcp.*架构/i.test(desc)) return true;
  if (/supports?.*mcp/i.test(lower) && !isMCPPrimary(desc)) return true;
  if (NON_MCP_PATTERNS.some(p => lower.includes(p))) return true;
  return false;
}

function hasPackageManagerSignal(tool: ToolEntry): number {
  if (tool.npmPackage) return 15;
  if (tool.pyPackage) return 10;
  return 0;
}

function autoScore(tool: ToolEntry): { score: number; signals: string[] } {
  const signals: string[] = [];
  let score = 0;

  // Name contains MCP — strongest signal. Overrides description penalty.
  if (nameContainsMCP(tool.name)) {
    score += 50;
    signals.push('name-has-mcp');
  }
  if (nameContainsMCP(tool.slug) && !nameContainsMCP(tool.name)) {
    score += 30;
    signals.push('slug-has-mcp');
  }

  // Description signals
  if (score < 30) {
    if (isExplicitMCPServer(tool.description)) {
      score += 40;
      signals.push('desc-explicit-mcp-server');
    } else if (isMCPPrimary(tool.description)) {
      score += 25;
      signals.push('desc-mcp-primary');
    } else if (tool.description.toLowerCase().includes('mcp')) {
      if (isWeakMCPMention(tool.description)) {
        score -= 10;
        signals.push('desc-weak-mcp');
      } else {
        score += 15;
        signals.push('desc-mentions-mcp');
      }
    } else {
      score -= 10;
      signals.push('desc-no-mcp');
    }
  } else {
    signals.push('name-override');
  }

  // Package manager
  const pkgScore = hasPackageManagerSignal(tool);
  score += pkgScore;
  if (pkgScore > 0) signals.push('has-package');

  // Stars bonus
  if (tool.stars >= 10000 && tool.stars >= 1000) score += 5;
  if (tool.stars >= 50000) score += 5;

  // Penalty for known non-MCP
  if (KNOWN_NON_MCP[tool.slug]) {
    score = -100;
    signals.push('known-non-mcp');
  }

  return { score, signals };
}

async function checkNpmDeps(tool: ToolEntry): Promise<{ found: boolean | null; detail: string }> {
  if (!tool.npmPackage) return { found: null, detail: 'no-npm-package' };
  try {
    const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(tool.npmPackage)}/latest`);
    if (!res.ok) return { found: null, detail: `npm-${res.status}` };
    const data = await res.json() as any;
    const allDeps = { ...(data.dependencies || {}), ...(data.peerDependencies || {}), ...(data.devDependencies || {}) };
    const hasMCP = '@modelcontextprotocol/sdk' in allDeps || 'mcp' in allDeps;
    if (hasMCP) return { found: true, detail: 'has-mcp-dep' };

    // Check for MCP in keywords
    const keywords: string[] = data.keywords || [];
    if (keywords.some(k => k.toLowerCase().includes('mcp-server') || k === 'mcp')) {
      return { found: true, detail: 'has-mcp-keyword' };
    }
    return { found: false, detail: 'no-mcp-dep' };
  } catch {
    return { found: null, detail: 'npm-error' };
  }
}

async function checkGithubFiles(tool: ToolEntry): Promise<{ found: boolean | null; detail: string }> {
  if (!tool.githubUrl) return { found: null, detail: 'no-github-url' };

  const parts = tool.githubUrl.replace('https://github.com/', '').split('/');
  if (parts.length < 2) return { found: null, detail: 'invalid-github-url' };
  const [owner, repo] = parts;

  const headers: Record<string, string> = { Accept: 'application/vnd.github+json', 'User-Agent': 'mcpub-validate/1.0' };
  if (GITHUB_TOKEN) headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;

  try {
    // Check package.json for MCP SDK
    const pkgRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/package.json`, { headers });
    if (pkgRes.ok) {
      const data = await pkgRes.json() as any;
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      const pkg = JSON.parse(content);
      const allDeps = { ...(pkg.dependencies || {}), ...(pkg.peerDependencies || {}), ...(pkg.devDependencies || {}) };
      if ('@modelcontextprotocol/sdk' in allDeps || 'mcp' in allDeps) {
        return { found: true, detail: 'pkg-has-mcp-dep' };
      }
    }

    // Check pyproject.toml for mcp
    const pyRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/pyproject.toml`, { headers });
    if (pyRes.ok) {
      const data = await pyRes.json() as any;
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      if (content.includes('"mcp"') || content.includes("'mcp'") || content.includes('"modelcontextprotocol"')) {
        return { found: true, detail: 'pyproject-has-mcp' };
      }
    }

    // Check requirements.txt
    const reqRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/requirements.txt`, { headers });
    if (reqRes.ok) {
      const data = await reqRes.json() as any;
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      if (content.includes('mcp') || content.includes('modelcontextprotocol')) {
        return { found: true, detail: 'requirements-has-mcp' };
      }
    }

    // Check setup.py
    const setupRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/setup.py`, { headers });
    if (setupRes.ok) {
      const data = await setupRes.json() as any;
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      if (content.includes('"mcp"') || content.includes("'mcp'")) {
        return { found: true, detail: 'setup-py-has-mcp' };
      }
    }

    return { found: false, detail: 'no-mcp-file-evidence' };
  } catch {
    return { found: null, detail: 'github-error' };
  }
}

async function validateTools() {
  const seedPath = resolve(__dirname, '../apps/registry-api/src/generated-seed.json');
  const tools: ToolEntry[] = JSON.parse(readFileSync(seedPath, 'utf-8'));
  console.error(`Loaded ${tools.length} tools for validation\n`);

  const results: ValidationResult[] = [];

  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    const { score, signals } = autoScore(tool);
    const reasons: string[] = [];

    let npmDepFound: boolean | null = null;
    let fileCheckFound: boolean | null = null;

    // For high-confidence via heuristics, skip API checks
    // For uncertain ones (score between -10 and 40), do API validation
    if (score >= 40 || score <= -20) {
      // Already confident from heuristics
    } else {
      // Do API verification
      if (tool.npmPackage) {
        const npmResult = await checkNpmDeps(tool);
        npmDepFound = npmResult.found;
        if (npmResult.found) {
          reasons.push(npmResult.detail);
        }
      } else if (tool.githubUrl) {
        const ghResult = await checkGithubFiles(tool);
        fileCheckFound = ghResult.found;
        if (ghResult.found) {
          reasons.push(ghResult.detail);
        }
      }
    }

    results.push({ tool, mcpScore: score, signals, reasons, npmDepFound, fileCheckFound });

    if ((i + 1) % 50 === 0) {
      console.error(`  Validated ${i + 1}/${tools.length}`);
    }
  }

  // Calculate final scores with API check results
  for (const r of results) {
    if (r.npmDepFound === true || r.fileCheckFound === true) {
      r.mcpScore += 30;
      r.reasons.push('api-verified');
    }
    if (r.npmDepFound === false || r.fileCheckFound === false) {
      r.mcpScore -= 30;
      r.reasons.push('api-denied');
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.mcpScore - a.mcpScore);

  // Classify
  const verified = results.filter(r => r.mcpScore >= 40);
  const uncertain = results.filter(r => r.mcpScore > -20 && r.mcpScore < 40);
  const rejected = results.filter(r => r.mcpScore <= -20);

  console.error(`\n=== Results ===`);
  console.error(`  Verified (score >= 40): ${verified.length}`);
  console.error(`  Uncertain (score -20 to 39): ${uncertain.length}`);
  console.error(`  Rejected (score <= -20): ${rejected.length}`);

  // Show top 20 verified
  console.error(`\n--- Top 20 Verified ---`);
  verified.slice(0, 20).forEach(r => {
    console.error(`  ${r.tool.slug}: +${r.mcpScore} [${r.signals.join(',')}] ${r.reasons.length ? '✓' + r.reasons.join(',') : ''}`);
  });

  // Show some rejected
  console.error(`\n--- Sample Rejected ---`);
  rejected.filter(r => r.tool.stars > 5000).slice(0, 10).forEach(r => {
    console.error(`  ${r.tool.slug}: ${r.mcpScore} (${r.tool.stars}★) — ${r.tool.shortDescription.slice(0, 60)}`);
  });

  // Write validated seed
  const validatedPath = resolve(__dirname, '../apps/registry-api/src/validated-seed.json');
  writeFileSync(validatedPath, JSON.stringify(verified.map(r => r.tool), null, 2), 'utf-8');
  console.error(`\nWritten validated seed (${verified.length} tools) to validated-seed.json`);

  // Summary
  console.log(JSON.stringify({
    total: tools.length,
    verified: verified.length,
    uncertain: uncertain.length,
    rejected: rejected.length,
    topSlugs: verified.slice(0, 10).map(r => r.tool.slug),
  }));
}

validateTools().catch(err => { console.error('FATAL:', err); process.exit(1); });
