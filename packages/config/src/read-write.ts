import { existsSync, readFileSync, writeFileSync, renameSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { MCPClientConfig, MCPInstallEntry, AddToolResult, RemoveToolResult, InstalledTool } from './types.js';

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

  const tmpFile = join(tmpdir(), `mcpub-config-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
  writeFileSync(tmpFile, JSON.stringify(config, null, 2) + '\n', 'utf-8');
  renameSync(tmpFile, client.configPath);
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

  servers[toolSlug] = installEntry;
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

  return Object.entries(servers).map(([slug, entry]) => ({
    slug,
    entry: entry as Record<string, unknown>,
  }));
}
