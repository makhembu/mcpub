import { homedir, platform } from 'node:os';
import { join } from 'node:path';
import { existsSync, readFileSync, writeFileSync, renameSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join as pathJoin } from 'node:path';

export interface MCPInstallEntry {
  command: string;
  args: string[];
  env?: Record<string, string>;
  type?: string;
  url?: string;
}

export interface MCPClientConfig {
  name: string;
  configPath: string;
  configKey: string;
  detected: boolean;
}

function getClaudeDesktopConfigPaths(): string[] {
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

export function detectMCPClients(): MCPClientConfig[] {
  const home = homedir();
  const clients: MCPClientConfig[] = [];

  const configs: { name: string; paths: string[]; configKey: string }[] = [
    {
      name: 'Claude Desktop',
      paths: getClaudeDesktopConfigPaths(),
      configKey: 'mcpServers',
    },
    {
      name: 'Cursor',
      paths: [join(home, '.cursor', 'mcp.json')],
      configKey: 'mcpServers',
    },
    {
      name: 'Windsurf',
      paths: [join(home, '.windsurf', 'mcp.json')],
      configKey: 'mcpServers',
    },
    {
      name: 'Continue',
      paths: [join(home, '.continue', 'config.json')],
      configKey: 'mcpServers',
    },
    {
      name: 'VS Code',
      paths: [join(home, '.vscode', 'mcp.json')],
      configKey: 'mcpServers',
    },
  ];

  for (const client of configs) {
    for (const configPath of client.paths) {
      clients.push({
        name: client.name,
        configPath,
        configKey: client.configKey,
        detected: existsSync(configPath),
      });
      break;
    }
  }

  return clients;
}

export function readClientConfig(client: MCPClientConfig): Record<string, unknown> | null {
  if (!existsSync(client.configPath)) return null;
  try {
    return JSON.parse(readFileSync(client.configPath, 'utf-8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function writeClientConfig(client: MCPClientConfig, config: Record<string, unknown>): void {
  const sep = client.configPath.includes('\\') ? '\\' : '/';
  const parentDir = client.configPath.substring(0, client.configPath.lastIndexOf(sep));

  if (!existsSync(parentDir)) {
    mkdirSync(parentDir, { recursive: true });
  }

  const tmpFile = pathJoin(tmpdir(), `mcpub-config-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
  writeFileSync(tmpFile, JSON.stringify(config, null, 2) + '\n', 'utf-8');
  renameSync(tmpFile, client.configPath);
}

export function addToolToConfig(
  client: MCPClientConfig,
  toolSlug: string,
  installEntry: MCPInstallEntry,
): { added: boolean; alreadyPresent: boolean } {
  let config = readClientConfig(client) || {};
  const rootKey = client.configKey;

  if (!config[rootKey] || typeof config[rootKey] !== 'object') {
    config[rootKey] = {};
  }

  const servers = config[rootKey] as Record<string, unknown>;

  if (toolSlug in servers) {
    return { added: false, alreadyPresent: true };
  }

  servers[toolSlug] = installEntry;
  writeClientConfig(client, config);
  return { added: true, alreadyPresent: false };
}

export function removeToolFromConfig(
  client: MCPClientConfig,
  toolSlug: string,
): { removed: boolean; wasPresent: boolean } {
  const config = readClientConfig(client);
  if (!config) return { removed: false, wasPresent: false };

  const rootKey = client.configKey;
  const servers = config[rootKey] as Record<string, unknown> | undefined;
  if (!servers || !(toolSlug in servers)) {
    return { removed: false, wasPresent: false };
  }

  delete servers[toolSlug];
  writeClientConfig(client, config);
  return { removed: true, wasPresent: true };
}

export function listInstalledTools(client: MCPClientConfig): { slug: string; entry: Record<string, unknown> }[] {
  const config = readClientConfig(client);
  if (!config) return [];

  const rootKey = client.configKey;
  const servers = config[rootKey] as Record<string, unknown> | undefined;
  if (!servers) return [];

  return Object.entries(servers).map(([slug, entry]) => ({
    slug,
    entry: entry as Record<string, unknown>,
  }));
}
