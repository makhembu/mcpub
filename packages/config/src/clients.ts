import { homedir, platform } from 'node:os';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import type { MCPClientConfig } from './types.js';

function getClaudeDesktopPaths(): string[] {
  const home = homedir();
  switch (platform()) {
    case 'win32': {
      const appData = process.env.APPDATA || join(home, 'AppData', 'Roaming');
      return [join(appData, 'Claude', 'claude_desktop_config.json')];
    }
    case 'darwin':
      return [join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json')];
    default:
      return [join(home, '.config', 'Claude', 'claude_desktop_config.json')];
  }
}

function isCommandAvailable(cmd: string): boolean {
  try {
    execSync(`${platform() === 'win32' ? 'where' : 'which'} ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function walkUpForOpenCodeJson(start: string): string | null {
  let dir = start;
  for (let i = 0; i < 10; i++) {
    const candidate = join(dir, 'opencode.json');
    if (existsSync(candidate)) return candidate;
    const parent = dir.substring(0, dir.lastIndexOf(dir.includes('\\') ? '\\' : '/'));
    if (!parent || parent === dir) break;
    dir = parent;
  }
  return null;
}

function getOpenCodeConfigPath(): string {
  const home = homedir();
  const cwd = process.cwd();

  const found = walkUpForOpenCodeJson(cwd);
  if (found) return found;

  const globalCandidates = [
    join(home, '.config', 'opencode', 'config.json'),
    join(home, '.opencode', 'config.json'),
  ];

  for (const p of globalCandidates) {
    if (existsSync(p)) return p;
  }

  return join(cwd, 'opencode.json');
}

export function detectMCPClients(): MCPClientConfig[] {
  const home = homedir();

  const configs: { name: string; paths: string[]; configKey: string; format: string }[] = [
    {
      name: 'Claude Desktop',
      paths: getClaudeDesktopPaths(),
      configKey: 'mcpServers',
      format: 'standard',
    },
    {
      name: 'Cursor',
      paths: [join(home, '.cursor', 'mcp.json')],
      configKey: 'mcpServers',
      format: 'standard',
    },
    {
      name: 'Windsurf',
      paths: [join(home, '.windsurf', 'mcp.json')],
      configKey: 'mcpServers',
      format: 'standard',
    },
    {
      name: 'Continue',
      paths: [join(home, '.continue', 'config.json')],
      configKey: 'mcpServers',
      format: 'standard',
    },
    {
      name: 'VS Code',
      paths: [join(home, '.vscode', 'mcp.json')],
      configKey: 'mcpServers',
      format: 'standard',
    },
  ];

  if (isCommandAvailable('opencode')) {
    configs.push({
      name: 'OpenCode',
      paths: [getOpenCodeConfigPath()],
      configKey: 'mcp',
      format: 'opencode',
    });
  }

  return configs.map(({ name, paths, configKey, format }) => ({
    name,
    configPath: paths[0],
    configKey,
    format: format as 'standard' | 'opencode',
    detected: true,
  }));
}
