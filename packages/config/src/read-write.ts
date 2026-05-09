import { existsSync, readFileSync, writeFileSync, renameSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { MCPClientConfig, MCPInstallEntry, AddToolResult, RemoveToolResult, InstalledTool } from './types.js';

function stripJsoncComments(raw: string): string {
  let result = '';
  let inString = false;
  let i = 0;
  while (i < raw.length) {
    const ch = raw[i];
    if (ch === '"') {
      let j = i;
      let escapes = 0;
      while (j > 0 && raw[j - 1] === '\\') { escapes++; j--; }
      if (escapes % 2 === 0) inString = !inString;
      result += ch;
      i++;
      continue;
    }
    if (!inString && ch === '/' && raw[i + 1] === '/') {
      while (i < raw.length && raw[i] !== '\n') i++;
      continue;
    }
    if (!inString && ch === '/' && raw[i + 1] === '*') {
      i += 2;
      while (i < raw.length && !(raw[i] === '*' && raw[i + 1] === '/')) i++;
      if (i < raw.length) i += 2;
      continue;
    }
    result += ch;
    i++;
  }
  return result;
}

export function readClientConfig(client: MCPClientConfig): Record<string, unknown> | null {
  if (!existsSync(client.configPath)) return null;
  try {
    const raw = readFileSync(client.configPath, 'utf-8');
    return JSON.parse(stripJsoncComments(raw)) as Record<string, unknown>;
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

  const tmpFile = join(tmpdir(), `mcpub-config-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
  writeFileSync(tmpFile, JSON.stringify(config, null, 2) + '\n', 'utf-8');
  renameSync(tmpFile, client.configPath);
}

function toOpenCodeEntry(entry: MCPInstallEntry): Record<string, unknown> {
  const result: Record<string, unknown> = {
    type: 'local',
    command: [entry.command, ...entry.args],
    enabled: true,
  };
  if (entry.env && Object.keys(entry.env).length > 0) {
    result.environment = entry.env;
  }
  return result;
}

function fromOpenCodeEntry(entry: Record<string, unknown>, slug: string): InstalledTool {
  const cmd = entry.command;
  if (Array.isArray(cmd) && cmd.length > 0) {
    return {
      slug,
      entry: { command: cmd[0], args: cmd.slice(1), env: (entry as any).environment },
    };
  }
  return { slug, entry: entry as Record<string, unknown> };
}

export function addToolToConfig(
  client: MCPClientConfig,
  toolSlug: string,
  installEntry: MCPInstallEntry,
): AddToolResult {
  let config = readClientConfig(client) || {};
  const rootKey = client.configKey;

  if (!config[rootKey] || typeof config[rootKey] !== 'object') {
    config[rootKey] = {};
  }

  const servers = config[rootKey] as Record<string, unknown>;

  if (toolSlug in servers) {
    return { added: false, alreadyPresent: true };
  }

  servers[toolSlug] = client.format === 'opencode'
    ? toOpenCodeEntry(installEntry)
    : installEntry;

  writeClientConfig(client, config);
  return { added: true, alreadyPresent: false };
}

export function removeToolFromConfig(
  client: MCPClientConfig,
  toolSlug: string,
): RemoveToolResult {
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

export function listInstalledTools(client: MCPClientConfig): InstalledTool[] {
  const config = readClientConfig(client);
  if (!config) return [];

  const rootKey = client.configKey;
  const servers = config[rootKey] as Record<string, unknown> | undefined;
  if (!servers) return [];

  return Object.entries(servers).map(([slug, entry]) => {
    if (client.format === 'opencode') {
      return fromOpenCodeEntry(entry as Record<string, unknown>, slug);
    }
    return { slug, entry: entry as Record<string, unknown> };
  });
}
