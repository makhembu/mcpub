import { readFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY_URL = process.env.REGISTRY_URL || 'https://mcpub-registry.shelflix.workers.dev';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const SCAN_DIR = resolve(__dirname, '..', '.scan-temp');
const args = process.argv.slice(2);
const LIMIT_INDEX = args.indexOf('--limit');
const LIMIT = LIMIT_INDEX >= 0 ? parseInt(args[LIMIT_INDEX + 1], 10) : Infinity;

interface ToolEntry {
  slug: string;
  name: string;
  githubUrl: string;
  description: string;
  shortDescription: string;
  npmPackage: string | null;
  pyPackage: string | null;
}

interface ScanFinding {
  id: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  file?: string;
}

const EXTRA_PATTERNS = [
  {
    id: 'SA-001', name: 'Unsanitized exec()',
    pattern: /\b(exec|execSync|spawn|spawnSync)\s*\(/g,
    severity: 'high', category: 'tool-poisoning',
    description: 'Shell command execution detected — ensure arguments are sanitized',
  },
  {
    id: 'SA-002', name: 'Dynamic eval()',
    pattern: /\b(eval|new Function)\s*\(/g,
    severity: 'critical', category: 'tool-poisoning',
    description: 'Dynamic code execution — eval or Function constructor used',
  },
  {
    id: 'SA-003', name: 'Outbound HTTP fetch',
    pattern: /\b(fetch|axios\.get|axios\.post|requests\.get|requests\.post)\s*\(/g,
    severity: 'medium', category: 'data-exfiltration',
    description: 'Outbound network request in tool code — verify destination is expected',
  },
  {
    id: 'SA-004', name: 'Env var in outbound request',
    pattern: /process\.env\.[A-Z_]+.*\b(fetch|axios|request|send)\b/g,
    severity: 'high', category: 'data-exfiltration',
    description: 'Environment variables may be sent to external services',
  },
  {
    id: 'SA-005', name: 'Broad filesystem access',
    pattern: /\b(readFileSync|readdirSync|glob)\s*\(\s*['"\/]\/['"]?/g,
    severity: 'medium', category: 'misconfiguration',
    description: 'Broad filesystem access from root — restrict to specific directories',
  },
  {
    id: 'SA-006', name: 'Hardcoded secrets',
    pattern: /['"][a-zA-Z0-9_\-]{32,}['"]\s*[:\]]?\s*['"]?(key|token|secret|password)['"]?/gi,
    severity: 'high', category: 'supply-chain',
    description: 'Potential hardcoded secret or API key',
  },
];

function scanFileContent(content: string, filePath: string): ScanFinding[] {
  const findings: ScanFinding[] = [];

  for (const pattern of EXTRA_PATTERNS) {
    const regex = new RegExp(pattern.pattern.source, 'gi');
    if (regex.test(content)) {
      findings.push({
        id: pattern.id,
        category: pattern.category,
        severity: pattern.severity,
        title: pattern.name,
        description: pattern.description,
        file: filePath,
      });
    }
  }

  return findings;
}

function walkSourceFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = existsSync(dir) ? walkDir(dir) : [];
  return entries.filter(f => {
    const ext = extname(f).toLowerCase();
    return ['.ts', '.js', '.py', '.mjs', '.cjs'].includes(ext);
  });
}

function walkDir(dir: string): string[] {
  const entries: string[] = [];
  try {
    const items = execSync(`dir "${dir}" /s /b /a-d 2>nul`, { encoding: 'utf8', timeout: 5000 })
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
    for (const item of items) {
      const normalized = item.replace(/\\/g, '/');
      if (normalized.includes('/node_modules/') ||
          normalized.includes('/dist/') ||
          normalized.includes('/.git/') ||
          normalized.includes('/__pycache__/') ||
          normalized.includes('/.next/') ||
          normalized.includes('/target/') ||
          normalized.includes('/build/') ||
          normalized.includes('/venv/')) {
        continue;
      }
      entries.push(normalized);
    }
  } catch {
    // dir command failed, skip
  }
  return entries;
}

async function main() {
  const seedPath = resolve(__dirname, '../apps/registry-api/src/validated-seed.json');
  const tools: ToolEntry[] = JSON.parse(readFileSync(seedPath, 'utf-8'));

  const toolsToScan = tools.filter(t => t.githubUrl).slice(0, LIMIT);
  console.log(`Scanning ${toolsToScan.length} tools...\n`);

  if (existsSync(SCAN_DIR)) {
    rmSync(SCAN_DIR, { recursive: true, force: true });
  }
  mkdirSync(SCAN_DIR, { recursive: true });

  let completed = 0;
  let withFindings = 0;

  for (const tool of toolsToScan) {
    const repoDir = join(SCAN_DIR, tool.slug);

    try {
      const cloneUrl = GITHUB_TOKEN
        ? `https://x-access-token:${GITHUB_TOKEN}@${tool.githubUrl.replace('https://', '')}`
        : tool.githubUrl;

      execSync(`git clone --depth=1 --single-branch "${cloneUrl}" "${repoDir}" 2>&1`, {
        timeout: 30000,
        stdio: 'pipe',
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      const sourceFiles = walkSourceFiles(repoDir);
      let findings: ScanFinding[] = [];

      for (const file of sourceFiles) {
        try {
          const content = readFileSync(file, 'utf-8');
          const fileFindings = scanFileContent(content, file);
          findings = findings.concat(fileFindings);
        } catch {
          // skip unreadable files
        }
      }

      const severityWeights: Record<string, number> = {
        critical: 30,
        high: 20,
        medium: 10,
        low: 5,
      };

      let deduction = 0;
      for (const f of findings) {
        deduction += severityWeights[f.severity] || 0;
      }
      const score = Math.max(0, 100 - deduction);

      const status = findings.length === 0 ? '✅' : deduction >= 40 ? '⚠️' : '🔍';
      console.log(`[${completed + 1}/${toolsToScan.length}] ${tool.slug}: ${score}/100 (${findings.length} findings) ${status}`);

      if (findings.length > 0) withFindings++;

      const res = await fetch(`${REGISTRY_URL}/api/tools/${tool.slug}/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'dev-seed-key',
        },
        body: JSON.stringify({
          securityScore: score,
          findings: findings.map(f => ({ ...f, file: f.file?.replace(repoDir, '') })),
          scannedAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(`  Failed to post scan result: ${res.status} ${text}`);
      }

      if (repoDir.includes(SCAN_DIR)) {
        rmSync(repoDir, { recursive: true, force: true });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[${completed + 1}/${toolsToScan.length}] ${tool.slug}: FAILED — ${msg.slice(0, 100)}`);
      if (existsSync(repoDir)) {
        rmSync(repoDir, { recursive: true, force: true });
      }
    }

    completed++;
  }

  if (existsSync(SCAN_DIR)) {
    rmSync(SCAN_DIR, { recursive: true, force: true });
  }

  console.log(`\n✅ Phase 4 scan complete`);
  console.log(`   Scanned: ${completed} tools`);
  console.log(`   With findings: ${withFindings} tools`);
}

main().catch(err => { console.error(err); process.exit(1); });
