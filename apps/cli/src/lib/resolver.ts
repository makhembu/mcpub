import { execSync } from 'node:child_process';
import type { MCPInstallConfig } from '@mcpub/shared';

interface ResolvedEntry {
  command: string;
  args: string[];
  env?: Record<string, string>;
  source: 'registry' | 'npm' | 'readme' | 'manual';
}

async function npmPackageExists(pkg: string): Promise<boolean> {
  try {
    const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg).replace(/^%40/, '@')}`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function fetchGitHubReadme(repoUrl: string): Promise<string | null> {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\/|$)/);
  if (!match) return null;
  const [, owner, repo] = match;
  const branches = ['main', 'master', 'trunk'];
  for (const branch of branches) {
    try {
      const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) return await res.text();
    } catch {
      continue;
    }
  }
  return null;
}

function extractCommandFromReadme(readme: string): { command: string; args: string[]; env?: Record<string, string> } | null {
  const runCommands = ['npx', 'uvx', 'bunx', 'docker', 'node', 'python', 'python3'];

  function parseCmdLine(line: string): { command: string; args: string[]; env?: Record<string, string> } | null {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 2) return null;

    const env: Record<string, string> = {};
    let startIdx = 0;
    while (startIdx < parts.length && /^[A-Z_]\w*=/.test(parts[startIdx])) {
      const eqIdx = parts[startIdx].indexOf('=');
      env[parts[startIdx].substring(0, eqIdx)] = parts[startIdx].substring(eqIdx + 1);
      startIdx++;
    }

    const cmd = parts[startIdx];
    const args = parts.slice(startIdx + 1);

    // Handle npx -> add -y if not present
    if (cmd === 'npx' && !args.includes('-y')) {
      args.unshift('-y');
    }

    return { command: cmd, args, ...(Object.keys(env).length > 0 ? { env } : {}) };
  }

  // First pass: look for run commands in code blocks (these are the actual MCP server commands)
  const runPatterns = runCommands.map(c => {
    const escaped = c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp('```(?:bash|sh|shell)\\s*\\n\\s*' + escaped + '\\s+-', 'i');
  });

  // Extract all code blocks
  const codeBlockRegex = /```(?:bash|sh|shell)\s*\n([\s\S]*?)```/gi;
  const blocks: string[] = [];
  let blockMatch;
  while ((blockMatch = codeBlockRegex.exec(readme)) !== null) {
    blocks.push(blockMatch[1].trim());
  }

  // In code blocks, prefer run commands (npx, uvx, etc.)
  for (const block of blocks) {
    const lines = block.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      const firstWord = trimmed.split(/\s+/)[0];
      if (firstWord && runCommands.includes(firstWord)) {
        const parsed = parseCmdLine(trimmed);
        if (parsed) return parsed;
      }
    }
  }

  // Try docker separately (common in code blocks)
  for (const block of blocks) {
    const lines = block.split('\n');
    for (const line of lines) {
      if (line.trim().startsWith('docker run')) {
        const parsed = parseCmdLine(line.trim());
        if (parsed) return parsed;
      }
    }
  }

  // Second pass: convert install commands to run commands
  interface InstallToRun {
    installPat: RegExp;
    toRun: (pkg: string) => { command: string; args: string[] } | null;
  }
  const installConverters: InstallToRun[] = [
    { installPat: /pip(?:3)?\s+install\s+(\S+)/i, toRun: (pkg) => ({ command: 'uvx', args: [pkg] }) },
    { installPat: /npm\s+(?:install|i)\s+(?:-g\s+)?(\S+)/i, toRun: (pkg) => ({ command: 'npx', args: ['-y', pkg] }) },
    { installPat: /go\s+install\s+(\S+)/i, toRun: (pkg) => {
      const bin = pkg.includes('/') ? pkg.split('/').pop()! : pkg;
      return { command: bin, args: [] };
    }},
    { installPat: /cargo\s+install\s+(\S+)/i, toRun: (pkg) => ({ command: pkg, args: [] }) },
    { installPat: /brew\s+install\s+(\S+)/i, toRun: (pkg) => ({ command: pkg, args: [] }) },
  ];

  for (const block of blocks) {
    const lines = block.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      for (const conv of installConverters) {
        const m = trimmed.match(conv.installPat);
        if (m) {
          const result = conv.toRun(m[1]);
          if (result) return result;
        }
      }
    }
  }

  // Third pass: inline mentions (Quick Start sections, install instructions outside code blocks)
  const inlineRunPatterns = [
    /\*\*Quick Start\*\*[\s\S]{0,500}?\*\*[^*]*\*\*[\s\S]{0,200}?(npx\s+-y\s+\S+)/i,
    /\*\*Quick Start\*\*[\s\S]{0,500}?\*\*[^*]*\*\*[\s\S]{0,200}?(uvx\s+\S+)/i,
    /\*\*Quick Start\*\*[\s\S]{0,500}?\*\*[^*]*\*\*[\s\S]{0,200}?(pip(?:3)?\s+install\s+\S+)/i,
  ];

  for (const pattern of inlineRunPatterns) {
    const match = readme.match(pattern);
    if (match) {
      const line = match[1].trim();
      // Check if it's an install command → convert
      for (const conv of installConverters) {
        const m = line.match(conv.installPat);
        if (m) {
          const result = conv.toRun(m[1]);
          if (result) return result;
        }
      }
      // Otherwise parse as-is (it might be a npx/uvx command)
      const parsed = parseCmdLine(line);
      if (parsed) return parsed;
    }
  }

  return null;
}

export async function resolveInstallConfig(
  tool: { slug: string; installConfig?: MCPInstallConfig | null; installCommand?: string | null; githubUrl?: string | null; npmPackage?: string | null; pyPackage?: string | null },
): Promise<ResolvedEntry | null> {
  const cfg = tool.installConfig;

  // If registry has a real config (not our slug-as-package fallback), use it
  if (cfg && cfg.args.length > 0 && cfg.args[0] !== '-y') {
    return {
      command: cfg.command,
      args: cfg.args,
      env: cfg.env,
      source: 'registry',
    };
  }

  // If installConfig uses our fallback (args = ['-y', slug]), verify the package exists
  if (cfg && cfg.command === 'npx' && cfg.args[0] === '-y') {
    const pkg = cfg.args[1];
    if (await npmPackageExists(pkg)) {
      return {
        command: cfg.command,
        args: cfg.args,
        env: cfg.env,
        source: 'npm',
      };
    }

    // Package doesn't exist — try scraping the GitHub README
    if (tool.githubUrl) {
      const readme = await fetchGitHubReadme(tool.githubUrl);
      if (readme) {
        const extracted = extractCommandFromReadme(readme);
        if (extracted) {
          return { ...extracted, source: 'readme' };
        }
      }
    }
  }

  // If no installConfig at all but has installCommand, try parsing it
  if (!cfg && tool.installCommand) {
    const parts = tool.installCommand.split(/\s+/);
    return {
      command: parts[0],
      args: parts.slice(1),
      source: 'registry',
    };
  }

  return null;
}
